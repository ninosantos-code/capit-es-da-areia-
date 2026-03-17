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
  onSnapshot
} from 'firebase/firestore';

export interface Tour {
  id?: string;
  title: string;
  description: string;
  duration: string;
  price: string;
  image: string;
  iconType: string; // 'sun', 'camera', 'star', 'logo'
  visible?: boolean;
  createdAt?: any;
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
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
  },

  async updateTour(id: string, data: Partial<Tour>) {
    const docRef = doc(db, 'tours', id);
    await updateDoc(docRef, data);
  },

  async addTour(tour: Omit<Tour, 'id'>) {
    const docRef = await addDoc(collection(db, 'tours'), {
      ...tour,
      createdAt: serverTimestamp()
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

  // Translations (i18n)
  async getTranslations(): Promise<Record<string, Record<string, string>>> {
    const q = query(collection(db, 'translations'));
    const snapshot = await getDocs(q);
    const trans: Record<string, Record<string, string>> = {};
    snapshot.docs.forEach(doc => {
      trans[doc.id] = doc.data() as Record<string, string>;
    });
    return trans;
  },

  async updateTranslation(lang: string, data: Record<string, string>) {
    const docRef = doc(db, 'translations', lang);
    await setDoc(docRef, data);
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
      const batch = writeBatch(db);
      initialTours.forEach((tour) => {
        const newDocRef = doc(collection(db, 'tours'));
        batch.set(newDocRef, { ...tour, createdAt: serverTimestamp() });
      });
      await batch.commit();
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
        heroBg: 'https://i.postimg.cc/Nfpfp7D/ninocomrede.jpg',
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
      const batch = writeBatch(db);
      initialGallery.forEach((url) => {
        const newDocRef = doc(collection(db, 'gallery'));
        batch.set(newDocRef, {
          url,
          createdAt: serverTimestamp(),
          source: 'firestore'
        });
      });
      await batch.commit();
    }

    // 4. Seed Translations
    const transCollection = collection(db, 'translations');
    const transSnapshot = await getDocs(transCollection);
    if (transSnapshot.empty) {
      const pt = {
        'nav.about': 'Sobre Moreré',
        'nav.tours': 'Nossos Passeios',
        'nav.gallery': 'Galeria',
        'nav.testimonials': 'Depoimentos',
        'nav.reservation': 'Reservar Agora',
        'hero.title': 'Capitães da Areia',
        'hero.subtitle': 'Experiências autênticas nas águas cristalinas de Moreré.',
        'hero.cta': 'Descobrir Experiências',
        'tours.label': 'Nossos Roteiros',
        'tours.title': 'Escolha sua próxima aventura',
        'tours.subtitle': 'Passeios privativos ou em pequenos grupos para garantir a melhor experiência nas águas de Boipeba.',
        'tours.duration': 'Duração',
        'tours.price': 'Valor',
        'tours.consult': 'Consultar Disponibilidade',
        'gallery.title': 'Momentos que contam histórias',
        'gallery.follow': 'Seguir no Instagram',
        'gallery.view': 'Ver no Instagram',
        'about.label': 'Nosso Paraíso',
        'about.title1': 'Muito mais que um destino,',
        'about.title2': 'uma experiência.',
        'about.p1': 'Moreré é um pequeno vilarejo de pescadores na Ilha de Boipeba, conhecido por suas águas calmas, piscinas naturais repletas de vida marinha e um ritmo de vida que nos convida a desacelerar.',
        'about.p2': 'Nossa missão é proporcionar a você os melhores passeios da região, com segurança, conforto e o caloroso acolhimento baiano. Conhecemos cada canto dessa ilha e queremos compartilhar seus segredos com você.',
        'about.exp_label': 'Anos de Experiência',
        'about.clients_label': 'Clientes Satisfeitos',
        'testimonials.title': 'O que dizem nossos clientes',
        'booking.title': 'Solicitar Reserva',
        'booking.subtitle': 'Preencha os detalhes e entraremos em contato via WhatsApp.',
        'booking.personal': 'Informações Pessoais',
        'booking.name': 'Seu Nome Completo',
        'booking.age': 'Idade',
        'booking.people': 'Quantas pessoas?',
        'booking.kids': 'Tem crianças?',
        'booking.yes': 'Sim',
        'booking.no': 'Não',
        'booking.arrival': 'Previsão de Chegada na Ilha',
        'booking.tour': 'Passeio Preferencial',
        'booking.decide': 'Ainda não decidi',
        'booking.safety': 'Saúde e Segurança',
        'booking.safety_desc': 'Para garantirmos a melhor experiência, por favor, nos informe:',
        'booking.health': 'Problemas de Saúde ou Alergias?',
        'booking.health_ph': 'Ex: Asma, alergia a frutos do mar, problemas cardíacos. (Especifique)',
        'booking.phobias': 'Possui alguma fobia?',
        'booking.phobias_ph': 'Ex: Medo de mar aberto, insetos, lugares fechados.',
        'booking.meds': 'Toma algum medicamento?',
        'booking.meds_ph': 'Ex: Aspirina, remédio para pressão, etc.',
        'booking.food': 'Restrições Alimentares?',
        'booking.food_ph': 'Ex: Intolerância à lactose, vegano, alergia a camarão.',
        'booking.exp': 'Nível de Experiência em Atividades ao Ar Livre',
        'booking.exp_1': 'Iniciante (Pouca ou nenhuma experiência)',
        'booking.exp_2': 'Intermediário (Pratica atividades ocasionalmente)',
        'booking.exp_3': 'Avançado (Pratica frequentemente, bom preparo físico)',
        'booking.obs': 'Observações Gerais (Opcional)',
        'booking.obs_ph': 'Alguma dúvida ou pedido especial?',
        'booking.disclaimer': 'Termo de Isenção de Responsabilidade',
        'booking.disclaimer_text': 'Declaro estar ciente de que as atividades de ecoturismo envolvem riscos inerentes. Ao prosseguir, assumo total responsabilidade por minha segurança.',
        'booking.submit': 'Enviar para o WhatsApp',
        'footer.description': 'Experiências autênticas no mar de Moreré. Passeios de lancha, canoa e vivências únicas na Ilha de Boipeba.',
        'footer.links': 'Links Rápidos',
        'footer.contact': 'Contato',
        'footer.rights': 'Todos os direitos reservados.',
        'footer.conductors': 'Condutores',
        'footer.languages': 'Idiomas falados'
      };

      const en = {
        'nav.about': 'About Moreré',
        'nav.tours': 'Our Tours',
        'nav.gallery': 'Gallery',
        'nav.testimonials': 'Reviews',
        'nav.reservation': 'Book Now',
        'hero.title': 'Sand Captains',
        'hero.subtitle': 'Authentic experiences in the crystal clear waters of Moreré.',
        'hero.cta': 'Discover Experiences',
        'tours.label': 'Our Routes',
        'tours.title': 'Choose your next adventure',
        'tours.subtitle': 'Private or small group tours to ensure the best experience in Boipeba waters.',
        'tours.duration': 'Duration',
        'tours.price': 'Price',
        'tours.consult': 'Check Availability',
        'gallery.title': 'Moments that tell stories',
        'gallery.follow': 'Follow on Instagram',
        'gallery.view': 'View on Instagram',
        'about.label': 'Our Paradise',
        'about.title1': 'More than a destination,',
        'about.title2': 'an experience.',
        'about.p1': 'Moreré is a small fishing village on Boipeba Island, known for its calm waters, natural pools full of marine life and a pace of life that invites us to slow down.',
        'about.p2': 'Our mission is to provide you with the best tours in the region, with safety, comfort and the warm Bahian welcome. We know every corner of this island and want to share its secrets with you.',
        'about.exp_label': 'Years of Experience',
        'about.clients_label': 'Happy Clients',
        'testimonials.title': 'What our clients say',
        'booking.title': 'Request Reservation',
        'booking.subtitle': 'Fill in the details and we will contact you via WhatsApp.',
        'booking.personal': 'Personal Information',
        'booking.name': 'Your Full Name',
        'booking.age': 'Age',
        'booking.people': 'How many people?',
        'booking.kids': 'Any kids?',
        'booking.yes': 'Yes',
        'booking.no': 'No',
        'booking.arrival': 'Estimated Arrival on the Island',
        'booking.tour': 'Preferred Tour',
        'booking.decide': 'I haven\'t decided yet',
        'booking.safety': 'Health and Safety',
        'booking.safety_desc': 'To ensure the best experience, please let us know:',
        'booking.health': 'Any Health Issues or Allergies?',
        'booking.health_ph': 'Ex: Asthma, seafood allergy, heart issues. (Specify)',
        'booking.phobias': 'Any phobias?',
        'booking.phobias_ph': 'Ex: Fear of open sea, insects, enclosed spaces.',
        'booking.meds': 'Taking any medication?',
        'booking.meds_ph': 'Ex: Aspirin, blood pressure meds, etc.',
        'booking.food': 'Dietary Restrictions?',
        'booking.food_ph': 'Ex: Lactose intolerance, vegan, shrimp allergy.',
        'booking.exp': 'Experience Level in Outdoor Activities',
        'booking.exp_1': 'Beginner (Little or no experience)',
        'booking.exp_2': 'Intermediate (Practices activities occasionally)',
        'booking.exp_3': 'Advanced (Practices frequently, good physical condition)',
        'booking.obs': 'General Observations (Optional)',
        'booking.obs_ph': 'Any questions or special requests?',
        'booking.disclaimer': 'Disclaimer',
        'booking.disclaimer_text': 'I declare I am aware that ecotourism activities involve inherent risks. By proceeding, I assume full responsibility for my safety.',
        'booking.submit': 'Send to WhatsApp',
        'footer.description': 'Authentic experiences in the Moreré sea. Speedboat, canoe tours and unique experiences on Boipeba Island.',
        'footer.links': 'Quick Links',
        'footer.contact': 'Contact',
        'footer.rights': 'All rights reserved.',
        'footer.conductors': 'Conductors',
        'footer.languages': 'Languages spoken'
      };

      const batch = writeBatch(db);
      batch.set(doc(transCollection, 'pt'), pt);
      batch.set(doc(transCollection, 'en'), en);
      await batch.commit();
    }
  },

  // Real-time Subscriptions
  subscribeToTours(callback: (tours: Tour[]) => void) {
    const q = query(collection(db, 'tours'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const tours = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tour));
      callback(tours);
    });
  },

  subscribeToGallery(callback: (items: any[]) => void) {
    const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        url: doc.data().url,
        source: (doc.data().source || 'firestore') as 'firestore' | 'instagram' | 'default'
      }));
      callback(items);
    });
  },

  subscribeToSettings(callback: (settings: any) => void) {
    return onSnapshot(collection(db, 'settings'), (snapshot) => {
      const settings: any = {};
      snapshot.docs.forEach(doc => {
        settings[doc.id] = doc.data();
      });
      callback(settings);
    });
  },

  subscribeToTranslations(callback: (translations: any) => void) {
    return onSnapshot(collection(db, 'translations'), (snapshot) => {
      const trans: Record<string, Record<string, string>> = {};
      snapshot.docs.forEach(doc => {
        trans[doc.id] = doc.data() as Record<string, string>;
      });
      callback(trans);
    });
  },

  subscribeToTestimonials(callback: (testimonials: Testimonial[]) => void) {
    const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const testimonials = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      callback(testimonials);
    });
  },

  // Auth (Simple Password for now as requested)
  verifyPassword(password: string): boolean {
    return password === 'Lagosta@7';
  }
};
