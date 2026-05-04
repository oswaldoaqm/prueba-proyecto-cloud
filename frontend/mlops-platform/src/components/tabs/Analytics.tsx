import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import type { FrameworkAnalytics, DriftData, TopModel } from '@/types'
import { Card } from '../Card'
import { DataTable } from '../DataTable'

const FRAMEWORK_COLORS: Record<string, string> = {
  'PyTorch': 'var(--red)',
  'TensorFlow': 'var(--amber)',
  'Scikit-learn': 'var(--blue)',
  'XGBoost': 'var(--green)',
  'LightGBM': 'var(--violet)',
}

export function Analytics() {
  const [frameworks, setFrameworks] = useState<FrameworkAnalytics[]>([])
  const [drift, setDrift] = useState<DriftData[]>([])
  const [topModels, setTopModels] = useState<TopModel[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAnalytics() }, [])

  async function loadAnalytics() {
    setLoading(true)
    try {
      const [fw, dr, top] = await Promise.all([
        apiService.getFrameworkAnalytics(),
        apiService.getDriftAnalytics(),
        apiService.getTopModelsVolume(),
      ])
      setFrameworks(fw)
      setDrift(dr.slice(0, 20))
      setTopModels(top)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>Analytics</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Platform Insights</h1>
      </div>

      {/* Framework bars */}
      <Card title="Framework Accuracy Benchmark">
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 48 }} />)}
          </div>
        ) : frameworks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {frameworks.map((fw, i) => {
              const max = Math.max(...frameworks.map((f) => f.avg_accuracy || 0), 0.01)
              const pct = ((fw.avg_accuracy || 0) / max * 100)
              const color = FRAMEWORK_COLORS[fw.framework] || 'var(--blue)'
              return (
                <div key={fw.framework} className="animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 3, height: 14, borderRadius: 2, background: color }} />
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>{fw.framework}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{fw.total_modelos} models · {(fw.avg_training_time_sec || 0).toFixed(0)}s avg</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color }}>
                        {(fw.avg_accuracy || 0).toFixed(4)}
                      </span>
                    </div>
                  </div>
                  <div style={{ height: 5, borderRadius: 3, background: 'var(--surface)', overflow: 'hidden' }}>
                    <div
                      className="animate-bar"
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: color,
                        borderRadius: 3,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-3)', padding: '24px 0', fontFamily: 'var(--font-mono)', fontSize: 11 }}>NO DATA</div>
        )}
      </Card>

      {/* Drift */}
      <Card title="Data Drift · Monthly Breakdown">
        <DataTable
          columns={[
            { key: 'nombre_modelo', label: 'Model' },
            { key: 'framework', label: 'Framework' },
            { key: 'mes', label: 'Month', render: (v) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{v}</span> },
            { key: 'promedio_prediccion', label: 'Avg Prediction', render: (v) => <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue)', fontSize: 12 }}>{v}</span> },
            { key: 'total_predicciones', label: 'Total', render: (v) => <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>{v?.toLocaleString()}</span> },
          ]}
          data={drift}
          loading={loading}
        />
      </Card>

      {/* Top by volume */}
      <Card title="Top Models · Volume (7d)">
        <DataTable
          columns={[
            { key: 'nombre_modelo', label: 'Model' },
            { key: 'version', label: 'Version' },
            { key: 'framework', label: 'Framework' },
            { key: 'peticiones_7d', label: 'Requests (7d)', render: (v) => (
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)', fontSize: 12 }}>{v?.toLocaleString()}</span>
            )},
            { key: 'latencia_promedio_ms', label: 'Avg Latency', render: (v) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: v > 200 ? 'var(--red)' : 'var(--green)' }}>{v?.toFixed(2)}ms</span>
            )},
          ]}
          data={topModels}
          loading={loading}
        />
      </Card>
    </div>
  )
}
