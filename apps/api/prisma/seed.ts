/**
 * Nap du lieu mac dinh cho moi truong moi - `npm run prisma:seed`.
 *
 * Muc tieu: tai khoan ADMIN de test + 34 don vi hanh chinh + sample food places.
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

// =============================================================================
// SAMPLE FOOD PLACES (Stage 1-3)
// =============================================================================
interface SeedPlace {
  name: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  category: string;
  cuisineType?: string;
  mealType?: string;
  priceRange?: string;
  avgMealPrice?: number;
  isHiddenPlace?: boolean;
  regionSlug: string;
  status?: string;
  googleRating?: number;
  googleReviews?: number;
}

const SEED_PLACES: SeedPlace[] = [
  // Ha Noi - 5 dia diem mau
  {
    name: 'Pho Thin',
    description: 'Quan pho noi tieng Ha Noi, pho bo tai nuong that ngon',
    lat: 21.0278, lng: 105.8530,
    address: '13 Lo Duc, Hai Ba Trung, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 45000, isHiddenPlace: false,
    regionSlug: 'ha-noi', status: 'APPROVED', googleRating: 4.5, googleReviews: 1200,
  },
  {
    name: 'Bun Cha Huong Lien',
    description: 'Quan bun cha noi tieng, nam trong top 10 quat an the gioi',
    lat: 21.0275, lng: 105.8558,
    address: '24 Le Van Huu, Hai Ba Trung, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 55000, isHiddenPlace: false,
    regionSlug: 'ha-noi', status: 'APPROVED', googleRating: 4.6, googleReviews: 890,
  },
  {
    name: 'Cafe Giang',
    description: 'Noi ban ca phe trung sua dau tien tai Viet Nam',
    lat: 21.0295, lng: 105.8499,
    address: '39 Nguyen Huu Huan, Hoan Kiem, Ha Noi',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 25000, isHiddenPlace: true,
    regionSlug: 'ha-noi', status: 'APPROVED', googleRating: 4.3, googleReviews: 450,
  },
  {
    name: 'Banh Mi Huynh Hoa',
    description: 'Banh mi nuong gio chao noi tieng Ha Noi',
    lat: 21.0234, lng: 105.8548,
    address: '89 Phung Hung, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'all-day',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true,
    regionSlug: 'ha-noi', status: 'APPROVED', googleRating: 4.7, googleReviews: 2100,
  },
  {
    name: 'Hoan Kiem Lake',
    description: 'Ho tro nuoc bien hinh thanh',
    lat: 21.0285, lng: 105.8526,
    address: 'Hoan Kiem, Ha Noi',
    category: 'attraction',
    regionSlug: 'ha-noi', status: 'APPROVED', googleRating: 4.6, googleReviews: 15000,
  },

  // Ho Chi Minh - 5 dia diem mau
  {
    name: 'Banh Canh Cua Ca Map',
    description: 'Quan banh canh cua ngon nhat Sai Gon',
    lat: 10.7890, lng: 106.6880,
    address: '46 Nguyen Trung Truc, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 50000, isHiddenPlace: true,
    regionSlug: 'tp-ho-chi-minh', status: 'APPROVED', googleRating: 4.4, googleReviews: 780,
  },
  {
    name: 'Com Tam Sai Gon',
    description: 'Com tam suon bi cha trung - mon an duooi cua nguoi Sai Gon',
    lat: 10.7762, lng: 106.6985,
    address: '293 Nguyen Trai, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: false,
    regionSlug: 'tp-ho-chi-minh', status: 'APPROVED', googleRating: 4.2, googleReviews: 920,
  },
  {
    name: 'Highland Cafe Nguyen Hue',
    description: 'Cafe Highlands noi tieng, view Saigon River',
    lat: 10.7728, lng: 106.7042,
    address: '59 Nguyen Hue, Quan 1, TP.HCM',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 65000, isHiddenPlace: false,
    regionSlug: 'tp-ho-chi-minh', status: 'APPROVED', googleRating: 4.1, googleReviews: 1500,
  },
  {
    name: 'Ben Thanh Market',
    description: 'Cho lon nhat Sai Gon - dau mua sam',
    lat: 10.7721, lng: 106.6980,
    address: 'Le Lai, Quan 1, TP.HCM',
    category: 'shopping',
    regionSlug: 'tp-ho-chi-minh', status: 'APPROVED', googleRating: 4.3, googleReviews: 18000,
  },
  {
    name: 'Notre Dame Cathedral',
    description: 'Nha tho lon Saigon, diem tham quan noi tieng',
    lat: 10.7795, lng: 106.6990,
    address: 'Cong Truong Cong Vien, Quan 1, TP.HCM',
    category: 'attraction',
    regionSlug: 'tp-ho-chi-minh', status: 'APPROVED', googleRating: 4.5, googleReviews: 12000,
  },

  // Da Nang - 3 dia diem mau
  {
    name: 'Mi Quang Ngon',
    description: 'Mi quang Danang - am thuc cua thanh pho bien',
    lat: 16.0544, lng: 108.2022,
    address: '166 Tran Phu, Hai Chau, Da Nang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true,
    regionSlug: 'da-nang', status: 'APPROVED', googleRating: 4.5, googleReviews: 650,
  },
  {
    name: 'My Khe Beach',
    description: 'Bai bien dep nguoi Danang, noi choi bien cua dia phuong',
    lat: 16.0605, lng: 108.2415,
    address: 'Phuoc My, Son Tra, Da Nang',
    category: 'attraction',
    regionSlug: 'da-nang', status: 'APPROVED', googleRating: 4.6, googleReviews: 8000,
  },
  {
    name: 'Highland Coffee Tran Phu',
    description: 'Cafe Highlands view bien',
    lat: 16.0620, lng: 108.1978,
    address: '89 Tran Phu, Hai Chau, Da Nang',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 55000, isHiddenPlace: false,
    regionSlug: 'da-nang', status: 'APPROVED', googleRating: 4.2, googleReviews: 420,
  },
];

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
  // Seed Places (sample food places)
  // -------------------------------------------------------------------------
  let placeCount = 0;
  for (const place of SEED_PLACES) {
    const regionRecord = await prisma.region.findUnique({ where: { slug: place.regionSlug } });
    if (!regionRecord) continue;

    // Kiem tra place da ton tai chua (theo name + regionId)
    const existing = await prisma.place.findFirst({
      where: { name: place.name, regionId: regionRecord.id },
    });

    if (existing) {
      // Cap nhat place
      await prisma.place.update({
        where: { id: existing.id },
        data: {
          description: place.description,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          googleRating: place.googleRating,
          googleReviews: place.googleReviews,
        },
      });
    } else {
      // Tao moi
      await prisma.place.create({
        data: {
          name: place.name,
          description: place.description,
          lat: place.lat,
          lng: place.lng,
          address: place.address,
          category: place.category,
          cuisineType: place.cuisineType,
          mealType: place.mealType,
          priceRange: place.priceRange,
          avgMealPrice: place.avgMealPrice,
          isHiddenPlace: place.isHiddenPlace ?? false,
          regionId: regionRecord.id,
          status: place.status ?? 'APPROVED',
          source: 'VERIFIED_LOCAL',
          googleRating: place.googleRating,
          googleReviews: place.googleReviews,
        },
      });
    }
    placeCount++;
  }
  console.log(`Seed ${placeCount} sample places`);

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
