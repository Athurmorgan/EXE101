/**
 * Nap du lieu mac dinh cho moi truong moi — `npm run prisma:seed`.
 *
 * Muc tieu duy nhat: **co tai khoan ADMIN de test phan quyen**. Khong tao
 * du lieu du lich o day (Google Maps khong seed duoc) va khong hardcode tai
 * khoan that — mat khau seed chi dung o moi truong local/dev.
 *
 * Idempotent: chay lai nhieu lan khong tao trung email (dung `upsert`).
 */

import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

/** Mat khau dung chung cho moi tai khoan seed. Chi co y nghia o local/dev. */
const SEED_PASSWORD = 'Vivivu@2026';

interface SeedUser {
  email: string;
  fullName: string;
  role: 'ADMIN' | 'MANAGER' | 'USER';
  locale?: 'vi' | 'en';
}

const SEED_USERS: SeedUser[] = [
  // Mat khau `Vivivu@2026`. TAI KHOAN QUAN TRI — doi truoc khi len production.
  { email: 'admin@vivivu.vn', fullName: 'Quan tri vien', role: 'ADMIN' },
  { email: 'manager@vivivu.vn', fullName: 'Quan ly khu vuc', role: 'MANAGER' },
  { email: 'user@vivivu.vn', fullName: 'Khach thuong', role: 'USER' },
  // Tai khoan de test khoa / xoa ma khong can tao lai moi lan.
  { email: 'suspended@vivivu.vn', fullName: 'Tai khoan bi khoa', role: 'USER' },
  { email: 'deleted@vivivu.vn', fullName: 'Tai khoan da xoa', role: 'USER' },
];

async function main(): Promise<void> {
  // Hash mot lan roi dung lai cho moi tai khoan — argon2 rat cham, hash 5 lan
  // lam `prisma db seed` cham khong can thiet.
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  for (const seed of SEED_USERS) {
    // Khai bao kieu `Prisma.UserUncheckedCreateInput` de gan them truong sau
    // khong bi TypeScript thu hep lai thanh object literal ban dau.
    const data: Prisma.UserUncheckedCreateInput = {
      email: seed.email,
      fullName: seed.fullName,
      passwordHash,
      role: seed.role,
      locale: seed.locale ?? 'vi',
      // Seed tai khoan deu da xac thuc email — khong can gui ma verify.
      status: 'ACTIVE',
      authProvider: 'LOCAL',
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date('1995-01-15'),
      address: '123 Nguyen Hue, Quan 1, Ho Chi Minh',
    };

    // Rieng 2 tai khoan cuoi dat trang thai rieng de test khoa / xoa.
    if (seed.email === 'suspended@vivivu.vn') {
      data.status = 'SUSPENDED';
      data.suspendedAt = new Date();
      data.suspendReason = 'Tai khoan mau - dung de test khoa tai khoan';
    }
    if (seed.email === 'deleted@vivivu.vn') {
      data.status = 'DELETED';
      data.deletedAt = new Date();
    }

    await prisma.user.upsert({
      where: { email: seed.email },
      create: data,
      // Chi cap nhat khi doi — `upsert` se ghi lai `emailVerifiedAt` moi lan
      // chay va lam mat thong tin "xac thuc luc nao" cua tai khoan that.
      update: data,
    });
  }

  const counts = await prisma.user.groupBy({ by: ['role'], _count: { _all: true } });
  console.log('Seed xong. Tong so tai khoan theo vai tro:');
  for (const row of counts) {
    console.log(`  ${row.role}: ${row._count._all}`);
  }
  console.log(`\nDang nhap duoc bang mat khau: ${SEED_PASSWORD}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed that bai:', error);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
