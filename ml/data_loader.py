"""
Загрузка и первичная валидация данных из PostgreSQL.
"""

import logging
from pathlib import Path
from typing import Optional

import pandas as pd
import numpy as np

from ml.config import (
    DATA_DIR, CITIES, OBJECT_FEATURES, MACRO_FEATURES, TARGET,
    TRAIN_DATE_START, TRAIN_DATE_END,
)

logger = logging.getLogger(__name__)

_DTYPE_MAP = {
    "area_total":        "float32",
    "area_living":       "float32",
    "area_kitchen":      "float32",
    "floor":             "int16",
    "floors_total":      "int16",
    "rooms":             "int8",
    "build_year":        "int16",
    "has_elevator":      "bool",
    "has_parking":       "bool",
    "has_balcony":       "bool",
    "to_metro_min":      "float32",
    "to_center_km":      "float32",
    "cbr_rate":          "float32",
    "inflation_yoy":     "float32",
    "unemployment_rate": "float32",
    "construction_volume": "float32",
    "migration_inflow":  "float32",
    "price_sqm":         "float32",
}


def load_listings(
    source: str = "parquet",
    path: Optional[str] = None,
    city: Optional[str] = None,
    date_start: str = TRAIN_DATE_START,
    date_end: str = TRAIN_DATE_END,
) -> pd.DataFrame:
    """Загружает объявления из локального parquet-файла или БД."""
    if source == "parquet":
        p = Path(path or f"{DATA_DIR}/listings.parquet")
        logger.info("Чтение датасета: %s", p)
        df = pd.read_parquet(p)
    elif source == "postgres":
        df = _load_from_db(city, date_start, date_end)
    else:
        raise ValueError(f"Неизвестный источник: {source}")

    df["listed_at"] = pd.to_datetime(df["listed_at"])
    df = df[(df["listed_at"] >= date_start) & (df["listed_at"] <= date_end)]

    if city:
        df = df[df["city"] == city]

    df = df.astype({k: v for k, v in _DTYPE_MAP.items() if k in df.columns})

    logger.info(
        "Загружено %d объявлений | %d городов | период %s — %s",
        len(df),
        df["city"].nunique(),
        df["listed_at"].min().date(),
        df["listed_at"].max().date(),
    )
    return df


def load_macro(path: Optional[str] = None) -> pd.DataFrame:
    """Загружает макроэкономические индикаторы (ежемесячные)."""
    p = Path(path or f"{DATA_DIR}/macro.parquet")
    logger.info("Чтение макроданных: %s", p)
    df = pd.read_parquet(p)
    df["date"] = pd.to_datetime(df["date"]).dt.to_period("M")
    return df


def _load_from_db(city, date_start, date_end) -> pd.DataFrame:
    """Загружает данные напрямую из PostgreSQL через psycopg2."""
    import psycopg2
    import os

    conn = psycopg2.connect(os.environ["DATABASE_URL"])
    city_filter = f"AND city = '{city}'" if city else ""
    query = f"""
        SELECT l.*, m.cbr_rate, m.inflation_yoy,
               m.unemployment_rate, m.construction_volume, m.migration_inflow
        FROM listings l
        JOIN macro_monthly m
          ON DATE_TRUNC('month', l.listed_at) = m.date
           AND l.city = m.city
        WHERE l.listed_at BETWEEN '{date_start}' AND '{date_end}'
              {city_filter}
              AND l.price_sqm BETWEEN 30000 AND 500000
    """
    df = pd.read_sql(query, conn)
    conn.close()
    return df


def validate_schema(df: pd.DataFrame) -> None:
    """Проверяет наличие обязательных колонок и диапазоны значений."""
    required = OBJECT_FEATURES + MACRO_FEATURES + [TARGET, "listed_at"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"Отсутствуют колонки: {missing}")

    assert df["area_total"].between(10, 500).all(), "area_total вне диапазона"
    assert df["build_year"].between(1900, 2026).all(), "build_year вне диапазона"
    assert df["price_sqm"].between(20_000, 600_000).all(), "price_sqm вне диапазона"
    logger.info("Валидация схемы пройдена (%d строк)", len(df))
