import { useState } from "react";
import { Calculator, TrendingUp, DollarSign, Home, Percent } from "lucide-react";
import { City } from "../data/cities";

interface Props {
  city: City;
}

const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));

export default function CalculatorSection({ city }: Props) {
  const [area, setArea] = useState(50);
  const [rooms, setRooms] = useState(2);
  const [district, setDistrict] = useState(city.districts[0].name);
  const [floor, setFloor] = useState(5);
  const [totalFloors, setTotalFloors] = useState(10);
  const [type, setType] = useState<"secondary" | "newbuilding">("secondary");
  const [year, setYear] = useState(2015);

  const selectedDistrict = city.districts.find((d) => d.name === district) || city.districts[0];

  // Price model
  let base = selectedDistrict.pricePerSqm;
  if (type === "newbuilding") base *= 1.22;
  const floorFactor = floor === 1 ? 0.96 : floor === totalFloors ? 0.97 : 1.0;
  const ageFactor = year >= 2020 ? 1.08 : year >= 2010 ? 1.0 : year >= 2000 ? 0.95 : 0.88;
  const roomFactor = rooms === 1 ? 1.05 : rooms >= 3 ? 0.97 : 1.0;
  const estimatedPsm = Math.round(base * floorFactor * ageFactor * roomFactor);
  const totalPrice = estimatedPsm * area;
  const forecastGrowth = city.priceGrowth / 100;
  const price1y = Math.round(totalPrice * (1 + forecastGrowth));
  const price3y = Math.round(totalPrice * Math.pow(1 + forecastGrowth * 0.85, 3));

  // Mortgage
  const downPayment = Math.round(totalPrice * 0.2);
  const loanAmount = totalPrice - downPayment;
  const rate = 0.26 / 12;
  const months = 240;
  const monthlyPayment = Math.round(
    (loanAmount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1)
  );

  const sliders = [
    {
      label: "Площадь, м²",
      value: area,
      min: 20,
      max: 200,
      step: 1,
      onChange: setArea,
      display: `${area} м²`,
    },
    {
      label: "Количество комнат",
      value: rooms,
      min: 1,
      max: 5,
      step: 1,
      onChange: setRooms,
      display: `${rooms} комн.`,
    },
    {
      label: "Этаж",
      value: floor,
      min: 1,
      max: totalFloors,
      step: 1,
      onChange: (v: number) => setFloor(Math.min(v, totalFloors)),
      display: `${floor} эт.`,
    },
    {
      label: "Этажей в доме",
      value: totalFloors,
      min: 1,
      max: 30,
      step: 1,
      onChange: setTotalFloors,
      display: `${totalFloors} эт.`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 rounded-2xl p-6 text-white shadow-xl shadow-emerald-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Оценщик стоимости</h2>
            <p className="text-emerald-100 text-sm">{city.name} — умный расчёт цены</p>
          </div>
        </div>
        <p className="text-emerald-100 text-sm mt-2 leading-relaxed">
          Укажите параметры квартиры — AI-модель рассчитает рыночную стоимость и инвестиционный потенциал
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input panel */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-5">
          <h3 className="text-base font-semibold text-slate-800">Параметры объекта</h3>

          {/* Type */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Тип жилья</label>
            <div className="flex gap-2">
              {[
                { val: "secondary", label: "Вторичное" },
                { val: "newbuilding", label: "Новостройка" },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setType(t.val as typeof type)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                    type === t.val
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* District */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Район</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {city.districts.map((d) => (
                <option key={d.name} value={d.name}>
                  {d.name} ({d.type}) — {fmt(d.pricePerSqm)} ₽/м²
                </option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">
              Год постройки: <span className="text-slate-800 font-bold">{year}</span>
            </label>
            <input
              type="range"
              min={1970}
              max={2026}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>1970</span><span>2026</span>
            </div>
          </div>

          {/* Sliders */}
          {sliders.map((s) => (
            <div key={s.label}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex justify-between">
                <span>{s.label}</span>
                <span className="text-slate-800 font-bold">{s.display}</span>
              </label>
              <input
                type="range"
                min={s.min}
                max={s.max}
                step={s.step}
                value={s.value}
                onChange={(e) => s.onChange(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-1">
                <span>{s.min}</span><span>{s.max}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Results panel */}
        <div className="space-y-4">
          {/* Main estimate */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-slate-300" />
              <span className="text-slate-300 text-sm font-medium">Оценочная стоимость</span>
            </div>
            <div className="text-4xl font-bold mb-1">{fmt(totalPrice)} ₽</div>
            <div className="text-slate-400 text-sm">{fmt(estimatedPsm)} ₽ за м² · {area} м²</div>

            <div className="border-t border-slate-700 my-4" />

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Через 1 год</div>
                <div className="text-emerald-400 font-bold text-lg">{fmt(price1y)} ₽</div>
                <div className="text-xs text-slate-400">+{city.priceGrowth}%</div>
              </div>
              <div className="bg-slate-700/50 rounded-xl p-3">
                <div className="text-slate-400 text-xs mb-1">Через 3 года</div>
                <div className="text-emerald-400 font-bold text-lg">{fmt(price3y)} ₽</div>
                <div className="text-xs text-slate-400">+{Math.round(((price3y - totalPrice) / totalPrice) * 100)}%</div>
              </div>
            </div>
          </div>

          {/* Mortgage */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Percent className="w-5 h-5 text-blue-500" />
              <h3 className="text-base font-semibold text-slate-800">Ипотечный расчёт</h3>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Стоимость объекта", value: `${fmt(totalPrice)} ₽`, highlight: false },
                { label: "Первоначальный взнос (20%)", value: `${fmt(downPayment)} ₽`, highlight: false },
                { label: "Сумма кредита", value: `${fmt(loanAmount)} ₽`, highlight: false },
                { label: "Ставка (рыночная 2026)", value: "26% / год", highlight: false },
                { label: "Срок", value: "20 лет", highlight: false },
                { label: "Ежемесячный платёж", value: `${fmt(monthlyPayment)} ₽`, highlight: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between py-2 px-3 rounded-xl ${
                    item.highlight ? "bg-blue-50 border border-blue-200" : "bg-slate-50"
                  }`}
                >
                  <span className="text-sm text-slate-500">{item.label}</span>
                  <span className={`text-sm font-bold ${item.highlight ? "text-blue-700" : "text-slate-800"}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Investment potential */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              <h3 className="text-base font-semibold text-slate-800">Инвестиционный потенциал</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Потенциальный доход (3 года)</span>
                <span className="text-sm font-bold text-emerald-600">+{fmt(price3y - totalPrice)} ₽</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Аренда 1-комн. (~30 м²)</span>
                <span className="text-sm font-bold text-slate-800">{fmt(city.avgRent1)} ₽/мес</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Годовая доходность от аренды</span>
                <span className="text-sm font-bold text-blue-600">
                  {((city.avgRent1 * 12 / totalPrice) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, ((price3y - totalPrice) / totalPrice) * 250)}%` }}
                />
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-slate-500">
                  Инвестиционная привлекательность:{" "}
                  <span className="font-semibold text-emerald-600">
                    {city.priceGrowth > 12 ? "Высокая ✦✦✦" : city.priceGrowth > 8 ? "Средняя ✦✦" : "Умеренная ✦"}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
