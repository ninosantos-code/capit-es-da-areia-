import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export interface Tour {
  id?: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  iconType: string; // 'sun', 'camera', 'star', 'logo'
}

export interface Testimonial {
  id?: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
}

export const adminService = {
  // Tours
  async getTours(): Promise<Tour[]> {
    const q = query(collection(db, 'tours'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
  },

  async updateTour(id: string, data: Partial<Tour>) {
    const docRef = doc(db, 'tours', id);
    await updateDoc(docRef, data);
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const q = query(collection(db, 'testimonials'), orderBy('approved', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
  },

  async approveTestimonial(id: string) {
    const docRef = doc(db, 'testimonials', id);
    await updateDoc(docRef, { approved: true });
  },

  async deleteTestimonial(id: string) {
    const docRef = doc(db, 'testimonials', id);
    await deleteDoc(docRef);
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};
