export interface CityInfo {
  id: string;
  cityName: string;
  provinceOrCountry: string;
  lat: number;
  lng: number;
  defaultCurrency: 'IDR' | 'USD' | 'EUR' | 'SGD' | 'MYR' | 'JPY';
  description: string;
  popularSpots?: {
    title: string;
    lat: number;
    lng: number;
    cat: 'sightseeing' | 'culinary' | 'hotel' | 'shopping' | 'transit' | 'nature';
    address: string;
    cost: number;
  }[];
}

export const POPULAR_CITIES: CityInfo[] = [
  {
    id: 'yogyakarta',
    cityName: 'Yogyakarta',
    provinceOrCountry: 'DI Yogyakarta, Indonesia',
    lat: -7.7956,
    lng: 110.3695,
    defaultCurrency: 'IDR',
    description: 'Kota budaya, seni, candi bersejarah, dan kuliner otentik gudeg.',
    popularSpots: [
      { title: 'Candi Prambanan', lat: -7.7520, lng: 110.4914, cat: 'sightseeing', address: 'Jl. Raya Solo - Yogyakarta No.16, Sleman', cost: 50000 },
      { title: 'Candi Borobudur', lat: -7.6079, lng: 110.2038, cat: 'sightseeing', address: 'Borobudur, Magelang', cost: 150000 },
      { title: 'Keraton & Taman Sari', lat: -7.8053, lng: 110.3642, cat: 'sightseeing', address: 'Jl. Rotowijayan Blok No. 1, Kraton', cost: 25000 },
      { title: 'Jalan Malioboro & Titik Nol', lat: -7.7928, lng: 110.3658, cat: 'shopping', address: 'Yogyakarta Pusat', cost: 100000 },
      { title: 'Gudeg Yu Djum Wijilan', lat: -7.8049, lng: 110.3664, cat: 'culinary', address: 'Jl. Wijilan No.167, Kraton', cost: 65000 },
    ],
  },
  {
    id: 'bali',
    cityName: 'Bali',
    provinceOrCountry: 'Bali, Indonesia',
    lat: -8.4095,
    lng: 115.1889,
    defaultCurrency: 'IDR',
    description: 'Pulau Dewata dengan pantai eksotis, tebing teater kecak, dan terasering Ubud.',
    popularSpots: [
      { title: 'Pura Tanah Lot', lat: -8.6212, lng: 115.0868, cat: 'sightseeing', address: 'Tabanan, Bali', cost: 60000 },
      { title: 'Tegallalang Rice Terrace', lat: -8.4357, lng: 115.2798, cat: 'nature', address: 'Ubud, Gianyar', cost: 50000 },
      { title: 'Pantai Melasti Ungasan', lat: -8.8475, lng: 115.1539, cat: 'nature', address: 'Kuta Selatan, Badung', cost: 35000 },
      { title: 'Pura Luhur Uluwatu', lat: -8.8291, lng: 115.0849, cat: 'sightseeing', address: 'Pecatu, Kuta Selatan', cost: 50000 },
      { title: 'Jimbaran Seafood Dinner', lat: -8.7735, lng: 115.1668, cat: 'culinary', address: 'Pantai Muaya, Jimbaran', cost: 350000 },
    ],
  },
  {
    id: 'bandung',
    cityName: 'Bandung',
    provinceOrCountry: 'Jawa Barat, Indonesia',
    lat: -6.9175,
    lng: 107.6191,
    defaultCurrency: 'IDR',
    description: 'Kota Kembang dengan suasana pegunungan sejuk, cafe estetik, dan kuliner khas.',
    popularSpots: [
      { title: 'Kawah Putih Ciwidey', lat: -7.1662, lng: 107.4021, cat: 'nature', address: 'Sugihmukti, Pasirjambu, Bandung', cost: 75000 },
      { title: 'Dusun Bambu Lembang', lat: -6.7891, lng: 107.5786, cat: 'nature', address: 'Jl. Kolonel Masturi KM 11, Lembang', cost: 40000 },
      { title: 'Jalan Asia Afrika & Braga', lat: -6.9211, lng: 107.6096, cat: 'sightseeing', address: 'Sumur Bandung, Kota Bandung', cost: 50000 },
      { title: 'Tebing Keraton Dago', lat: -6.8337, lng: 107.6358, cat: 'nature', address: 'Ciburial, Cimenyan, Bandung', cost: 20000 },
      { title: 'Batagor Kingsley', lat: -6.9142, lng: 107.6180, cat: 'culinary', address: 'Jl. Veteran No.25, Bandung', cost: 45000 },
    ],
  },
  {
    id: 'jakarta',
    cityName: 'Jakarta',
    provinceOrCountry: 'DKI Jakarta, Indonesia',
    lat: -6.2088,
    lng: 106.8456,
    defaultCurrency: 'IDR',
    description: 'Metropolis megah dengan ikon Monas, Kota Tua bersejarah, dan kuliner Nusantara.',
    popularSpots: [
      { title: 'Monumen Nasional (Monas)', lat: -6.1754, lng: 106.8272, cat: 'sightseeing', address: 'Gambir, Jakarta Pusat', cost: 20000 },
      { title: 'Kota Tua & Museum Fatahillah', lat: -6.1352, lng: 106.8133, cat: 'sightseeing', address: 'Pinangsia, Tamansari, Jakarta Barat', cost: 15000 },
      { title: 'Pantai Indah Kapuk (PIK 2)', lat: -6.1102, lng: 106.7383, cat: 'culinary', address: 'Penjaringan, Jakarta Utara', cost: 100000 },
      { title: 'Taman Mini Indonesia Indah (TMII)', lat: -6.3024, lng: 106.8952, cat: 'sightseeing', address: 'Cipayung, Jakarta Timur', cost: 35000 },
      { title: 'Soto Betawi H. Ma\'ruf', lat: -6.1932, lng: 106.8378, cat: 'culinary', address: 'Cikini, Jakarta Pusat', cost: 55000 },
    ],
  },
  {
    id: 'surabaya',
    cityName: 'Surabaya',
    provinceOrCountry: 'Jawa Timur, Indonesia',
    lat: -7.2575,
    lng: 112.7521,
    defaultCurrency: 'IDR',
    description: 'Kota Pahlawan penuh sejarah, Jembatan Suramadu, dan kuliner Rawon Kalkulator.',
    popularSpots: [
      { title: 'Monumen Tugu Pahlawan', lat: -7.2458, lng: 112.7378, cat: 'sightseeing', address: 'Alun-alun Contong, Bubutan, Surabaya', cost: 10000 },
      { title: 'Jembatan Suramadu', lat: -7.1952, lng: 112.7801, cat: 'sightseeing', address: 'Kenjeran, Surabaya', cost: 20000 },
      { title: 'Rawon Setan Mbak Endang', lat: -7.2628, lng: 112.7420, cat: 'culinary', address: 'Jl. Embong Malang No.78, Genteng', cost: 45000 },
      { title: 'House of Sampoerna', lat: -7.2307, lng: 112.7341, cat: 'sightseeing', address: 'Taman Sampoerna No.6, Pabean Cantian', cost: 10000 },
      { title: 'Surabaya North Quay', lat: -7.1950, lng: 112.7328, cat: 'nature', address: 'Perak Utara, Pabean Cantian', cost: 25000 },
    ],
  },
  {
    id: 'lombok',
    cityName: 'Lombok & Gili',
    provinceOrCountry: 'Nusa Tenggara Barat, Indonesia',
    lat: -8.5833,
    lng: 116.1167,
    defaultCurrency: 'IDR',
    description: 'Pantai Kuta Lombok, Bukit Merese, Gunung Rinjani, dan pulau eksotis Gili Trawangan.',
    popularSpots: [
      { title: 'Gili Trawangan Island', lat: -8.3490, lng: 116.0396, cat: 'nature', address: 'Pemenang, Lombok Utara', cost: 150000 },
      { title: 'Pantai Kuta Lombok & Mandalika', lat: -8.8955, lng: 116.2825, cat: 'nature', address: 'Pujut, Lombok Tengah', cost: 20000 },
      { title: 'Bukit Merese Sunset', lat: -8.9080, lng: 116.3112, cat: 'nature', address: 'Kuta, Pujut, Lombok Tengah', cost: 15000 },
      { title: 'Ayam Taliwang H. Moerad', lat: -8.5841, lng: 116.1012, cat: 'culinary', address: 'Cilinaya, Mataram', cost: 60000 },
      { title: 'Desa Adat Sade Sasak', lat: -8.8385, lng: 116.2921, cat: 'sightseeing', address: 'Rembang, Pujut, Lombok Tengah', cost: 30000 },
    ],
  },
  {
    id: 'labuan-bajo',
    cityName: 'Labuan Bajo',
    provinceOrCountry: 'Nusa Tenggara Timur, Indonesia',
    lat: -8.4539,
    lng: 119.8728,
    defaultCurrency: 'IDR',
    description: 'Gerbang utama Taman Nasional Komodo, Pulau Padar, dan Pink Beach yang menakjubkan.',
    popularSpots: [
      { title: 'Pulau Padar Trekking', lat: -8.6534, lng: 119.5714, cat: 'nature', address: 'Komodo, Manggarai Barat', cost: 200000 },
      { title: 'Taman Nasional Komodo', lat: -8.6226, lng: 119.4678, cat: 'sightseeing', address: 'Pulau Komodo, Manggarai Barat', cost: 250000 },
      { title: 'Pink Beach Komodo', lat: -8.6015, lng: 119.5218, cat: 'nature', address: 'Pulau Komodo', cost: 50000 },
      { title: 'Puncak Waringin Sunset Point', lat: -8.4878, lng: 119.8765, cat: 'sightseeing', address: 'Labuan Bajo, Manggarai Barat', cost: 25000 },
      { title: 'Gua Rangko (Kolam Alami)', lat: -8.4352, lng: 119.9542, cat: 'nature', address: 'Tanjung Boleng, Manggarai Barat', cost: 100000 },
    ],
  },
  {
    id: 'singapore',
    cityName: 'Singapore',
    provinceOrCountry: 'Singapore',
    lat: 1.3521,
    lng: 103.8198,
    defaultCurrency: 'SGD',
    description: 'Kota modern dengan Gardens by the Bay, Marina Bay Sands, dan Jewel Changi.',
    popularSpots: [
      { title: 'Gardens by the Bay', lat: 1.2815, lng: 103.8636, cat: 'sightseeing', address: '18 Marina Gardens Dr, Singapore', cost: 28 },
      { title: 'Marina Bay Sands SkyPark', lat: 1.2834, lng: 103.8607, cat: 'sightseeing', address: '10 Bayfront Ave, Singapore', cost: 30 },
      { title: 'Merlion Park', lat: 1.2868, lng: 103.8545, cat: 'sightseeing', address: 'One Fullerton, Singapore', cost: 0 },
      { title: 'Lau Pa Sat Hawker Center', lat: 1.2807, lng: 103.8504, cat: 'culinary', address: '18 Raffles Quay, Singapore', cost: 15 },
      { title: 'Universal Studios Singapore', lat: 1.2540, lng: 103.8238, cat: 'sightseeing', address: '8 Sentosa Gateway, Singapore', cost: 82 },
    ],
  },
  {
    id: 'tokyo',
    cityName: 'Tokyo',
    provinceOrCountry: 'Japan',
    lat: 35.6762,
    lng: 139.6503,
    defaultCurrency: 'JPY',
    description: 'Pusat budaya populer, Kuil Senso-ji, persimpangan Shibuya, dan kulinernya yang lezat.',
    popularSpots: [
      { title: 'Senso-ji Temple Asakusa', lat: 35.7148, lng: 139.7967, cat: 'sightseeing', address: '2 Chome-3-1 Asakusa, Taito, Tokyo', cost: 0 },
      { title: 'Shibuya Crossing & Hachiko', lat: 35.6595, lng: 139.7004, cat: 'sightseeing', address: 'Dogenzaka, Shibuya, Tokyo', cost: 0 },
      { title: 'Tokyo Skytree', lat: 35.7101, lng: 139.8107, cat: 'sightseeing', address: '1 Chome-1-2 Oshiage, Sumida, Tokyo', cost: 2100 },
      { title: 'Tsukiji Outer Market (Ramen & Sushi)', lat: 35.6654, lng: 139.7707, cat: 'culinary', address: '4 Chome Tsukiji, Chuo, Tokyo', cost: 3000 },
      { title: 'Meiji Jingu Shrine', lat: 35.6764, lng: 139.6993, cat: 'nature', address: '1-1 Yoyogikamicho, Shibuya, Tokyo', cost: 0 },
    ],
  },
];

