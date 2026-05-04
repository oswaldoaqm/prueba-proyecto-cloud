// API Configuration
export const API_BASE_URLS = {
  ms1: 'http://localhost:8001', // Feature Store
  ms2: 'http://localhost:8002', // Model Registry
  ms3: 'http://localhost:8003', // Logs
  ms4: 'http://localhost:8004', // Inference/Predict
  ms5: 'http://localhost:8005', // Analytics
}

export const PAGE_SIZE = 15

export const BADGE_COLORS: Record<string, { bg: string; text: string; border?: string }> = {
  produccion: { 
    bg: 'bg-green-900/20',
    text: 'text-green-300',
    border: 'border-green-800'
  },
  staging: { 
    bg: 'bg-amber-900/20',
    text: 'text-amber-300',
    border: 'border-amber-800'
  },
  retirado: { 
    bg: 'bg-slate-800',
    text: 'text-slate-300',
    border: 'border-slate-700'
  },
  en_entrenamiento: { 
    bg: 'bg-blue-900/20',
    text: 'text-blue-300',
    border: 'border-blue-800'
  },
}

export const FRAMEWORKS = [
  'PyTorch',
  'TensorFlow',
  'Scikit-learn',
  'XGBoost',
  'LightGBM',
]

export const FEATURE_TYPES = [
  'numerico',
  'categorico',
  'texto',
  'fecha',
]

export const MODEL_STATES = [
  'produccion',
  'staging',
  'en_entrenamiento',
  'retirado',
]
