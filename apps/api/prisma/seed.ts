/**
 * Nap du lieu mac dinh cho moi truong moi - `npm run prisma:seed`.
 *
 * Muc tieu: tai khoan ADMIN de test + 34 don vi hanh chinh + sample food places.
 *
 * Idempotent: chay lai nhieu lan khong tao trung email (dung `upsert`).
 */

import { Prisma, PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { SEED_PLACES } from './seed-places';
import { SEED_COMMUNITY_USERS, SEED_POSTS, SEED_SHORTLIST } from './seed-community';

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
  // Mat khau `Vivivu@2026`. TAI KHOAN QUAN TRI - doi truoc khi len production.
  { email: 'admin@vivivu.vn', fullName: 'Quan tri vien', role: 'ADMIN' },
  { email: 'manager@vivivu.vn', fullName: 'Quan ly khu vuc Ha Noi', role: 'MANAGER' },
  { email: 'user@vivivu.vn', fullName: 'Khach thuong', role: 'USER' },
  // Tai khoan de test khoa / xoa ma khong can tao lai moi lan.
  { email: 'suspended@vivivu.vn', fullName: 'Tai khoan bi khoa', role: 'USER' },
  { email: 'deleted@vivivu.vn', fullName: 'Tai khoan da xoa', role: 'USER' },
];

