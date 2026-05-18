"""
Инференс модели: оценка стоимости объекта и прогноз рынка.

Используется FastAPI-роутером /api/v1/predict.
"""

import logging
from dataclasses import dataclass, field
from typing import Dict, List, Optional

import numpy as np
import pandas as pd

from ml.config import MODEL_DIR, FORECAST_HORIZON
from ml.model import PricePredictor
from ml.timeseries import forecast_market

logger = logging.getLogger(__name__)

_predictor_cache: Dict[str, PricePredictor] = {}


def get_predictor(city: str = "all_cities") -> PricePredictor:
    """Ленивая загрузка модели с кэшированием по городу."""
    if city not in _predictor_cache:
        path = f"{MODEL_DIR}/price_predictor_{city}.pkl"
        try:
            _predictor_cache[city] = PricePredictor.load(path)
        except FileNotFoundError:
            logger.warning(
                "Модель для %s не найдена, используется общая модель", city
            )
            _predictor_cache[city] = PricePredictor.load(
                f"{MODEL_DIR}/price_predictor_all_cities.pkl"
            )
    return _predictor_cache[city]


@dataclass
class ApartmentFeatures:
    city:           str
    district:       str
    area_total:     float
    area_living:    float
    area_kitchen:   float
    floor:          int
    floors_total:   int
    rooms:          int
    build_year:     int
    building_type:  str        = "panel"
    has_elevator:   bool       = False
    has_parking:    bool       = False
    has_balcony:    bool       = False
    renovation:     str        = "cosmetic"
    to_metro_min:   float      = 15.0
    to_center_km:   float      = 5.0
    cbr_rate:       float      = 16.0
    inflation_yoy:  float      = 8.5
    unemployment_rate: float   = 3.9
    construction_volume: float = 1_200_000.0
    migration_inflow:    float = 12_500.0


@dataclass
class PredictionResult:
    price_total:      float            # оценочная стоимость объекта, руб.
    price_sqm:        float            # цена за м², руб.
    price_1y:         float            # прогноз через 1 год
    price_3y:         float            # прогноз через 3 года
    confidence_low:   float            # нижняя граница 90%-ДИ
    confidence_high:  float            # верхняя граница 90%-ДИ
    market_assessment: str             # "занижена" | "в рынке" | "завышена"
    rental_yield_pct: float            # доходность аренды, %
    scenarios:        Dict[str, float] = field(default_factory=dict)


def predict_apartment(features: ApartmentFeatures) -> PredictionResult:
    """Основная точка инференса для калькулятора стоимости."""
    predictor = get_predictor(features.city)
    X = pd.DataFrame([features.__dict__])

    price_sqm = predictor.predict_single(features.__dict__)
    price_total = price_sqm * features.area_total

    # Погрешность модели ≈ ±8.1% (MAE на тесте)
    err = price_sqm * 0.081
    ci_low  = (price_sqm - 1.645 * err) * features.area_total
    ci_high = (price_sqm + 1.645 * err) * features.area_total

    # Краткосрочный прогноз на основе трендовой поправки рынка
    growth_1y = _get_city_growth(features.city, horizon=12)
    growth_3y = _get_city_growth(features.city, horizon=36)
    price_1y = price_total * (1 + growth_1y)
    price_3y = price_total * (1 + growth_3y)

    # Оценка объявления относительно рынка
    market_median = _get_market_median(features.city, features.district)
    deviation = (price_sqm - market_median) / market_median
    if deviation < -0.07:
        assessment = "занижена"
    elif deviation > 0.07:
        assessment = "завышена"
    else:
        assessment = "в рынке"

    # Доходность аренды (средняя по городу)
    rental_yield = _estimate_rental_yield(features.city, price_sqm)

    scenarios = {
        "pessimistic": price_3y * 0.87,
        "base":        price_3y,
        "optimistic":  price_3y * 1.13,
    }

    logger.info(
        "Предсказание: %s, %s | %.0f руб./м² | %.2fM руб. | оценка: %s",
        features.city, features.district,
        price_sqm, price_total / 1e6, assessment,
    )

    return PredictionResult(
        price_total=price_total,
        price_sqm=price_sqm,
        price_1y=price_1y,
        price_3y=price_3y,
        confidence_low=ci_low,
        confidence_high=ci_high,
        market_assessment=assessment,
        rental_yield_pct=rental_yield,
        scenarios=scenarios,
    )


# ---- вспомогательные функции ------------------------------------------------

_CITY_GROWTH_TABLE: Dict[str, float] = {
    "Ростов-на-Дону": 0.135,
    "Краснодар":      0.112,
    "Сочи":           0.085,
    "Ставрополь":     0.121,
    "Волгоград":      0.098,
}

_CITY_MEDIAN_SQM: Dict[str, float] = {
    "Ростов-на-Дону": 122_000,
    "Краснодар":      118_000,
    "Сочи":           210_000,
    "Ставрополь":     82_000,
    "Волгоград":      78_000,
}

_RENTAL_YIELD: Dict[str, float] = {
    "Ростов-на-Дону": 5.8,
    "Краснодар":      6.1,
    "Сочи":           7.4,
    "Ставрополь":     5.2,
    "Волгоград":      5.0,
}


def _get_city_growth(city: str, horizon: int) -> float:
    annual = _CITY_GROWTH_TABLE.get(city, 0.10)
    return (1 + annual) ** (horizon / 12) - 1


def _get_market_median(city: str, district: str | None = None) -> float:
    return _CITY_MEDIAN_SQM.get(city, 100_000)


def _estimate_rental_yield(city: str, price_sqm: float) -> float:
    return _RENTAL_YIELD.get(city, 5.5)
