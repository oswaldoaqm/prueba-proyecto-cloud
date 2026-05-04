import { useState } from 'react'
import { apiService } from '@/services/api'
import type { PredictionResponse } from '@/types'

const inputStyle = {
  width: '100%',
  padding: '9px 13px',
  borderRadius: 7,
  border: '1px solid var(--border-2)',
  background: 'var(--bg-3)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  fontSize: 13,
  outline: 'none',
  transition: 'border-color 0.15s',
}

const labelStyle = {
  fontFamily: 'var(--font-mono)',
  fontSize: 9,
  color: 'var(--text-3)',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  marginBottom: 5,
  display: 'block',
}

export function Predict() {
  const [modelId, setModelId] = useState('1')
  const [age, setAge] = useState('30')
  const [income, setIncome] = useState('3500')
  const [seniority, setSeniority] = useState('24')
  const [result, setResult] = useState<PredictionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePredict() {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const response = await apiService.runPrediction({
        modelo_id: parseInt(modelId),
        input_features: { edad: parseInt(age), ingreso: parseInt(income), antiguedad_meses: parseInt(seniority) },
      })
      if (response) setResult(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-slide-up">
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 4, textTransform: 'uppercase' }}>Inference Engine</div>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.02em' }}>Prediction Simulator</h1>
      </div>

      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 16, background: 'var(--green)', borderRadius: 2 }} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
            Inference Request
          </span>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {[
              { label: 'Model ID', value: modelId, set: setModelId, min: 1, max: 1000 },
              { label: 'Age (years)', value: age, set: setAge, min: 0 },
              { label: 'Income (USD)', value: income, set: setIncome, min: 0 },
              { label: 'Seniority (months)', value: seniority, set: setSeniority, min: 0 },
            ].map(({ label, value, set, min, max }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => set(e.target.value)}
                  min={min}
                  max={max}
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,229,160,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border-2)'}
                />
              </div>
            ))}
          </div>

          {/* Button */}
          <div>
            <button
              onClick={handlePredict}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 24px',
                borderRadius: 8,
                border: '1px solid rgba(0,229,160,0.3)',
                background: loading ? 'rgba(0,229,160,0.05)' : 'var(--green-dim)',
                color: 'var(--green)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                transition: 'all 0.15s',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '◐ PROCESSING...' : '▶ RUN INFERENCE'}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 8,
              background: 'var(--red-dim)',
              border: '1px solid rgba(255,77,106,0.2)',
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--red)',
            }}>
              ✗ {error}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="animate-slide-up" style={{
              borderRadius: 10,
              border: '1px solid rgba(0,229,160,0.2)',
              overflow: 'hidden',
            }}>
              <div style={{
                padding: '10px 16px',
                background: 'var(--green-dim)',
                borderBottom: '1px solid rgba(0,229,160,0.15)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                color: 'var(--green)',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                ✓ Inference Complete · req/{result.request_id?.slice(0, 8)}
              </div>
              <div style={{ padding: 20, background: 'var(--bg-3)' }}>
                {/* Big output */}
                <div style={{ marginBottom: 20, textAlign: 'center', padding: '20px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase' }}>Prediction Output</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 700, color: 'var(--green)' }}>
                    {result.prediction}
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'Model', value: result.modelo },
                    { label: 'Model ID', value: String(result.modelo_id) },
                    { label: 'Latency', value: `${result.latencia_ms}ms` },
                    { label: 'Log Status', value: result.log_status },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
