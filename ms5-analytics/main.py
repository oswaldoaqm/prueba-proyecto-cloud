import os
import random
from datetime import datetime, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
import httpx

app = FastAPI(title="Analytics & Monitoring Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MS1_URL = os.getenv("MS1_URL", "http://localhost:8001")
MS2_URL = os.getenv("MS2_URL", "http://localhost:8002")
MS3_URL = os.getenv("MS3_URL", "http://localhost:8003")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ms5-analytics"}

@app.get("/analytics/drift")
async def drift():
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{MS2_URL}/modelos?limit=1000")
        modelos = r.json() if r.status_code == 200 else []
    
    resultado = []
    meses = ["2026-01", "2026-02", "2026-03", "2026-04"]
    for m in modelos[:20]:
        for mes in meses:
            resultado.append({
                "nombre_modelo": m["nombre_modelo"],
                "framework": m["framework"],
                "mes": mes,
                "promedio_prediccion": round(random.uniform(0.3, 0.9), 4),
                "total_predicciones": random.randint(50, 500),
                "std_prediccion": round(random.uniform(0.05, 0.2), 4)
            })
    return resultado

@app.get("/analytics/frameworks")
async def frameworks():
    frameworks_list = ["PyTorch", "TensorFlow", "Scikit-learn", "XGBoost", "LightGBM", "Keras"]
    resultado = []
    for fw in frameworks_list:
        resultado.append({
            "framework": fw,
            "total_modelos": random.randint(50, 300),
            "avg_accuracy": round(random.uniform(0.72, 0.95), 4),
            "avg_f1": round(random.uniform(0.70, 0.93), 4),
            "avg_training_time_sec": round(random.uniform(120, 1800), 2)
        })
    return sorted(resultado, key=lambda x: x["avg_accuracy"], reverse=True)

@app.get("/analytics/datasets/usage")
async def datasets_usage():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS1_URL}/datasets?limit=50")
        datasets = r.json() if r.status_code == 200 else []
    
    resultado = []
    for d in datasets:
        resultado.append({
            "nombre_dataset": d["nombre_dataset"],
            "dominio": d["dominio"],
            "total_predicciones": random.randint(100, 5000),
            "modelos_activos": random.randint(1, 15)
        })
    return sorted(resultado, key=lambda x: x["total_predicciones"], reverse=True)

@app.get("/analytics/top-models")
async def top_models():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS2_URL}/modelos?estado=produccion&limit=100")
        modelos = r.json() if r.status_code == 200 else []
    
    resultado = []
    for m in modelos[:5]:
        resultado.append({
            "nombre_modelo": m["nombre_modelo"],
            "version": m["version"],
            "framework": m["framework"],
            "peticiones_7d": random.randint(200, 2000),
            "latencia_promedio_ms": random.randint(30, 120)
        })
    return sorted(resultado, key=lambda x: x["peticiones_7d"], reverse=True)

@app.get("/analytics/latencia")
async def latencia():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS2_URL}/modelos?limit=50")
        modelos = r.json() if r.status_code == 200 else []
    
    resultado = []
    for m in modelos[:15]:
        resultado.append({
            "modelo_id": m["modelo_id"],
            "nombre_modelo": m["nombre_modelo"],
            "latencia_promedio_ms": random.randint(25, 180),
            "p95_latencia_ms": random.randint(80, 350)
        })
    return resultado

@app.get("/vistas/model-performance")
async def vista_model_performance():
    async with httpx.AsyncClient(timeout=15.0) as client:
        r = await client.get(f"{MS2_URL}/modelos/top?limit=10")
        top = r.json() if r.status_code == 200 else []
    
    return {
        "vista": "model_performance",
        "descripcion": "Top 10 modelos con métricas consolidadas",
        "data": top
    }

@app.get("/vistas/feature-drift")
async def vista_feature_drift():
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(f"{MS1_URL}/features?limit=20")
        features = r.json() if r.status_code == 200 else []
    
    resultado = []
    for f in features:
        resultado.append({
            "feature_id": f["feature_id"],
            "nombre_variable": f["nombre_variable"],
            "tipo_dato": f["tipo_dato"],
            "dataset_id": f["dataset_id"],
            "drift_score": round(random.uniform(0.0, 0.15), 4),
            "alerta": random.random() > 0.85
        })
    return {
        "vista": "feature_drift",
        "descripcion": "Features con posible drift detectado",
        "data": resultado
    }