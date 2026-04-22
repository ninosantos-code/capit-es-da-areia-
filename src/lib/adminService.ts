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
  orderBy,
  serverTimestamp,
  writeBatch,
  onSnapshot,
  where
} from 'firebase/firestore';

export interface User {
  id?: string;
  authId: string;
  email: string;
  role: string;
  displayName?: string;
  createdAt?: any;
}

export interface Tour {
  id?: string;
  title: string;
  description: string;
  duration: string;
  price: number;
  imageUrl: string;
  iconType: string; // 'sun', 'camera', 'star', 'logo'
  visible: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Testimonial {
  id?: string;
  name: string;
  text: string;
  rating: number;
  approved: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface GalleryImage {
  id?: string;
  url: string;
  source: string;
  createdAt: any;
  caption?: string;
}

export interface Setting {
  id?: string;
  key: string;
  value: string;
  updatedAt?: any;
}

export interface Translation {
  id?: string;
  key: string;
  language: string;
  value: string;
  updatedAt?: any;
}

export const adminService = {
  // Tours
  async getTours(): Promise<Tour[]> {
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
  },

  async updateTour(id: string, data: Partial<Tour>) {
    const docRef = doc(db, 'tours', id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
  },

  async addTour(tour: Omit<Tour, 'id' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, 'tours'), {
      ...tour,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...tour };
  },

  async deleteTour(id: string) {
    const docRef = doc(db, 'tours', id);
    await deleteDoc(docRef);
  },

  // Testimonials
  async getTestimonials(): Promise<Testimonial[]> {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
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
      createdAt: serverTimestamp() 
    });
  },

  // Settings (Key-Value)
  async getSettings(): Promise<Setting[]> {
    const q = query(collection(db, 'settings'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Setting));
  },

