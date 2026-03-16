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
  serverTimestamp
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
  createdAt?: any;
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

  // Settings (Links and Contact)
  async getSettings(): Promise<any> {
    const q = query(collection(db, 'settings'));
    const snapshot = await getDocs(q);
    const settings: any = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data();
    });
    return settings;
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

  // Seeding
  async seedDatabase() {
    // 1. Seed Tours
    const toursCollection = collection(db, 'tours');
    const toursSnapshot = await getDocs(toursCollection);
    if (toursSnapshot.empty) {
      const initialTours = [
        {
          title: 'Piscinas Naturais de Moreré',
          description: 'Mergulhe em águas cristalinas e nade com peixes coloridos no cartão postal da Ilha de Boipeba. Um passeio imperdível na maré baixa.',
          duration: '2-3 horas',
          price: 'A partir de R$ 100',
          image: 'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg',
          iconType: 'sun'
        },
        {
          title: 'Volta à Ilha de Lancha',
          description: 'Conheça as praias de Bainema, Ponta dos Castelhanos, Cova da Onça e navegue pelo Rio do Inferno com paradas para banho e almoço.',
          duration: 'Dia inteiro (9h às 16h)',
          price: 'A partir de R$ 250',
          image: 'https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg',
          iconType: 'logo'
        },
        {
          title: 'Passeio de Canoa no Mangue',
          description: 'Uma experiência contemplativa pelos túneis do manguezal. Silêncio, natureza intocada e um pôr do sol inesquecível nas águas calmas.',
          duration: '2 horas',
          price: 'A partir de R$ 80',
          image: 'https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg',
          iconType: 'camera'
        },
        {
          title: 'Bioluminescência de Caiaque',
          description: 'Uma experiência mágica noturna. Reme pelas águas escuras e veja o mar brilhar a cada movimento com o fenômeno da bioluminescência.',
          duration: '1.5 horas (Noturno)',
          price: 'A partir de R$ 120',
          image: 'https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg',
          iconType: 'star'
        },
        {
          title: 'Vivência Nativa: Pesca e Preparo',
          description: 'Sinta-se um verdadeiro morador da ilha. Participe da pesca artesanal com os nativos e aprenda a preparar o seu próprio peixe fresco à moda baiana.',
          duration: 'Um dia inteiro',
          price: 'Valor a combinar',
          image: 'https://i.postimg.cc/mZHqgbcN/diogoemumu.jpg',
          iconType: 'logo'
        },
        {
          title: 'Hospedagem Pé na Areia',
          description: 'Aproveite a melhor localização de Moreré. Nossa hospedagem oferece o privilégio de acordar com o pé na areia e o som das ondas.',
          duration: 'Diárias a combinar',
          price: 'Consulte disponibilidade',
          image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=2070&auto=format&fit=crop',
          iconType: 'house'
        }
      ];
      for (const tour of initialTours) {
        await addDoc(toursCollection, tour);
      }
    }

    // 2. Seed Settings
    const settingsCollection = collection(db, 'settings');
    const settingsSnapshot = await getDocs(settingsCollection);
    if (settingsSnapshot.empty) {
      await setDoc(doc(db, 'settings', 'contact'), {
        whatsapp1: '(21) 98864-3166',
        whatsapp1Link: '5521988643166',
        whatsapp2: '(75) 9921-1235',
        whatsapp2Link: '557599211235',
        instagram: '@capitaesdaareiamorere',
        instagramLink: 'capitaesdaareiamorere',
        address: 'Praia de Moreré, s/n\nIlha de Boipeba, Cairu - BA'
      });
      await setDoc(doc(db, 'settings', 'instagram'), {
        beholdUrl: 'https://feeds.behold.so/tNJoO9390vXCO8fbN5Wo'
      });
      await setDoc(doc(db, 'settings', 'media'), {
        heroBg: 'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg',
        aboutMain: 'https://i.postimg.cc/bNKw2YLZ/005ee50d-13e6-4229-9fd6-4db34ae4d335.jpg',
        aboutSecondary: 'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg'
      });
    }

    // 3. Seed Gallery
    const galleryCollection = collection(db, 'gallery');
    const gallerySnapshot = await getDocs(galleryCollection);
    if (gallerySnapshot.empty) {
      const initialGallery = [
        'https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg',
        'https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg',
        'https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg',
        'https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg',
        'https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg',
        'https://i.postimg.cc/Nfpfp7gb/ninodeitado.jpg',
        'https://i.postimg.cc/xTtTty0X/ninodrip.jpg'
      ];
      for (const url of initialGallery) {
        await addDoc(galleryCollection, {
          url,
          createdAt: serverTimestamp(),
          source: 'firestore'
        });
      }
    }
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};
