import { describe, it, expect, vi } from 'vitest';
import { app, firebaseConfig } from './firebase';
import { getAnalytics } from 'firebase/analytics';

vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({ name: '[DEFAULT]' })),
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(),
}));

describe('Firebase Configuration', () => {
  it('should have the correct project configuration', () => {
    expect(firebaseConfig.projectId).toBe('capitaes-48bab');
    expect(firebaseConfig.appId).toBe('1:535964867514:web:6fd22b7f612d550732db83');
    expect(firebaseConfig.measurementId).toBe('G-7CX4YQEBXQ');
  });

  it('should export the initialized app instance', () => {
    expect(app).toBeDefined();
  });
});
