import { useState, useEffect } from 'react';

type ConnectionState = 'online' | 'offline';

function getConnectionState(): ConnectionState {
  if (typeof navigator !== 'undefined' && !navigator.onLine) return 'offline';
  return 'online';
}

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>(getConnectionState);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const newStatus = getConnectionState();
      setStatus(newStatus);
      setIsVisible(newStatus === 'offline');
    };

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    // Check periodically for connection status
    const interval = setInterval(update, 10000);

    // Initial check
    update();

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible || status !== 'offline') return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] bg-red-600 text-white py-2.5 px-4 text-center text-sm font-medium shadow-lg connection-banner">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636" />
        </svg>
        <span>Você está offline. O site pode mostrar conteúdo salvo anteriormente.</span>
        <button
          onClick={() => setIsVisible(false)}
          className="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
          aria-label="Fechar aviso"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
