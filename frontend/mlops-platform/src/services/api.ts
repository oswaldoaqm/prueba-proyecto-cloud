import axios, { AxiosInstance } from 'axios'
import { API_BASE_URLS } from '@/constants'
import type {
  Feature,
  Model,
  PredictionRequest,
  PredictionResponse,
  LogsResponse,
  FrameworkAnalytics,
  DriftData,
  TopModel,
} from '@/types'

class APIService {
  private clients: Record<string, AxiosInstance>

  constructor() {
    this.clients = {
      ms1: axios.create({ baseURL: API_BASE_URLS.ms1, timeout: 5000 }),
      ms2: axios.create({ baseURL: API_BASE_URLS.ms2, timeout: 5000 }),
      ms3: axios.create({ baseURL: API_BASE_URLS.ms3, timeout: 5000 }),
      ms4: axios.create({ baseURL: API_BASE_URLS.ms4, timeout: 5000 }),
      ms5: axios.create({ baseURL: API_BASE_URLS.ms5, timeout: 5000 }),
    }
  }

  // ===== MS1: Features =====
  async getFeatures(limit: number = 15, skip: number = 0, tipo?: string): Promise<Feature[]> {
    try {
      const params: Record<string, any> = { limit, skip }
      if (tipo) params.tipo = tipo
      const response = await this.clients.ms1.get('/features', { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching features:', error)
      return []
    }
  }

  // ===== MS2: Models =====
  async getModels(limit: number = 15, skip: number = 0, framework?: string, estado?: string): Promise<Model[]> {
    try {
      const params: Record<string, any> = { limit, skip }
      if (framework) params.framework = framework
      if (estado) params.estado = estado
      const response = await this.clients.ms2.get('/modelos', { params })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching models:', error)
      return []
    }
  }

  async getTopModels(limit: number = 5): Promise<Model[]> {
    try {
      const response = await this.clients.ms2.get('/modelos/top', { params: { limit } })
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching top models:', error)
      return []
    }
  }

  // ===== MS3: Logs =====
  async getLogs(modeloId: number, page: number = 1, limit: number = 15): Promise<LogsResponse> {
    try {
      const response = await this.clients.ms3.get(`/logs/modelo/${modeloId}`, {
        params: { page, limit },
      })
      return {
        logs: response.data.logs || [],
        total: response.data.total || 0,
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      return { logs: [], total: 0 }
    }
  }

  // ===== MS4: Predictions =====
  async runPrediction(request: PredictionRequest): Promise<PredictionResponse | null> {
    try {
      const response = await this.clients.ms4.post('/predict', request)
      return response.data
    } catch (error) {
      console.error('Error running prediction:', error)
      throw error
    }
  }

  // ===== MS5: Analytics =====
  async getFrameworkAnalytics(): Promise<FrameworkAnalytics[]> {
    try {
      const response = await this.clients.ms5.get('/analytics/frameworks')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching framework analytics:', error)
      return []
    }
  }

  async getDriftAnalytics(): Promise<DriftData[]> {
    try {
      const response = await this.clients.ms5.get('/analytics/drift')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching drift analytics:', error)
      return []
    }
  }

  async getTopModelsVolume(): Promise<TopModel[]> {
    try {
      const response = await this.clients.ms5.get('/analytics/top-models')
      return Array.isArray(response.data) ? response.data : []
    } catch (error) {
      console.error('Error fetching top models volume:', error)
      return []
    }
  }
}

export const apiService = new APIService()
