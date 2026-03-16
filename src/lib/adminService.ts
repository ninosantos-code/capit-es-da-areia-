import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
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

  async addTestimonial(data: Omit<Testimonial, 'id' | 'approved'>) {
    await addDoc(collection(db, 'testimonials'), { 
      ...data, 
      approved: false, 
      createdAt: new Date() 
    });
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
        whatsapp1: '(21) 98864-3166',
        whatsapp1Link: '5521988643166',
        whatsapp2: '(75) 9921-1235',
        whatsapp2Link: '557599211235',
        instagram: '@capitaesdaareiamorere',
        instagramLink: 'capitaesdaareiamorere',
        address: 'Praia de Moreré, s/n\nIlha de Boipeba, Cairu - BA'
      },
      instagram: {
        beholdUrl: 'https://feeds.behold.so/tNJoO9390vXCO8fbN5Wo'
      }
    };
  },

  async updateSettings(id: string, data: any) {
    const docRef = doc(db, 'settings', id);
    await setDoc(docRef, data, { merge: true });
  },

  // Gallery
  async getGallery(): Promise<{id: string, url: string, source: 'firestore' | 'instagram' | 'default'}[]> {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    const firestoreItems = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      url: doc.data().url,
      source: 'firestore' as const
    }));

    if (firestoreItems.length === 0) {
      return [
        { id: '1', url: 'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg', source: 'default' },
        { id: '2', url: 'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg', source: 'default' },
        { id: '3', url: 'https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg', source: 'default' },
        { id: '4', url: 'https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg', source: 'default' },
        { id: '5', url: 'https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg', source: 'default' },
        { id: '6', url: 'https://i.postimg.cc/Nfpfp7gb/ninodeitado.jpg', source: 'default' },
        { id: '7', url: 'https://i.postimg.cc/xTtTty0X/ninodrip.jpg', source: 'default' }
      ];
    }
    return firestoreItems;
  },

  async addToGallery(url: string) {
    if (!url) throw new Error('URL é obrigatória');
    await addDoc(collection(db, 'gallery'), { 
      url, 
      createdAt: new Date(),
      source: 'firestore'
    });
  },

  async removeFromGallery(id: string) {
    const docRef = doc(db, 'gallery', id);
    await deleteDoc(docRef);
  },

  // Instagram Feed (Behold.so)
  async getInstagramFeed(beholdUrl: string): Promise<any[]> {
    if (!beholdUrl) return [];
    try {
      const response = await fetch(beholdUrl);
      const data = await response.json();
      
      // Behold pode retornar um array direto ou um objeto com a propriedade 'posts'
      const posts = Array.isArray(data) ? data : (data.posts || []);
      
      return posts.map((item: any) => ({
        id: item.id,
        // Para vídeos, a URL da imagem deve ser a miniatura (thumbnailUrl)
        url: item.mediaType === 'VIDEO' ? (item.thumbnailUrl || item.mediaUrl) : (item.mediaUrl || item.thumbnailUrl),
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType, // IMAGE, VIDEO, CAROUSEL_ALBUM
        permalink: item.permalink,
        caption: item.caption,
        source: 'instagram' as const
      }));
    } catch (err) {
      console.error('Erro ao buscar feed do Instagram:', err);
      return [];
    }
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};