// =============================================================================
// 34 DON VI HANH CHINH CAP TINH: 27 tinh + 7 thanh pho truc thuoc TW
// Cap nhat theo cau truc hanh chinh 2025-2026
// =============================================================================
const SEED_REGIONS = [
  // 7 thanh pho truc thuoc trung uong
  { name: 'Ha Noi', slug: 'ha-noi', isCity: true, lat: 21.0285, lng: 105.8542 },
  { name: 'Ho Chi Minh', slug: 'tp-ho-chi-minh', isCity: true, lat: 10.8231, lng: 106.6297 },
  { name: 'Hai Phong', slug: 'hai-phong', isCity: true, lat: 20.8449, lng: 106.6881 },
  { name: 'Da Nang', slug: 'da-nang', isCity: true, lat: 16.0544, lng: 108.2022 },
  { name: 'Can Tho', slug: 'can-tho', isCity: true, lat: 10.0452, lng: 105.7469 },
  { name: 'Thua Thien Hue', slug: 'thua-thien-hue', isCity: true, lat: 16.4637, lng: 107.5909 },
  { name: 'Bac Ninh', slug: 'bac-ninh', isCity: true, lat: 21.1214, lng: 106.1110 },

  // 27 tinh (danh sach theo thu tu alphabet)
  { name: 'An Giang', slug: 'an-giang', isCity: false, lat: 10.5201, lng: 105.1250 },
  { name: 'Ba Ria - Vung Tau', slug: 'ba-ria-vung-tau', isCity: false, lat: 10.5418, lng: 107.2436 },
  { name: 'Bac Giang', slug: 'bac-giang', isCity: false, lat: 21.2731, lng: 106.1976 },
  { name: 'Bac Kan', slug: 'bac-kan', isCity: false, lat: 22.1473, lng: 105.8348 },
  { name: 'Ben Tre', slug: 'ben-tre', isCity: false, lat: 10.2441, lng: 106.3752 },
  { name: 'Binh Dinh', slug: 'binh-dinh', isCity: false, lat: 14.0863, lng: 108.9894 },
  { name: 'Binh Duong', slug: 'binh-duong', isCity: false, lat: 11.0695, lng: 106.6535 },
  { name: 'Binh Phuoc', slug: 'binh-phuoc', isCity: false, lat: 11.7538, lng: 107.0739 },
  { name: 'Binh Thuan', slug: 'binh-thuan', isCity: false, lat: 10.9293, lng: 108.1043 },
  { name: 'Ca Mau', slug: 'ca-mau', isCity: false, lat: 9.1769, lng: 105.1525 },
  { name: 'Cao Bang', slug: 'cao-bang', isCity: false, lat: 22.6657, lng: 106.2579 },
  { name: 'Dak Lak', slug: 'dak-lak', isCity: false, lat: 12.7100, lng: 108.2420 },
  { name: 'Dak Nong', slug: 'dak-nong', isCity: false, lat: 12.2644, lng: 107.6097 },
  { name: 'Dien Bien', slug: 'dien-bien', isCity: false, lat: 21.3851, lng: 103.0224 },
  { name: 'Dong Nai', slug: 'dong-nai', isCity: false, lat: 11.0689, lng: 107.1676 },
  { name: 'Dong Thap', slug: 'dong-thap', isCity: false, lat: 10.4938, lng: 105.6881 },
  { name: 'Gia Lai', slug: 'gia-lai', isCity: false, lat: 13.9879, lng: 108.0000 },
  { name: 'Ha Giang', slug: 'ha-giang', isCity: false, lat: 22.8232, lng: 104.9834 },
  { name: 'Ha Nam', slug: 'ha-nam', isCity: false, lat: 20.5814, lng: 105.9237 },
  { name: 'Ha Tinh', slug: 'ha-tinh', isCity: false, lat: 18.3490, lng: 105.9032 },
  { name: 'Hai Duong', slug: 'hai-duong', isCity: false, lat: 20.9405, lng: 106.3294 },
  { name: 'Hau Giang', slug: 'hau-giang', isCity: false, lat: 9.7578, lng: 105.6405 },
  { name: 'Hoa Binh', slug: 'hoa-binh', isCity: false, lat: 20.8131, lng: 105.3392 },
  { name: 'Hung Yen', slug: 'hung-yen', isCity: false, lat: 20.6463, lng: 106.0744 },
  { name: 'Khanh Hoa', slug: 'khanh-hoa', isCity: false, lat: 12.2588, lng: 109.0516 },
  { name: 'Kien Giang', slug: 'kien-giang', isCity: false, lat: 10.4080, lng: 105.0799 },
  { name: 'Kon Tum', slug: 'kon-tum', isCity: false, lat: 14.3497, lng: 108.0000 },
  { name: 'Lai Chau', slug: 'lai-chau', isCity: false, lat: 22.3848, lng: 103.4384 },
  { name: 'Lam Dong', slug: 'lam-dong', isCity: false, lat: 11.5752, lng: 108.1429 },
  { name: 'Lang Son', slug: 'lang-son', isCity: false, lat: 21.8587, lng: 106.7610 },
  { name: 'Lao Cai', slug: 'lao-cai', isCity: false, lat: 22.4862, lng: 103.9563 },
  { name: 'Long An', slug: 'long-an', isCity: false, lat: 10.6928, lng: 106.1589 },
  { name: 'Nam Dinh', slug: 'nam-dinh', isCity: false, lat: 20.4239, lng: 106.1771 },
  { name: 'Nghe An', slug: 'nghe-an', isCity: false, lat: 18.6791, lng: 105.6814 },
  { name: 'Ninh Binh', slug: 'ninh-binh', isCity: false, lat: 20.2541, lng: 105.9744 },
  { name: 'Ninh Thuan', slug: 'ninh-thuan', isCity: false, lat: 11.5775, lng: 108.8396 },
  { name: 'Phu Tho', slug: 'phu-tho', isCity: false, lat: 21.4188, lng: 105.2222 },
  { name: 'Phu Yen', slug: 'phu-yen', isCity: false, lat: 13.0887, lng: 109.0923 },
  { name: 'Quang Binh', slug: 'quang-binh', isCity: false, lat: 17.6108, lng: 106.3927 },
  { name: 'Quang Nam', slug: 'quang-nam', isCity: false, lat: 15.5734, lng: 108.1402 },
  { name: 'Quang Ngai', slug: 'quang-ngai', isCity: false, lat: 15.1214, lng: 108.7929 },
  { name: 'Quang Ninh', slug: 'quang-ninh', isCity: false, lat: 21.0062, lng: 107.2890 },
  { name: 'Quang Tri', slug: 'quang-tri', isCity: false, lat: 16.7389, lng: 107.0895 },
  { name: 'Soc Trang', slug: 'soc-trang', isCity: false, lat: 9.6029, lng: 105.9735 },
  { name: 'Son La', slug: 'son-la', isCity: false, lat: 21.3249, lng: 103.9113 },
  { name: 'Tay Ninh', slug: 'tay-ninh', isCity: false, lat: 11.3357, lng: 106.1176 },
  { name: 'Thai Binh', slug: 'thai-binh', isCity: false, lat: 20.4492, lng: 106.3367 },
  { name: 'Thai Nguyen', slug: 'thai-nguyen', isCity: false, lat: 21.5944, lng: 105.8482 },
  { name: 'Thanh Hoa', slug: 'thanh-hoa', isCity: false, lat: 19.8048, lng: 105.3969 },
  { name: 'Tien Giang', slug: 'tien-giang', isCity: false, lat: 10.4495, lng: 106.3425 },
  { name: 'Tra Vinh', slug: 'tra-vinh', isCity: false, lat: 9.9470, lng: 106.3379 },
  { name: 'Tuyen Quang', slug: 'tuyen-quang', isCity: false, lat: 21.7749, lng: 105.2274 },
  { name: 'Vinh Long', slug: 'vinh-long', isCity: false, lat: 10.2486, lng: 105.9657 },
  { name: 'Vinh Phuc', slug: 'vinh-phuc', isCity: false, lat: 21.3609, lng: 105.5972 },
  { name: 'Yen Bai', slug: 'yen-bai', isCity: false, lat: 21.7051, lng: 104.8617 },
];

