import { useState, useEffect } from 'react';
import { adminService } from '../lib/adminService';

type ConnectionState = 'online' | 'offline' | 'firestore-error';

export default function ConnectionStatus() {
  const [status, setStatus] = useState<ConnectionState>('online');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listener de rede (online/offline)
    const updateNetwork = () => {
      if (!navigator.onLine) {
        setStatus('offline');
        setErrorMessage('');
        setIsVisible(true);
      } else if (status === 'offline') {
        // Voltou online — esconder após breve delay
        setIsVisible(false);
      }
    };

    window.addEventListener('online', updateNetwork);
    window.addEventListener('offline', updateNetwork);

    // Listener de conexão com o Firestore
    const unsubFirestore = adminService.onConnectionChange((connected, error) => {
      if (!connected && error) {
        setStatus('firestore-error');
        setErrorMessage(error);
        setIsVisible(true);
      } else if (connected && status === 'firestore-error') {
        setStatus('online');
        setErrorMessage('');
        setIsVisible(false);
      }
    });

    return () => {
      window.removeEventListener('online', updateNetwork);
      window.removeEventListener('offline', updateNetwork);
      unsubFirestore();
    };
  }, [status]);

  if (!isVisible) return null;

  const bgColor = status === 'offline' 
    ? 'bg-red-600' 
    : 'bg-amber-600';

  const message = status === 'offline'
    ? 'Você está offline. O site pode mostrar conteúdo salvo anteriormente.'
    : errorMessage || 'Erro de conexão com o banco de dados.';

  const icon = status === 'offline'
    ? (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-12.728-12.728m12.728 12.728L5.636 5.636" />
      </svg>
    )
    : (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    );

  return (
    <div className={`fixed top-0 left-0 right-0 z-[200] ${bgColor} text-white py-2.5 px-4 text-center text-sm font-medium shadow-lg connection-banner`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {icon}
        <span>{message}</span>
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
