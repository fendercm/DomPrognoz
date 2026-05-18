import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import { Brain, TrendingUp, AlertCircle, CheckCircle2, Info } from "lucide-react";
import { City } from "../data/cities";

interface Props {
  city: City;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

const factors = [
  {
    icon: TrendingUp,
    label: "Рост спроса",
    value: "+15%",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    desc: "Миграционный прирост, рост населения",
  },
  {
    icon: Brain,
    label: "Инфляция",
    value: "+8.5%",
    color: "text-amber-600",
    bg: "bg-amber-50",
    desc: "Влияние ключевой ставки ЦБ РФ",
  },
  {
    icon: CheckCircle2,
    label: "Новое строительство",
    value: "+12%",
    color: "text-blue-600",
    bg: "bg-blue-50",
    desc: "Объём ввода новостроек за год",
  },
  {
    icon: AlertCircle,
    label: "Ипотечная ставка",
    value: "26%",
    color: "text-red-600",
    bg: "bg-red-50",
    desc: "Средняя ставка по ипотеке (2026)",
  },
];

const modelMetrics = [
  { label: "Точность модели (R²)", value: "0.93", color: "text-emerald-600" },
  { label: "MAE (ошибка)", value: "4.2%", color: "text-blue-600" },
  { label: "Горизонт прогноза", value: "3 года", color: "text-violet-600" },
  { label: "Обновление данных", value: "Еженедельно", color: "text-slate-600" },
];

export default function ForecastSection({ city }: Props) {
  const combined = [
    ...city.priceHistory.slice(-3).map((h) => ({
      year: h.year,
      actual: h.price,
      base: undefined as number | undefined,
      optimistic: undefined as number | undefined,
      pessimistic: undefined as number | undefined,
    })),
    ...city.forecast.slice(1).map((f) => ({
      year: f.year,
      actual: undefined as number | undefined,
      base: f.price,
      optimistic: f.optimistic,
      pessimistic: f.pessimistic,
    })),
  ];

  // Connect last historical to first forecast
  combined[2].base = combined[2].actual;
  combined[2].optimistic = combined[2].actual;
  combined[2].pessimistic = combined[2].actual;

  const lastPrice = city.priceHistory[city.priceHistory.length - 1].price;
  const forecast3y = city.forecast[city.forecast.length - 1];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-600 via-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl shadow-violet-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI-прогноз цен</h2>
            <p className="text-violet-200 text-sm">{city.name} — горизонт 3 года</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-violet-200 text-xs mb-1">Текущая цена</div>
            <div className="text-white font-bold text-lg">{fmt(lastPrice)} ₽</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-violet-200 text-xs mb-1">Базовый прогноз '28</div>
            <div className="text-white font-bold text-lg">{fmt(forecast3y.price)} ₽</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-violet-200 text-xs mb-1">Рост за 3 года</div>
            <div className="text-emerald-300 font-bold text-lg">
              +{Math.round(((forecast3y.price - lastPrice) / lastPrice) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold text-slate-800">Прогноз до 2028 года</h3>
          <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">ML-модель</span>
        </div>
        <p className="text-xs text-slate-400 mb-4">Три сценария: базовый, оптимистичный и пессимистичный, ₽/м²</p>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={combined} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rangeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
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
              formatter={(value: any, name: any) => {
                const labels: Record<string, string> = {
                  actual: "Факт",
                  base: "Базовый",
                  optimistic: "Оптимистичный",
                  pessimistic: "Пессимистичный",
                };
                return value != null ? [`${fmt(Number(value))} ₽/м²`, labels[name] || name] : [null, null];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <ReferenceLine x="2026" stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Сейчас", position: "top", fontSize: 11, fill: "#94a3b8" }} />
            <Legend
              formatter={(v: string) => {
                const labels: Record<string, string> = {
                  actual: "Факт",
                  base: "Базовый прогноз",
                  optimistic: "Оптимистичный",
                  pessimistic: "Пессимистичный",
                };
                return labels[v] || v;
              }}
              wrapperStyle={{ fontSize: 12 }}
            />
            <Area type="monotone" dataKey="optimistic" fill="url(#rangeGrad)" stroke="none" />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: "#3b82f6" }} connectNulls />
            <Line type="monotone" dataKey="base" stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 5, fill: "#8b5cf6" }} connectNulls />
            <Line type="monotone" dataKey="optimistic" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
            <Line type="monotone" dataKey="pessimistic" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Пессимистичный",
            desc: "Экономический спад, рост безработицы",
            price: forecast3y.pessimistic,
            change: Math.round(((forecast3y.pessimistic - lastPrice) / lastPrice) * 100),
            color: "border-amber-300 bg-amber-50",
            badge: "bg-amber-100 text-amber-700",
            textColor: "text-amber-700",
          },
          {
            label: "Базовый",
            desc: "Умеренный рост, стабильная экономика",
            price: forecast3y.price,
            change: Math.round(((forecast3y.price - lastPrice) / lastPrice) * 100),
            color: "border-violet-300 bg-violet-50",
            badge: "bg-violet-100 text-violet-700",
            textColor: "text-violet-700",
          },
          {
            label: "Оптимистичный",
            desc: "Снижение ставок, рост спроса",
            price: forecast3y.optimistic,
            change: Math.round(((forecast3y.optimistic - lastPrice) / lastPrice) * 100),
            color: "border-emerald-300 bg-emerald-50",
            badge: "bg-emerald-100 text-emerald-700",
            textColor: "text-emerald-700",
          },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border-2 p-4 ${s.color}`}>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
            <div className={`text-2xl font-bold mt-3 ${s.textColor}`}>{fmt(s.price)} ₽</div>
            <div className={`text-sm font-semibold mt-0.5 ${s.textColor}`}>+{s.change}% к 2028</div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Key factors */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">Ключевые факторы модели</h3>
        <div className="grid grid-cols-2 gap-3">
          {factors.map((f) => (
            <div key={f.label} className={`${f.bg} rounded-xl p-3.5 flex items-start gap-3`}>
              <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}>
                <f.icon className={`w-4 h-4 ${f.color}`} />
              </div>
              <div>
                <div className={`text-sm font-bold ${f.color}`}>{f.value}</div>
                <div className="text-xs font-semibold text-slate-700">{f.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-slate-400" />
          <h3 className="text-base font-semibold text-slate-800">Метрики модели</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {modelMetrics.map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
              <div className="text-xs text-slate-400 mt-1">{m.label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            Прогноз носит информационный характер. Модель использует линейную регрессию, временные ряды и
            данные макроэкономических индикаторов. Точность зависит от рыночной волатильности.
          </p>
        </div>
      </div>
    </div>
  );
}