/**
 * Finds approximate default coordinates for a given city name
 */
export function getCoordinatesForCityName(cityName: string): { lat: number; lng: number } {
  const normalized = cityName.toLowerCase().trim();
  const matched = POPULAR_CITIES.find(
    (c) =>
      normalized.includes(c.cityName.toLowerCase()) ||
      c.cityName.toLowerCase().includes(normalized) ||
      normalized.includes(c.id)
  );

  if (matched) {
    return { lat: matched.lat, lng: matched.lng };
  }

  // Indonesian fallback coordinates mapping
  if (normalized.includes('semarang')) return { lat: -6.9667, lng: 110.4167 };
  if (normalized.includes('malang')) return { lat: -7.9666, lng: 112.6326 };
  if (normalized.includes('medan')) return { lat: 3.5952, lng: 98.6722 };
  if (normalized.includes('makassar')) return { lat: -5.1477, lng: 119.4327 };
  if (normalized.includes('solo') || normalized.includes('surakarta')) return { lat: -7.5755, lng: 110.8243 };
  if (normalized.includes('palembang')) return { lat: -2.9761, lng: 104.7754 };
  if (normalized.includes('manado')) return { lat: 1.4748, lng: 124.8428 };
  if (normalized.includes('batam')) return { lat: 1.1299, lng: 104.0529 };
  if (normalized.includes('paris')) return { lat: 48.8566, lng: 2.3522 };
  if (normalized.includes('london')) return { lat: 51.5074, lng: -0.1278 };
  if (normalized.includes('sydney')) return { lat: -33.8688, lng: 151.2093 };

  // Default Indonesia Center if totally unknown
  return { lat: -6.2088, lng: 106.8456 };
}
