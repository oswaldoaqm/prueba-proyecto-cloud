import { useEffect, useState } from 'react'
import { apiService } from '@/services/api'
import { PAGE_SIZE } from '@/constants'
import type { PredictionLog } from '@/types'
import { Card } from '../Card'
import { DataTable } from '../DataTable'
import { Pagination } from '../Pagination'

export function Logs() {
  const [logs, setLogs] = useState<PredictionLog[]>([])
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(false)
  const [modelId, setModelId] = useState('1')
  const [total, setTotal] = useState(0)

  useEffect(() => { loadLogs() }, [page])

  async function loadLogs() {
    setLoading(true)
    try {
      const data = await apiService.getLogs(parseInt(modelId), page + 1, PAGE_SIZE)
      setLogs(data.logs)
      setTotal(data.total)
    } finally {
      setLoading(false)
    }
  }

  function handleSearch() { setPage(0); loadLogs() }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>Prediction Logs</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Inference History</h1>
      </div>

      <Card title="Logs · Prediction History">
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 18, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>Model ID</div>
            <input
              type="number"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 7,
                border: '1px solid var(--border-2)',
                background: 'var(--bg-3)',
                color: 'var(--text)',
                fontFamily: 'var(--font-mono)',
                fontSize: 13,
                outline: 'none',
                width: 120,
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
            />
          </div>
          <button
            onClick={handleSearch}
            style={{
              padding: '7px 18px',
              borderRadius: 7,
              border: '1px solid rgba(0,229,160,0.25)',
              background: 'var(--green-dim)',
              color: 'var(--green)',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              transition: 'all 0.15s',
            }}
          >
            SEARCH
          </button>
        </div>

        <DataTable
          columns={[
            { key: 'log_id', label: 'Log ID' },
            { key: 'modelo_nombre', label: 'Model' },
            { key: 'prediccion_output', label: 'Output', render: (v) => (
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--green)', fontSize: 12 }}>{v}</span>
            )},
            { key: 'latencia_ms', label: 'Latency', render: (v) => (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: v > 200 ? 'var(--amber)' : 'var(--text-2)' }}>{v}ms</span>
            )},
            { key: 'timestamp', label: 'Timestamp', render: (v) => v ? (
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>{new Date(v).toLocaleString()}</span>
            ) : '—'},
          ]}
          data={logs}
          loading={loading}
        />
        <Pagination page={page} onPrevious={() => setPage(Math.max(0, page - 1))} onNext={() => setPage(page + 1)} canPrevious={page > 0} canNext={logs.length === PAGE_SIZE} total={total} />
      </Card>
    </div>
  )
}
