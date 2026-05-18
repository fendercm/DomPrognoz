"""
Определение моделей: XGBoost, LightGBM, RandomForest и стэкинговый ансамбль.
Линейная регрессия (statsmodels OLS) — для интерпретации факторов.
"""

import logging
import pickle
from pathlib import Path
from typing import Dict, Any

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, StackingRegressor
from sklearn.linear_model import Ridge
from sklearn.pipeline import Pipeline
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor

from ml.config import (
    XGBOOST_PARAMS, RF_PARAMS, META_LEARNER_PARAMS,
    MODEL_DIR,
)
from ml.preprocessing import build_preprocessor, get_feature_names

logger = logging.getLogger(__name__)

LGBM_PARAMS = {
    "n_estimators":     1000,
    "max_depth":        7,
    "learning_rate":    0.04,
    "num_leaves":       63,
    "subsample":        0.85,
    "colsample_bytree": 0.80,
    "min_child_samples": 20,
    "reg_alpha":        0.05,
    "reg_lambda":       1.0,
    "random_state":     42,
    "n_jobs":           -1,
    "verbose":          -1,
}


def build_xgboost() -> Pipeline:
    """XGBoost-регрессор с предобработкой."""
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model",        XGBRegressor(**XGBOOST_PARAMS)),
    ])


def build_lightgbm() -> Pipeline:
    """LightGBM-регрессор с предобработкой."""
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model",        LGBMRegressor(**LGBM_PARAMS)),
    ])


def build_random_forest() -> Pipeline:
    """RandomForest-регрессор с предобработкой."""
    return Pipeline([
        ("preprocessor", build_preprocessor()),
        ("model",        RandomForestRegressor(**RF_PARAMS)),
    ])


def build_stacking_ensemble() -> StackingRegressor:
    """
    Стэкинговый ансамбль: XGBoost + LightGBM + RandomForest → Ridge-метаобучение.

    Базовые модели работают на разных folds (cv=5),
    мета-признаки обучаются на out-of-fold предсказаниях.
    """
    base_estimators = [
        ("xgb", build_xgboost()),
        ("lgbm", build_lightgbm()),
        ("rf",  build_random_forest()),
    ]
    return StackingRegressor(
        estimators=base_estimators,
        final_estimator=Ridge(**META_LEARNER_PARAMS),
        cv=5,
        n_jobs=-1,
        passthrough=False,
    )


def fit_ols(X: pd.DataFrame, y: pd.Series, feature_names: list):
    """
    Линейная регрессия (statsmodels OLS) для интерпретации факторов.

    Возвращает fitted RegressionResultsWrapper с коэффициентами,
    p-значениями и R² — используется в разделе «Ключевые факторы» приложения.
    """
    import statsmodels.api as sm

    X_sm = sm.add_constant(X[feature_names].fillna(0))
    model = sm.OLS(np.log1p(y), X_sm)
    result = model.fit(method="pinv")

    logger.info(
        "OLS | R²=%.4f | adj. R²=%.4f | AIC=%.1f | наблюдений=%d",
        result.rsquared, result.rsquared_adj, result.aic, result.nobs,
    )
    return result


class PricePredictor:
    """
    Высокоуровневый интерфейс модели для FastAPI-сервиса.

    Хранит обученный ансамбль и скейлер лога цен,
    возвращает предсказание в рублях/м².
    """

    def __init__(self, model=None):
        self.model  = model or build_stacking_ensemble()
        self._fitted = False

    def fit(self, X: pd.DataFrame, y: pd.Series) -> "PricePredictor":
        log_y = np.log1p(y)
        logger.info("Обучение стэкингового ансамбля на %d примерах...", len(X))
        self.model.fit(X, log_y)
        self._fitted = True
        return self

    def predict(self, X: pd.DataFrame) -> np.ndarray:
        if not self._fitted:
            raise RuntimeError("Модель не обучена. Вызовите fit() сначала.")
        log_pred = self.model.predict(X)
        return np.expm1(log_pred)

    def predict_single(self, features: Dict[str, Any]) -> float:
        """Предсказание для одного объекта (используется в калькуляторе)."""
        X = pd.DataFrame([features])
        return float(self.predict(X)[0])

    def save(self, path: str = f"{MODEL_DIR}/price_predictor.pkl") -> None:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        with open(path, "wb") as f:
            pickle.dump(self, f, protocol=5)
        logger.info("Модель сохранена: %s", path)

    @classmethod
    def load(cls, path: str = f"{MODEL_DIR}/price_predictor.pkl") -> "PricePredictor":
        with open(path, "rb") as f:
            obj = pickle.load(f)
        logger.info("Модель загружена: %s", path)
        return obj
