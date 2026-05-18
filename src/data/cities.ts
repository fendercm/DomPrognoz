export interface City {
  id: string;
  name: string;
  region: string;
  pricePerSqm: number;
  priceGrowth: number;
  avgRent1: number;
  avgRent2: number;
  population: number;
  description: string;
  priceHistory: { year: string; price: number; newbuilding: number }[];
  forecast: { year: string; price: number; optimistic: number; pessimistic: number }[];
  districts: { name: string; pricePerSqm: number; type: string }[];
}

export const cities: City[] = [
  {
    id: "rostov",
    name: "Ростов-на-Дону",
    region: "Ростовская область",
    pricePerSqm: 122074,
    priceGrowth: 13.5,
    avgRent1: 27147,
    avgRent2: 34505,
    population: 1_142_000,
    description: "Крупнейший город юга России, деловой и культурный центр Северного Кавказа",
    priceHistory: [
      { year: "2018", price: 58129, newbuilding: 62000 },
      { year: "2019", price: 57624, newbuilding: 63500 },
      { year: "2020", price: 57913, newbuilding: 68000 },
      { year: "2021", price: 59663, newbuilding: 78000 },
      { year: "2022", price: 66287, newbuilding: 95000 },
      { year: "2023", price: 90663, newbuilding: 111520 },
      { year: "2024", price: 124011, newbuilding: 152934 },
      { year: "2025", price: 122074, newbuilding: 167804 },
    ],
    forecast: [
      { year: "2025", price: 122074, optimistic: 122074, pessimistic: 122074 },
      { year: "2026", price: 131000, optimistic: 138000, pessimistic: 124000 },
      { year: "2027", price: 141000, optimistic: 155000, pessimistic: 128000 },
      { year: "2028", price: 152000, optimistic: 172000, pessimistic: 133000 },
    ],
    districts: [
      { name: "Центральный", pricePerSqm: 165000, type: "Элитный" },
      { name: "Советский", pricePerSqm: 128000, type: "Комфорт" },
      { name: "Кировский", pricePerSqm: 118000, type: "Комфорт" },
      { name: "Октябрьский", pricePerSqm: 135000, type: "Бизнес" },
      { name: "Пролетарский", pricePerSqm: 95000, type: "Эконом" },
      { name: "Железнодорожный", pricePerSqm: 105000, type: "Эконом" },
      { name: "Первомайский", pricePerSqm: 110000, type: "Комфорт" },
      { name: "Ленинский", pricePerSqm: 142000, type: "Бизнес" },
    ],
  },
  {
    id: "krasnodar",
    name: "Краснодар",
    region: "Краснодарский край",
    pricePerSqm: 118000,
    priceGrowth: 11.2,
    avgRent1: 28000,
    avgRent2: 36000,
    population: 1_100_000,
    description: "Столица Кубани, один из самых быстрорастущих городов России",
    priceHistory: [
      { year: "2018", price: 55000, newbuilding: 60000 },
      { year: "2019", price: 56200, newbuilding: 62000 },
      { year: "2020", price: 60000, newbuilding: 70000 },
      { year: "2021", price: 72000, newbuilding: 85000 },
      { year: "2022", price: 88000, newbuilding: 100000 },
      { year: "2023", price: 98000, newbuilding: 115000 },
      { year: "2024", price: 112000, newbuilding: 145000 },
      { year: "2025", price: 118000, newbuilding: 162000 },
    ],
    forecast: [
      { year: "2025", price: 118000, optimistic: 118000, pessimistic: 118000 },
      { year: "2026", price: 126000, optimistic: 134000, pessimistic: 120000 },
      { year: "2027", price: 135000, optimistic: 150000, pessimistic: 124000 },
      { year: "2028", price: 145000, optimistic: 165000, pessimistic: 128000 },
    ],
    districts: [
      { name: "Центральный", pricePerSqm: 155000, type: "Элитный" },
      { name: "Прикубанский", pricePerSqm: 112000, type: "Комфорт" },
      { name: "Карасунский", pricePerSqm: 108000, type: "Комфорт" },
      { name: "Западный", pricePerSqm: 125000, type: "Бизнес" },
      { name: "Юбилейный", pricePerSqm: 98000, type: "Эконом" },
      { name: "Гидростроителей", pricePerSqm: 102000, type: "Эконом" },
    ],
  },
  {
    id: "sochi",
    name: "Сочи",
    region: "Краснодарский край",
    pricePerSqm: 210000,
    priceGrowth: 8.5,
    avgRent1: 45000,
    avgRent2: 68000,
    population: 480_000,
    description: "Курортная столица России, главный морской курорт страны",
    priceHistory: [
      { year: "2018", price: 100000, newbuilding: 115000 },
      { year: "2019", price: 108000, newbuilding: 122000 },
      { year: "2020", price: 125000, newbuilding: 145000 },
      { year: "2021", price: 155000, newbuilding: 180000 },
      { year: "2022", price: 175000, newbuilding: 210000 },
      { year: "2023", price: 190000, newbuilding: 230000 },
      { year: "2024", price: 205000, newbuilding: 265000 },
      { year: "2025", price: 210000, newbuilding: 280000 },
    ],
    forecast: [
      { year: "2025", price: 210000, optimistic: 210000, pessimistic: 210000 },
      { year: "2026", price: 228000, optimistic: 242000, pessimistic: 215000 },
      { year: "2027", price: 248000, optimistic: 272000, pessimistic: 222000 },
      { year: "2028", price: 268000, optimistic: 302000, pessimistic: 230000 },
    ],
    districts: [
      { name: "Центральный", pricePerSqm: 280000, type: "Элитный" },
      { name: "Адлерский", pricePerSqm: 195000, type: "Комфорт" },
      { name: "Хостинский", pricePerSqm: 220000, type: "Бизнес" },
      { name: "Лазаревский", pricePerSqm: 165000, type: "Комфорт" },
    ],
  },
  {
    id: "volgograd",
    name: "Волгоград",
    region: "Волгоградская область",
    pricePerSqm: 78000,
    priceGrowth: 9.8,
    avgRent1: 18000,
    avgRent2: 24000,
    population: 1_013_000,
    description: "Город-герой на Волге, крупный промышленный и транспортный узел",
    priceHistory: [
      { year: "2018", price: 43000, newbuilding: 48000 },
      { year: "2019", price: 44500, newbuilding: 50000 },
      { year: "2020", price: 48000, newbuilding: 55000 },
      { year: "2021", price: 55000, newbuilding: 65000 },
      { year: "2022", price: 62000, newbuilding: 72000 },
      { year: "2023", price: 68000, newbuilding: 80000 },
      { year: "2024", price: 74000, newbuilding: 92000 },
      { year: "2025", price: 78000, newbuilding: 98000 },
    ],
    forecast: [
      { year: "2025", price: 78000, optimistic: 78000, pessimistic: 78000 },
      { year: "2026", price: 84000, optimistic: 90000, pessimistic: 79000 },
      { year: "2027", price: 91000, optimistic: 100000, pessimistic: 82000 },
      { year: "2028", price: 98000, optimistic: 112000, pessimistic: 86000 },
    ],
    districts: [
      { name: "Центральный", pricePerSqm: 98000, type: "Элитный" },
      { name: "Советский", pricePerSqm: 75000, type: "Комфорт" },
      { name: "Кировский", pricePerSqm: 68000, type: "Эконом" },
      { name: "Дзержинский", pricePerSqm: 80000, type: "Комфорт" },
      { name: "Красноармейский", pricePerSqm: 65000, type: "Эконом" },
    ],
  },
  {
    id: "stavropol",
    name: "Ставрополь",
    region: "Ставропольский край",
    pricePerSqm: 82000,
    priceGrowth: 12.1,
    avgRent1: 20000,
    avgRent2: 27000,
    population: 455_000,
    description: "Административный центр Северо-Кавказского федерального округа",
    priceHistory: [
      { year: "2018", price: 42000, newbuilding: 46000 },
      { year: "2019", price: 43500, newbuilding: 48000 },
      { year: "2020", price: 46000, newbuilding: 53000 },
      { year: "2021", price: 54000, newbuilding: 63000 },
      { year: "2022", price: 62000, newbuilding: 74000 },
      { year: "2023", price: 70000, newbuilding: 84000 },
      { year: "2024", price: 78000, newbuilding: 96000 },
      { year: "2025", price: 82000, newbuilding: 105000 },
    ],
    forecast: [
      { year: "2025", price: 82000, optimistic: 82000, pessimistic: 82000 },
      { year: "2026", price: 89000, optimistic: 96000, pessimistic: 83000 },
      { year: "2027", price: 97000, optimistic: 108000, pessimistic: 87000 },
      { year: "2028", price: 106000, optimistic: 122000, pessimistic: 91000 },
    ],
    districts: [
      { name: "Октябрьский", pricePerSqm: 98000, type: "Элитный" },
      { name: "Промышленный", pricePerSqm: 78000, type: "Комфорт" },
      { name: "Ленинский", pricePerSqm: 85000, type: "Комфорт" },
      { name: "Юго-Западный", pricePerSqm: 72000, type: "Эконом" },
    ],
  },
];

export const getCity = (id: string) => cities.find((c) => c.id === id) || cities[0];
