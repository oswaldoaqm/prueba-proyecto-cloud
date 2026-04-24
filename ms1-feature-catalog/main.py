from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import sessionmaker, Session, relationship, declarative_base
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import os

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost:5432/features")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

app = FastAPI(title="Feature Catalog Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Dataset(Base):
    __tablename__ = "dataset"
    dataset_id = Column(Integer, primary_key=True, index=True)
    nombre_dataset = Column(String(100))
    dominio = Column(String(50))
    descripcion = Column(Text)
    fecha_creacion = Column(DateTime)
    propietario = Column(String(100))
    features = relationship("Feature", back_populates="dataset")

class Feature(Base):
    __tablename__ = "feature"
    feature_id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("dataset.dataset_id"))
    nombre_variable = Column(String(100))
    tipo_dato = Column(String(20))
    descripcion = Column(Text)
    estadisticas = Column(JSON)
    fecha_registro = Column(DateTime)
    dataset = relationship("Dataset", back_populates="features")

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Schemas
class FeatureOut(BaseModel):
    feature_id: int
    dataset_id: int
    nombre_variable: str
    tipo_dato: str
    descripcion: Optional[str] = None
    estadisticas: Optional[dict] = None
    fecha_registro: Optional[datetime] = None
    class Config:
        from_attributes = True

class DatasetOut(BaseModel):
    dataset_id: int
    nombre_dataset: str
    dominio: str
    descripcion: Optional[str] = None
    propietario: Optional[str] = None
    fecha_creacion: Optional[datetime] = None
    class Config:
        from_attributes = True

class DatasetWithFeatures(DatasetOut):
    features: List[FeatureOut] = []

# Endpoints
@app.get("/datasets", response_model=List[DatasetOut])
def list_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(Dataset).offset(skip).limit(limit).all()

@app.get("/datasets/{dataset_id}/features", response_model=DatasetWithFeatures)
def get_dataset_features(dataset_id: int, db: Session = Depends(get_db)):
    ds = db.query(Dataset).filter(Dataset.dataset_id == dataset_id).first()
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return ds

@app.get("/features", response_model=List[FeatureOut])
def list_features(tipo: Optional[str] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    q = db.query(Feature)
    if tipo:
        q = q.filter(Feature.tipo_dato == tipo)
    return q.offset(skip).limit(limit).all()

@app.post("/features", response_model=FeatureOut)
def create_feature(dataset_id: int, nombre_variable: str, tipo_dato: str, descripcion: str = "", db: Session = Depends(get_db)):
    f = Feature(dataset_id=dataset_id, nombre_variable=nombre_variable, tipo_dato=tipo_dato, descripcion=descripcion, estadisticas={})
    db.add(f)
    db.commit()
    db.refresh(f)
    return f

@app.get("/features/search")
def search_features(tipo: str, db: Session = Depends(get_db)):
    count = db.query(Feature).filter(Feature.tipo_dato == tipo).count()
    return {"tipo": tipo, "total": count}

@app.get("/health")
def health():
    return {"status": "ok", "service": "ms1-feature-catalog"}