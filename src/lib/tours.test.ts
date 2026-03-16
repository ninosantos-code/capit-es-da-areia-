import { describe, it, expect, vi, beforeEach } from 'vitest';
import { adminService, Tour } from './adminService';
import { addDoc, deleteDoc, collection, doc } from 'firebase/firestore';

// Mocking Firebase
vi.mock('./firebase', () => ({
  db: { type: 'firestore' }
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
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp')
}));

describe('● Tours Management System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('○ Creation Flow', () => {
    it('should successfully add a new tour to Firestore', async () => {
      const mockTour: Omit<Tour, 'id'> = {
        title: 'New Desert Tour',
        description: 'An amazing trip to the sand dunes',
        duration: '4 hours',
        price: 'R$ 200',
        image: 'https://test.com/tour.jpg',
        iconType: 'sun'
      };

      (addDoc as any).mockResolvedValueOnce({ id: 'new-tour-id' });

      const result = await adminService.addTour(mockTour);

      expect(addDoc).toHaveBeenCalled();
      expect(result.id).toBe('new-tour-id');
      expect(result.title).toBe(mockTour.title);
    });
  });

  describe('○ Deletion Flow', () => {
    it('should call Firestore deleteDoc with correct reference', async () => {
      const tourId = 'tour-to-delete';
      await adminService.deleteTour(tourId);

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'tours', tourId);
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  describe('◌ Data Consistency', () => {
    it('should fetch all tours from the database', async () => {
      const mockTours = [
        { id: '1', title: 'Tour 1' },
        { id: '2', title: 'Tour 2' }
      ];
      
      const { getDocs } = await import('firebase/firestore');
      (getDocs as any).mockResolvedValueOnce({
        docs: mockTours.map(t => ({
          id: t.id,
          data: () => ({ title: t.title })
        }))
      });

      const tours = await adminService.getTours();
      
      expect(tours).toHaveLength(2);
      expect(tours[0].title).toBe('Tour 1');
    });
  });
});
