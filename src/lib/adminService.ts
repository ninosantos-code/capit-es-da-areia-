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

  // Settings (Links and Contact)
  async getSettings(): Promise<any> {
    const q = query(collection(db, 'settings'));
    const snapshot = await getDocs(q);
    const settings: any = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data();
    });
    // Return a default if empty
    return Object.keys(settings).length > 0 ? settings : {
      contact: {
        whatsapp1: '(75) 9921-1235',
        whatsapp1Link: '557599211235',
        whatsapp2: '(21) 98864-3166',
        whatsapp2Link: '5521988643166',
        instagram: '@capitaesdaareia',
        instagramLink: 'capitaesdaareiamorere',
        address: 'Praia de Moreré, s/n\nIlha de Boipeba, Cairu - BA'
      }
    };
  },

  async updateSettings(id: string, data: any) {
    const docRef = doc(db, 'settings', id);
    await updateDoc(docRef, data);
  },

  // Gallery
  async getGallery(): Promise<string[]> {
    const q = query(collection(db, 'gallery'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/650098100_18059250272426181_2033458607713035493_n.jpg',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/650837703_18059552462426181_6081456137423034486_n.webp',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/649555508_18059552474426181_1904247928205305178_n.webp',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/651889840_18059251376426181_4552180899044557139_n.jpg',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/650765726_18059249600426181_7400181766281724016_n.jpg',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/651541813_18059552450426181_5374245162380237564_n.webp',
      'https://instagram.fval2-1.fna.fbcdn.net/v/t51.82787-15/651492047_18059552498426181_2297765212161143916_n.webp'
    ];
    return snapshot.docs.map(doc => doc.data().url);
  },

  async addToGallery(url: string) {
    await addDoc(collection(db, 'gallery'), { url, createdAt: new Date() });
  },

  async removeFromGallery(id: string) {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};
