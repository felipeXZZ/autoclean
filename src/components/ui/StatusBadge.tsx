import React from 'react';
import { cn } from '../../lib/utils';
import type { AppointmentStatus } from '../../types';

const config: Record<AppointmentStatus, { label: string; classes: string }> = {
  pending:   { label: 'Pendente',         classes: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado',       classes: 'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400'  },
  completed: { label: 'Concluído',        classes: 'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400'   },
  cancelled: { label: 'Cancelado',        classes: 'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400'    },
  no_show:   { label: 'Não compareceu',   classes: 'bg-slate-100  text-slate-700  dark:bg-slate-800      dark:text-slate-400'  },
};

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { label, classes } = config[status] ?? config.pending;
  return (
    <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider', classes, className)}>
      {label}
    </span>
  );
}
