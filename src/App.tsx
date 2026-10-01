import { AppProvider, useApp } from './context/AppContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { CustomerApp } from './components/customer/CustomerApp';
import { CaptainApp } from './components/captain/CaptainApp';
import { AdminApp } from './components/admin/AdminApp';
import { CityModal } from './components/customer/CityModal';
import { useState } from 'react';
import { AlertTriangle, RotateCw, Inbox } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-3">
      <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="text-sm text-slate-500 font-medium">Loading HomeServ...</p>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <AlertTriangle className="w-10 h-10 text-rose-500" />
      <p className="text-sm font-bold text-slate-800">Couldn't reach the HomeServ server</p>
      <p className="text-xs text-slate-500 max-w-sm">{message}</p>
      <p className="text-xs text-slate-400 max-w-sm">
        Make sure the API server is running (<code className="font-mono">npm run server:dev</code>).
      </p>
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
      >
        <RotateCw className="w-3.5 h-3.5" />
        Retry
      </button>
    </div>
  );
}

function EmptyScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-[#F5F7FA] flex flex-col items-center justify-center gap-3 px-6 text-center">
      <Inbox className="w-10 h-10 text-slate-400" />
      <p className="text-sm font-bold text-slate-800">No data yet</p>
      <p className="text-xs text-slate-500 max-w-sm">
        Connected to the server, but the database is empty — no cities have been set up. Run the seed script
        (<code className="font-mono">npm run server:seed</code>), then reload.
      </p>
      <button
        onClick={onRetry}
        className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
      >
        <RotateCw className="w-3.5 h-3.5" />
        Reload
      </button>
    </div>
  );
}

function AppShell() {
  const { role, isLoading, loadError, allCities, resetToDefault } = useApp();
  const [isCityModalOpen, setCityModalOpen] = useState(false);

  if (isLoading) return <LoadingScreen />;
  if (loadError) return <ErrorScreen message={loadError} onRetry={resetToDefault} />;
  if (allCities.length === 0) return <EmptyScreen onRetry={resetToDefault} />;

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <RoleSwitcherBar onOpenCityModal={() => setCityModalOpen(true)} />

      {role === 'customer' && <CustomerApp />}
      {role === 'captain' && <CaptainApp />}
      {role === 'admin' && <AdminApp />}

      <CityModal isOpen={isCityModalOpen} onClose={() => setCityModalOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}

export default App;
