import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { Label } from '../types';

const PRESET_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
  '#f97316', '#14b8a6',
];

interface LabelsModalProps {
  labels: Label[];
  onCreate: (name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function LabelsModal({ labels, onCreate, onDelete, onClose }: LabelsModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('Label name is required'); return; }
    setAdding(true);
    setError('');
    try {
      await onCreate(name.trim(), color);
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create label');
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-scale-in" style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl)',
        width: '100%', maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Labels
          </h2>
          <button onClick={onClose} style={{
            padding: '6px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
          }}>
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Existing labels */}
          {labels.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {labels.map(l => (
                <div key={l.id} style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '5px 10px',
                  background: l.color + '20',
                  border: `1px solid ${l.color}40`,
                  borderRadius: '20px',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: l.color }}>{l.name}</span>
                  <button onClick={() => onDelete(l.id)} style={{
                    display: 'flex', alignItems: 'center',
                    color: l.color, opacity: 0.7,
                  }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {labels.length === 0 && (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '8px' }}>
              No labels yet. Create one below.
            </p>
          )}

          {/* Add new */}
          <div style={{ borderTop: labels.length > 0 ? '1px solid var(--border-subtle)' : 'none', paddingTop: labels.length > 0 ? '16px' : '0' }}>
            <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Create Label
            </p>

            {/* Preview */}
            {name && (
              <div style={{ marginBottom: '10px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 600,
                  padding: '3px 10px', borderRadius: '20px',
                  background: color + '25', color: color,
                  border: `1px solid ${color}40`,
                }}>
                  {name}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Label name (e.g. Bug, Feature)"
                style={{ flex: 1, padding: '8px 12px', fontSize: '13px', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
              />
              <button onClick={handleAdd} disabled={adding} style={{
                padding: '8px 14px',
                background: 'var(--accent-blue)', color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '4px',
              }}>
                <Plus size={13} /> Add
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: '24px', height: '24px', borderRadius: '50%',
                    background: c,
                    border: `2px solid ${color === c ? '#fff' : 'transparent'}`,
                    outline: color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '1px',
                    transition: 'all 0.15s', cursor: 'pointer',
                  }}
                />
              ))}
            </div>
            {error && <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}


