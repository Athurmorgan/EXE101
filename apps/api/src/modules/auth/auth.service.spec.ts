import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { AppException, ErrorCode } from '../../common/errors/app.exception';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';

// argon2 la native addon — giam thoi gian hash trong test, thuat toan goc nguyen.
jest.mock('argon2', () => ({
  hash: jest.fn(async (plain: string) => `hashed:${plain}`),
  verify: jest.fn(async (hashed: string, plain: string) => hashed === `hashed:${plain}`),
}));

/** Ban ghi user nho gon, du cho cac nhanh test. */
function makeUser(overrides: Record<string, unknown> = {}) {
  return {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'khach@example.com',
    passwordHash: 'hashed:matkhau123',
    fullName: 'Nguyen Van A',
    avatarUrl: null,
    dateOfBirth: new Date('1995-04-12'),
    address: null,
    googleId: null,
    locale: 'vi',
    role: 'USER',
    status: 'ACTIVE',
    authProvider: 'LOCAL',
    emailVerifiedAt: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let prisma: { user: { findUnique: jest.Mock; create: jest.Mock }; refreshToken: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock; updateMany: jest.Mock } };
  let config: { get: jest.Mock; getOrThrow: jest.Mock };

  beforeEach(async () => {
    prisma = {
      user: { findUnique: jest.fn(), create: jest.fn() },
      refreshToken: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn() },
    };

    const store: Record<string, string> = {
      JWT_ACCESS_SECRET: 'test-secret',
      JWT_ACCESS_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '30d',
    };
    config = {
      get: jest.fn((key: string, fallback?: string) => store[key] ?? fallback),
      getOrThrow: jest.fn((key: string) => store[key]),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
        { provide: JwtService, useValue: { signAsync: jest.fn(async () => 'access.jwt.token') } },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('register', () => {
    it('tao tai khoan voi role USER va status PENDING', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
        makeUser(data),
      );

      const { user, verificationRequired } = await service.register({
        email: '  KHACH@Example.COM  ',
        password: 'matkhau123',
        fullName: ' Nguyen Van A ',
        dateOfBirth: new Date('1995-04-12'),
        address: '  123 Nguyen Hue  ',
        locale: 'en',
      });

      // Email phai chuan hoa ve chu thuong va bo khoang trang.
      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'khach@example.com',
            fullName: 'Nguyen Van A',
            role: 'USER',
            // Chua xac thuc email -> PENDING. KHONG chan dang nhap.
            status: 'PENDING',
            authProvider: 'LOCAL',
            locale: 'en',
            dateOfBirth: new Date('1995-04-12'),
            address: '123 Nguyen Hue',
          }),
        }),
      );
      expect(user.role).toBe('USER');
      // Client phai verify truoc roi moi login de lay token.
      expect(verificationRequired).toBe(true);
    });

    it('tu dinh locale khi client khong gui', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
        makeUser(data),
      );

      await service.register({ email: 'a@b.com', password: 'matkhau123', fullName: 'A B' });

      expect(prisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ locale: 'vi' }) }),
      );
    });

    it('tu choi email da ton tai', async () => {
      prisma.user.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(
        service.register({ email: 'khach@example.com', password: 'matkhau123', fullName: 'A B' }),
      ).rejects.toMatchObject({ code: ErrorCode.EMAIL_ALREADY_EXISTS, status: 409 });
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('cap token khi mat khau dung', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      const { user, tokens } = await service.login({
        email: 'KHACH@example.com',
        password: 'matkhau123',
      });

      expect(user.email).toBe('khach@example.com');
      expect(tokens.expiresIn).toBe(900);
    });

    it('bao loi chung khi email khong ton tai', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'khong@co.com', password: 'matkhau123' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    });

    it('bao loi chung khi mat khau sai', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser());

      await expect(
        service.login({ email: 'khach@example.com', password: 'saimatkhau' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    });

    it('khong cho tai khoan GOOGLE dang nhap bang mat khau', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ passwordHash: null }));

      await expect(
        service.login({ email: 'khach@example.com', password: 'matkhau123' }),
      ).rejects.toMatchObject({ code: ErrorCode.INVALID_CREDENTIALS });
    });

    it('chan tai khoan da bi khoa', async () => {
      prisma.user.findUnique.mockResolvedValue(makeUser({ status: 'SUSPENDED' }));

      await expect(
        service.login({ email: 'khach@example.com', password: 'matkhau123' }),
      ).rejects.toMatchObject({ code: ErrorCode.ACCOUNT_SUSPENDED });
    });
  });

  describe('refresh', () => {
    it('thu hoi token cu roi cap token moi', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() + 60_000),
        user: makeUser(),
      });
      prisma.refreshToken.update.mockResolvedValue({});

      const { tokens } = await service.refresh('token-goc');

      expect(prisma.refreshToken.update).toHaveBeenCalledWith({
        where: { id: 'token-1' },
        data: { revokedAt: expect.any(Date) },
      });
      expect(tokens.accessToken).toBe('access.jwt.token');
    });

    it('tu choi token da thu hoi', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 60_000),
        user: makeUser(),
      });

      await expect(service.refresh('token-cu')).rejects.toMatchObject({
        code: ErrorCode.TOKEN_EXPIRED,
      });
    });

    it('tu choi token het han', async () => {
      prisma.refreshToken.findUnique.mockResolvedValue({
        id: 'token-1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1_000),
        user: makeUser(),
      });

      await expect(service.refresh('token-het-han')).rejects.toMatchObject({
        code: ErrorCode.TOKEN_EXPIRED,
      });
    });

    it('tu choi khi khong co cookie', async () => {
      await expect(service.refresh(undefined)).rejects.toBeInstanceOf(AppException);
      expect(prisma.refreshToken.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('khong lam gi khi khong co token', async () => {
      await service.logout(undefined);
      expect(prisma.refreshToken.updateMany).not.toHaveBeenCalled();
    });

    it('thu hoi token theo hash', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });
      await service.logout('token-goc');
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ revokedAt: null }),
        }),
      );
    });
  });

  describe('logoutAll', () => {
    it('thu hoi moi phien va tra ve so luong', async () => {
      prisma.refreshToken.updateMany.mockResolvedValue({ count: 3 });
      await expect(service.logoutAll('user-1')).resolves.toBe(3);
    });
  });

  describe('durationInSeconds', () => {
    it.each([
      ['15m', 900],
      ['30d', 2_592_000],
      ['2h', 7200],
      ['45s', 45],
      ['900', 900],
    ])('chuyen %s thanh %i giay', (input, expected) => {
      expect(service.durationInSeconds(input)).toBe(expected);
    });

    it('fallback 900 khi chuoi khong hop le', () => {
      expect(service.durationInSeconds('abc')).toBe(900);
    });
  });

  describe('hash mat khau', () => {
    it('dung argon2, khong luu ban ro', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) =>
        makeUser(data),
      );

      await service.register({ email: 'a@b.com', password: 'matkhau123', fullName: 'A B' });

      expect(argon2.hash).toHaveBeenCalledWith('matkhau123');
      const createArgs = prisma.user.create.mock.calls[0]?.[0] as { data: Record<string, unknown> };
      expect(createArgs.data['passwordHash']).toBe('hashed:matkhau123');
      expect(createArgs.data['passwordHash']).not.toBe('matkhau123');
    });
  });
});
