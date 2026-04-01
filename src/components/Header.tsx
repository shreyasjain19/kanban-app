import { Search, Plus, Users, Tag, X, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';
import type { Task, TeamMember, Label } from '../types';

interface HeaderProps {
  tasks: Task[];
  members: TeamMember[];
  labels: Label[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterPriority: string;
  setFilterPriority: (p: string) => void;
  filterAssignee: string;
  setFilterAssignee: (a: string) => void;
  filterLabel: string;
  setFilterLabel: (l: string) => void;
  onNewTask: () => void;
  onTeamOpen: () => void;
  onLabelsOpen: () => void;
}

export function Header({
  tasks, members, labels,
  searchQuery, setSearchQuery,
  filterPriority, setFilterPriority,
  filterAssignee, setFilterAssignee,
  filterLabel, setFilterLabel,
  onNewTask, onTeamOpen, onLabelsOpen,
}: HeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;
  const overdueTasks = tasks.filter(t => {
    if (!t.due_date || t.status === 'done') return false;
    return new Date(t.due_date) < new Date();
  }).length;

  const hasActiveFilters = filterPriority || filterAssignee || filterLabel;

  const clearFilters = () => {
    setFilterPriority('');
    setFilterAssignee('');
    setFilterLabel('');
    setSearchQuery('');
  };

  return (
    <header style={{
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      {/* Top row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '0 24px',
        height: '56px',
      }}>
        {/* Logo */}
        <div style={{
          fontFamily: 'var(--font-display)',
          fontSize: '20px',
          fontWeight: 800,
          letterSpacing: '-0.5px',
          color: 'var(--text-primary)',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span style={{
            width: '26px', height: '26px',
            background: 'var(--accent-blue)',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 800, color: '#fff',
          }}>F</span>
          Flow
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'var(--border)', flexShrink: 0 }} />

        {/* Stats */}
        <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
          <Stat label="Total" value={totalTasks} />
          <Stat label="Done" value={doneTasks} color="var(--accent-green)" />
          {overdueTasks > 0 && <Stat label="Overdue" value={overdueTasks} color="var(--accent-red)" />}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Search */}
        <div style={{ position: 'relative', width: '220px' }}>
          <Search size={13} style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Search tasks…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              fontSize: '13px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', display: 'flex',
            }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setFiltersOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-md)',
            background: filtersOpen || hasActiveFilters ? 'var(--accent-blue-soft)' : 'transparent',
            color: filtersOpen || hasActiveFilters ? 'var(--accent-blue)' : 'var(--text-secondary)',
            fontSize: '13px', fontWeight: 500,
            transition: 'all 0.15s',
            position: 'relative',
          }}
        >
          <SlidersHorizontal size={13} />
          Filters
          {hasActiveFilters && (
            <span style={{
              position: 'absolute', top: '-4px', right: '-4px',
              width: '8px', height: '8px',
              background: 'var(--accent-blue)',
              borderRadius: '50%',
            }} />
          )}
        </button>

        {/* Team */}
        <button onClick={onTeamOpen} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '13px', fontWeight: 500,
          transition: 'all 0.15s',
        }}>
          <Users size={13} />
          Team
        </button>

        {/* Labels */}
        <button onClick={onLabelsOpen} style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          background: 'transparent',
          color: 'var(--text-secondary)',
          fontSize: '13px', fontWeight: 500,
          transition: 'all 0.15s',
        }}>
          <Tag size={13} />
          Labels
        </button>

        {/* New Task */}
        <button
          onClick={onNewTask}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--accent-blue)',
            color: '#fff',
            fontSize: '13px', fontWeight: 600,
            transition: 'all 0.15s',
            boxShadow: '0 1px 4px rgba(59,130,246,0.4)',
          }}
        >
          <Plus size={14} />
          New Task
        </button>
      </div>

      {/* Filters row */}
      {filtersOpen && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 24px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-base)',
          animation: 'fadeIn 0.15s ease-out',
        }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>Filter by:</span>

          {/* Priority */}
          <select
            value={filterPriority}
            onChange={e => setFilterPriority(e.target.value)}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)', minWidth: '110px' }}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>

          {/* Assignee */}
          <select
            value={filterAssignee}
            onChange={e => setFilterAssignee(e.target.value)}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)', minWidth: '130px' }}
          >
            <option value="">All members</option>
            {members.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Label */}
          <select
            value={filterLabel}
            onChange={e => setFilterLabel(e.target.value)}
            style={{ padding: '5px 10px', fontSize: '12px', borderRadius: 'var(--radius-sm)', minWidth: '120px' }}
          >
            <option value="">All labels</option>
            {labels.map(l => (
              <option key={l.id} value={l.id}>{l.name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button onClick={clearFilters} style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '12px', color: 'var(--accent-red)', fontWeight: 500,
            }}>
              <X size={11} /> Clear
            </button>
          )}
        </div>
      )}
    </header>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
      <span style={{ fontSize: '16px', fontWeight: 700, color: color || 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </div>
  );
}
