import { useState, useEffect } from 'react';

type ConnectionState = 'online' | 'offline' | 'slow';

function getConnectionState(): ConnectionState {
  if (!navigator.onLine) return 'offline';

  const conn = (navigator as any).connection;
  if (conn) {
    // effectiveType: 'slow-2g', '2g', '3g', '4g'
    if (conn.effectiveType === 'slow-2g' || conn.effectiveType === '2g') {
      return 'slow';
    }
    // downlink in Mbps — below 0.5 Mbps is very slow
    if (conn.downlink !== undefined && conn.downlink < 0.5) {
      return 'slow';
    }
  }

  return 'online';
}

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>(getConnectionState);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const update = () => {
      const newStatus = getConnectionState();
      setStatus(newStatus);
      setIsVisible(newStatus !== 'online');
    };

    window.addEventListener('online', update);
    window.addEventListener('offline', update);

    const conn = (navigator as any).connection;
    if (conn) {
      conn.addEventListener('change', update);
    }

    // Check periodically for slow connections
    const interval = setInterval(update, 10000);

    // Initial check
    update();

    return () => {
      window.removeEventListener('online', update);
      window.removeEventListener('offline', update);
      if (conn) conn.removeEventListener('change', update);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) return null;

  const config = {
    offline: {
      bg: 'bg-red-600',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      text: 'Você está offline. O site pode mostrar conteúdo salvo anteriormente.',
    },
    slow: {
      bg: 'bg-amber-600',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
      text: 'Conexão lenta detectada. As imagens podem demorar para carregar.',
    },
  };

  const current = config[status as 'offline' | 'slow'];
  if (!current) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] ${current.bg} text-white py-2.5 px-4 text-center text-sm font-medium shadow-lg connection-banner`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {current.icon}
        <span>{current.text}</span>
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