  async updateSetting(key: string, value: string) {
    const q = query(collection(db, 'settings'), where('key', '==', key));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(db, 'settings', snapshot.docs[0].id);
      await updateDoc(docRef, { value, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'settings'), { key, value, updatedAt: serverTimestamp() });
    }
  },

  // Gallery (Now GalleryImage)
  async getGallery(): Promise<GalleryImage[]> {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data()
    } as GalleryImage));
  },

  async addToGallery(image: Omit<GalleryImage, 'id' | 'createdAt'>) {
    await addDoc(collection(db, 'gallery'), { 
      ...image, 
      createdAt: serverTimestamp()
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

  // Translations (Per Key/Language)
  async getTranslations(): Promise<Translation[]> {
    const q = query(collection(db, 'translations'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Translation));
  },

  async updateTranslation(key: string, language: string, value: string) {
    const q = query(collection(db, 'translations'), 
      where('key', '==', key), 
      where('language', '==', language)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const docRef = doc(db, 'translations', snapshot.docs[0].id);
      await updateDoc(docRef, { value, updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'translations'), { 
        key, 
        language, 
        value, 
        updatedAt: serverTimestamp() 
      });
    }
  },

  // Seeding
  async seedDatabase() {    // 1. Seed Tours
    const toursCollection = collection(db, 'tours');
    const toursSnapshot = await getDocs(toursCollection);
    if (toursSnapshot.empty) {
      const initialTours = [
        {
          title: 'Piscinas Naturais de Moreré',
          description: 'Mergulhe em águas cristalinas e nade com peixes coloridos no cartão postal da Ilha de Boipeba. Um passeio imperdível na maré baixa.',
          duration: '2-3 horas',
          price: 100.0,
          imageUrl: 'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg',
          iconType: 'sun',
          visible: true
        },
        {
          title: 'Volta à Ilha de Lancha',
          description: 'Conheça as praias de Bainema, Ponta dos Castelhanos, Cova da Onça e navegue pelo Rio do Inferno com paradas para banho e almoço.',
          duration: 'Dia inteiro (9h às 16h)',
          price: 250.0,
          imageUrl: 'https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg',
          iconType: 'logo',
          visible: true
        },
        {
          title: 'Passeio de Canoa no Mangue',
          description: 'Uma experiência contemplativa pelos túneis do manguezal. Silêncio, natureza intocada e um pôr do sol inesquecível nas águas calmas.',
          duration: '2 horas',
          price: 80.0,
          imageUrl: 'https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg',
          iconType: 'camera',
          visible: true
        },
        {
          title: 'Bioluminescência de Caiaque',
          description: 'Uma experiência mágica noturna. Reme pelas águas escuras e veja o mar brilhar a cada movimento com o fenômeno da bioluminescência.',
          duration: '1.5 horas (Noturno)',
          price: 120.0,
          imageUrl: 'https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg',
          iconType: 'star',
          visible: true
        }
      ];
      const batch = writeBatch(db);
      initialTours.forEach((tour) => {
        const newDocRef = doc(collection(db, 'tours'));
        batch.set(newDocRef, { 
          ...tour, 
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });
      await batch.commit();
    }

    // 2. Seed Settings
    const settingsCollection = collection(db, 'settings');
    const settingsSnapshot = await getDocs(settingsCollection);
    if (settingsSnapshot.empty) {
      const initialSettings = [
        { key: 'whatsapp1', value: '(21) 98864-3166' },
        { key: 'whatsapp2', value: '(75) 9921-1235' },
        { key: 'instagram', value: '@capitaesdaareiamorere' },
        { key: 'heroBg', value: 'https://i.postimg.cc/Nfpfp7D/ninocomrede.jpg' }
      ];
      const batch = writeBatch(db);
      initialSettings.forEach(setting => {
        const newDocRef = doc(collection(db, 'settings'));
        batch.set(newDocRef, { ...setting, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    }

    // 3. Seed Gallery
    const galleryCollection = collection(db, 'gallery');
    const gallerySnapshot = await getDocs(galleryCollection);
    if (gallerySnapshot.empty) {
      const initialGallery = [
        { url: 'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg', source: 'firestore', caption: 'Relaxando na rede' },
        { url: 'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg', source: 'firestore', caption: 'Piscinas Naturais' }
      ];
      const batch = writeBatch(db);
      initialGallery.forEach((img) => {
        const newDocRef = doc(collection(db, 'gallery'));
        batch.set(newDocRef, { ...img, createdAt: serverTimestamp() });
      });
      await batch.commit();
    }

    // 4. Seed Translations
    const transCollection = collection(db, 'translations');
    const transSnapshot = await getDocs(transCollection);
    if (transSnapshot.empty) {
      const initialTranslations = [
        { key: 'nav.tours', language: 'pt', value: 'Nossos Passeios' },
        { key: 'nav.tours', language: 'en', value: 'Our Tours' },
        { key: 'hero.title', language: 'pt', value: 'Capitães da Areia' },
        { key: 'hero.title', language: 'en', value: 'Sand Captains' }
      ];
      const batch = writeBatch(db);
      initialTranslations.forEach(trans => {
        const newDocRef = doc(collection(db, 'translations'));
        batch.set(newDocRef, { ...trans, updatedAt: serverTimestamp() });
      });
      await batch.commit();
    }
  },

  // ─── Estado de conexão do Firestore ───
  _connectionListeners: [] as ((connected: boolean, error?: string) => void)[],

  onConnectionChange(callback: (connected: boolean, error?: string) => void) {
    this._connectionListeners.push(callback);
    return () => {
      this._connectionListeners = this._connectionListeners.filter(cb => cb !== callback);
    };
  },

  _notifyConnection(connected: boolean, error?: string) {
    this._connectionListeners.forEach(cb => cb(connected, error));
  },

  _handleSnapshotError(context: string) {
    return (error: any) => {
      console.error(`[Firestore] Erro no listener '${context}':`, error?.message || error);
      const msg = error?.message || '';
      if (msg.includes('PERMISSION_DENIED') || msg.includes('disabled')) {
        this._notifyConnection(false, 'API do Firestore desabilitada. Ative no Console Firebase.');
      } else if (msg.includes('unavailable') || msg.includes('UNAVAILABLE')) {
        this._notifyConnection(false, 'Firestore indisponível. Verifique sua conexão.');
      } else {
        this._notifyConnection(false, `Erro de conexão: ${msg}`);
      }
    };
  },

  // Real-time Subscriptions (com tratamento de erros)
  subscribeToTours(callback: (tours: Tour[]) => void) {
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tours = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
      this._notifyConnection(true);
      callback(tours);
    }, this._handleSnapshotError('tours'));
  },

  subscribeToGallery(callback: (items: any[]) => void) {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        url: doc.data().url,
        source: (doc.data().source || 'firestore') as 'firestore' | 'instagram' | 'default'
      }));
      this._notifyConnection(true);
      callback(items);
    }, this._handleSnapshotError('gallery'));
  },

  subscribeToSettings(callback: (settings: any) => void) {
    return onSnapshot(collection(db, 'settings'), (snapshot) => {
      const settings: any = {};
      snapshot.docs.forEach(doc => {
        settings[doc.id] = doc.data();
      });
      this._notifyConnection(true);
      callback(settings);
    }, this._handleSnapshotError('settings'));
  },

  subscribeToTranslations(callback: (translations: any) => void) {
    return onSnapshot(collection(db, 'translations'), (snapshot) => {
      const trans: Record<string, Record<string, string>> = {};
      snapshot.docs.forEach(doc => {
        trans[doc.id] = doc.data() as Record<string, string>;
      });
      this._notifyConnection(true);
      callback(trans);
    }, this._handleSnapshotError('translations'));
  },

  subscribeToTestimonials(callback: (testimonials: Testimonial[]) => void) {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      this._notifyConnection(true);
      callback(testimonials);
    }, this._handleSnapshotError('testimonials'));
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};

