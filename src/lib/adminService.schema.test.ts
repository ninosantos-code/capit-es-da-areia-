import { describe, it, expect, vi } from 'vitest';
import { adminService } from './adminService';

// ● Mocks do Firestore já configurados em outros arquivos,
// mas vamos garantir que as funções de dados retornem o esperado.
vi.mock('./firebase', () => ({
  db: {},
}));

const mockAddDoc = vi.fn(() => Promise.resolve({ id: 'new-id' }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ id: 'mock-coll' })),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: (...args: any[]) => mockAddDoc(...args),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  where: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  onSnapshot: vi.fn(),
}));

describe('AdminService — Integridade do Novo Esquema', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // ────────────────────────────────────────────────
  // ● Passeios (Tours)
  // ────────────────────────────────────────────────
  
  it('● deve adicionar um tour com preço numérico e imageUrl', async () => {
    const tourData = {
      title: 'Teste',
      description: 'Desc',
      duration: '1h',
      price: 150.50,
      imageUrl: 'http://img.jpg',
      iconType: 'sun',
      visible: true
    };

    await adminService.addTour(tourData);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        price: 150.50,
        imageUrl: 'http://img.jpg',
        createdAt: 'mock-timestamp'
      })
    );
  });

  // ────────────────────────────────────────────────
  // ● Galeria (GalleryImage)
  // ────────────────────────────────────────────────

  it('● deve adicionar imagem à galeria com caption', async () => {
    const imageData = {
      url: 'http://img.jpg',
      source: 'firestore',
      caption: 'Uma bela vista'
    };

    await adminService.addToGallery(imageData);

    expect(mockAddDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        caption: 'Uma bela vista',
        source: 'firestore'
      })
    );
  });

  // ────────────────────────────────────────────────
  // ● Autenticação
  // ────────────────────────────────────────────────

  it('● deve validar a senha mestre administrativa', () => {
    expect(adminService.verifyPassword('Lagosta@7')).toBe(true);
    expect(adminService.verifyPassword('errada')).toBe(false);
  });

});