/** Anh demo on dinh theo seed (picsum.photos, anh ngau nhien nhung co dinh theo ten). Thay bang anh that sau. */
function demoPhotoUrl(keywords: string, seed: string): string {
  const slug = `${keywords}-${seed}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return `https://picsum.photos/seed/${slug}/960/720`;
}

async function main(): Promise<void> {
  // Hash mot lan roi dung lai cho moi tai khoan - argon2 rat cham.
  const passwordHash = await argon2.hash(SEED_PASSWORD);

  // -------------------------------------------------------------------------
  // Seed Users
  // -------------------------------------------------------------------------
  for (const seed of SEED_USERS) {
    const data: Prisma.UserUncheckedCreateInput = {
      email: seed.email,
      fullName: seed.fullName,
      passwordHash,
      role: seed.role,
      locale: seed.locale ?? 'vi',
      status: 'ACTIVE',
      authProvider: 'LOCAL',
      emailVerifiedAt: new Date(),
      dateOfBirth: new Date('1995-01-15'),
      address: '123 Nguyen Hue, Quan 1, Ho Chi Minh',
    };

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
      update: data,
    });
  }

  // -------------------------------------------------------------------------
  // Seed Regions (34 don vi hanh chinh cap tinh)
  // -------------------------------------------------------------------------
  let regionCount = 0;
  for (const region of SEED_REGIONS) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      create: {
        name: region.name,
        slug: region.slug,
        isCity: region.isCity,
        lat: region.lat,
        lng: region.lng,
      },
      update: {
        name: region.name,
        isCity: region.isCity,
        lat: region.lat,
        lng: region.lng,
      },
    });
    regionCount++;
  }
  console.log(`Seed ${regionCount} regions (${SEED_REGIONS.filter(r => r.isCity).length} cities + ${SEED_REGIONS.filter(r => !r.isCity).length} provinces)`);

  // -------------------------------------------------------------------------
  // Seed Places (+ gio mo cua) - khop theo name + regionId de chay lai duoc
  // -------------------------------------------------------------------------
  let placeCount = 0;
  for (const place of SEED_PLACES) {
    const regionRecord = await prisma.region.findUnique({ where: { slug: place.regionSlug } });
    if (!regionRecord) continue;

    const data = {
      description: place.description,
      lat: place.lat,
      lng: place.lng,
      address: place.address,
      category: place.category,
      cuisineType: place.cuisineType ?? null,
      mealType: place.mealType ?? null,
      priceRange: place.priceRange ?? null,
      avgMealPrice: place.avgMealPrice ?? null,
      isHiddenPlace: place.isHiddenPlace ?? false,
      googleRating: place.googleRating ?? null,
      googleReviews: place.googleReviews ?? null,
      aiScore: place.aiScore ?? null,
    };

    const existing = await prisma.place.findFirst({
      where: { name: place.name, regionId: regionRecord.id },
      select: { id: true },
    });
    const row = existing
      ? await prisma.place.update({ where: { id: existing.id }, data })
      : await prisma.place.create({
          data: {
            ...data,
            name: place.name,
            regionId: regionRecord.id,
            status: place.status ?? 'APPROVED',
            source: 'VERIFIED_LOCAL',
          },
        });

    if (place.hours) {
      const [openTime, closeTime] = place.hours.split('-') as [string, string];
      const closed = new Set(place.closedDays ?? []);
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        const hour = { openTime, closeTime, isClosed: closed.has(dayOfWeek) };
        await prisma.openingHour.upsert({
          where: { placeId_dayOfWeek: { placeId: row.id, dayOfWeek } },
          create: { placeId: row.id, dayOfWeek, ...hour },
          update: hour,
        });
      }
    }
    // Anh demo: 1 anh/dia diem, on dinh theo ten (lock) de reload khong doi anh.
    const photoUrl = demoPhotoUrl(place.photo ?? `${place.category},${place.regionSlug.replace(/-/g, '')},vietnam`, place.name);
    const hasPhoto = await prisma.placePhoto.findFirst({ where: { placeId: row.id, url: photoUrl }, select: { id: true } });
    if (!hasPhoto) {
      await prisma.placePhoto.create({
        data: { placeId: row.id, url: photoUrl, caption: place.name, isVerified: true, uploadedByName: 'Vivivu' },
      });
    }
    placeCount++;
  }
  console.log(`Seed ${placeCount} sample places`);

  // -------------------------------------------------------------------------
  // Seed Community users + posts + comments + reactions
  // -------------------------------------------------------------------------
  for (const u of SEED_COMMUNITY_USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      create: {
        email: u.email, fullName: u.fullName, passwordHash, role: 'USER', locale: 'vi', status: 'ACTIVE',
        authProvider: 'LOCAL', emailVerifiedAt: new Date(),
      },
      update: { fullName: u.fullName },
    });
  }
  const userByEmail = new Map<string, { id: string; fullName: string }>();
  for (const u of await prisma.user.findMany({ select: { id: true, email: true, fullName: true } })) {
    userByEmail.set(u.email, { id: u.id, fullName: u.fullName });
  }
  const placeByName = new Map<string, { id: string; regionId: string | null }>();
  for (const pl of await prisma.place.findMany({ select: { id: true, name: true, regionId: true } })) {
    placeByName.set(pl.name, { id: pl.id, regionId: pl.regionId });
  }

  let postCount = 0;
  for (const post of SEED_POSTS) {
    const author = userByEmail.get(post.authorEmail);
    if (!author) continue;
    const place = post.placeName ? placeByName.get(post.placeName) : undefined;
    const region = await prisma.region.findUnique({ where: { slug: post.regionSlug }, select: { id: true } });
    const createdAt = new Date(Date.now() - post.daysAgo * 86_400_000);

    let row = await prisma.post.findFirst({ where: { title: post.title, authorId: author.id }, select: { id: true } });
    if (!row) {
      row = await prisma.post.create({
        data: {
          title: post.title, content: post.content, authorId: author.id,
          placeId: place?.id, regionId: region?.id ?? place?.regionId ?? null,
          status: 'APPROVED', createdAt,
          media: post.photo
            ? { create: [{ type: 'image', url: demoPhotoUrl(post.photo, post.title), status: 'APPROVED', uploadedByName: author.fullName, uploadedAt: createdAt }] }
            : undefined,
        },
        select: { id: true },
      });
    }
    for (const [i, c] of (post.comments ?? []).entries()) {
      const ca = userByEmail.get(c.authorEmail);
      if (!ca) continue;
      const exists = await prisma.comment.findFirst({ where: { postId: row.id, authorId: ca.id, content: c.content }, select: { id: true } });
      if (!exists) {
        await prisma.comment.create({
          data: { content: c.content, authorId: ca.id, authorName: ca.fullName, postId: row.id, createdAt: new Date(createdAt.getTime() + (i + 1) * 3_600_000) },
        });
      }
    }
    for (const r of post.reactions ?? []) {
      const ru = userByEmail.get(r.authorEmail);
      if (!ru) continue;
      await prisma.reaction.upsert({
        where: { userId_postId: { userId: ru.id, postId: row.id } },
        create: { type: r.type, userId: ru.id, userName: ru.fullName, postId: row.id },
        update: { type: r.type },
      });
    }
    postCount++;
  }
  console.log(`Seed ${postCount} community posts`);

  // Reaction len dia diem: vai luot "love"/"helpful" de trang place khong trong.
  const reactors = SEED_COMMUNITY_USERS.map((u) => userByEmail.get(u.email)).filter((u): u is { id: string; fullName: string } => Boolean(u));
  let placeReactionCount = 0;
  for (const [i, pl] of SEED_PLACES.entries()) {
    const target = placeByName.get(pl.name);
    if (!target) continue;
    const n = ((pl.aiScore ?? 7) >= 8.5 ? 3 : (pl.aiScore ?? 7) >= 8 ? 2 : 1);
    for (let k = 0; k < n && k < reactors.length; k++) {
      const ru = reactors[(i + k) % reactors.length]!;
      const type = pl.isHiddenPlace ? 'love' : k === 0 ? 'helpful' : 'like';
      await prisma.reaction.upsert({
        where: { userId_placeId: { userId: ru.id, placeId: target.id } },
        create: { type, userId: ru.id, userName: ru.fullName, placeId: target.id },
        update: {},
      });
      placeReactionCount++;
    }
  }
  console.log(`Seed ${placeReactionCount} place reactions`);

  // Shortlist mau cho user@vivivu.vn
  for (const [i, item] of SEED_SHORTLIST.entries()) {
    const u = userByEmail.get(item.userEmail);
    const target = placeByName.get(item.placeName);
    if (!u || !target) continue;
    await prisma.shortlist.upsert({
      where: { userId_placeId: { userId: u.id, placeId: target.id } },
      create: { userId: u.id, placeId: target.id, notes: item.notes, order: i },
      update: { notes: item.notes },
    });
  }

  // -------------------------------------------------------------------------
  // Seed Manager Regions (gan manager Ha Noi)
  // -------------------------------------------------------------------------
  const manager = await prisma.user.findUnique({ where: { email: 'manager@vivivu.vn' } });
  const hanoiRegion = await prisma.region.findUnique({ where: { slug: 'ha-noi' } });
  if (manager && hanoiRegion) {
    await prisma.managerRegion.upsert({
      where: { managerId_regionId: { managerId: manager.id, regionId: hanoiRegion.id } },
      create: { managerId: manager.id, regionId: hanoiRegion.id },
      update: {},
    });
    console.log(`Manager ${manager.email} duoc gan Ha Noi`);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const userCounts = await prisma.user.groupBy({ by: ['role'], _count: { _all: true } });
  console.log('\nSeed xong. Tong so tai khoan theo vai tro:');
  for (const row of userCounts) {
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
