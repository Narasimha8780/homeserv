import React, { type ReactNode } from 'react';

export const EmptyState: React.FC<{
  icon: ReactNode;
  title: ReactNode;
  body?: ReactNode;
  action?: ReactNode;
  tone?: 'accent' | 'danger' | 'neutral';
}> = ({ icon, title, body, action, tone = 'neutral' }) => {
  const toneClass = {
    accent: 'bg-accent-soft text-accent-ink',
    danger: 'bg-danger-soft text-danger-ink',
    neutral: 'bg-surface-2 text-ink-3',
  }[tone];
  return (
    <div className="card px-6 py-10 text-center flex flex-col items-center">
      <span className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-4 ${toneClass}`}>{icon}</span>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      {body && <p className="text-sm text-ink-3 mt-1.5 max-w-sm leading-relaxed">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
