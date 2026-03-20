import { describe, it, expect, vi } from 'vitest';

// ● Mock completo do Firebase para evitar chamadas reais
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({})),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
}));

import { firebaseConfig } from './firebase';

describe('Firebase Configuration', () => {
  it('● deve ter a configuração correta do projeto', () => {
    expect(firebaseConfig.projectId).toBe('capitaes-48bab');
    expect(firebaseConfig.appId).toBe('1:535964867514:web:6fd22b7f612d550732db83');
    expect(firebaseConfig.measurementId).toBe('G-7CX4YQEBXQ');
  });

  it('● deve exportar as credenciais completas', () => {
    expect(firebaseConfig.apiKey).toBeDefined();
    expect(firebaseConfig.authDomain).toBe('capitaes-48bab.firebaseapp.com');
    expect(firebaseConfig.storageBucket).toBe('capitaes-48bab.firebasestorage.app');
  });
});
