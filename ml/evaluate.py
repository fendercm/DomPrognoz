"""
Метрики качества модели и визуализация результатов.
"""

import logging
from pathlib import Path
from typing import Dict, List, Optional

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
import seaborn as sns
from sklearn.metrics import mean_absolute_error, r2_score

from ml.config import REPORT_DIR

logger = logging.getLogger(__name__)
sns.set_theme(style="whitegrid", palette="muted")


def compute_metrics(
    y_true: pd.Series | np.ndarray,
    y_pred: np.ndarray,
    prefix: str = "test",
) -> Dict[str, float]:
    """MAE, RMSE, MAPE, R² с префиксом для MLflow."""
    y_true = np.asarray(y_true, dtype=float)
    y_pred = np.asarray(y_pred, dtype=float)

    mae  = mean_absolute_error(y_true, y_pred)
    rmse = float(np.sqrt(np.mean((y_true - y_pred) ** 2)))
    mape = float(np.mean(np.abs((y_true - y_pred) / np.clip(y_true, 1, None))))
    r2   = float(r2_score(y_true, y_pred))

    return {
        f"{prefix}_mae":  round(mae, 2),
        f"{prefix}_rmse": round(rmse, 2),
        f"{prefix}_mape": round(mape, 6),
        f"{prefix}_r2":   round(r2, 6),
    }


def log_feature_importance(
    model,
    feature_names: List[str],
    top_n: int = 20,
    save_path: Optional[str] = None,
) -> pd.DataFrame:
    """Строит и сохраняет график важности признаков XGBoost."""
    # Достаём XGBoost или LightGBM из стэкинга (первый доступный)
    try:
        for _, pipe in model.estimators_:
            m = pipe.named_steps.get("model")
            if hasattr(m, "feature_importances_"):
                importances = m.feature_importances_
                break
        else:
            raise AttributeError("нет estimators с feature_importances_")
    except (AttributeError, IndexError):
        logger.warning("Не удалось получить feature importances — пропускаем")
        return pd.DataFrame()

    n = min(len(importances), len(feature_names))
    fi = (
        pd.DataFrame({"feature": feature_names[:n], "importance": importances[:n]})
        .sort_values("importance", ascending=False)
        .head(top_n)
    )

    fig, ax = plt.subplots(figsize=(10, 6))
    sns.barplot(data=fi, x="importance", y="feature", ax=ax, color="#3A86FF")
    ax.set_title(f"Топ-{top_n} признаков по важности (XGBoost)", fontsize=14, pad=12)
    ax.set_xlabel("Feature Importance (gain)", fontsize=11)
    ax.set_ylabel("")
    plt.tight_layout()

    out = Path(save_path or f"{REPORT_DIR}/feature_importance.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=150)
    plt.close(fig)
    logger.info("График важности признаков сохранён: %s", out)
    return fi


def plot_predictions(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    city: str = "",
    save_path: Optional[str] = None,
) -> None:
    """Scatter-plot «факт vs прогноз» с диагональю идеального предсказания."""
    fig, ax = plt.subplots(figsize=(8, 8))
    vmin = min(y_true.min(), y_pred.min())
    vmax = max(y_true.max(), y_pred.max())

    ax.scatter(y_true, y_pred, alpha=0.35, s=12, color="#3A86FF", rasterized=True)
    ax.plot([vmin, vmax], [vmin, vmax], "r--", lw=1.5, label="Идеальное предсказание")

    fmt = mticker.FuncFormatter(lambda x, _: f"{x/1000:.0f}k")
    ax.xaxis.set_major_formatter(fmt)
    ax.yaxis.set_major_formatter(fmt)

    title = f"Факт vs Прогноз{' — ' + city if city else ''}"
    ax.set_title(title, fontsize=14, pad=12)
    ax.set_xlabel("Реальная цена, руб./м²", fontsize=11)
    ax.set_ylabel("Предсказанная цена, руб./м²", fontsize=11)
    ax.legend(fontsize=10)
    plt.tight_layout()

    out = Path(save_path or f"{REPORT_DIR}/predictions_scatter.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=150)
    plt.close(fig)
    logger.info("График предсказаний сохранён: %s", out)


def plot_residuals(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    save_path: Optional[str] = None,
) -> None:
    """Распределение остатков модели."""
    residuals = y_pred - y_true
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))

    axes[0].scatter(y_pred, residuals, alpha=0.3, s=10, color="#FF6B6B", rasterized=True)
    axes[0].axhline(0, color="k", lw=1.2)
    axes[0].set_xlabel("Предсказание, руб./м²")
    axes[0].set_ylabel("Остаток (pred − true)")
    axes[0].set_title("Остатки vs Предсказание")

    axes[1].hist(residuals, bins=80, color="#6BCB77", edgecolor="white")
    axes[1].set_xlabel("Остаток, руб./м²")
    axes[1].set_ylabel("Количество объектов")
    axes[1].set_title("Распределение остатков")

    plt.tight_layout()
    out = Path(save_path or f"{REPORT_DIR}/residuals.png")
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, dpi=150)
    plt.close(fig)
    logger.info("График остатков сохранён: %s", out)


def full_report(
    y_true: np.ndarray,
    y_pred: np.ndarray,
    model,
    feature_names: List[str],
    city: str = "",
) -> None:
    """Генерирует полный HTML-отчёт о качестве модели."""
    metrics = compute_metrics(y_true, y_pred)
    fi = log_feature_importance(model, feature_names)
    plot_predictions(y_true, y_pred, city=city)
    plot_residuals(y_true, y_pred)

    logger.info(
        "ИТОГОВЫЙ ОТЧЁТ [%s] | R²=%.4f | MAE=%.0f | MAPE=%.2f%%",
        city or "all_cities",
        metrics["test_r2"],
        metrics["test_mae"],
        metrics["test_mape"] * 100,
    )
