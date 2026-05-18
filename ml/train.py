"""
Обучение ML-модели прогнозирования цен.

Запуск:
    python -m ml.train --city Краснодар
    python -m ml.train  # все города
"""

import argparse
import logging
import time
from pathlib import Path

import mlflow
import pandas as pd

from ml.config import CITIES, OBJECT_FEATURES, MACRO_FEATURES, MODEL_DIR
from ml.data_loader import load_listings, load_macro, validate_schema
from ml.evaluate import compute_metrics, log_feature_importance
from ml.model import PricePredictor
from ml.preprocessing import (
    engineer_features, remove_outliers, split_dataset, get_feature_names,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

FEATURE_COLS = get_feature_names()


def train(city: str | None = None) -> None:
    tag = city or "all_cities"
    logger.info("=" * 60)
    logger.info("Запуск обучения | режим: %s", tag)
    logger.info("=" * 60)

    # ---------- загрузка ----------
    t0 = time.perf_counter()
    df = load_listings(city=city)
    macro = load_macro()
    validate_schema(df)

    # Приводим дату к периоду для джойна с макроданными
    df["period"] = df["listed_at"].dt.to_period("M")
    df = df.merge(macro, left_on=["period", "city"], right_on=["date", "city"], how="left")

    # ---------- предобработка ----------
    df = engineer_features(df)
    df = remove_outliers(df)

    available = [c for c in FEATURE_COLS if c in df.columns]
    X = df[available]
    y = df["price_sqm"]

    train_df, val_df, test_df = split_dataset(df)
    X_train = train_df[available];  y_train = train_df["price_sqm"]
    X_val   = val_df[available];    y_val   = val_df["price_sqm"]
    X_test  = test_df[available];   y_test  = test_df["price_sqm"]

    logger.info("Признаков: %d | train=%d | val=%d | test=%d",
                len(available), len(X_train), len(X_val), len(X_test))

    # ---------- обучение ----------
    with mlflow.start_run(run_name=f"domprognoz_{tag}"):
        mlflow.log_params({
            "city":      tag,
            "n_train":   len(X_train),
            "n_features": len(available),
        })

        predictor = PricePredictor()
        predictor.fit(X_train, y_train)

        # ---------- оценка ----------
        for split_name, Xs, ys in [("val", X_val, y_val), ("test", X_test, y_test)]:
            preds   = predictor.predict(Xs)
            metrics = compute_metrics(ys, preds, prefix=split_name)
            mlflow.log_metrics(metrics)
            logger.info(
                "[%s]  MAE=%.1f руб./м²  MAPE=%.2f%%  R²=%.4f",
                split_name.upper(),
                metrics[f"{split_name}_mae"],
                metrics[f"{split_name}_mape"] * 100,
                metrics[f"{split_name}_r2"],
            )

        log_feature_importance(predictor.model, available)

        # ---------- сохранение ----------
        model_path = f"{MODEL_DIR}/price_predictor_{tag}.pkl"
        predictor.save(model_path)
        mlflow.log_artifact(model_path)

    elapsed = time.perf_counter() - t0
    logger.info("Обучение завершено за %.1f сек.", elapsed)


def main() -> None:
    parser = argparse.ArgumentParser(description="ДомПрогноз — обучение модели")
    parser.add_argument("--city", choices=CITIES, default=None,
                        help="Город (по умолчанию — все)")
    args = parser.parse_args()
    train(city=args.city)


if __name__ == "__main__":
    main()
