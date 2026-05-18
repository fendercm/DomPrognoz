"""
Предобработка признаков для модели прогнозирования цен.
"""

import logging
from typing import Tuple, List

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer

from ml.config import (
    OBJECT_FEATURES, MACRO_FEATURES, TARGET,
    RANDOM_STATE, TEST_SIZE, VAL_SIZE,
)

logger = logging.getLogger(__name__)

_CAT_FEATURES  = ["city", "district", "building_type", "renovation"]
_BOOL_FEATURES = ["has_elevator", "has_parking", "has_balcony"]
_NUM_FEATURES  = [
    f for f in OBJECT_FEATURES + MACRO_FEATURES
    if f not in _CAT_FEATURES + _BOOL_FEATURES
]


def build_preprocessor() -> ColumnTransformer:
    """Собирает sklearn-трансформер для смешанных типов признаков."""
    numeric_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler",  StandardScaler()),
    ])
    categorical_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("encoder", OrdinalEncoder(
            handle_unknown="use_encoded_value",
            unknown_value=-1,
        )),
    ])
    bool_pipe = Pipeline([
        ("imputer", SimpleImputer(strategy="most_frequent")),
    ])

    return ColumnTransformer([
        ("num",  numeric_pipe,     _NUM_FEATURES),
        ("cat",  categorical_pipe, _CAT_FEATURES),
        ("bool", bool_pipe,        _BOOL_FEATURES),
    ], remainder="drop")


def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    """Создаёт производные признаки."""
    df = df.copy()

    df["floor_ratio"]      = df["floor"] / df["floor"].clip(lower=1)
    df["is_top_floor"]     = (df["floor"] == df["floors_total"]).astype("int8")
    df["is_first_floor"]   = (df["floor"] == 1).astype("int8")
    df["building_age"]     = 2026 - df["build_year"]
    df["area_living_share"] = df["area_living"] / df["area_total"].clip(lower=1)
    df["kitchen_share"]    = df["area_kitchen"] / df["area_total"].clip(lower=1)

    # Логарифм цены — основная целевая переменная для обучения
    df["log_price_sqm"] = np.log1p(df[TARGET])

    # Лаговые макроэкономические признаки (1 и 3 месяца)
    for col in ["cbr_rate", "inflation_yoy"]:
        if col in df.columns:
            df[f"{col}_lag1"] = df[col].shift(1)
            df[f"{col}_lag3"] = df[col].shift(3)

    df.dropna(subset=["log_price_sqm"], inplace=True)
    logger.info("Feature engineering: итого %d признаков", len(df.columns))
    return df


def remove_outliers(df: pd.DataFrame, sigma: float = 3.5) -> pd.DataFrame:
    """Удаляет выбросы по цене через IQR + z-score по городу."""
    before = len(df)
    groups = []
    for city, gdf in df.groupby("city"):
        q1, q3 = gdf[TARGET].quantile([0.01, 0.99])
        gdf = gdf[(gdf[TARGET] >= q1) & (gdf[TARGET] <= q3)]
        z = (gdf[TARGET] - gdf[TARGET].mean()) / gdf[TARGET].std()
        gdf = gdf[z.abs() <= sigma]
        groups.append(gdf)
    df = pd.concat(groups)
    logger.info("Выбросы удалены: %d → %d строк", before, len(df))
    return df


def split_dataset(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Разбивает датасет: train / val / test (хронологически)."""
    df = df.sort_values("listed_at")
    n = len(df)
    n_test = int(n * TEST_SIZE)
    n_val  = int(n * VAL_SIZE)

    test  = df.iloc[-n_test:]
    val   = df.iloc[-(n_test + n_val):-n_test]
    train = df.iloc[:-(n_test + n_val)]

    logger.info(
        "Разбивка: train=%d | val=%d | test=%d",
        len(train), len(val), len(test),
    )
    return train, val, test


def get_feature_names() -> List[str]:
    """Возвращает полный список признаков после инжиниринга."""
    extra = [
        "floor_ratio", "is_top_floor", "is_first_floor",
        "building_age", "area_living_share", "kitchen_share",
        "cbr_rate_lag1", "cbr_rate_lag3",
        "inflation_yoy_lag1", "inflation_yoy_lag3",
    ]
    return _NUM_FEATURES + extra + _CAT_FEATURES + _BOOL_FEATURES
