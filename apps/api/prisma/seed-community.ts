/**
 * Du lieu gia cho mang cong dong: bai viet, binh luan, reaction, shortlist.
 * Anh lay tu loremflickr theo tu khoa (demo; se thay bang anh that sau).
 */

export interface SeedPost {
  title: string;
  content: string;
  /** Email tac gia (phai co trong SEED_USERS). */
  authorEmail: string;
  /** Ten dia diem (khop `SeedPlace.name`) de gan placeId + regionId. */
  placeName?: string;
  regionSlug: string;
  /** Tu khoa anh; bo trong = khong co anh. */
  photo?: string;
  comments?: Array<{ authorEmail: string; content: string }>;
  reactions?: Array<{ authorEmail: string; type: 'like' | 'love' | 'wow' | 'helpful' }>;
  /** So ngay truoc hom nay (de feed khong cung mot gio). */
  daysAgo: number;
}

export const SEED_COMMUNITY_USERS = [
  { email: 'linh.local@vivivu.vn', fullName: 'Linh Nguyen' },
  { email: 'minh.foodie@vivivu.vn', fullName: 'Minh Tran' },
  { email: 'an.wanderer@vivivu.vn', fullName: 'An Pham' },
  { email: 'ha.coffee@vivivu.vn', fullName: 'Ha Le' },
];

