"""
Прогнозирование динамики рынка временными рядами (SARIMA + Prophet).
"""

import logging
from typing import Dict, List

import numpy as np
import pandas as pd

from ml.config import CITIES, FORECAST_HORIZON

logger = logging.getLogger(__name__)


def aggregate_monthly(df: pd.DataFrame) -> pd.DataFrame:
    """Агрегирует объявления в ежемесячный индекс цен по городу."""
    df = df.copy()
    df["period"] = df["listed_at"].dt.to_period("M")
    agg = (
        df.groupby(["city", "period"])["price_sqm"]
        .agg(["median", "mean", "count"])
        .reset_index()
    )
    agg.columns = ["city", "period", "price_median", "price_mean", "n_listings"]
    agg["date"] = agg["period"].dt.to_timestamp()
    return agg.sort_values(["city", "date"])


def fit_sarima(series: pd.Series, order=(1, 1, 1), seasonal_order=(1, 1, 1, 12)):
    """Подгоняет SARIMA-модель к ряду средней цены."""
    from statsmodels.tsa.statespace.sarimax import SARIMAX

    model = SARIMAX(
        series,
        order=order,
        seasonal_order=seasonal_order,
        enforce_stationarity=False,
        enforce_invertibility=False,
    )
    result = model.fit(disp=False, maxiter=200)
    logger.info(
        "SARIMA%s×%s  AIC=%.2f  BIC=%.2f",
        order, seasonal_order,
        result.aic, result.bic,
    )
    return result


def fit_prophet(df_city: pd.DataFrame):
    """Подгоняет Prophet-модель с регрессором ключевой ставки."""
    from prophet import Prophet

    prophet_df = df_city[["date", "price_median"]].rename(
        columns={"date": "ds", "price_median": "y"}
    )
    m = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=False,
        daily_seasonality=False,
        seasonality_mode="multiplicative",
        changepoint_prior_scale=0.05,
    )
    if "cbr_rate" in df_city.columns:
        m.add_regressor("cbr_rate")
        prophet_df["cbr_rate"] = df_city["cbr_rate"].values

    m.fit(prophet_df)
    return m


def forecast_market(
    df_monthly: pd.DataFrame,
    city: str,
    horizon: int = FORECAST_HORIZON,
    method: str = "sarima",
) -> pd.DataFrame:
    """
    Прогнозирует медианную цену для города на `horizon` месяцев.

    Возвращает DataFrame с колонками:
        date, forecast, lower_90, upper_90, scenario_pessimistic,
        scenario_base, scenario_optimistic
    """
    city_df = df_monthly[df_monthly["city"] == city].copy()
    if city_df.empty:
        raise ValueError(f"Нет данных для города: {city}")

    series = city_df.set_index("date")["price_median"].asfreq("MS")

    if method == "sarima":
        result = fit_sarima(series)
        fc = result.get_forecast(steps=horizon)
        summary = fc.summary_frame(alpha=0.10)

        out = pd.DataFrame({
            "date":      pd.date_range(series.index[-1], periods=horizon + 1, freq="MS")[1:],
            "forecast":  summary["mean"].values,
            "lower_90":  summary["mean_ci_lower"].values,
            "upper_90":  summary["mean_ci_upper"].values,
        })
    elif method == "prophet":
        m = fit_prophet(city_df)
        future = m.make_future_dataframe(periods=horizon, freq="MS")
        fc = m.predict(future).tail(horizon)
        out = pd.DataFrame({
            "date":     pd.to_datetime(fc["ds"].values),
            "forecast": fc["yhat"].values,
            "lower_90": fc["yhat_lower"].values,
            "upper_90": fc["yhat_upper"].values,
        })
    else:
        raise ValueError(f"Неизвестный метод: {method}")

    # Три сценария: ±9% от базового прогноза
    out["scenario_pessimistic"] = out["forecast"] * 0.91
    out["scenario_base"]        = out["forecast"]
    out["scenario_optimistic"]  = out["forecast"] * 1.09

    logger.info(
        "Прогноз [%s | %s] | к концу периода: %.0f руб./м²",
        city, method, out["forecast"].iloc[-1],
    )
    return out


def forecast_all_cities(
    df_monthly: pd.DataFrame,
    horizon: int = FORECAST_HORIZON,
    method: str = "sarima",
) -> Dict[str, pd.DataFrame]:
    """Прогноз для всех городов сразу."""
    results = {}
    for city in CITIES:
        try:
            results[city] = forecast_market(df_monthly, city, horizon, method)
        except Exception as exc:
            logger.error("Ошибка прогноза для %s: %s", city, exc)
    return results
