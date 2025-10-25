from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from fastapi.responses import FileResponse, JSONResponse
from typing import List
import os
import shutil
from io import BytesIO
import pandas as pd
import io, csv

from machine_learning.model2.main import allocate_rooms   
from machine_learning.model3.main import get_predictions_csv_path_for
import tempfile

from machine_learning.model1.part1 import evaluate_candidate
from machine_learning.model1.part2 import form_teams_from_csv


app = FastAPI(title="Machine Learning Models API")

BASE_DIR = os.path.dirname(__file__)
OUTPUT_DIR = os.path.join(BASE_DIR, "output")
os.makedirs(OUTPUT_DIR, exist_ok=True)


@app.get("/")
def home():
    return {"message": "Welcome to the Machine Learning Models API"}


# --- Model 1 Endpoint ---
# -----------------------------
# MODEL 1 ENDPOINTS
# -----------------------------
# --- Input Model ---
class CandidateInput(BaseModel):
    name: str
    tech_stack_used: str


# --- Endpoint 1: Evaluate Candidate (Only Score) ---
@app.post("/model1/evaluate")
def evaluate_candidate_api(data: CandidateInput):
    """
    Takes candidate name and tech stack string (skills separated by double spaces),
    converts to a list, evaluates using model1.part1, and returns only the score.
    """

    # Step 1️⃣ Convert double-space-separated skills to a list
    cleaned_stack = data.tech_stack_used.replace("  ", ",").replace(" ,", ",").strip()
    skills = [s.strip() for s in cleaned_stack.split(",") if s.strip()]

    # Step 2️⃣ Evaluate candidate
    _, score, _ = evaluate_candidate(data.name, skills)

    # Step 3️⃣ Return only the score in JSON
    return {"score": score}


# ------------------------------------------------------------
# 🔹 Function 2 (part2.py): Form Teams from CSV Input
# ------------------------------------------------------------

@app.post("/model1/form_teams", response_class=FileResponse)
async def form_teams(file: UploadFile = File(...)):
    """
    Accepts a CSV file (output of evaluate_candidates),
    forms teams using model1.part2, writes final teams.csv to disk,
    and returns it for download.
    """

    # Step 1️⃣ Read uploaded CSV content
    content = await file.read()
    csv_content = content.decode("utf-8")

    # Step 2️⃣ Process the CSV with form_teams_from_csv()
    teams_csv = form_teams_from_csv(csv_content)

    # Step 3️⃣ Save teams CSV to disk
    os.makedirs("outputs", exist_ok=True)
    file_path = "outputs/teams.csv"
    with open(file_path, "w", encoding="utf-8", newline="") as f:
        f.write(teams_csv)

    # Step 4️⃣ Return generated CSV for download
    return FileResponse(
        path=file_path,
        filename="teams.csv",
        media_type="text/csv"
    )


# -------------------------------
# --- Model 2 Endpoint upload two CSVs, save + download) ---
@app.post("/model2/upload")
async def upload_and_run_model2(teams_file: UploadFile = File(...), rooms_file: UploadFile = File(...)):
    try:
        teams_df = pd.read_csv(BytesIO(await teams_file.read()))
        rooms_df = pd.read_csv(BytesIO(await rooms_file.read()))

        os.makedirs(OUTPUT_DIR, exist_ok=True)
        final_output_path = os.path.abspath(os.path.join(OUTPUT_DIR, "room_allocation.csv"))
        allocate_rooms(teams_df, rooms_df, final_output_path)

        if not os.path.exists(final_output_path):
            raise RuntimeError("Model 2 did not produce an output CSV.")

        return FileResponse(final_output_path, filename="room_allocation.csv", media_type="text/csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- Model 3 Endpoint (upload CSV, save + download) ---
@app.post("/model3/upload")
async def upload_and_run_model3(file: UploadFile = File(...)):
    try:
        fd, temp_input_path = tempfile.mkstemp(suffix=".csv")
        os.close(fd)
        contents = await file.read()
        with open(temp_input_path, "wb") as f:
            f.write(contents)

        source_output = os.path.abspath(get_predictions_csv_path_for(temp_input_path))
        
        if not os.path.exists(source_output):
            raise RuntimeError(f"Model 3 did not produce an output CSV at: {source_output}")

        final_output_path = os.path.abspath(os.path.join(OUTPUT_DIR, "predicted_scores.csv"))
        os.makedirs(os.path.dirname(final_output_path), exist_ok=True)
        try:
            shutil.copyfile(source_output, final_output_path)
            path_to_return = final_output_path
        except Exception:
            path_to_return = source_output

        return FileResponse(path_to_return, filename="predicted_scores.csv", media_type="text/csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        try:
            if 'temp_input_path' in locals() and os.path.exists(temp_input_path):
                os.remove(temp_input_path)
        except Exception:
            pass
