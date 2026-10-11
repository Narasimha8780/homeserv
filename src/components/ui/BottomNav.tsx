import React from 'react';

export interface BottomNavItem<T extends string> {
  id: T;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

// Floating Material-3-style navigation dock for phones and the Android app. Sits above
// the gesture/navigation bar using the safe-area inset.
export function BottomNav<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: BottomNavItem<T>[];
  active: T | null;
  onSelect: (id: T) => void;
}) {
  return (
    <nav
      className="sm:hidden fixed inset-x-3 z-40 glass border border-line-strong rounded-[1.6rem] shadow-pop"
      style={{ bottom: 'calc(0.75rem + var(--sa-bottom))' }}
    >
      <ul className="flex items-stretch justify-around px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === active;
          return (
            <li key={item.id} className="flex-1">
              <button
                onClick={() => onSelect(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className="w-full flex flex-col items-center gap-0.5 pt-2 pb-1.5"
              >
                <span
                  className={`relative flex items-center justify-center h-8 w-14 rounded-full transition-colors duration-200 ${
                    isActive ? 'bg-accent-soft text-accent-ink' : 'text-ink-3'
                  }`}
                >
                  <Icon className="w-[22px] h-[22px]" strokeWidth={isActive ? 2.4 : 2} />
                  {!!item.badge && (
                    <span className="absolute top-0 right-2.5 min-w-4 h-4 px-1 rounded-full bg-accent text-on-accent text-[10px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-semibold ${isActive ? 'text-ink' : 'text-ink-3'}`}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
