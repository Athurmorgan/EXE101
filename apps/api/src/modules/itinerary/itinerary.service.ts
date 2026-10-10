import { Injectable } from '@nestjs/common';
import { AUDIT_ACTIONS } from '@vivivu/shared';
import type { Itinerary } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { AuditService } from '../audit/audit.service';
import type { AuthUser } from '../../common/decorators';
import { AiService } from '../ai/ai.service';

@Injectable()
export class ItineraryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly aiService: AiService,
  ) {}

  async create(dto: { regionId: string; startDate: string; endDate: string; title?: string; budgetVnd?: number }, user: AuthUser): Promise<Itinerary> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    const days = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return this.prisma.itinerary.create({
      data: {
        userId: user.id,
        regionId: dto.regionId,
        startDate,
        endDate,
        days,
        title: dto.title,
        estimatedCost: dto.budgetVnd,
        status: 'DRAFT',
      },
    }) as unknown as Itinerary;
  }

  async generateOptions(itineraryId: string, user: AuthUser): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id: itineraryId } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only generate options for your own itinerary');

    await this.prisma.itineraryStop.deleteMany({ where: { itineraryId } });

    const aiResult = await this.aiService.generate5Options({
      regionId: itinerary.regionId!,
      startDate: itinerary.startDate.toISOString().slice(0, 10),
      endDate: itinerary.endDate.toISOString().slice(0, 10),
      budgetVnd: itinerary.estimatedCost ?? undefined,
    });

    for (const option of aiResult.options) {
      let orderInDay = 0;
      for (const day of option.days) {
        for (const stop of day.stops) {
          await this.prisma.itineraryStop.create({
            data: {
              itineraryId,
              optionNumber: option.optionNumber,
              dayNumber: day.dayNumber,
              orderInDay: orderInDay++,
              placeName: stop.name,
              placeLat: stop.lat,
              placeLng: stop.lng,
              placeAddress: stop.address,
              stopType: stop.stopType,
              mealType: stop.mealType ?? null,
              scheduledTime: stop.scheduledTime,
              estimatedDuration: stop.estimatedDurationMin,
              estimatedCost: stop.estimatedCost,
              travelTimeFromPrevMin: stop.travelTimeFromPrevMin,
              notes: stop.notes,
            },
          });
        }
      }
    }

    const totalCost = aiResult.options.reduce((sum, opt) => sum + (opt.estimatedCost ?? 0), 0);
    await this.prisma.itinerary.update({ where: { id: itineraryId }, data: { estimatedCost: totalCost } });
    await this.audit.record({ action: AUDIT_ACTIONS.ITINERARY_GENERATE, targetType: 'Itinerary', targetId: itineraryId, actor: { id: user.id, email: user.email } });

    return this.prisma.itinerary.findUnique({ where: { id: itineraryId } }) as unknown as Itinerary;
  }

  async applyOption(itineraryId: string, dto: { optionNumber: number }, user: AuthUser): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id: itineraryId }, include: { stops: true } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only apply options for your own itinerary');

    await this.prisma.itineraryStop.deleteMany({ where: { itineraryId, optionNumber: { not: dto.optionNumber } } });

    const updated = await this.prisma.itinerary.update({
      where: { id: itineraryId },
      data: { selectedOption: dto.optionNumber, status: 'APPLIED' },
    });
    await this.audit.record({ action: AUDIT_ACTIONS.ITINERARY_APPLY, targetType: 'Itinerary', targetId: itineraryId, actor: { id: user.id, email: user.email }, after: { selectedOption: dto.optionNumber } });

    return updated as unknown as Itinerary;
  }

  async findByUser(userId: string): Promise<Itinerary[]> {
    return this.prisma.itinerary.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { stops: { orderBy: [{ dayNumber: 'asc' }, { orderInDay: 'asc' }] }, region: true },
    }) as unknown as Itinerary[];
  }

  async findOne(id: string, userId?: string): Promise<Itinerary> {
    const itinerary = await this.prisma.itinerary.findUnique({
      where: { id },
      include: { stops: { orderBy: [{ optionNumber: 'asc' }, { dayNumber: 'asc' }, { orderInDay: 'asc' }] }, region: true, user: { select: { id: true, fullName: true } } },
    });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (userId && itinerary.userId !== userId) throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only view your own itinerary');
    return itinerary as unknown as Itinerary;
  }

  async remove(id: string, user: AuthUser): Promise<{ id: string }> {
    const itinerary = await this.prisma.itinerary.findUnique({ where: { id } });
    if (!itinerary) throw AppException.notFound('Itinerary');
    if (itinerary.userId !== user.id && user.role !== 'ADMIN') throw new AppException(ErrorCode.FORBIDDEN, 403, 'You can only delete your own itinerary');
    await this.prisma.itinerary.delete({ where: { id } });
    return { id };
  }
}
