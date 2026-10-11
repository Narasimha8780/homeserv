import { LogoMark } from '../ui/Logo';
import { WifiOff, RotateCw, Database } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-5" role="status" aria-live="polite">
      <div className="relative">
        <span className="absolute inset-0 rounded-[22px] bg-orange-500/40 blur-xl animate-pulse" />
        <LogoMark className="relative w-16 h-16" />
      </div>
      <div className="w-32 h-1 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 animate-[loading-bar_1.1s_ease-in-out_infinite]" />
      </div>
      <p className="text-sm text-ink-3 font-medium">Loading HomeServ…</p>
      <style>{`@keyframes loading-bar{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  );
}

function StatusLayout({ icon, title, children, onRetry, retryLabel }: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onRetry: () => void;
  retryLabel: string;
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center px-5">
      <div className="card !bg-surface-solid max-w-md w-full p-8 text-center animate-page-enter">
        <span className="w-16 h-16 mx-auto rounded-3xl bg-danger-soft text-danger-ink flex items-center justify-center">{icon}</span>
        <h1 className="mt-5 text-xl font-bold text-ink">{title}</h1>
        <div className="mt-2 text-sm text-ink-2 space-y-2">{children}</div>
        <button onClick={onRetry} className="btn btn-primary h-12 px-6 mt-6">
          <RotateCw className="w-4 h-4" />
          {retryLabel}
        </button>
      </div>
    </div>
  );
}

export function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <StatusLayout icon={<WifiOff className="w-7 h-7" />} title="Couldn't reach HomeServ" onRetry={onRetry} retryLabel="Try again">
      <p>Check your internet connection and try again.</p>
      <p className="text-xs text-ink-3">
        {message} · If you're running locally, start the API with <code className="font-mono">npm run server:dev</code>.
      </p>
    </StatusLayout>
  );
}

export function EmptyScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <StatusLayout icon={<Database className="w-7 h-7" />} title="No data yet" onRetry={onRetry} retryLabel="Reload">
      <p>
        Connected to the server, but the database is empty — no cities have been set up. Run the seed script (
        <code className="font-mono">npm run server:seed</code>), then reload.
      </p>
    </StatusLayout>
  );
}
