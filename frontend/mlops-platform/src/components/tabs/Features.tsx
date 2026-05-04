import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { FEATURE_TYPES, PAGE_SIZE } from '@/constants'
import type { Feature } from '@/types'
import { Card } from '../Card'
import { DataTable } from '../DataTable'
import { Pagination } from '../Pagination'

const selectStyle = {
  padding: '7px 12px',
  borderRadius: 7,
  border: '1px solid var(--border-2)',
  background: 'var(--bg-3)',
  color: 'var(--text-2)',
  fontFamily: 'var(--font-sans)',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
  minWidth: 160,
}

const typeColors: Record<string, string> = {
  numerico: 'var(--blue)',
  categorico: 'var(--violet)',
  texto: 'var(--amber)',
  fecha: 'var(--green)',
}

export function Features() {
  const [features, setFeatures] = useState<Feature[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filterType, setFilterType] = useState('')

  useEffect(() => { loadFeatures() }, [page, filterType])

  async function loadFeatures() {
    setLoading(true)
    try {
      const data = await apiService.getFeatures(PAGE_SIZE, page * PAGE_SIZE, filterType || undefined)
      setFeatures(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>Feature Store</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Feature Catalog</h1>
      </div>

      <Card title="Feature Store · Catalog">
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Data Type</div>
          <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(0) }} style={selectStyle}>
            <option value="">All Types</option>
            {FEATURE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>

        <DataTable
          columns={[
            { key: 'feature_id', label: 'ID' },
            { key: 'nombre_variable', label: 'Variable' },
            {
              key: 'tipo_dato',
              label: 'Type',
              render: (v) => (
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9,
                  padding: '2px 7px',
                  borderRadius: 4,
                  background: `${typeColors[v] || 'var(--text-3)'}18`,
                  color: typeColors[v] || 'var(--text-3)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}>
                  {v}
                </span>
              ),
            },
            { key: 'dataset_id', label: 'Dataset' },
            {
              key: 'estadisticas',
              label: 'Statistics',
              render: (s) => s
                ? <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>μ={s.media?.toFixed(1)||'0'} σ={s.std?.toFixed(1)||'0'}</span>
                : '—',
            },
          ]}
          data={features}
          loading={loading}
        />
        <Pagination page={page} onPrevious={() => setPage(Math.max(0, page - 1))} onNext={() => setPage(page + 1)} canPrevious={page > 0} canNext={features.length === PAGE_SIZE} />
      </Card>
    </div>
  )
}
