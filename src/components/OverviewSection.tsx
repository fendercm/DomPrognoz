import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { TrendingUp, Home, DollarSign, Users, Building } from "lucide-react";
import { City } from "../data/cities";

interface Props {
  city: City;
}

const districtTypeColors: Record<string, string> = {
  Элитный: "bg-purple-100 text-purple-700",
  Бизнес: "bg-blue-100 text-blue-700",
  Комфорт: "bg-emerald-100 text-emerald-700",
  Эконом: "bg-amber-100 text-amber-700",
};

const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n));

export default function OverviewSection({ city }: Props) {
  const stats = [
    {
      label: "Цена за м² (вторичка)",
      value: `${fmt(city.pricePerSqm)} ₽`,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sub: `+${city.priceGrowth}% за год`,
      subColor: "text-emerald-600",
    },
    {
      label: "Аренда 1-комн.",
      value: `${fmt(city.avgRent1)} ₽/мес`,
      icon: Home,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sub: `2-комн. от ${fmt(city.avgRent2)} ₽`,
      subColor: "text-slate-500",
    },
    {
      label: "Новостройки",
      value: `${fmt(city.priceHistory[city.priceHistory.length - 1].newbuilding)} ₽/м²`,
      icon: Building,
      color: "text-violet-600",
      bg: "bg-violet-50",
      sub: "Средняя цена 2025",
      subColor: "text-slate-500",
    },
    {
      label: "Население",
      value: `${(city.population / 1_000_000).toFixed(2)} млн`,
      icon: Users,
      color: "text-rose-600",
      bg: "bg-rose-50",
      sub: "жителей",
      subColor: "text-slate-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* City hero */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm font-medium uppercase tracking-widest mb-1">{city.region}</p>
            <h2 className="text-3xl font-bold mb-2">{city.name}</h2>
            <p className="text-blue-100 text-sm max-w-md leading-relaxed">{city.description}</p>
          </div>
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <TrendingUp className="w-5 h-5 text-emerald-300" />
              <span className="text-xl font-bold">+{city.priceGrowth}%</span>
            </div>
            <span className="text-blue-200 text-xs">рост цен за год</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-lg font-bold text-slate-800">{s.value}</div>
            <div className={`text-xs font-medium mt-0.5 ${s.subColor}`}>{s.sub}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Price chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Динамика цен на жильё</h3>
        <p className="text-xs text-slate-400 mb-4">Вторичный рынок и новостройки, ₽/м²</p>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={city.priceHistory} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSecondary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="year" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${fmt(Number(value))} ₽/м²`,
                name === "price" ? "Вторичка" : "Новостройки",
              ]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Legend
              formatter={(v) => (v === "price" ? "Вторичный рынок" : "Новостройки")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorSecondary)" dot={{ r: 4, fill: "#3b82f6" }} />
            <Area type="monotone" dataKey="newbuilding" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorNew)" dot={{ r: 4, fill: "#8b5cf6" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Districts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Цены по районам</h3>
        <p className="text-xs text-slate-400 mb-4">Средняя стоимость м² по районам города</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={city.districts} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}к`}
            />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={100} />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [`${fmt(Number(v))} ₽/м²`, "Цена за м²"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="pricePerSqm" fill="#3b82f6" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-2 mt-4">
          {Object.entries(districtTypeColors).map(([type, cls]) => (
            <span key={type} className={`px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
              {type}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
          {city.districts.map((d) => (
            <div key={d.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <div>
                <div className="text-xs font-semibold text-slate-700">{d.name}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${districtTypeColors[d.type]}`}>
                  {d.type}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-800">{fmt(d.pricePerSqm)} ₽</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
