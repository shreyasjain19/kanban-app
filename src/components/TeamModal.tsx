import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import type { TeamMember } from '../types';

const PRESET_COLORS = [
  '#3b82f6', '#a855f7', '#10b981', '#f59e0b',
  '#ef4444', '#06b6d4', '#ec4899', '#84cc16',
];

interface TeamModalProps {
  members: TeamMember[];
  onCreate: (name: string, color: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function TeamModal({ members, onCreate, onDelete, onClose }: TeamModalProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) { setError('Name is required'); return; }
    setAdding(true);
    setError('');
    try {
      await onCreate(name.trim(), color);
      setName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  return (
    <Modal title="Team Members" onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Existing members */}
        {members.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px',
                background: 'var(--bg-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: m.color, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '11px', fontWeight: 700, color: '#fff',
                }}>
                  {m.initials}
                </div>
                <span style={{ flex: 1, fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                  {m.name}
                </span>
                <button onClick={() => onDelete(m.id)} style={{
                  padding: '4px', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'all 0.15s',
                }}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {members.length === 0 && (
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '16px' }}>
            No team members yet. Add your first one below.
          </p>
        )}

        {/* Add new */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Add Member
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Member name"
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

          {/* Color picker */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: '24px', height: '24px',
                  borderRadius: '50%',
                  background: c,
                  border: `2px solid ${color === c ? '#fff' : 'transparent'}`,
                  outline: color === c ? `2px solid ${c}` : 'none',
                  outlineOffset: '1px',
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          {error && <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '6px' }}>{error}</p>}
        </div>
      </div>
    </Modal>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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
            {title}
          </h2>
          <button onClick={onClose} style={{
            padding: '6px', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center',
          }}>
            <X size={14} />
          </button>
        </div>
        <div style={{ padding: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
