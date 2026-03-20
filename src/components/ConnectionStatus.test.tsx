import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ConnectionStatus from './ConnectionStatus';

// ● Mock do adminService
vi.mock('../lib/adminService', () => ({
  adminService: {
    onConnectionChange: vi.fn((callback) => {
      // Armazena o callback para podermos chamá-lo nos testes
      (globalThis as any).__firestoreConnectionCallback = callback;
      return vi.fn(); // unsubscribe
    }),
  },
}));

describe('ConnectionStatus Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Simula navigator.onLine = true por padrão
    Object.defineProperty(navigator, 'onLine', { value: true, writable: true, configurable: true });
  });

  // ────────────────────────────────────────────────
  // ● Comportamento Padrão
  // ────────────────────────────────────────────────

  it('● não deve exibir nada quando tudo está online', () => {
    render(<ConnectionStatus />);
    // Não deve haver banner visível
    expect(screen.queryByText(/offline/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/erro/i)).not.toBeInTheDocument();
  });

  // ────────────────────────────────────────────────
  // ● Detecção de Rede Offline
  // ────────────────────────────────────────────────

  it('● deve exibir banner vermelho quando a rede cai (navigator.onLine = false)', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true });
    
    render(<ConnectionStatus />);
    
    // Dispara evento offline
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  // ────────────────────────────────────────────────
  // ● Detecção de Erros do Firestore
  // ────────────────────────────────────────────────

  it('● deve exibir banner amber quando o Firestore reporta erro', () => {
    render(<ConnectionStatus />);

    // Simula erro do Firestore via callback
    act(() => {
      const cb = (globalThis as any).__firestoreConnectionCallback;
      if (cb) cb(false, 'API do Firestore desabilitada. Ative no Console Firebase.');
    });

    expect(screen.getByText(/Firestore desabilitada/i)).toBeInTheDocument();
  });

  it('● deve esconder banner quando o Firestore reconecta após erro', () => {
    render(<ConnectionStatus />);

    // Simula erro
    act(() => {
      const cb = (globalThis as any).__firestoreConnectionCallback;
      if (cb) cb(false, 'Firestore indisponível.');
    });

    expect(screen.getByText(/indisponível/i)).toBeInTheDocument();

    // Simula reconexão
    act(() => {
      const cb = (globalThis as any).__firestoreConnectionCallback;
      if (cb) cb(true);
    });

    expect(screen.queryByText(/indisponível/i)).not.toBeInTheDocument();
  });

  // ────────────────────────────────────────────────
  // ● Botão Fechar
  // ────────────────────────────────────────────────

  it('● deve permitir fechar o banner manualmente', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    render(<ConnectionStatus />);

    // Mostra banner de erro
    act(() => {
      const cb = (globalThis as any).__firestoreConnectionCallback;
      if (cb) cb(false, 'Erro de conexão: timeout');
    });

    expect(screen.getByText(/timeout/i)).toBeInTheDocument();

    // Clica no botão fechar
    const closeBtn = screen.getByLabelText('Fechar aviso');
    await user.click(closeBtn);

    expect(screen.queryByText(/timeout/i)).not.toBeInTheDocument();
  });
});
