import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeRegressor
import joblib
import os
import re

# --- Paths (anchored to this module directory) ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "Datasets", "Final_data", "combined_data.csv")
NEW_DATA_PATH = os.path.join(BASE_DIR, "Datasets", "Final_data", "test_data.csv")
MODEL_PATH = os.path.join(BASE_DIR, "Models", "model.pkl")
OUTPUT_PATH = os.path.join(BASE_DIR, "Predictions", "predicted_scores.csv")


def train_model():
    print(" Loading dataset...")
    df = pd.read_csv(DATA_PATH)

    lower_map = {c.lower(): c for c in df.columns}
    if "score" not in lower_map:
        raise KeyError(
            "Target column 'score' not found. Available columns: "
            + ", ".join(df.columns)
        )
    target_col = lower_map["score"]

    X = df.drop(columns=[target_col])
    y = df[target_col]

    print(" Training Decision Tree model (memorization mode)...")
    model = DecisionTreeRegressor(random_state=42, max_depth=None)
    model.fit(X, y)

    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
    bundle = {"model": model, "feature_names": list(X.columns)}
    joblib.dump(bundle, MODEL_PATH)
    print(f"✅ Model saved at {MODEL_PATH}")


def _prepare_and_predict(X_pred):
    """
    Core prediction logic: prepares features and returns predictions.
    
    Args:
        X_pred: DataFrame with input data
    
    Returns:
        Tuple of (model, predictions)
    """
    print(" Loading model...")
    loaded = joblib.load(MODEL_PATH)

    if isinstance(loaded, dict) and "model" in loaded:
        model = loaded["model"]
        feature_names = loaded.get("feature_names")
    else:
        model = loaded
        feature_names = None

    if feature_names is not None:
        for col in feature_names:
            if col not in X_pred.columns:
                X_pred[col] = 0
        X_pred = X_pred[feature_names]
    else:
        model_feats = getattr(model, "feature_names_in_", None)
        if model_feats is not None:
            model_feats = list(map(str, model_feats))
            for col in model_feats:
                if col not in X_pred.columns:
                    X_pred[col] = 0
            X_pred = X_pred[model_feats]

    print(" Predicting scores...")
    predictions = model.predict(X_pred)
    try:
        predictions = np.rint(predictions).astype(int)
    except Exception:
        predictions = pd.Series(predictions).round(0).astype(int).values

    return model, predictions


def predict_scores():
    print(" Loading model and new data...")
    new_data_original = pd.read_csv(NEW_DATA_PATH)

    lower_map_new = {c.lower(): c for c in new_data_original.columns}

    team_name_key = (
        lower_map_new.get("team name")
        or lower_map_new.get("team_name")
        or lower_map_new.get("team")
    )
    team_series = new_data_original[team_name_key].copy() if team_name_key else None

    X_pred = new_data_original.copy()

    model, predictions = _prepare_and_predict(X_pred)

    if team_series is not None:
        team_name = team_series.astype(str)
    else:
        team_name = pd.Series(
            [f"Team {i}" for i in range(1, len(new_data_original) + 1)],
            index=new_data_original.index,
        )

    output_df = pd.DataFrame(
        {
            "team_name": team_name,
            "score": pd.Series(predictions, index=new_data_original.index).astype(int),
        }
    )

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    output_df.to_csv(OUTPUT_PATH, index=False)
    print(f"✅ Predictions saved to {OUTPUT_PATH}")



def get_predictions_csv_path_for(input_csv_path: str):
    """
    Run predictions for a specific input CSV path without overwriting the
    default NEW_DATA_PATH on disk. Temporarily sets NEW_DATA_PATH in-memory,
    executes predictions, then restores the original path. Returns the
    model's OUTPUT_PATH where predictions were written.
    """
    global NEW_DATA_PATH
    original_input = NEW_DATA_PATH
    try:
        NEW_DATA_PATH = input_csv_path
        if not os.path.exists(MODEL_PATH):
            train_model()
        predict_scores()
        return OUTPUT_PATH
    finally:
        NEW_DATA_PATH = original_input


def predict_score_from_json(json_input: dict) -> int:
    """
    Takes a JSON object with team_name and tech_stack_used fields and returns
    the predicted score.
    
    Args:
        json_input: Dictionary with format:
            {
                "team_name": "Tech Titans",
                "tech_stack_used": "AWS Python OpenCV TailwindCSS"
            }
    
    Returns:
        Integer predicted score
    """
    if not os.path.exists(MODEL_PATH):
        train_model()
    
    # Extract tech stack string
    tech_stack = json_input.get("tech_stack_used", "")
    
    # Load model to get feature names
    loaded = joblib.load(MODEL_PATH)
    if isinstance(loaded, dict) and "model" in loaded:
        feature_names = loaded.get("feature_names")
    else:
        feature_names = getattr(loaded, "feature_names_in_", None)
        if feature_names is not None:
            feature_names = list(map(str, feature_names))
    
    # Remove 'Score' from feature names if present
    if feature_names and "Score" in feature_names:
        feature_names = [f for f in feature_names if f != "Score"]
    
    # Create a binary vector for the tech stack
    tech_input = {tech: 0 for tech in feature_names}
    
    # Split the tech stack string and map to features
    techs = tech_stack.split()
    for tech in techs:
        # Try to find matching technology in feature names
        for feature in feature_names:
            # Case-insensitive matching
            if tech.lower() in feature.lower() or feature.lower() in tech.lower():
                tech_input[feature] = 1
                break
    
    # Create DataFrame with the correct feature order
    X_pred = pd.DataFrame([tech_input])[feature_names]
    
    # Use the core prediction logic
    model, predictions = _prepare_and_predict(X_pred)
    
    return int(predictions[0])




if __name__ == "__main__":
    if not os.path.exists(MODEL_PATH):
        train_model()
    predict_scores()
    
    json_input1 = {
        "team_name": "Tech_Titans",
        "tech_stack_used": "MongoDB  React  javascript  Express.js  TailwindCss  Redux  Socket.io  AWS"
    }
    json_input2 = {
        "team_name": "Tech_Titans",
        "tech_stack_used": "Next.js  Azure  Python  MongoDB  aws  OpenCV  Prisma  TailwindCss  Recoil  Zustand  Redux  TanStack_Query"
    }
    score = predict_score_from_json(json_input2)
    print(f"Predicted score from JSON input: {score}")
    