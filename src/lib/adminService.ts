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
  async getGallery(): Promise<{id: string, url: string}[]> {
    const q = query(collection(db, 'gallery'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return [
      { id: '1', url: 'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg' },
      { id: '2', url: 'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg' },
      { id: '3', url: 'https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg' },
      { id: '4', url: 'https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg' },
      { id: '5', url: 'https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg' },
      { id: '6', url: 'https://i.postimg.cc/Nfpfp7gb/ninodeitado.jpg' },
      { id: '7', url: 'https://i.postimg.cc/xTtTty0X/ninodrip.jpg' }
    ];
    return snapshot.docs.map(doc => ({ id: doc.id, url: doc.data().url }));
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
