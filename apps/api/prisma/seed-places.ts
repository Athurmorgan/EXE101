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
}

const HN = 'ha-noi';
const HCM = 'tp-ho-chi-minh';
const DN = 'da-nang';

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
];
