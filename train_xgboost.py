import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
import shap
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# === Patch for newer numpy versions
np.bool = np.bool_

# === Paths
script_dir = os.path.dirname(__file__)
csv_path = os.path.join(script_dir, "eco_dataset.csv")
model_dir = os.path.join(script_dir, "ml_model")
encoders_dir = os.path.join(model_dir, "xgb_encoders")
os.makedirs(encoders_dir, exist_ok=True)

# === Load dataset
column_names = ["title", "material", "weight", "transport", "recyclability", "true_eco_score", "co2_emissions", "origin"]
df = pd.read_csv(csv_path, header=None, names=column_names, quotechar='"')

# === Clean and preprocess
valid_scores = ["A+", "A", "B", "C", "D", "E", "F"]
df = df[df["true_eco_score"].isin(valid_scores)].dropna()

for col in ["material", "transport", "recyclability", "origin"]:
    df[col] = df[col].astype(str).str.title().str.strip()

encoders = {
    'material': LabelEncoder(),
    'transport': LabelEncoder(),
    'recyclability': LabelEncoder(),
    'origin': LabelEncoder(),
    'label': LabelEncoder()
}

# Encode features
df["material_encoded"] = encoders['material'].fit_transform(df["material"])
df["transport_encoded"] = encoders['transport'].fit_transform(df["transport"])
df["recycle_encoded"] = encoders['recyclability'].fit_transform(df["recyclability"])
df["origin_encoded"] = encoders['origin'].fit_transform(df["origin"])
df["label_encoded"] = encoders['label'].fit_transform(df["true_eco_score"])

# Features and target
X = df[["material_encoded", "weight", "transport_encoded", "recycle_encoded", "origin_encoded"]].astype(float)
y = pd.Categorical(df["label_encoded"], categories=range(len(encoders['label'].classes_))).codes

# === Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# === Train model
model = xgb.XGBClassifier(
    use_label_encoder=False,
    eval_metric="mlogloss",
    n_estimators=100,
    random_state=42
)
model.fit(X_train, y_train)

# === Explain model with SHAP
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_test)

# --- Handle SHAP values correctly
if shap_values.ndim == 3:
    # For multi-class output: (samples, features, classes)
    shap_values_mean = np.abs(shap_values).mean(axis=(0, 2))  # mean over samples and classes
else:
    shap_values_mean = np.abs(shap_values).mean(axis=0)  # normal 2D case

print("shap_values type:", type(shap_values))
if isinstance(shap_values, list):
    print("shap_values[0] shape:", shap_values[0].shape)
else:
    print("shap_values shape:", shap_values.shape)

print("shap_values_mean shape:", shap_values_mean.shape)

# === Feature importance DataFrame
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': shap_values_mean
}).sort_values(by="importance", ascending=True)

# === Plot feature importances
plt.figure(figsize=(6, 4))
plt.barh(feature_importance["feature"], feature_importance["importance"])
plt.xlabel("Mean SHAP Value (Impact)")
plt.title("Feature Importance based on SHAP values")
plt.tight_layout()
shap_plot_path = os.path.join(model_dir, "shap_summary.png")
plt.savefig(shap_plot_path)
plt.close()

print(f"✅ SHAP feature importance plot saved at {shap_plot_path}")

# === Save model and encoders
model.save_model(os.path.join(model_dir, "xgb_model.json"))

for name, encoder in encoders.items():
    joblib.dump(encoder, os.path.join(encoders_dir, f"{name}_encoder.pkl"))

print("✅ Model and encoders saved successfully!")
