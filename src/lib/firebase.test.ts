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
    expect(firebaseConfig.projectId).toBe('capitaesdaareia-8cd73');
    expect(firebaseConfig.appId).toBe('1:849754146663:web:be53ff7af02a84692c11c2');
    expect(firebaseConfig.measurementId).toBe('G-WPQSJ6L32H');
  });

  it('● deve exportar as credenciais completas', () => {
    expect(firebaseConfig.apiKey).toBe('AIzaSyAVWPV39_jYk3ZQgPatl3KZK0SyybtYFEs');
    expect(firebaseConfig.authDomain).toBe('capitaesdaareia-8cd73.firebaseapp.com');
    expect(firebaseConfig.storageBucket).toBe('capitaesdaareia-8cd73.firebasestorage.app');
  });
});
