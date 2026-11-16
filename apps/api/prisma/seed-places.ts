/**
 * Dia diem mau cho demo planner. Toa do lay gan dung tu ban do cong khai;
 * gio mo cua la gio pho bien cua tung quan (de scheduler co du lieu de xep).
 *
 * `hours`: "HH:mm-HH:mm" ap dung moi ngay; `closedDays`: 0 = CN ... 6 = T7.
 */

export interface SeedPlace {
  name: string;
  description: string;
  lat: number;
  lng: number;
  address: string;
  category: 'restaurant' | 'cafe' | 'attraction' | 'shopping' | 'hotel';
  cuisineType?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'coffee' | 'all-day';
  priceRange?: 'budget' | 'moderate' | 'high-end';
  avgMealPrice?: number;
  isHiddenPlace?: boolean;
  regionSlug: string;
  status?: string;
  googleRating?: number;
  googleReviews?: number;
  /** 0-10, dung de xep hang khi chon dia diem. */
  aiScore?: number;
  hours?: string;
  closedDays?: number[];
  /** Tu khoa anh demo (loremflickr); bo trong = suy ra tu category + vung. */
  photo?: string;
}

const HN = 'ha-noi';
const HCM = 'tp-ho-chi-minh';
const DN = 'da-nang';
const HUE = 'thua-thien-hue';
const DALAT = 'lam-dong';
const NT = 'khanh-hoa';
const PQ = 'kien-giang';
const SAPA = 'lao-cai';
const CT = 'can-tho';
const HL = 'quang-ninh';
const HP = 'hai-phong';

