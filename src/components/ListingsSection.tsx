import { useState } from "react";
import { ExternalLink, MapPin, TrendingUp, Home, Calendar, Filter, ChevronDown } from "lucide-react";
import { City } from "../data/cities";
import { getListingsByCity, Listing } from "../data/listings";

interface Props {
  city: City;
}

const sourceColors: Record<string, string> = {
  ЦИАН: "bg-sky-100 text-sky-700",
  Авито: "bg-emerald-100 text-emerald-700",
  "Яндекс Недвижимость": "bg-amber-100 text-amber-700",
  Домклик: "bg-violet-100 text-violet-700",
};

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

const roomsLabel = (r: number | "studio") => {
  if (r === "studio") return "Студия";
  if (r === 1) return "1-комн.";
  if (r === 2) return "2-комн.";
  if (r === 3) return "3-комн.";
  return `${r}-комн.`;
};

export default function ListingsSection({ city }: Props) {
  const all = getListingsByCity(city.id);
  const [filter, setFilter] = useState<"all" | "secondary" | "newbuilding">("all");
  const [roomFilter, setRoomFilter] = useState<"all" | "studio" | 1 | 2 | 3>("all");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "area">("price_asc");
  const [selected, setSelected] = useState<Listing | null>(null);

  const filtered = all
    .filter((l) => (filter === "all" ? true : l.type === filter))
    .filter((l) => (roomFilter === "all" ? true : l.rooms === roomFilter))
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.price - b.price;
      if (sortBy === "price_desc") return b.price - a.price;
      return b.area - a.area;
    });

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Фильтры</span>
          </div>

          {/* Type filter */}
          <div className="flex gap-1.5">
            {[
              { val: "all", label: "Все" },
              { val: "secondary", label: "Вторичка" },
              { val: "newbuilding", label: "Новостройки" },
            ].map((f) => (
              <button
                key={f.val}
                onClick={() => setFilter(f.val as typeof filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filter === f.val
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Rooms filter */}
          <div className="flex gap-1.5">
            {[
              { val: "all", label: "Любые" },
              { val: "studio", label: "Студия" },
              { val: 1, label: "1" },
              { val: 2, label: "2" },
              { val: 3, label: "3+" },
            ].map((f) => (
              <button
                key={String(f.val)}
                onClick={() => setRoomFilter(f.val as typeof roomFilter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  roomFilter === f.val
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="ml-auto flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="price_asc">Цена ↑</option>
              <option value="price_desc">Цена ↓</option>
              <option value="area">По площади</option>
            </select>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Найдено <span className="font-bold text-slate-800">{filtered.length}</span> объявлений
        </p>
        <p className="text-xs text-slate-400">Данные с ЦИАН, Авито, Яндекс Недвижимость, Домклик</p>
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Home className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Объявлений не найдено</p>
          <p className="text-slate-300 text-sm mt-1">Попробуйте изменить фильтры</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((listing) => (
          <div
            key={listing.id}
            onClick={() => setSelected(listing)}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer overflow-hidden group"
          >
            {/* Color bar */}
            <div className={`h-1 ${listing.type === "newbuilding" ? "bg-gradient-to-r from-violet-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`} />

            <div className="p-4">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[listing.source] || "bg-slate-100 text-slate-600"}`}>
                      {listing.source}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${listing.type === "newbuilding" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                      {listing.type === "newbuilding" ? "Новостройка" : "Вторичка"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                    {listing.title}
                  </h3>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-1.5 text-slate-500 text-xs mb-3">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{listing.address}</span>
                <span className="text-slate-300">•</span>
                <span>{listing.district} р-н</span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-2 text-center">
                  <div className="text-xs text-slate-400">Комнат</div>
                  <div className="font-bold text-slate-800 text-sm">{roomsLabel(listing.rooms)}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center">
                  <div className="text-xs text-slate-400">Площадь</div>
                  <div className="font-bold text-slate-800 text-sm">{listing.area} м²</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2 text-center">
                  <div className="text-xs text-slate-400">Этаж</div>
                  <div className="font-bold text-slate-800 text-sm">{listing.floor}/{listing.totalFloors}</div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-slate-900">{fmt(listing.price)} ₽</div>
                  <div className="text-xs text-slate-400">{fmt(listing.pricePerSqm)} ₽/м²</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-emerald-600">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Прогноз +{listing.predictedDiff}%</span>
                  </div>
                  <div className="text-xs text-slate-400">{fmt(listing.predicted)} ₽</div>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3">
                {listing.tags.map((tag) => (
                  <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Date */}
              <div className="flex items-center gap-1 mt-3 text-slate-300 text-xs">
                <Calendar className="w-3 h-3" />
                <span>Добавлено {new Date(listing.postedAt).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`h-2 rounded-t-3xl ${selected.type === "newbuilding" ? "bg-gradient-to-r from-violet-500 to-purple-600" : "bg-gradient-to-r from-blue-500 to-indigo-600"}`} />
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[selected.source] || "bg-slate-100 text-slate-600"}`}>
                      {selected.source}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selected.type === "newbuilding" ? "bg-violet-100 text-violet-700" : "bg-blue-100 text-blue-700"}`}>
                      {selected.type === "newbuilding" ? "Новостройка" : "Вторичка"}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-800">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl font-bold ml-4">×</button>
              </div>

              <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span>{selected.address}, {selected.district} район</span>
              </div>

              <p className="text-slate-600 text-sm leading-relaxed mb-5">{selected.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Комнат", value: roomsLabel(selected.rooms) },
                  { label: "Площадь", value: `${selected.area} м²` },
                  { label: "Этаж", value: `${selected.floor} из ${selected.totalFloors}` },
                  { label: "Год постройки", value: selected.year },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-400">{item.label}</div>
                    <div className="font-bold text-slate-800">{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 mb-5">
                <div className="text-3xl font-bold text-slate-900 mb-1">{fmt(selected.price)} ₽</div>
                <div className="text-sm text-slate-500 mb-3">{fmt(selected.pricePerSqm)} ₽ за м²</div>
                <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <div className="text-xs text-emerald-700 font-semibold">AI-прогноз через 12 месяцев</div>
                    <div className="text-base font-bold text-emerald-800">{fmt(selected.predicted)} ₽ (+{selected.predictedDiff}%)</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-5">
                {selected.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={selected.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-2xl transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Открыть на {selected.source}
              </a>
              <p className="text-center text-xs text-slate-400 mt-2">
                * В MVP данные демонстрационные. В боевой версии — реальный парсинг.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
