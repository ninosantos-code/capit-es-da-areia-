import { describe, it, expect, vi, beforeEach } from 'vitest';

// ● Mock do Firebase
vi.mock('./firebase', () => ({
  db: {},
}));

const mockOnSnapshot = vi.fn();
const mockGetDocs = vi.fn();

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mock-collection'),
  getDocs: (...args: any[]) => mockGetDocs(...args),
  doc: vi.fn(() => 'mock-doc'),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(() => Promise.resolve({ id: 'new-id' })),
  deleteDoc: vi.fn(),
  query: vi.fn((...args: any[]) => args),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  writeBatch: vi.fn(() => ({ set: vi.fn(), commit: vi.fn(() => Promise.resolve()) })),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
}));

import { adminService } from './adminService';

describe('AdminService — Conexão e Erros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    adminService._connectionListeners = [];
  });

  // ────────────────────────────────────────────────
  // ● Sistema de Notificação de Conexão
  // ────────────────────────────────────────────────

  it('● deve registrar e desregistrar listeners de conexão', () => {
    const listener = vi.fn();
    const unsub = adminService.onConnectionChange(listener);

    expect(adminService._connectionListeners).toHaveLength(1);

    unsub();
    expect(adminService._connectionListeners).toHaveLength(0);
  });

  it('● deve notificar listeners quando a conexão muda', () => {
    const listener = vi.fn();
    adminService.onConnectionChange(listener);

    adminService._notifyConnection(true);
    expect(listener).toHaveBeenCalledWith(true, undefined);

    adminService._notifyConnection(false, 'Erro de teste');
    expect(listener).toHaveBeenCalledWith(false, 'Erro de teste');
  });

  // ────────────────────────────────────────────────
  // ● Tratamento de Erros de Snapshot
  // ────────────────────────────────────────────────

  it('● deve identificar erro PERMISSION_DENIED como API desabilitada', () => {
    const listener = vi.fn();
    adminService.onConnectionChange(listener);

    const handler = adminService._handleSnapshotError('tours');
    handler({ message: 'PERMISSION_DENIED: Cloud Firestore API disabled' });

    expect(listener).toHaveBeenCalledWith(false, expect.stringContaining('desabilitada'));
  });

  it('● deve identificar erro UNAVAILABLE como Firestore indisponível', () => {
    const listener = vi.fn();
    adminService.onConnectionChange(listener);

    const handler = adminService._handleSnapshotError('gallery');
    handler({ message: 'UNAVAILABLE: Service temporarily down' });

    expect(listener).toHaveBeenCalledWith(false, expect.stringContaining('indisponível'));
  });

  it('● deve passar mensagem genérica para erros desconhecidos', () => {
    const listener = vi.fn();
    adminService.onConnectionChange(listener);

    const handler = adminService._handleSnapshotError('settings');
    handler({ message: 'Some unknown error' });

    expect(listener).toHaveBeenCalledWith(false, expect.stringContaining('Some unknown error'));
  });

  // ────────────────────────────────────────────────
  // ● Subscriptions com Error Handler
  // ────────────────────────────────────────────────

  it('● subscribeToTours deve passar callback de erro para onSnapshot', () => {
    mockOnSnapshot.mockReturnValue(vi.fn());

    const callback = vi.fn();
    adminService.subscribeToTours(callback);

    // onSnapshot deve ter sido chamado com 3 argumentos (query, success, error)
    expect(mockOnSnapshot).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.any(Function)
    );
  });

  it('● subscribeToTours deve notificar conexão OK ao receber dados', () => {
    let successCb: any;
    mockOnSnapshot.mockImplementation((_q: any, onSuccess: any, _onError: any) => {
      successCb = onSuccess;
      return vi.fn();
    });

    const connectionListener = vi.fn();
    adminService.onConnectionChange(connectionListener);

    const callback = vi.fn();
    adminService.subscribeToTours(callback);

    // Simula recebimento de dados
    successCb({ docs: [] });

    expect(connectionListener).toHaveBeenCalledWith(true, undefined);
    expect(callback).toHaveBeenCalledWith([]);
  });

  // ────────────────────────────────────────────────
  // ● Verificação de Senha
  // ────────────────────────────────────────────────

  it('● verifyPassword deve aceitar senha correta', () => {
    expect(adminService.verifyPassword('Lagosta@7')).toBe(true);
  });

  it('● verifyPassword deve rejeitar senha incorreta', () => {
    expect(adminService.verifyPassword('senhaerrada')).toBe(false);
    expect(adminService.verifyPassword('')).toBe(false);
  });
});
