import { Injectable } from '@nestjs/common';
import { AUDIT_ACTIONS } from '@vivivu/shared';
import type { Itinerary } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../common/decorators';
import { AiService } from '../ai/ai.service';
import type { DietaryPreference, TripStyle } from '../ai/dto/ai.dto';
import type { CreateItineraryDto } from './dto/itinerary.dto';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly aiService: AiService,
  ) {}

  async create(dto: CreateItineraryDto, user: AuthUser): Promise<Itinerary> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const days = AiService.calculateDays(dto.startDate, dto.endDate);
    const hasStart = dto.startLat != null && dto.startLng != null;

    return this.prisma.itinerary.create({
      data: {
        userId: user.id,
        regionId: dto.regionId,
        startDate,
        endDate,
        days,
        title: dto.title,
        estimatedCost: dto.budgetVnd,
        travelers: dto.travelers,
        styles: dto.styles ?? [],
        dietary: dto.dietary,
        preferredPlaceIds: dto.preferredPlaceIds ?? [],
        startLat: hasStart ? dto.startLat : null,
        startLng: hasStart ? dto.startLng : null,
        startLabel: hasStart ? dto.startLabel : null,
        status: 'DRAFT',
      },
    });
  }

  async generateOptions(itineraryId: string, user: AuthUser): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id: itineraryId } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only generate options for your own itinerary');
    if (!itinerary.regionId) throw new AppException(ErrorCode.VALIDATION_FAILED, 422, 'Itinerary has no region');

    const aiResult = await this.aiService.generate5Options({
      regionId: itinerary.regionId,
      startDate: itinerary.startDate.toISOString().slice(0, 10),
      endDate: itinerary.endDate.toISOString().slice(0, 10),
      budgetVnd: itinerary.estimatedCost ?? undefined,
      travelers: itinerary.travelers ?? undefined,
      styles: itinerary.styles as TripStyle[],
      dietary: (itinerary.dietary as DietaryPreference | null) ?? undefined,
      preferredPlaceIds: itinerary.preferredPlaceIds,
      startLat: itinerary.startLat ?? undefined,
      startLng: itinerary.startLng ?? undefined,
      startLabel: itinerary.startLabel ?? undefined,
    });

    const rows = aiResult.options.flatMap((option) =>
      option.days.flatMap((day) =>
        day.stops.map((stop, orderInDay) => ({
          itineraryId,
          optionNumber: option.optionNumber,
          dayNumber: day.dayNumber,
          orderInDay,
          placeId: stop.placeId,
          placeName: stop.name,
          placeLat: stop.lat,
          placeLng: stop.lng,
          placeAddress: stop.address,
          stopType: stop.stopType,
          mealType: stop.mealType,
          scheduledTime: stop.scheduledTime,
          estimatedDuration: stop.estimatedDurationMin,
          estimatedCost: stop.estimatedCost,
          travelTimeFromPrevMin: stop.travelTimeFromPrevMin,
          notes: stop.notes ?? null,
        })),
      ),
    );

    // Thay toan bo stops cu bang bo moi trong mot transaction, de regenerate
    // that bai khong de lai lich trinh trong.
    await this.prisma.$transaction([
      this.prisma.itineraryStop.deleteMany({ where: { itineraryId } }),
      this.prisma.itineraryStop.createMany({ data: rows }),
      this.prisma.itinerary.update({ where: { id: itineraryId }, data: { selectedOption: null, status: 'DRAFT' } }),
    ]);

    await this.audit.record({
      action: AUDIT_ACTIONS.ITINERARY_GENERATE,
      targetType: 'Itinerary',
      targetId: itineraryId,
      actor: { id: user.id, email: user.email },
      after: { source: aiResult.source, provider: aiResult.provider, candidates: aiResult.candidateCount },
    });

    return this.findOne(itineraryId);
  }

  async applyOption(itineraryId: string, dto: { optionNumber: number }, user: AuthUser): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id: itineraryId }, include: { stops: true } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only apply options for your own itinerary');

    const chosen = itinerary.stops.filter((s) => s.optionNumber === dto.optionNumber);
    if (chosen.length === 0) throw AppException.notFound('Option');
    const perPerson = chosen.reduce((sum, s) => sum + (s.estimatedCost ?? 0), 0);

    await this.prisma.itineraryStop.deleteMany({ where: { itineraryId, optionNumber: { not: dto.optionNumber } } });

    const updated = await this.prisma.itinerary.update({
      where: { id: itineraryId },
      data: { selectedOption: dto.optionNumber, status: 'APPLIED', estimatedCost: perPerson },
    });
    await this.audit.record({ action: AUDIT_ACTIONS.ITINERARY_APPLY, targetType: 'Itinerary', targetId: itineraryId, actor: { id: user.id, email: user.email }, after: { selectedOption: dto.optionNumber } });

    return updated;
  }

  async findByUser(userId: string): Promise<Itinerary[]> {
    return this.prisma.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { stops: { orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }] }, region: true },
    });
  }

  async findOne(id: string, userId?: string): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: { stops: { orderBy: [{ optionNumber: 'asc' }, { dayNumber: 'asc' }, { orderInDay: 'asc' }] }, region: true, user: { select: { id: true, fullName: true } } },
    });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (userId && itinerary.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only view your own itinerary');
    return itinerary;
  }

  async remove(id: string, user: AuthUser): Promise<{ id: string }> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id && user.role !== 'ADMIN') throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only delete your own itinerary');
    await this.prisma.itinerary.delete({ where: { id } });
    return { id };
  }
}
