// Feature types
export interface Feature {
  feature_id: string
  nombre_variable: string
  tipo_dato: string
  dataset_id: string
  estadisticas?: {
    media?: number
    std?: number
  }
}

// Model types
export interface Model {
  modelo_id: string
  nombre_modelo: string
  version: string
  framework: string
  estado: string
  autor?: string
  avg_accuracy?: number
  training_time_sec?: number
}

// Prediction types
export interface PredictionRequest {
  modelo_id: number
  input_features: {
    edad: number
    ingreso: number
    antiguedad_meses: number
  }
}

export interface PredictionResponse {
  modelo: string
  modelo_id: number
  request_id: string
  prediction: string
  latencia_ms: number
  log_status: string
}

// Log types
export interface PredictionLog {
  log_id: string
  modelo_nombre: string
  prediccion_output: string
  latencia_ms: number
  timestamp: string
}

export interface LogsResponse {
  logs: PredictionLog[]
  total: number
}

// Analytics types
export interface FrameworkAnalytics {
  framework: string
  avg_accuracy: number
  total_modelos: number
  avg_training_time_sec: number
}

export interface DriftData {
  nombre_modelo: string
  framework: string
  mes: string
  promedio_prediccion: number
  total_predicciones: number
}

export interface TopModel {
  nombre_modelo: string
  version: string
  framework: string
  peticiones_7d: number
  latencia_promedio_ms: number
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}
