import { MapPin, TrendingUp, TrendingDown } from "lucide-react";
import { cities, City } from "../data/cities";

interface CitySelectorProps {
  selectedCity: City;
  onSelect: (city: City) => void;
}

export default function CitySelector({ selectedCity, onSelect }: CitySelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-4 h-4 text-blue-500" />
        <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Выбор города</span>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {cities.map((city) => {
          const isSelected = city.id === selectedCity.id;
          const isGrowing = city.priceGrowth > 0;
          return (
            <button
              key={city.id}
              onClick={() => onSelect(city)}
              className={`w-full text-left p-3 rounded-xl border transition-all duration-200 group ${
                isSelected
                  ? "bg-blue-600 border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white border-slate-200 hover:border-blue-300 hover:bg-blue-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className={`font-semibold text-sm ${isSelected ? "text-white" : "text-slate-800"}`}>
                    {city.name}
                  </div>
                  <div className={`text-xs mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                    {city.region}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs font-bold ${isSelected ? "text-white" : "text-slate-700"}`}>
                    {(city.pricePerSqm / 1000).toFixed(0)}к ₽/м²
                  </div>
                  <div
                    className={`flex items-center gap-0.5 justify-end mt-0.5 text-xs font-medium ${
                      isSelected
                        ? "text-blue-100"
                        : isGrowing
                        ? "text-emerald-600"
                        : "text-red-500"
                    }`}
                  >
                    {isGrowing ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {city.priceGrowth > 0 ? "+" : ""}{city.priceGrowth}%
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-slate-400 mt-3 text-center">* данные за 2026 год</p>
    </div>
  );
}
