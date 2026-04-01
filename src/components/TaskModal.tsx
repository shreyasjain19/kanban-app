import { useState, useEffect, useRef } from 'react';
import { X, Trash2, Flag, Calendar, User, Tag, MessageSquare, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { useComments } from '../hooks/useComments';
import { useActivityLogs } from '../hooks/useActivityLogs';
import type { Task, TeamMember, Label, Priority, Status } from '../types';

interface TaskModalProps {
  mode: 'create' | 'edit';
  task?: Task;
  initialStatus?: string;
  members: TeamMember[];
  labels: Label[];
  userId?: string;
  onSubmit: (data: Partial<Task> & { label_ids?: string[] }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onClose: () => void;
}

const STATUSES: { id: Status; label: string }[] = [
  { id: 'todo', label: 'To Do' },
  { id: 'in_progress', label: 'In Progress' },
  { id: 'in_review', label: 'In Review' },
  { id: 'done', label: 'Done' },
];

export function TaskModal({ mode, task, initialStatus, members, labels, userId, onSubmit, onDelete, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<Status>((task?.status || initialStatus || 'todo') as Status);
  const [priority, setPriority] = useState<Priority>(task?.priority || 'normal');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [assigneeId, setAssigneeId] = useState(task?.assignee_id || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>(task?.label_ids || []);
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'activity'>('details');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [addingComment, setAddingComment] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const { comments, addComment } = useComments(task?.id, userId);
  const { logs } = useActivityLogs(task?.id);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        due_date: dueDate || undefined,
        assignee_id: assigneeId || undefined,
        label_ids: selectedLabels,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
      setSubmitting(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setAddingComment(true);
    try {
      await addComment(commentText.trim());
      setCommentText('');
    } finally {
      setAddingComment(false);
    }
  };

  const toggleLabel = (id: string) => {
    setSelectedLabels(prev => prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]);
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
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
        width: '100%',
        maxWidth: mode === 'edit' ? '760px' : '520px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        overflow: 'hidden',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '16px', fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {mode === 'create' ? 'New Task' : 'Edit Task'}
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            {mode === 'edit' && onDelete && (
              confirmDelete ? (
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sure?</span>
                  <button onClick={async () => { await onDelete(); }} style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-red)', color: '#fff',
                    fontSize: '12px', fontWeight: 600,
                  }}>Delete</button>
                  <button onClick={() => setConfirmDelete(false)} style={{
                    padding: '4px 10px', borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)', fontSize: '12px',
                    color: 'var(--text-secondary)',
                  }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} style={{
                  padding: '6px', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center',
                  transition: 'all 0.15s',
                }}>
                  <Trash2 size={14} />
                </button>
              )
            )}
            <button onClick={onClose} style={{
              padding: '6px', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center',
            }}>
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs (edit mode only) */}
        {mode === 'edit' && (
          <div style={{
            display: 'flex', gap: '2px',
            padding: '10px 20px 0',
            borderBottom: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            {([
              { id: 'details', icon: <Flag size={12} />, label: 'Details' },
              { id: 'comments', icon: <MessageSquare size={12} />, label: `Comments${comments.length ? ` (${comments.length})` : ''}` },
              { id: 'activity', icon: <Activity size={12} />, label: 'Activity' },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '8px 12px',
                  fontSize: '12px', fontWeight: 600,
                  color: activeTab === tab.id ? 'var(--accent-blue)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${activeTab === tab.id ? 'var(--accent-blue)' : 'transparent'}`,
                  marginBottom: '-1px',
                  transition: 'all 0.15s',
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {(mode === 'create' || activeTab === 'details') && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  ref={titleRef}
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  style={{ ...inputStyle, fontSize: '14px', fontWeight: 500 }}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) handleSubmit(); }}
                />
                {error && <p style={{ color: 'var(--accent-red)', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Add more context…"
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {/* Status */}
                <div>
                  <label style={labelStyle}><Flag size={11} /> Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value as Status)} style={inputStyle}>
                    {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label style={labelStyle}><Flag size={11} /> Priority</label>
                  <select value={priority} onChange={e => setPriority(e.target.value as Priority)} style={inputStyle}>
                    <option value="high">High</option>
                    <option value="normal">Normal</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                {/* Due date */}
                <div>
                  <label style={labelStyle}><Calendar size={11} /> Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    style={{ ...inputStyle, colorScheme: 'dark' }}
                  />
                </div>

                {/* Assignee */}
                <div>
                  <label style={labelStyle}><User size={11} /> Assignee</label>
                  <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} style={inputStyle}>
                    <option value="">Unassigned</option>
                    {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Labels */}
              {labels.length > 0 && (
                <div>
                  <label style={labelStyle}><Tag size={11} /> Labels</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                    {labels.map(label => {
                      const selected = selectedLabels.includes(label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => toggleLabel(label.id)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px', fontWeight: 600,
                            border: `1px solid ${selected ? label.color : label.color + '40'}`,
                            background: selected ? label.color + '25' : 'transparent',
                            color: selected ? label.color : 'var(--text-secondary)',
                            transition: 'all 0.15s',
                          }}
                        >
                          {label.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Comments tab */}
          {mode === 'edit' && activeTab === 'comments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {comments.length === 0 && (
                <EmptyTabState icon={<MessageSquare size={20} />} text="No comments yet. Be the first to comment." />
              )}
              {comments.map(c => (
                <div key={c.id} style={{
                  padding: '12px 14px',
                  background: 'var(--bg-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-blue)' }}>Guest</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {format(new Date(c.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                    {c.content}
                  </p>
                </div>
              ))}

              {/* Add comment */}
              <div style={{ marginTop: '8px' }}>
                <textarea
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment…"
                  rows={3}
                  style={{ ...inputStyle, width: '100%', resize: 'vertical' }}
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim() || addingComment}
                  style={{
                    marginTop: '8px',
                    padding: '8px 16px',
                    background: 'var(--accent-blue)',
                    color: '#fff',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '13px', fontWeight: 600,
                    opacity: !commentText.trim() || addingComment ? 0.5 : 1,
                    cursor: !commentText.trim() || addingComment ? 'not-allowed' : 'pointer',
                  }}
                >
                  {addingComment ? 'Posting…' : 'Post Comment'}
                </button>
              </div>
            </div>
          )}

          {/* Activity tab */}
          {mode === 'edit' && activeTab === 'activity' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {logs.length === 0 && (
                <EmptyTabState icon={<Activity size={20} />} text="No activity recorded yet." />
              )}
              {logs.map((log, i) => (
                <div key={log.id} style={{
                  display: 'flex', gap: '12px', alignItems: 'flex-start',
                  padding: '10px 0',
                  borderBottom: i < logs.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                }}>
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Activity size={12} color="var(--text-muted)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.4 }}>{log.action}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {format(new Date(log.created_at), 'MMM d, yyyy · h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {(mode === 'create' || activeTab === 'details') && (
          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: '8px',
            padding: '14px 20px',
            borderTop: '1px solid var(--border-subtle)',
            flexShrink: 0,
          }}>
            <button onClick={onClose} style={{
              padding: '8px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: '13px', fontWeight: 500,
            }}>
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !title.trim()}
              style={{
                padding: '8px 20px',
                background: 'var(--accent-blue)',
                color: '#fff',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px', fontWeight: 600,
                opacity: submitting || !title.trim() ? 0.6 : 1,
                cursor: submitting || !title.trim() ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 4px rgba(59,130,246,0.4)',
              }}
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyTabState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      padding: '40px 20px', color: 'var(--text-muted)', textAlign: 'center',
    }}>
      {icon}
      <p style={{ fontSize: '13px' }}>{text}</p>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '4px',
  fontSize: '11px', fontWeight: 600,
  color: 'var(--text-secondary)',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  marginBottom: '6px',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  fontSize: '13px',
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-md)',
  color: 'var(--text-primary)',
};