export const SEED_POSTS: SeedPost[] = [
  {
    title: 'The egg coffee queue is worth it, but go through the back door',
    content:
      'Everyone lines up at the front of Cafe Giang on Nguyen Huu Huan. Walk ten metres past it and there is a second entrance through the silver shop; same cafe, same egg coffee, half the wait. Order the egg cacao if you have already had the coffee - it is thicker and less sweet than it sounds.',
    authorEmail: 'ha.coffee@vivivu.vn', placeName: 'Cafe Giang', regionSlug: 'ha-noi', photo: 'hanoi,coffee', daysAgo: 2,
    comments: [
      { authorEmail: 'minh.foodie@vivivu.vn', content: 'Can confirm the back door. Also the upstairs room is quieter.' },
      { authorEmail: 'user@vivivu.vn', content: 'Went this morning, no queue at 7:30. Thanks!' },
    ],
    reactions: [
      { authorEmail: 'minh.foodie@vivivu.vn', type: 'helpful' },
      { authorEmail: 'user@vivivu.vn', type: 'love' },
      { authorEmail: 'an.wanderer@vivivu.vn', type: 'like' },
    ],
  },
  {
    title: 'Bat Dan pho: how the self-service actually works',
    content:
      'You queue, you say "tai" or "chin", you pay, you carry your own bowl to whichever stool is free. Nobody will seat you. Get there before 8 or after 9:30 to skip the office crowd. The broth is clearer and saltier than Pho Thin - different school entirely.',
    authorEmail: 'minh.foodie@vivivu.vn', placeName: 'Pho Gia Truyen Bat Dan', regionSlug: 'ha-noi', photo: 'pho,noodle', daysAgo: 4,
    comments: [{ authorEmail: 'linh.local@vivivu.vn', content: 'They close when the broth runs out, sometimes before 10.' }],
    reactions: [
      { authorEmail: 'linh.local@vivivu.vn', type: 'helpful' },
      { authorEmail: 'ha.coffee@vivivu.vn', type: 'like' },
    ],
  },
  {
    title: 'Train Street is open again - here is the etiquette',
    content:
      'Cafes on the Phung Hung stretch will wave you in if you buy a drink; the police only move people on when they stand on the tracks. Trains pass around 15:20 and 19:00 on weekdays. Sit on the far side of the rails for photos without the crowd behind you.',
    authorEmail: 'an.wanderer@vivivu.vn', placeName: 'Train Street', regionSlug: 'ha-noi', photo: 'hanoi,train', daysAgo: 6,
    reactions: [{ authorEmail: 'user@vivivu.vn', type: 'wow' }, { authorEmail: 'ha.coffee@vivivu.vn', type: 'helpful' }],
  },
  {
    title: 'A slow Sunday around West Lake',
    content:
      'Tran Quoc Pagoda at 7 before the tour buses, then walk the Thanh Nien causeway for banh tom (shrimp fritters) at the lakeside stalls. Loop up Quang An for a cafe with a lake view and you are back in the Old Quarter for a late lunch. Flat, shaded, about 6 km.',
    authorEmail: 'linh.local@vivivu.vn', placeName: 'Tran Quoc Pagoda', regionSlug: 'ha-noi', photo: 'hanoi,lake,pagoda', daysAgo: 9,
    comments: [{ authorEmail: 'an.wanderer@vivivu.vn', content: 'Rent a bike from the hostels near Hang Bac, it is 50k for the day.' }],
    reactions: [{ authorEmail: 'minh.foodie@vivivu.vn', type: 'love' }],
  },
  {
    title: 'The best banh mi in Saigon is not the famous one',
    content:
      'Huynh Hoa is great and enormous, but at 65k it is a meal. Two blocks over on Nguyen Trai there is a cart with no name that does a 25k pate-and-cha banh mi which I prefer. Look for the blue umbrella after 15:00. I have added it as a hidden place - vote it up if you agree.',
    authorEmail: 'minh.foodie@vivivu.vn', placeName: 'Banh Mi Huynh Hoa Le Thi Rieng', regionSlug: 'tp-ho-chi-minh', photo: 'banhmi,saigon', daysAgo: 1,
    comments: [
      { authorEmail: 'linh.local@vivivu.vn', content: 'Controversial but fair. Huynh Hoa is a tourist thing now.' },
      { authorEmail: 'an.wanderer@vivivu.vn', content: 'Blue umbrella confirmed, 25k, excellent.' },
    ],
    reactions: [
      { authorEmail: 'linh.local@vivivu.vn', type: 'like' },
      { authorEmail: 'an.wanderer@vivivu.vn', type: 'helpful' },
      { authorEmail: 'user@vivivu.vn', type: 'like' },
    ],
  },
  {
    title: 'Cho Lon in a morning: temple, market, noodles',
    content:
      'Start at Thien Hau pagoda when the incense coils are lit, cross to Binh Tay market for the wholesale chaos, then hu tieu at any of the stalls on Trieu Quang Phuc. It is 7 km from District 1; take a Grab bike there and a bus back along Tran Hung Dao to see the shop-houses.',
    authorEmail: 'an.wanderer@vivivu.vn', placeName: 'Cho Lon - Binh Tay Market', regionSlug: 'tp-ho-chi-minh', photo: 'cholon,market', daysAgo: 5,
    reactions: [{ authorEmail: 'ha.coffee@vivivu.vn', type: 'helpful' }],
  },
  {
    title: 'The Cafe Apartment floor by floor',
    content:
      'Nine floors, a 3k lift fee, and every floor is a different mood. Second floor for the balcony over Nguyen Hue, fifth for the quiet bookshop cafe, top floor for sunset. Skip the ground floor chains. Weekday afternoons are empty.',
    authorEmail: 'ha.coffee@vivivu.vn', placeName: 'Cafe Apartment 42 Nguyen Hue', regionSlug: 'tp-ho-chi-minh', photo: 'saigon,cafe,balcony', daysAgo: 12,
    comments: [{ authorEmail: 'user@vivivu.vn', content: 'The lift lady takes cash only, bring small notes.' }],
    reactions: [{ authorEmail: 'user@vivivu.vn', type: 'like' }, { authorEmail: 'minh.foodie@vivivu.vn', type: 'like' }],
  },
  {
    title: 'Oc night: how to order snails without a menu',
    content:
      'Point at the tray, then say the cooking style: "xao bo toi" (butter garlic), "nuong mo hanh" (grilled with scallion oil), "hap sa" (steamed with lemongrass). A plate is 60-90k and three plates feed two people with beer. Oc Dao gets loud after 19:00, which is the point.',
    authorEmail: 'minh.foodie@vivivu.vn', placeName: 'Oc Dao Nguyen Trai', regionSlug: 'tp-ho-chi-minh', photo: 'seafood,street,vietnam', daysAgo: 15,
    reactions: [{ authorEmail: 'an.wanderer@vivivu.vn', type: 'love' }, { authorEmail: 'linh.local@vivivu.vn', type: 'helpful' }],
  },
  {
    title: 'Dragon Bridge fire show: where to stand',
    content:
      'Saturday and Sunday at 21:00 the bridge breathes fire then water. Stand on the east bank near the Love Bridge for the fire, but anyone on the west end of the bridge itself gets soaked by the water. Roads close ten minutes before, so cross early.',
    authorEmail: 'an.wanderer@vivivu.vn', placeName: 'Dragon Bridge', regionSlug: 'da-nang', photo: 'danang,bridge,night', daysAgo: 3,
    comments: [{ authorEmail: 'ha.coffee@vivivu.vn', content: 'Cong Caphe on Bach Dang has a balcony with a straight view.' }],
    reactions: [{ authorEmail: 'user@vivivu.vn', type: 'wow' }, { authorEmail: 'ha.coffee@vivivu.vn', type: 'like' }],
  },
  {
    title: 'Banh xeo Ba Duong is down an alley - here is the alley',
    content:
      'K280/23 Hoang Dieu. The first banh xeo place you pass in the alley is a copycat; keep walking to the end. Order banh xeo and nem lui, roll them yourself in rice paper with the herbs, dip in the peanut sauce. 80k a head and you will not need dinner.',
    authorEmail: 'linh.local@vivivu.vn', placeName: 'Banh Xeo Ba Duong', regionSlug: 'da-nang', photo: 'banhxeo,vietnamese,food', daysAgo: 8,
    reactions: [{ authorEmail: 'minh.foodie@vivivu.vn', type: 'helpful' }, { authorEmail: 'an.wanderer@vivivu.vn', type: 'like' }],
  },
  {
    title: 'Marble Mountains without the crowds',
    content:
      'Take the stairs on the Huyen Tran Cong Chua side, not the lift, and go at 7 when it opens. Huyen Khong cave is empty for the first hour and the light comes through the roof around 8. Wear real shoes; the marble is polished smooth and slippery.',
    authorEmail: 'an.wanderer@vivivu.vn', placeName: 'Marble Mountains', regionSlug: 'da-nang', photo: 'marble,mountain,cave', daysAgo: 18,
    comments: [{ authorEmail: 'user@vivivu.vn', content: 'Did this last week, the 7am tip is gold.' }],
    reactions: [{ authorEmail: 'user@vivivu.vn', type: 'helpful' }],
  },
  {
    title: 'Specialty coffee in Da Nang is quietly excellent',
    content:
      '43 Factory roasts on site and does a proper pour-over flight. It is pricier than the city average, but the beans are Vietnamese arabica from Lam Dong, which you rarely see done this well. Go mid-morning, sit by the glass wall, skip the food.',
    authorEmail: 'ha.coffee@vivivu.vn', placeName: '43 Factory Coffee Roaster', regionSlug: 'da-nang', photo: 'specialty,coffee,roaster', daysAgo: 21,
    reactions: [{ authorEmail: 'linh.local@vivivu.vn', type: 'like' }],
  },
  {
    title: 'Hue in the rain is the right Hue',
    content:
      'It rains most afternoons from October to January. Do the Citadel in the morning, then spend the wet hours at a bun bo stall and a cafe on the river. The tombs are better in drizzle anyway - fewer people, and the moss on Tu Duc goes bright green.',
    authorEmail: 'an.wanderer@vivivu.vn', placeName: 'Imperial City of Hue', regionSlug: 'thua-thien-hue', photo: 'hue,citadel,vietnam', daysAgo: 7,
    reactions: [{ authorEmail: 'ha.coffee@vivivu.vn', type: 'love' }, { authorEmail: 'minh.foodie@vivivu.vn', type: 'like' }],
  },
  {
    title: 'Da Lat night market: eat the banh trang nuong, skip the rest',
    content:
      'The market is mostly jackets and strawberries. The thing to eat is banh trang nuong (grilled rice paper with egg and scallion) from the carts at the Hoa Binh end, 20k each, and a cup of soy milk after. Bring a jacket; it is 15 degrees after dark.',
    authorEmail: 'minh.foodie@vivivu.vn', placeName: 'Da Lat Night Market', regionSlug: 'lam-dong', photo: 'dalat,night,market', daysAgo: 11,
    comments: [{ authorEmail: 'linh.local@vivivu.vn', content: 'The avocado ice cream stall next to the stairs is also worth it.' }],
    reactions: [{ authorEmail: 'user@vivivu.vn', type: 'like' }, { authorEmail: 'an.wanderer@vivivu.vn', type: 'helpful' }],
  },
];

/** Dia diem user@vivivu.vn da luu san, de trang shortlist va "Must include" khong trong. */
export const SEED_SHORTLIST: Array<{ userEmail: string; placeName: string; notes?: string }> = [
  { userEmail: 'user@vivivu.vn', placeName: 'Cafe Giang', notes: 'Egg coffee, go early' },
  { userEmail: 'user@vivivu.vn', placeName: 'Cha Ca Thang Long', notes: 'Dinner night 1' },
  { userEmail: 'user@vivivu.vn', placeName: 'Temple of Literature' },
  { userEmail: 'user@vivivu.vn', placeName: 'Banh Xeo Ba Duong' },
  { userEmail: 'user@vivivu.vn', placeName: 'Cuc Gach Quan', notes: 'Book a table' },
];
