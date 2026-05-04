import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import type { Model } from '@/types'
import { KPICard } from '../KPICard'
import { DataTable } from '../DataTable'
import { Badge } from '../Badge'

export function Dashboard() {
  const [topModels, setTopModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  async function loadDashboard() {
    setLoading(true)
    try {
      const models = await apiService.getTopModels(5)
      setTopModels(models)
    } finally {
      setLoading(false)
    }
  }

  const kpis = [
    { value: '50',    label: 'Datasets',    sublabel: 'Feature sources',  accent: 'blue'   as const },
    { value: '1,000', label: 'Models',       sublabel: 'Registered total', accent: 'violet' as const },
    { value: '25K',   label: 'Predictions',  sublabel: 'Total inferences', accent: 'amber'  as const },
    { value: '0.840', label: 'Avg Accuracy', sublabel: 'Across all models',accent: 'green'  as const },
  ]

  return (
    <div className="animate-slide-up" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 6, textTransform: 'uppercase' }}>
            System Overview
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>
            MLOps Dashboard
          </h1>
        </div>
        <div style={{
          padding: '6px 12px',
          borderRadius: 6,
          background: 'var(--green-dim)',
          border: '1px solid rgba(0,229,160,0.2)',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--green)',
          letterSpacing: '0.08em',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}>
          <span className="pulse-live" style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        {kpis.map((kpi, i) => (
          <div key={kpi.label} style={{ animationDelay: `${i * 0.07}s` }}>
            <KPICard {...kpi} loading={loading} />
          </div>
        ))}
      </div>

      {/* Top Models */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-3)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <div style={{ width: 3, height: 16, background: 'var(--green)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
            Top Performers
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)' }}>
            BY ACCURACY · TOP 5
          </span>
        </div>
        <div style={{ padding: 20 }}>
          <DataTable
            columns={[
              { key: 'nombre_modelo', label: 'Model Name' },
              { key: 'version', label: 'Version' },
              { key: 'framework', label: 'Framework' },
              {
                key: 'avg_accuracy',
                label: 'Accuracy',
                render: (value) => (
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: 12 }}>
                    {value ? value.toFixed(4) : '—'}
                  </span>
                ),
              },
              {
                key: 'estado',
                label: 'State',
                render: (value) => <Badge label={value} variant={value} />,
              },
            ]}
            data={topModels}
            loading={loading}
          />
        </div>
      </div>

      {/* Status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {[
          { label: 'Feature Store', status: 'ms1 · :8001', ok: true },
          { label: 'Model Registry', status: 'ms2 · :8002', ok: true },
          { label: 'Log Service', status: 'ms3 · :8003', ok: true },
          { label: 'Inference Engine', status: 'ms4 · :8004', ok: true },
          { label: 'Analytics', status: 'ms5 · :8005', ok: true },
        ].map((svc) => (
          <div key={svc.label} style={{
            padding: '12px 14px',
            borderRadius: 8,
            background: 'var(--bg-3)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 500 }}>{svc.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', marginTop: 2 }}>{svc.status}</div>
            </div>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: svc.ok ? 'var(--green)' : 'var(--red)', boxShadow: svc.ok ? '0 0 6px var(--green)' : 'none' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
