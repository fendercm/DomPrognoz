"""
Конфигурация ML-модели «ДомПрогноз».
"""

CITIES = ["Ростов-на-Дону", "Краснодар", "Сочи", "Ставрополь", "Волгоград"]

DISTRICTS = {
    "Ростов-на-Дону": [
        "Центральный", "Советский", "Пролетарский", "Железнодорожный",
        "Октябрьский", "Кировский", "Ленинский", "Первомайский",
    ],
    "Краснодар": [
        "Центральный", "Прикубанский", "Карасунский", "Западный",
    ],
    "Сочи": [
        "Центральный", "Адлерский", "Хостинский", "Лазаревский",
    ],
    "Ставрополь": [
        "Центральный", "Промышленный", "Октябрьский",
    ],
    "Волгоград": [
        "Центральный", "Дзержинский", "Советский", "Краснооктябрьский",
    ],
}

OBJECT_FEATURES = [
    "city",
    "district",
    "area_total",
    "area_living",
    "area_kitchen",
    "floor",
    "floors_total",
    "rooms",
    "build_year",
    "building_type",       # panel / brick / monolith / block
    "has_elevator",
    "has_parking",
    "has_balcony",
    "renovation",          # none / cosmetic / euro / designer
    "to_metro_min",
    "to_center_km",
]

MACRO_FEATURES = [
    "cbr_rate",            # ключевая ставка ЦБ РФ
    "inflation_yoy",
    "unemployment_rate",
    "construction_volume",
    "migration_inflow",
]

TARGET = "price_sqm"       # рублей за м²

TRAIN_DATE_START = "2018-01-01"
TRAIN_DATE_END   = "2024-12-31"
FORECAST_HORIZON = 36      # месяцев

RANDOM_STATE = 42
TEST_SIZE    = 0.15
VAL_SIZE     = 0.10

LGBM_PARAMS = {
    "n_estimators":      1000,
    "max_depth":         7,
    "learning_rate":     0.04,
    "num_leaves":        63,
    "subsample":         0.85,
    "colsample_bytree":  0.80,
    "min_child_samples": 20,
    "reg_alpha":         0.05,
    "reg_lambda":        1.0,
    "random_state":      RANDOM_STATE,
    "n_jobs":            -1,
    "verbose":           -1,
}

XGBOOST_PARAMS = {
    "n_estimators":      1200,
    "max_depth":         7,
    "learning_rate":     0.03,
    "subsample":         0.85,
    "colsample_bytree":  0.80,
    "min_child_weight":  5,
    "gamma":             0.1,
    "reg_alpha":         0.05,
    "reg_lambda":        1.2,
    "tree_method":       "hist",
    "random_state":      RANDOM_STATE,
    "n_jobs":            -1,
}

RF_PARAMS = {
    "n_estimators":  600,
    "max_depth":     20,
    "min_samples_split": 4,
    "min_samples_leaf":  2,
    "max_features":  "sqrt",
    "random_state":  RANDOM_STATE,
    "n_jobs":        -1,
}

META_LEARNER_PARAMS = {
    "alpha": 0.001,
    "fit_intercept": True,
    "max_iter": 2000,
}

MODEL_DIR  = "models"
DATA_DIR   = "data"
REPORT_DIR = "reports"
