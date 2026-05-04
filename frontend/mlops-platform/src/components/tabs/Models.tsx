import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { FRAMEWORKS, MODEL_STATES, PAGE_SIZE } from '@/constants'
import type { Model } from '@/types'
import { Card } from '../Card'
import { DataTable } from '../DataTable'
import { Pagination } from '../Pagination'
import { Badge } from '../Badge'

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

export function Models() {
  const [models, setModels] = useState<Model[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [filterFramework, setFilterFramework] = useState('')
  const [filterState, setFilterState] = useState('')

  useEffect(() => { loadModels() }, [page, filterFramework, filterState])

  async function loadModels() {
    setLoading(true)
    try {
      const data = await apiService.getModels(PAGE_SIZE, page * PAGE_SIZE, filterFramework || undefined, filterState || undefined)
      setModels(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>Model Registry</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Registered Models</h1>
      </div>

      <Card title="Model Registry">
        <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Framework</div>
            <select value={filterFramework} onChange={(e) => { setFilterFramework(e.target.value); setPage(0) }} style={selectStyle}>
              <option value="">All Frameworks</option>
              {FRAMEWORKS.map((fw) => <option key={fw} value={fw}>{fw}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Status</div>
            <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setPage(0) }} style={selectStyle}>
              <option value="">All States</option>
              {MODEL_STATES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>

        <DataTable
          columns={[
            { key: 'modelo_id', label: 'ID' },
            { key: 'nombre_modelo', label: 'Model' },
            { key: 'version', label: 'Version' },
            { key: 'framework', label: 'Framework' },
            { key: 'estado', label: 'State', render: (v) => <Badge label={v} variant={v} /> },
            { key: 'autor', label: 'Author' },
          ]}
          data={models}
          loading={loading}
        />
        <Pagination page={page} onPrevious={() => setPage(Math.max(0, page - 1))} onNext={() => setPage(page + 1)} canPrevious={page > 0} canNext={models.length === PAGE_SIZE} />
      </Card>
    </div>
  )
}
