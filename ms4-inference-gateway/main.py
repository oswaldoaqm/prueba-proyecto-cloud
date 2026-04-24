import os
import random
import uuid
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any
import httpx

app = FastAPI(title="Inference Gateway")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MS2_URL = os.getenv("MS2_URL", "http://localhost:8002")
MS3_URL = os.getenv("MS3_URL", "http://localhost:8003")

class PredictRequest(BaseModel):
    modelo_id: int
    input_features: Dict[str, Any]

@app.get("/health")
async def health():
    health_status = {"gateway": "ok", "ms2": "unknown", "ms3": "unknown"}
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            r = await client.get(f"{MS2_URL}/health")
            health_status["ms2"] = "ok" if r.status_code == 200 else "fail"
        except Exception as e:
            health_status["ms2"] = f"fail: {str(e)}"
        try:
            r = await client.get(f"{MS3_URL}/health")
            health_status["ms3"] = "ok" if r.status_code == 200 else "fail"
        except Exception as e:
            health_status["ms3"] = f"fail: {str(e)}"
    return health_status

@app.get("/modelos/activos")
async def modelos_activos():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS2_URL}/modelos?estado=produccion&limit=100")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail="MS2 unavailable")
        return r.json()

@app.post("/predict")
async def predict(req: PredictRequest):
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS2_URL}/modelos/{req.modelo_id}")
        if r.status_code == 404:
            raise HTTPException(status_code=404, detail="Modelo no encontrado")
        if r.status_code != 200:
            raise HTTPException(status_code=502, detail="MS2 unavailable")
        modelo = r.json()
        if modelo.get("estado") != "produccion":
            raise HTTPException(status_code=400, detail=f"Modelo no está en producción (estado: {modelo.get('estado')})")

        prediccion = round(random.uniform(0.01, 0.99), 4)
        latencia = random.randint(25, 150)
        request_id = f"req_{uuid.uuid4().hex[:8]}"

        log_payload = {
            "log_id": random.randint(100000, 999999),
            "modelo_id": req.modelo_id,
            "modelo_nombre": modelo.get("nombre_modelo", "unknown"),
            "request_id": request_id,
            "input_features": req.input_features,
            "prediccion_output": prediccion,
            "probabilidad_clase": [round(1 - prediccion, 4), prediccion],
            "latencia_ms": latencia,
            "timestamp": None,
            "metadata": {"version_gateway": "1.0.0"}
        }

        log_error = None
        log_result = None
        try:
            r3 = await client.post(f"{MS3_URL}/logs", json=log_payload, timeout=10.0)
            if r3.status_code == 201:
                log_result = r3.json()
            else:
                log_error = f"MS3 returned status {r3.status_code}: {r3.text}"
        except Exception as e:
            log_error = f"Exception calling MS3: {str(e)}"

    response = {
        "prediction": prediccion,
        "modelo": modelo.get("nombre_modelo"),
        "modelo_id": req.modelo_id,
        "request_id": request_id,
        "latencia_ms": latencia,
        "input_features": req.input_features,
        "log_status": "created" if (log_result and "_id" in log_result) else "failed"
    }
    if log_error:
        response["log_error"] = log_error
    return response