import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService } from './adminService';
import { db } from './firebase';
import { getDocs, addDoc, deleteDoc, collection } from 'firebase/firestore';

// Mocking Firebase
vi.mock('./firebase', () => ({
  db: {
    type: 'firestore'
  }
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  getDocs: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  updateDoc: vi.fn(),
  setDoc: vi.fn()
}));

describe('● Gallery Logic & Sync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('○ Data Retrieval', () => {
    it('should return default photos when the database is empty', async () => {
      (getDocs as any).mockResolvedValueOnce({ empty: true, docs: [] });
      
      const gallery = await adminService.getGallery();
      
      expect(gallery.length).toBeGreaterThan(0);
      expect(gallery[0].source).toBe('default');
    });

    it('should identify photos coming from Firestore', async () => {
      (getDocs as any).mockResolvedValueOnce({
        empty: false,
        docs: [
          { id: 'fire123', data: () => ({ url: 'https://test.com/1.jpg' }) }
        ]
      });

      const gallery = await adminService.getGallery();
      
      expect(gallery[0].id).toBe('fire123');
      expect(gallery[0].source).toBe('firestore');
    });
  });

  describe('○ Instagram Integration', () => {
    it('should fetch and tag Instagram posts correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve([
          { id: 'insta1', mediaUrl: 'https://insta.com/1.jpg', mediaType: 'IMAGE', permalink: 'https://insta.com/p/1' }
        ])
      });
      global.fetch = mockFetch;

      const feed = await adminService.getInstagramFeed('https://feeds.behold.so/test');
      
      expect(feed[0].source).toBe('instagram');
      expect(feed[0].id).toBe('insta1');
    });
  });

  describe('◌ Modification Actions', () => {
    it('should prevent adding empty URLs', async () => {
      await expect(adminService.addToGallery('')).rejects.toThrow('URL é obrigatória');
    });

    it('should call Firestore addDoc when adding a photo', async () => {
      await adminService.addToGallery('https://newphoto.com/img.jpg');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should call Firestore deleteDoc when removing a photo', async () => {
      await adminService.removeFromGallery('photoId');
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