export const SEED_PLACES: SeedPlace[] = [
  // ===========================================================================
  // HA NOI
  // ===========================================================================
  {
    name: 'Pho Thin',
    description: 'Pho bo tai lan xao voi hanh, nuoc dung beo - quan pho ky cuu tu 1979.',
    lat: 21.0160, lng: 105.8560, address: '13 Lo Duc, Hai Ba Trung, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 60000, googleRating: 4.3, googleReviews: 3200, aiScore: 8.6,
    regionSlug: HN, hours: '06:00-20:30',
  },
  {
    name: 'Bun Cha Huong Lien',
    description: 'Quan bun cha "Obama" - cha nuong than hoa, nem cua be.',
    lat: 21.0145, lng: 105.8560, address: '24 Le Van Huu, Hai Ba Trung, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 55000, googleRating: 4.3, googleReviews: 6800, aiScore: 8.4,
    regionSlug: HN, hours: '08:00-20:00',
  },
  {
    name: 'Cafe Giang',
    description: 'Noi khai sinh ca phe trung Ha Noi (1946), ngo nho tren pho Nguyen Huu Huan.',
    lat: 21.0330, lng: 105.8535, address: '39 Nguyen Huu Huan, Hoan Kiem, Ha Noi',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 9000, aiScore: 9.0,
    regionSlug: HN, hours: '07:00-22:00',
  },
  {
    name: 'Banh Mi Huynh Hoa',
    description: 'Banh mi pate day dan, an sang hoac an nhe giua buoi.',
    lat: 21.0234, lng: 105.8548, address: '89 Phung Hung, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'all-day',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true, googleRating: 4.5, googleReviews: 2100, aiScore: 7.6,
    regionSlug: HN, hours: '06:30-21:00',
  },
  {
    name: 'Hoan Kiem Lake',
    description: 'Trai tim cua Ha Noi: di bo quanh ho, cau The Huc, den Ngoc Son.',
    lat: 21.0287, lng: 105.8524, address: 'Hoan Kiem, Ha Noi',
    category: 'attraction', googleRating: 4.6, googleReviews: 52000, aiScore: 9.2,
    regionSlug: HN, hours: '05:00-23:00',
  },
  {
    name: 'Temple of Literature',
    description: 'Van Mieu - Quoc Tu Giam, truong dai hoc dau tien cua Viet Nam (1070).',
    lat: 21.0294, lng: 105.8356, address: '58 Quoc Tu Giam, Dong Da, Ha Noi',
    category: 'attraction', googleRating: 4.5, googleReviews: 38000, aiScore: 8.8,
    regionSlug: HN, hours: '08:00-17:00',
  },
  {
    name: 'Hoa Lo Prison Museum',
    description: 'Nha tu Hoa Lo - trien lam ve thoi Phap thuoc va chien tranh, co audio guide.',
    lat: 21.0253, lng: 105.8464, address: '1 Hoa Lo, Hoan Kiem, Ha Noi',
    category: 'attraction', googleRating: 4.5, googleReviews: 21000, aiScore: 8.5,
    regionSlug: HN, hours: '08:00-17:00',
  },
  {
    name: 'Vietnam Museum of Ethnology',
    description: 'Bao tang Dan toc hoc - nha san, nha rong cua 54 dan toc ngoai troi.',
    lat: 21.0404, lng: 105.7990, address: 'Nguyen Van Huyen, Cau Giay, Ha Noi',
    category: 'attraction', googleRating: 4.5, googleReviews: 12000, aiScore: 8.3,
    regionSlug: HN, hours: '08:30-17:30', closedDays: [1],
  },
  {
    name: 'Train Street',
    description: 'Pho duong tau Phung Hung - ngoi cafe sat ray, tau chay qua vai lan moi ngay.',
    lat: 21.0245, lng: 105.8447, address: 'Phung Hung, Hoan Kiem, Ha Noi',
    category: 'attraction', isHiddenPlace: true, googleRating: 4.4, googleReviews: 9500, aiScore: 8.0,
    regionSlug: HN, hours: '08:00-22:00',
  },
  {
    name: 'Long Bien Bridge',
    description: 'Cau thep Phap xay 1902, di bo luc hoang hon nhin ra bai giua song Hong.',
    lat: 21.0437, lng: 105.8585, address: 'Long Bien, Ha Noi',
    category: 'attraction', googleRating: 4.5, googleReviews: 7000, aiScore: 7.8,
    regionSlug: HN, hours: '05:00-23:00',
  },
  {
    name: 'Tran Quoc Pagoda',
    description: 'Chua co nhat Ha Noi tren ban dao nho giua Ho Tay, dep nhat luc chieu muon.',
    lat: 21.0480, lng: 105.8366, address: 'Thanh Nien, Tay Ho, Ha Noi',
    category: 'attraction', googleRating: 4.6, googleReviews: 16000, aiScore: 8.4,
    regionSlug: HN, hours: '07:30-17:30',
  },
  {
    name: 'Dong Xuan Market',
    description: 'Cho lon nhat pho co - do kho, vai, va hang an vat phia sau cho.',
    lat: 21.0381, lng: 105.8495, address: 'Dong Xuan, Hoan Kiem, Ha Noi',
    category: 'shopping', googleRating: 4.1, googleReviews: 14000, aiScore: 7.2,
    regionSlug: HN, hours: '06:00-18:00',
  },
  {
    name: 'Hang Gai Silk Street',
    description: 'Pho Hang Gai - lua, ao dai may do, qua luu niem thu cong.',
    lat: 21.0317, lng: 105.8494, address: 'Hang Gai, Hoan Kiem, Ha Noi',
    category: 'shopping', googleRating: 4.3, googleReviews: 2200, aiScore: 7.0,
    regionSlug: HN, hours: '09:00-21:00',
  },
  {
    name: 'Pho Gia Truyen Bat Dan',
    description: 'Pho bo chin/tai noi tieng, tu buoc xep hang bung bat - dac san buoi sang pho co.',
    lat: 21.0330, lng: 105.8462, address: '49 Bat Dan, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 55000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 4100, aiScore: 8.7,
    regionSlug: HN, hours: '06:00-10:00',
  },
  {
    name: 'Cha Ca Thang Long',
    description: 'Cha ca La Vong nuong tai ban voi thi la, bun va mam tom.',
    lat: 21.0318, lng: 105.8483, address: '6B Duong Thanh, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 150000, googleRating: 4.4, googleReviews: 5600, aiScore: 8.5,
    regionSlug: HN, hours: '10:30-21:30',
  },
  {
    name: 'Bun Bo Nam Bo Hang Dieu',
    description: 'Bun bo xao kieu Nam, rau song, lac rang - an trua nhanh gon.',
    lat: 21.0330, lng: 105.8466, address: '67 Hang Dieu, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 65000, googleRating: 4.3, googleReviews: 3800, aiScore: 8.1,
    regionSlug: HN, hours: '07:00-22:00',
  },
  {
    name: 'Quan An Ngon Phan Boi Chau',
    description: 'Hang chuc mon duong pho ba mien trong mot san vuon - hop nhom dong va gia dinh.',
    lat: 21.0255, lng: 105.8445, address: '18 Phan Boi Chau, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 180000, googleRating: 4.3, googleReviews: 11000, aiScore: 8.2,
    regionSlug: HN, hours: '06:30-22:30',
  },
  {
    name: 'Uu Dam Chay',
    description: 'Nha hang chay sang trong, menu mua, khong gian yen tinh.',
    lat: 21.0230, lng: 105.8456, address: '34 Hang Bai, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vegetarian', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 200000, googleRating: 4.5, googleReviews: 2400, aiScore: 8.3,
    regionSlug: HN, hours: '10:00-22:00',
  },
  {
    name: 'Loading T Cafe',
    description: 'Cafe trong biet thu Phap co tren tang 2, ca phe trung va banh ngot.',
    lat: 21.0236, lng: 105.8521, address: '8 Chan Cam, Hoan Kiem, Ha Noi',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 45000, isHiddenPlace: true, googleRating: 4.5, googleReviews: 1900, aiScore: 8.2,
    regionSlug: HN, hours: '08:00-22:00',
  },
  {
    name: 'Tranquil Books & Coffee',
    description: 'Cafe sach nhe nhang, chi noi khe, hop buoi chieu doc sach.',
    lat: 21.0288, lng: 105.8478, address: '5 Nguyen Quang Bich, Hoan Kiem, Ha Noi',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 50000, isHiddenPlace: true, googleRating: 4.6, googleReviews: 2100, aiScore: 8.0,
    regionSlug: HN, hours: '08:00-23:00',
  },
  {
    name: 'Ta Hien Beer Corner',
    description: 'Nga tu bia hoi quoc te - ghe nhua, bia hoi 10k, nem chua ran.',
    lat: 21.0352, lng: 105.8521, address: 'Ta Hien, Hoan Kiem, Ha Noi',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'budget', avgMealPrice: 80000, googleRating: 4.3, googleReviews: 7000, aiScore: 7.9,
    regionSlug: HN, hours: '16:00-23:30',
  },

  // ===========================================================================
  // HO CHI MINH
  // ===========================================================================
  {
    name: 'Banh Canh Cua Ca Map',
    description: 'Banh canh cua nuoc sanh, cang cua that - quan ven duong Quan 1.',
    lat: 10.7890, lng: 106.6880, address: '46 Nguyen Trung Truc, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 50000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 780, aiScore: 7.8,
    regionSlug: HCM, hours: '06:00-21:00',
  },
  {
    name: 'Com Tam Sai Gon',
    description: 'Com tam suon bi cha trung, mo hanh - bua trua chuan Sai Gon.',
    lat: 10.7762, lng: 106.6985, address: '293 Nguyen Trai, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 45000, googleRating: 4.2, googleReviews: 920, aiScore: 7.5,
    regionSlug: HCM, hours: '06:00-22:00',
  },
  {
    name: 'Highland Cafe Nguyen Hue',
    description: 'Highlands tren pho di bo Nguyen Hue, ngoi ngoai troi ngam dong nguoi.',
    lat: 10.7728, lng: 106.7042, address: '59 Nguyen Hue, Quan 1, TP.HCM',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 65000, googleRating: 4.1, googleReviews: 1500, aiScore: 6.8,
    regionSlug: HCM, hours: '07:00-23:00',
  },
  {
    name: 'Ben Thanh Market',
    description: 'Cho bieu tuong Sai Gon - do luu niem, ca phe, va khu an uong ben trong.',
    lat: 10.7721, lng: 106.6980, address: 'Le Loi, Quan 1, TP.HCM',
    category: 'shopping', googleRating: 4.2, googleReviews: 45000, aiScore: 8.0,
    regionSlug: HCM, hours: '06:00-19:00',
  },
  {
    name: 'Notre Dame Cathedral',
    description: 'Nha tho Duc Ba - gach do Marseille, cong trinh Phap tieu bieu cua Sai Gon.',
    lat: 10.7798, lng: 106.6990, address: '1 Cong xa Paris, Quan 1, TP.HCM',
    category: 'attraction', googleRating: 4.5, googleReviews: 30000, aiScore: 8.4,
    regionSlug: HCM, hours: '08:00-17:00',
  },
  {
    name: 'War Remnants Museum',
    description: 'Bao tang Chung tich Chien tranh - trien lam anh nang nhung quan trong.',
    lat: 10.7794, lng: 106.6921, address: '28 Vo Van Tan, Quan 3, TP.HCM',
    category: 'attraction', googleRating: 4.6, googleReviews: 48000, aiScore: 8.9,
    regionSlug: HCM, hours: '07:30-17:30',
  },
  {
    name: 'Independence Palace',
    description: 'Dinh Doc Lap - kien truc 1960s, ham chi huy va phong hop con nguyen ban.',
    lat: 10.7770, lng: 106.6953, address: '135 Nam Ky Khoi Nghia, Quan 1, TP.HCM',
    category: 'attraction', googleRating: 4.5, googleReviews: 32000, aiScore: 8.5,
    regionSlug: HCM, hours: '08:00-16:30',
  },
  {
    name: 'Saigon Central Post Office',
    description: 'Buu dien Thanh pho - mai vom thep Gustave Eiffel, van gui thu duoc.',
    lat: 10.7799, lng: 106.6999, address: '2 Cong xa Paris, Quan 1, TP.HCM',
    category: 'attraction', googleRating: 4.5, googleReviews: 28000, aiScore: 8.0,
    regionSlug: HCM, hours: '07:00-19:00',
  },
  {
    name: 'Cho Lon - Binh Tay Market',
    description: 'Cho Binh Tay o Cho Lon - khu nguoi Hoa, chua Ba Thien Hau gan do.',
    lat: 10.7497, lng: 106.6502, address: '57A Thap Muoi, Quan 6, TP.HCM',
    category: 'shopping', googleRating: 4.2, googleReviews: 9000, aiScore: 7.6,
    regionSlug: HCM, hours: '06:00-18:00',
  },
  {
    name: 'Bui Vien Walking Street',
    description: 'Pho Tay ban dem - bia, nhac song, dong vui tu 20h.',
    lat: 10.7672, lng: 106.6930, address: 'Bui Vien, Quan 1, TP.HCM',
    category: 'attraction', googleRating: 4.1, googleReviews: 15000, aiScore: 6.9,
    regionSlug: HCM, hours: '17:00-23:59',
  },
  {
    name: 'Pho Hoa Pasteur',
    description: 'Pho Bac trong long Sai Gon tu 1968, to lon, banh quay an kem.',
    lat: 10.7881, lng: 106.6903, address: '260C Pasteur, Quan 3, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 90000, googleRating: 4.3, googleReviews: 6200, aiScore: 8.2,
    regionSlug: HCM, hours: '06:00-23:00',
  },
  {
    name: 'Banh Mi Huynh Hoa Le Thi Rieng',
    description: 'Banh mi "nang nhat Sai Gon" - cha, pate, bo day, xep hang toi muon.',
    lat: 10.7707, lng: 106.6905, address: '26 Le Thi Rieng, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'all-day',
    priceRange: 'budget', avgMealPrice: 65000, googleRating: 4.3, googleReviews: 8500, aiScore: 8.6,
    regionSlug: HCM, hours: '06:00-22:00',
  },
  {
    name: 'Oc Dao Nguyen Trai',
    description: 'Quan oc binh dan - oc huong xao bo toi, so diep nuong mo hanh.',
    lat: 10.7625, lng: 106.6830, address: '212B Nguyen Trai, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'dinner',
    priceRange: 'budget', avgMealPrice: 150000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 3400, aiScore: 8.3,
    regionSlug: HCM, hours: '10:00-23:00',
  },
  {
    name: 'Cuc Gach Quan',
    description: 'Nha hang trong biet thu co, mon Viet gia dinh nau kieu nha - dat ban truoc.',
    lat: 10.7906, lng: 106.6960, address: '10 Dang Tat, Quan 1, TP.HCM',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 250000, googleRating: 4.4, googleReviews: 5100, aiScore: 8.7,
    regionSlug: HCM, hours: '09:00-23:00',
  },
  {
    name: 'Hum Vegetarian Cafe',
    description: 'Chay hien dai, vuon xanh, hop ca nguoi an chay lan khong.',
    lat: 10.7813, lng: 106.6931, address: '32 Vo Van Tan, Quan 3, TP.HCM',
    category: 'restaurant', cuisineType: 'vegetarian', mealType: 'lunch',
    priceRange: 'moderate', avgMealPrice: 180000, googleRating: 4.6, googleReviews: 4300, aiScore: 8.4,
    regionSlug: HCM, hours: '10:00-22:00',
  },
  {
    name: 'The Workshop Coffee',
    description: 'Specialty coffee tren gac xep cao, rang xay tai cho - dan cafe me.',
    lat: 10.7745, lng: 106.7030, address: '27 Ngo Duc Ke, Quan 1, TP.HCM',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 80000, isHiddenPlace: true, googleRating: 4.5, googleReviews: 3900, aiScore: 8.3,
    regionSlug: HCM, hours: '08:00-21:00',
  },
  {
    name: 'Cafe Apartment 42 Nguyen Hue',
    description: 'Chung cu cu 9 tang toan quan cafe nho, moi tang mot phong cach.',
    lat: 10.7738, lng: 106.7039, address: '42 Nguyen Hue, Quan 1, TP.HCM',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 60000, googleRating: 4.3, googleReviews: 7800, aiScore: 7.9,
    regionSlug: HCM, hours: '08:00-22:30',
  },
  {
    name: 'Cong Caphe Dong Khoi',
    description: 'Cot dua ca phe trong khong gian bao cap - thuong hieu Viet quen thuoc.',
    lat: 10.7760, lng: 106.7020, address: '26 Ly Tu Trong, Quan 1, TP.HCM',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 50000, googleRating: 4.3, googleReviews: 2600, aiScore: 7.4,
    regionSlug: HCM, hours: '07:00-23:00',
  },

  // ===========================================================================
  // DA NANG
  // ===========================================================================
  {
    name: 'Mi Quang Ngon',
    description: 'Mi Quang tom thit, banh trang me, rau song day dia.',
    lat: 16.0640, lng: 108.2210, address: '166 Tran Phu, Hai Chau, Da Nang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: true, googleRating: 4.5, googleReviews: 650, aiScore: 8.0,
    regionSlug: DN, hours: '06:00-21:00',
  },
  {
    name: 'My Khe Beach',
    description: 'Bai bien dai cat trang - tam som 5-7h hoac chieu 16h tro di.',
    lat: 16.0605, lng: 108.2460, address: 'Vo Nguyen Giap, Son Tra, Da Nang',
    category: 'attraction', googleRating: 4.6, googleReviews: 21000, aiScore: 9.0,
    regionSlug: DN, hours: '05:00-21:00',
  },
  {
    name: 'Highland Coffee Tran Phu',
    description: 'Highlands ven song Han, ngoi ngoai hong gio.',
    lat: 16.0700, lng: 108.2240, address: '89 Tran Phu, Hai Chau, Da Nang',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 55000, googleRating: 4.2, googleReviews: 420, aiScore: 6.7,
    regionSlug: DN, hours: '07:00-23:00',
  },
  {
    name: 'Dragon Bridge',
    description: 'Cau Rong phun lua va nuoc 21h toi T7, CN - ngam tu bo song Han.',
    lat: 16.0612, lng: 108.2272, address: 'Nguyen Van Linh, Hai Chau, Da Nang',
    category: 'attraction', googleRating: 4.6, googleReviews: 36000, aiScore: 8.6,
    regionSlug: DN, hours: '05:00-23:59',
  },
  {
    name: 'Marble Mountains',
    description: 'Ngu Hanh Son - hang dong, chua tren nui, nhin ra bien. Co thang may.',
    lat: 16.0038, lng: 108.2630, address: '81 Huyen Tran Cong Chua, Ngu Hanh Son, Da Nang',
    category: 'attraction', googleRating: 4.5, googleReviews: 28000, aiScore: 8.7,
    regionSlug: DN, hours: '07:00-17:30',
  },
  {
    name: 'Linh Ung Pagoda Son Tra',
    description: 'Tuong Quan Am 67 m tren ban dao Son Tra, view toan vinh Da Nang.',
    lat: 16.1003, lng: 108.2778, address: 'Hoang Sa, Son Tra, Da Nang',
    category: 'attraction', googleRating: 4.7, googleReviews: 25000, aiScore: 8.8,
    regionSlug: DN, hours: '06:00-21:00',
  },
  {
    name: 'Museum of Cham Sculpture',
    description: 'Bo suu tap dieu khac Cham Pa lon nhat the gioi, toa nha Phap 1915.',
    lat: 16.0605, lng: 108.2233, address: '2 Thang 9, Hai Chau, Da Nang',
    category: 'attraction', googleRating: 4.4, googleReviews: 8000, aiScore: 7.9,
    regionSlug: DN, hours: '07:30-17:00',
  },
  {
    name: 'Han Market',
    description: 'Cho Han - do kho, nem tre, ao dai may nhanh trong ngay.',
    lat: 16.0680, lng: 108.2240, address: '119 Tran Phu, Hai Chau, Da Nang',
    category: 'shopping', googleRating: 4.2, googleReviews: 12000, aiScore: 7.5,
    regionSlug: DN, hours: '06:00-19:00',
  },
  {
    name: 'Banh Xeo Ba Duong',
    description: 'Banh xeo mien Trung nho gion, nem lui, cham tuong dau phong - trong hem.',
    lat: 16.0565, lng: 108.2180, address: 'K280/23 Hoang Dieu, Hai Chau, Da Nang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'budget', avgMealPrice: 80000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 4800, aiScore: 8.5,
    regionSlug: DN, hours: '09:30-21:30',
  },
  {
    name: 'Bun Cha Ca 109',
    description: 'Bun cha ca Da Nang - nuoc dung bi do, cha ca chien dai.',
    lat: 16.0675, lng: 108.2135, address: '109 Nguyen Chi Thanh, Hai Chau, Da Nang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 2600, aiScore: 8.2,
    regionSlug: DN, hours: '06:00-22:00',
  },
  {
    name: 'Be Man Seafood',
    description: 'Hai san tuoi ven bien, tu chon roi che bien - dong, nen di som.',
    lat: 16.0760, lng: 108.2455, address: 'Vo Nguyen Giap, Son Tra, Da Nang',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 250000, googleRating: 4.3, googleReviews: 6100, aiScore: 8.3,
    regionSlug: DN, hours: '10:00-22:00',
  },
  {
    name: 'Com Ga A Hai',
    description: 'Com ga xe Hoi An kieu Da Nang, com vang nghe, an trua nhanh.',
    lat: 16.0660, lng: 108.2200, address: '100 Thai Phien, Hai Chau, Da Nang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 45000, googleRating: 4.2, googleReviews: 3100, aiScore: 7.7,
    regionSlug: DN, hours: '09:00-22:00',
  },
  {
    name: 'Hai San Ba Thoi',
    description: 'Hai san gia binh dan khu Son Tra, muc nuong, nghieu hap sa.',
    lat: 16.0790, lng: 108.2370, address: '98 Le Dinh Duong, Son Tra, Da Nang',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'lunch',
    priceRange: 'moderate', avgMealPrice: 180000, googleRating: 4.2, googleReviews: 2900, aiScore: 7.6,
    regionSlug: DN, hours: '10:00-22:00',
  },
  {
    name: 'Cong Caphe Bach Dang',
    description: 'Cong Caphe ven song Han - cot dua ngam cau Rong.',
    lat: 16.0665, lng: 108.2255, address: '96-98 Bach Dang, Hai Chau, Da Nang',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 50000, googleRating: 4.3, googleReviews: 2200, aiScore: 7.5,
    regionSlug: DN, hours: '07:00-23:00',
  },
  {
    name: '43 Factory Coffee Roaster',
    description: 'Specialty coffee gan bien, khong gian kinh - bao tang ca phe mini.',
    lat: 16.0520, lng: 108.2440, address: '422 Ngo Thi Sy, Ngu Hanh Son, Da Nang',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 90000, isHiddenPlace: true, googleRating: 4.6, googleReviews: 3300, aiScore: 8.1,
    regionSlug: DN, hours: '07:00-22:00',
  },
  // ===========================================================================
  // THUA THIEN HUE
  // ===========================================================================
  {
    name: 'Imperial City of Hue',
    description: 'Dai Noi - hoang thanh nha Nguyen, di bo 2-3 tieng; vao cong Ngo Mon.',
    lat: 16.4698, lng: 107.5774, address: 'Phu Hau, Hue',
    category: 'attraction', googleRating: 4.5, googleReviews: 40000, aiScore: 9.1,
    regionSlug: HUE, hours: '07:00-17:30',
  },
  {
    name: 'Thien Mu Pagoda',
    description: 'Chua Thien Mu ben song Huong, thap Phuoc Duyen 7 tang - di thuyen rong toi.',
    lat: 16.4530, lng: 107.5447, address: 'Kim Long, Hue',
    category: 'attraction', googleRating: 4.5, googleReviews: 18000, aiScore: 8.5,
    regionSlug: HUE, hours: '06:00-18:00',
  },
  {
    name: 'Tomb of Tu Duc',
    description: 'Lang Tu Duc - ho sen, nha thuy ta, reu xanh; dep nhat sau mua.',
    lat: 16.4310, lng: 107.5510, address: 'Thuy Xuan, Hue',
    category: 'attraction', googleRating: 4.5, googleReviews: 12000, aiScore: 8.4,
    regionSlug: HUE, hours: '07:00-17:30',
  },
  {
    name: 'Bun Bo Hue Ba Tuyet',
    description: 'Bun bo Hue chuan vi, gio heo va cha cua, mo som dong khach dia phuong.',
    lat: 16.4625, lng: 107.5880, address: '47 Nguyen Cong Tru, Hue',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 1800, aiScore: 8.6,
    regionSlug: HUE, hours: '06:00-11:00',
  },
  {
    name: 'Quan Hanh Banh Khoai',
    description: 'Banh khoai, banh beo, nem lui - bo mon an vat cung dinh binh dan hoa.',
    lat: 16.4660, lng: 107.5930, address: '11 Pho Duc Chinh, Hue',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 70000, googleRating: 4.3, googleReviews: 3200, aiScore: 8.1,
    regionSlug: HUE, hours: '09:00-21:00',
  },
  {
    name: 'Les Jardins de La Carambole',
    description: 'Nha hang Phap-Viet trong biet thu thoi thuoc dia, gan Dai Noi - bua toi dat ban.',
    lat: 16.4710, lng: 107.5720, address: '32 Dang Tran Con, Hue',
    category: 'restaurant', cuisineType: 'international', mealType: 'dinner',
    priceRange: 'high-end', avgMealPrice: 450000, googleRating: 4.5, googleReviews: 2100, aiScore: 8.3,
    regionSlug: HUE, hours: '07:00-22:00',
  },
  {
    name: 'Ca Phe Muoi Dang Thai Than',
    description: 'Ca phe muoi - dac san Hue, vi man nhe lam dam ca phe. Quan goc tren Dang Thai Than.',
    lat: 16.4720, lng: 107.5855, address: '10 Nguyen Luong Bang, Hue',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 25000, isHiddenPlace: true, googleRating: 4.5, googleReviews: 1400, aiScore: 8.4,
    regionSlug: HUE, hours: '06:30-22:00',
  },
  {
    name: 'Dong Ba Market',
    description: 'Cho Dong Ba - me xung, tom chua, non la; khu an vat tang tret.',
    lat: 16.4720, lng: 107.5880, address: 'Tran Hung Dao, Hue',
    category: 'shopping', googleRating: 4.1, googleReviews: 9000, aiScore: 7.3,
    regionSlug: HUE, hours: '06:00-18:30',
  },

  // ===========================================================================
  // LAM DONG (DA LAT)
  // ===========================================================================
  {
    name: 'Xuan Huong Lake',
    description: 'Ho giua trung tam Da Lat - di bo hoac dap vit, sang som co suong.',
    lat: 11.9404, lng: 108.4430, address: 'Tran Quoc Toan, Da Lat',
    category: 'attraction', googleRating: 4.5, googleReviews: 15000, aiScore: 8.3,
    regionSlug: DALAT, hours: '05:00-23:00',
  },
  {
    name: 'Da Lat Night Market',
    description: 'Cho dem Da Lat - banh trang nuong, sua dau nanh nong, ao am.',
    lat: 11.9430, lng: 108.4375, address: 'Nguyen Thi Minh Khai, Da Lat',
    category: 'shopping', googleRating: 4.1, googleReviews: 11000, aiScore: 7.6,
    regionSlug: DALAT, hours: '17:00-23:00',
  },
  {
    name: 'Crazy House',
    description: 'Biet thu Hang Nga - kien truc ky di, cau thang hep, hop chup anh.',
    lat: 11.9350, lng: 108.4310, address: '3 Huynh Thuc Khang, Da Lat',
    category: 'attraction', googleRating: 4.2, googleReviews: 20000, aiScore: 7.5,
    regionSlug: DALAT, hours: '08:30-19:00',
  },
  {
    name: 'Datanla Waterfall',
    description: 'Thac Datanla - may truot nui xuyen rung thong, cach trung tam 6 km.',
    lat: 11.9020, lng: 108.4490, address: 'Deo Prenn, Da Lat',
    category: 'attraction', googleRating: 4.4, googleReviews: 14000, aiScore: 8.0,
    regionSlug: DALAT, hours: '07:00-17:00',
  },
  {
    name: 'Banh Can Nha Chung',
    description: 'Banh can trung cut, cha ca, an voi xiu mai - bua sang lanh Da Lat.',
    lat: 11.9420, lng: 108.4335, address: '1 Nha Chung, Da Lat',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 35000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 2200, aiScore: 8.2,
    regionSlug: DALAT, hours: '06:30-11:30',
  },
  {
    name: 'Lau Ga La E Tao Ngo',
    description: 'Lau ga la e - mon lau "quoc dan" Da Lat, cay nhe, an toi troi lanh.',
    lat: 11.9460, lng: 108.4400, address: '5 Ba Thang Tu, Da Lat',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 150000, googleRating: 4.3, googleReviews: 5400, aiScore: 8.3,
    regionSlug: DALAT, hours: '10:00-22:00',
  },
  {
    name: 'Tiem Banh Mi Xiu Mai Hoang Dieu',
    description: 'Banh mi cham xiu mai nuoc - an trua nhanh, quan via he.',
    lat: 11.9395, lng: 108.4350, address: '26 Hoang Dieu, Da Lat',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 30000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 1600, aiScore: 7.9,
    regionSlug: DALAT, hours: '06:00-20:00',
  },
  {
    name: 'An Cafe',
    description: 'Cafe san vuon tren doi, nhin xuong thung lung - ca phe arabica Cau Dat.',
    lat: 11.9470, lng: 108.4480, address: '63 Ba Thang Hai, Da Lat',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 45000, googleRating: 4.5, googleReviews: 6800, aiScore: 8.2,
    regionSlug: DALAT, hours: '07:00-22:00',
  },

  // ===========================================================================
  // KHANH HOA (NHA TRANG)
  // ===========================================================================
  {
    name: 'Nha Trang Beach',
    description: 'Bai bien trung tam 6 km, tam sang som; cong vien bo bien co cay bong mat.',
    lat: 12.2388, lng: 109.1967, address: 'Tran Phu, Nha Trang',
    category: 'attraction', googleRating: 4.5, googleReviews: 30000, aiScore: 8.6,
    regionSlug: NT, hours: '05:00-22:00',
  },
  {
    name: 'Po Nagar Cham Towers',
    description: 'Thap Ba Ponagar - den Cham the ky 8 tren doi, nhin ra cua song Cai.',
    lat: 12.2653, lng: 109.1955, address: '2 Thang 4, Nha Trang',
    category: 'attraction', googleRating: 4.4, googleReviews: 16000, aiScore: 8.2,
    regionSlug: NT, hours: '06:00-17:30',
  },
  {
    name: 'Long Son Pagoda',
    description: 'Chua Long Son - tuong Phat trang tren doi, 150 bac thang, view thanh pho.',
    lat: 12.2510, lng: 109.1810, address: '22 Thang 10, Nha Trang',
    category: 'attraction', googleRating: 4.4, googleReviews: 11000, aiScore: 7.8,
    regionSlug: NT, hours: '07:30-17:00',
  },
  {
    name: 'Bun Ca Nguyen Loan',
    description: 'Bun ca sua, cha ca Nha Trang - bua sang cua dan bien.',
    lat: 12.2440, lng: 109.1890, address: '123 Ngo Gia Tu, Nha Trang',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 2800, aiScore: 8.3,
    regionSlug: NT, hours: '06:00-21:00',
  },
  {
    name: 'Nem Nuong Dang Van Quyen',
    description: 'Nem nuong Ninh Hoa cuon rau, cham tuong - quan lau doi nhat.',
    lat: 12.2470, lng: 109.1910, address: '16A Lan Ong, Nha Trang',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 60000, googleRating: 4.3, googleReviews: 4100, aiScore: 8.0,
    regionSlug: NT, hours: '07:30-21:30',
  },
  {
    name: 'Lang Chai Seafood',
    description: 'Hai san tuoi tren be, khong gian lon, hop nhom - dat gia truoc khi can.',
    lat: 12.2300, lng: 109.1960, address: '1 Pham Van Dong, Nha Trang',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 300000, googleRating: 4.2, googleReviews: 7200, aiScore: 7.8,
    regionSlug: NT, hours: '10:00-22:30',
  },
  {
    name: 'Rainforest Cafe Nha Trang',
    description: 'Cafe nhieu tang cay xanh giua pho, mat ve chieu, co khu tre em.',
    lat: 12.2395, lng: 109.1895, address: '146 Vo Tru, Nha Trang',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 50000, googleRating: 4.4, googleReviews: 5100, aiScore: 7.7,
    regionSlug: NT, hours: '07:00-22:30',
  },

  // ===========================================================================
  // KIEN GIANG (PHU QUOC)
  // ===========================================================================
  {
    name: 'Sao Beach',
    description: 'Bai Sao - cat trang min, nuoc xanh, phia dong nam dao; dep nhat buoi sang.',
    lat: 10.0530, lng: 104.0370, address: 'An Thoi, Phu Quoc',
    category: 'attraction', googleRating: 4.3, googleReviews: 22000, aiScore: 8.5,
    regionSlug: PQ, hours: '06:00-18:00',
  },
  {
    name: 'Dinh Cau Night Market',
    description: 'Cho dem Phu Quoc - hai san nuong, kem cuon, qua luu niem ngoc trai.',
    lat: 10.2170, lng: 103.9590, address: 'Bach Dang, Duong Dong, Phu Quoc',
    category: 'shopping', googleRating: 4.1, googleReviews: 14000, aiScore: 7.4,
    regionSlug: PQ, hours: '17:00-23:00',
  },
  {
    name: 'Phu Quoc Fish Sauce Factory Khai Hoan',
    description: 'Nha thung nuoc mam truyen thong, xem thung go 10 tan va nem thu.',
    lat: 10.2100, lng: 103.9650, address: '11 Hung Vuong, Duong Dong, Phu Quoc',
    category: 'attraction', isHiddenPlace: true, googleRating: 4.2, googleReviews: 3100, aiScore: 7.3,
    regionSlug: PQ, hours: '07:30-17:00',
  },
  {
    name: 'Bun Quay Kien Xay',
    description: 'Bun quay - bun tuoi ep tai cho, cha ca, tu pha nuoc cham. Dac san dao.',
    lat: 10.2150, lng: 103.9610, address: '28 Bach Dang, Duong Dong, Phu Quoc',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 50000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 3600, aiScore: 8.2,
    regionSlug: PQ, hours: '06:00-22:00',
  },
  {
    name: 'Ra Khoi Seafood',
    description: 'Hai san gia hop ly gan cho dem, ghe nuong, goi ca trich.',
    lat: 10.2190, lng: 103.9620, address: '131 Ba Thang Muoi, Duong Dong, Phu Quoc',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 250000, googleRating: 4.2, googleReviews: 4800, aiScore: 7.9,
    regionSlug: PQ, hours: '10:00-22:00',
  },
  {
    name: 'Phu Quoc Coffee Roastery',
    description: 'Cafe san thuong nhin ra bien Duong Dong, hoang hon dep.',
    lat: 10.2160, lng: 103.9570, address: 'Tran Hung Dao, Duong Dong, Phu Quoc',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 70000, googleRating: 4.4, googleReviews: 1200, aiScore: 7.6,
    regionSlug: PQ, hours: '07:00-22:00',
  },

  // ===========================================================================
  // LAO CAI (SA PA)
  // ===========================================================================
  {
    name: 'Cat Cat Village',
    description: 'Ban Cat Cat cua nguoi H Mong, thac nuoc va ruong bac thang, di bo 2 tieng.',
    lat: 22.3240, lng: 103.8330, address: 'San Sa Ho, Sa Pa',
    category: 'attraction', googleRating: 4.3, googleReviews: 17000, aiScore: 8.2,
    regionSlug: SAPA, hours: '06:00-18:00',
  },
  {
    name: 'Fansipan Cable Car',
    description: 'Cap treo len noc nha Dong Duong 3.143 m, 20 phut; mang ao am.',
    lat: 22.3030, lng: 103.7750, address: 'Nguyen Chi Thanh, Sa Pa',
    category: 'attraction', googleRating: 4.6, googleReviews: 24000, aiScore: 8.9,
    regionSlug: SAPA, hours: '07:30-17:30',
  },
  {
    name: 'Sa Pa Stone Church',
    description: 'Nha tho da giua thi tran, quang truong la noi hop cho phien toi T7.',
    lat: 22.3370, lng: 103.8430, address: 'Quang truong Sa Pa',
    category: 'attraction', googleRating: 4.4, googleReviews: 9000, aiScore: 7.6,
    regionSlug: SAPA, hours: '06:00-21:00',
  },
  {
    name: 'A Phu Restaurant',
    description: 'Lau ca hoi, thit lon ban nuong, rau cai meo - bua toi am giua suong.',
    lat: 22.3360, lng: 103.8420, address: '15 Fansipan, Sa Pa',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 200000, googleRating: 4.3, googleReviews: 3900, aiScore: 8.0,
    regionSlug: SAPA, hours: '09:00-22:00',
  },
  {
    name: 'Pho Chua Sa Pa',
    description: 'Banh cuon, pho chua - bua sang nong trong con hem gan cho.',
    lat: 22.3380, lng: 103.8440, address: 'Cau May, Sa Pa',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: true, googleRating: 4.2, googleReviews: 900, aiScore: 7.5,
    regionSlug: SAPA, hours: '06:00-11:00',
  },
  {
    name: 'Le Gecko Cafe',
    description: 'Cafe Phap lau doi tren Cau May, banh ngot va view thung lung Muong Hoa.',
    lat: 22.3355, lng: 103.8445, address: '4 Ham Rong, Sa Pa',
    category: 'cafe', cuisineType: 'international', mealType: 'coffee',
    priceRange: 'moderate', avgMealPrice: 70000, googleRating: 4.3, googleReviews: 2500, aiScore: 7.6,
    regionSlug: SAPA, hours: '07:00-22:00',
  },

  // ===========================================================================
  // CAN THO
  // ===========================================================================
  {
    name: 'Cai Rang Floating Market',
    description: 'Cho noi lon nhat mien Tay, di ghe tu ben Ninh Kieu luc 5h30; an hu tieu tren ghe.',
    lat: 10.0050, lng: 105.7520, address: 'Cai Rang, Can Tho',
    category: 'attraction', googleRating: 4.3, googleReviews: 19000, aiScore: 8.7,
    regionSlug: CT, hours: '05:00-09:00',
  },
  {
    name: 'Ninh Kieu Wharf',
    description: 'Ben Ninh Kieu - di dao bo song Hau buoi toi, cau di bo den mau.',
    lat: 10.0330, lng: 105.7880, address: 'Hai Ba Trung, Ninh Kieu, Can Tho',
    category: 'attraction', googleRating: 4.4, googleReviews: 15000, aiScore: 8.0,
    regionSlug: CT, hours: '05:00-23:00',
  },
  {
    name: 'Binh Thuy Ancient House',
    description: 'Nha co Binh Thuy 1870, phim Nguoi tinh quay o day; vuon lan.',
    lat: 10.0620, lng: 105.7640, address: '144 Bui Huu Nghia, Binh Thuy, Can Tho',
    category: 'attraction', googleRating: 4.3, googleReviews: 4200, aiScore: 7.7,
    regionSlug: CT, hours: '08:00-17:00',
  },
  {
    name: 'Banh Xeo Bay Toi',
    description: 'Banh xeo mien Tay co lon, nhan tom thit gia, cuon la cach la cai.',
    lat: 10.0260, lng: 105.7700, address: '45 Hoang Quoc Viet, Ninh Kieu, Can Tho',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 60000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 2600, aiScore: 8.1,
    regionSlug: CT, hours: '10:00-21:00',
  },
  {
    name: 'Lau Mam Da Ly',
    description: 'Lau mam dam vi mien Tay, rau dong hon 20 loai - bua toi cho nhom.',
    lat: 10.0290, lng: 105.7760, address: '89 Ba Thang Hai, Ninh Kieu, Can Tho',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 180000, googleRating: 4.2, googleReviews: 3300, aiScore: 7.9,
    regionSlug: CT, hours: '10:00-22:00',
  },
  {
    name: 'Nem Nuong Thanh Van',
    description: 'Nem nuong Cai Rang cuon banh hoi, sang hoac trua deu hop.',
    lat: 10.0320, lng: 105.7830, address: '17 Dai lo Hoa Binh, Ninh Kieu, Can Tho',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 45000, googleRating: 4.2, googleReviews: 2100, aiScore: 7.6,
    regionSlug: CT, hours: '07:00-21:00',
  },
  {
    name: 'Cafe Sai Gon - Can Tho',
    description: 'Cafe ven song nhin ra cau Can Tho, hoang hon mien Tay.',
    lat: 10.0340, lng: 105.7900, address: '55 Hai Ba Trung, Ninh Kieu, Can Tho',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 40000, googleRating: 4.3, googleReviews: 1500, aiScore: 7.4,
    regionSlug: CT, hours: '06:30-22:30',
  },

  // ===========================================================================
  // QUANG NINH (HA LONG)
  // ===========================================================================
  {
    name: 'Ha Long Bay Day Cruise Pier',
    description: 'Cang tau Tuan Chau - diem len tau tham vinh; tour 6 tieng qua hang Sung Sot.',
    lat: 20.9220, lng: 106.9850, address: 'Tuan Chau, Ha Long',
    category: 'attraction', googleRating: 4.6, googleReviews: 35000, aiScore: 9.3,
    regionSlug: HL, hours: '07:00-17:00',
  },
  {
    name: 'Bai Tho Mountain',
    description: 'Nui Bai Tho - leo 30 phut, view toan vinh tu tren cao luc hoang hon.',
    lat: 20.9530, lng: 107.0810, address: 'Hong Gai, Ha Long',
    category: 'attraction', isHiddenPlace: true, googleRating: 4.5, googleReviews: 3800, aiScore: 8.2,
    regionSlug: HL, hours: '06:00-18:00',
  },
  {
    name: 'Ha Long Market',
    description: 'Cho Ha Long 1 - hai san kho, cha muc, sa sung.',
    lat: 20.9520, lng: 107.0770, address: 'Le Thanh Tong, Ha Long',
    category: 'shopping', googleRating: 4.0, googleReviews: 5200, aiScore: 7.0,
    regionSlug: HL, hours: '06:00-18:00',
  },
  {
    name: 'Cha Muc Ha Long Thoan',
    description: 'Cha muc gia tay, xoi trang - mon sang bieu tuong Ha Long.',
    lat: 20.9515, lng: 107.0780, address: 'Cho Ha Long 1, Ha Long',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 50000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 1700, aiScore: 8.3,
    regionSlug: HL, hours: '06:00-20:00',
  },
  {
    name: 'Hai San Cua Vang',
    description: 'Nha hang hai san lon ven bien Bai Chay, tu bon hai san.',
    lat: 20.9570, lng: 107.0360, address: 'Ha Long Marina, Bai Chay',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'dinner',
    priceRange: 'moderate', avgMealPrice: 300000, googleRating: 4.3, googleReviews: 6400, aiScore: 8.0,
    regionSlug: HL, hours: '10:00-22:00',
  },
  {
    name: 'Bun Be Be Ha Long',
    description: 'Bun be be (tom tit) - dac san vinh, nuoc dung ngot thanh.',
    lat: 20.9540, lng: 107.0790, address: 'Tran Hung Dao, Ha Long',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 55000, googleRating: 4.2, googleReviews: 1300, aiScore: 7.7,
    regionSlug: HL, hours: '06:30-21:00',
  },

  // ===========================================================================
  // HAI PHONG
  // ===========================================================================
  {
    name: 'Banh Da Cua Ba Cu',
    description: 'Banh da cua do - mon sang dinh danh Hai Phong, cha la lot va tom.',
    lat: 20.8570, lng: 106.6830, address: '179 Cau Dat, Ngo Quyen, Hai Phong',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'breakfast',
    priceRange: 'budget', avgMealPrice: 40000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 2900, aiScore: 8.5,
    regionSlug: HP, hours: '06:00-21:00',
  },
  {
    name: 'Banh Mi Que Ba Gia',
    description: 'Banh mi que cham pate cay - an vat chieu, mua chuc chiec.',
    lat: 20.8580, lng: 106.6790, address: '57 Le Loi, Ngo Quyen, Hai Phong',
    category: 'restaurant', cuisineType: 'vietnamese', mealType: 'all-day',
    priceRange: 'budget', avgMealPrice: 15000, isHiddenPlace: true, googleRating: 4.3, googleReviews: 1800, aiScore: 7.8,
    regionSlug: HP, hours: '07:00-21:00',
  },
  {
    name: 'Nem Cua Be Co Lan',
    description: 'Nem cua be vuong Hai Phong, bun va rau song - bua trua dam da.',
    lat: 20.8540, lng: 106.6850, address: '33 Tran Phu, Ngo Quyen, Hai Phong',
    category: 'restaurant', cuisineType: 'seafood', mealType: 'lunch',
    priceRange: 'budget', avgMealPrice: 60000, googleRating: 4.3, googleReviews: 1400, aiScore: 7.9,
    regionSlug: HP, hours: '09:00-21:00',
  },
  {
    name: 'Hai Phong Opera House',
    description: 'Nha hat lon Hai Phong - kien truc Phap 1904, quang truong phuong do.',
    lat: 20.8580, lng: 106.6820, address: 'Quang truong Nha hat, Hong Bang, Hai Phong',
    category: 'attraction', googleRating: 4.5, googleReviews: 5600, aiScore: 7.9,
    regionSlug: HP, hours: '06:00-22:00',
  },
  {
    name: 'Do Son Beach',
    description: 'Bai bien Do Son - cach trung tam 20 km, dai hoi choi trau thang 8 am lich.',
    lat: 20.7080, lng: 106.7830, address: 'Do Son, Hai Phong',
    category: 'attraction', googleRating: 4.1, googleReviews: 8200, aiScore: 7.2,
    regionSlug: HP, hours: '05:00-20:00',
  },
  {
    name: 'Ca Phe Cot Den',
    description: 'Cafe san vuon cu ky giua pho, ca phe phin dam va ban ghe go.',
    lat: 20.8560, lng: 106.6800, address: '8 Minh Khai, Hong Bang, Hai Phong',
    category: 'cafe', cuisineType: 'vietnamese', mealType: 'coffee',
    priceRange: 'budget', avgMealPrice: 30000, isHiddenPlace: true, googleRating: 4.4, googleReviews: 900, aiScore: 7.6,
    regionSlug: HP, hours: '06:30-22:00',
  },
];
