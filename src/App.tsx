import { useState } from "react";
import Header from "./components/Header";
import CitySelector from "./components/CitySelector";
import OverviewSection from "./components/OverviewSection";
import ListingsSection from "./components/ListingsSection";
import ForecastSection from "./components/ForecastSection";
import CalculatorSection from "./components/CalculatorSection";
import { cities, City } from "./data/cities";
import { MapPin, Database, Cpu } from "lucide-react";

type Section = "overview" | "listings" | "forecast" | "calculator";

export default function App() {
  const [selectedCity, setSelectedCity] = useState<City>(cities[0]);
  const [activeSection, setActiveSection] = useState<Section>("overview");

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection city={selectedCity} />;
      case "listings":
        return <ListingsSection city={selectedCity} />;
      case "forecast":
        return <ForecastSection city={selectedCity} />;
      case "calculator":
        return <CalculatorSection city={selectedCity} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header activeSection={activeSection} onNavigate={(s) => setActiveSection(s as Section)} />

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Database className="w-4 h-4" />
              <span>Источники: ЦИАН · Авито · Яндекс Недвижимость · Домклик</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-blue-100">
              <Cpu className="w-4 h-4" />
              <span>ML-прогнозирование · Линейная регрессия · Временные ряды</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-blue-100">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span>Данные актуальны: июнь 2025</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-72 flex-shrink-0">
            <div className="space-y-4 lg:sticky lg:top-24">
              <CitySelector selectedCity={selectedCity} onSelect={handleCityChange} />

              {/* Parser info */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Источники данных</div>
                <div className="space-y-2">
                  {[
                    { name: "ЦИАН", url: "cian.ru", count: "1.2M+ объявл.", color: "bg-sky-500" },
                    { name: "Авито", url: "avito.ru", count: "3.5M+ объявл.", color: "bg-emerald-500" },
                    { name: "Яндекс.Недв.", url: "realty.yandex.ru", count: "800K+ объявл.", color: "bg-amber-500" },
                    { name: "Домклик", url: "domclick.ru", count: "600K+ объявл.", color: "bg-violet-500" },
                  ].map((src) => (
                    <div key={src.name} className="flex items-center gap-2.5 py-1">
                      <div className={`w-2 h-2 rounded-full ${src.color}`} />
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-slate-700">{src.name}</div>
                        <div className="text-[10px] text-slate-400">{src.url}</div>
                      </div>
                      <div className="text-[10px] text-slate-400">{src.count}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    * MVP использует демо-данные. В продакшне применяется парсинг через Playwright/Selenium
                    с периодичностью обновления 24 часа.
                  </p>
                </div>
              </div>

              {/* Parser tech */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="w-4 h-4 text-slate-300" />
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Tech Stack</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    "Python · Scrapy / Playwright",
                    "PostgreSQL · Redis кеш",
                    "scikit-learn · statsmodels",
                    "FastAPI · REST API",
                    "React · Recharts · Vite",
                  ].map((tech) => (
                    <div key={tech} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                      <span className="text-xs text-slate-300">{tech}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-semibold text-slate-700">Выбранный город</span>
                </div>
                <div className="text-lg font-bold text-slate-800">{selectedCity.name}</div>
                <div className="text-xs text-slate-400">{selectedCity.region}</div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                    +{selectedCity.priceGrowth}% год
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {(selectedCity.pricePerSqm / 1000).toFixed(0)}к ₽/м²
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Page title */}
            <div className="mb-5">
              <h1 className="text-2xl font-bold text-slate-800">
                {activeSection === "overview" && `Рынок недвижимости — ${selectedCity.name}`}
                {activeSection === "listings" && `Объявления — ${selectedCity.name}`}
                {activeSection === "forecast" && `Прогноз цен — ${selectedCity.name}`}
                {activeSection === "calculator" && `Калькулятор стоимости — ${selectedCity.name}`}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {activeSection === "overview" && "Аналитика рынка, динамика цен и статистика по районам"}
                {activeSection === "listings" && "Актуальные объявления о продаже недвижимости с AI-оценкой"}
                {activeSection === "forecast" && "Прогнозирование стоимости жилья на основе ML-модели"}
                {activeSection === "calculator" && "Расчёт рыночной стоимости и инвестиционного потенциала объекта"}
              </p>
            </div>

            {renderSection()}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-base font-bold text-slate-800">ДомПрогноз</div>
              <p className="text-xs text-slate-400 mt-1">
                Система прогнозирования цен на жильё — студенческий MVP-проект
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">
                Данные: ЦИАН, Авито, Яндекс Недвижимость, Домклик, RealtyStats, RosRealt
              </p>
              <p className="text-xs text-slate-300 mt-1">© 2025 ДомПрогноз — Учебный проект</p>
            </div>
            <div className="flex gap-2">
              {["Ростов-на-Дону", "Краснодар", "Сочи", "Волгоград"].map((c) => (
                <span key={c} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
