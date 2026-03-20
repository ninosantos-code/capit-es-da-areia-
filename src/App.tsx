import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, Sun, Camera, Instagram, MessageCircle, ChevronRight, ChevronLeft, Star, Menu, X, Play, Home, Loader2, Moon, Anchor, Globe } from 'lucide-react';
import { logEvent } from 'firebase/analytics';
import { analytics } from './lib/firebase';
import LazyImage from './components/LazyImage';
import ConnectionStatus from './components/ConnectionStatus';
import AdminDashboard from './components/Admin/AdminDashboard';
import { adminService, Tour } from './lib/adminService';
import { TourSkeleton, GallerySkeleton, TestimonialSkeleton } from './components/Skeletons';

const TESTIMONIALS: { name: string; text: string; rating: number }[] = [];


const TRANSLATIONS: Record<string, Record<string, string>> = {
  pt: {
    'nav.about': 'Sobre Moreré',
    'nav.tours': 'Nossos Passeios',
    'nav.gallery': 'Galeria',
    'nav.testimonials': 'Depoimentos',
    'nav.bioluminescence': 'Bioluminescência',
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
    
    // Bioluminescência
    'bio.label': 'Experiência Noturna',
    'bio.title': 'O Fenômeno da Bioluminescência',
    'bio.subtitle': 'Moreré é um dos raros lugares do mundo onde é possível presenciar o brilho das águas sob as estrelas.',
    'bio.description': 'O brilho azulado é causado por organismos microscópicos (principalmente dinoflagelados) que emitem luz ao serem agitados. Em noites de lua nova, as águas de Moreré se transformam em um espelho do céu estrelado.',
    'bio.card1.title': 'Melhor Época',
    'bio.card1.desc': 'Noites de Lua Nova ou Crescente para máxima escuridão e visibilidade.',
    'bio.card2.title': 'Como Funciona',
    'bio.card2.desc': 'A agitação da água (com as mãos ou nadando) ativa a reação química dos plânctons.',
    'bio.card3.title': 'Onde Ver',
    'bio.card3.desc': 'Nas águas calmas e rasas de Moreré, longe das luzes artificiais do vilarejo.',
    'bio.cta': 'Agendar Experiência Noturna'
  },
  en: {
    'nav.about': 'About Moreré',
    'nav.tours': 'Our Tours',
    'nav.gallery': 'Gallery',
    'nav.testimonials': 'Reviews',
    'nav.bioluminescence': 'Bioluminescence',
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
    'testimonials.title': 'What our customers say',
    'booking.title': 'Request Booking',
    'booking.subtitle': 'Fill in the details and we will contact you via WhatsApp.',
    'booking.personal': 'Personal Information',
    'booking.name': 'Your Full Name',
    'booking.age': 'Age',
    'booking.people': 'How many people?',
    'booking.kids': 'Any children?',
    'booking.yes': 'Yes',
    'booking.no': 'No',
    'booking.arrival': 'Island Arrival Date',
    'booking.tour': 'Preferred Tour',
    'booking.decide': 'I haven\'t decided yet',
    'booking.safety': 'Health and Safety',
    'booking.safety_desc': 'To ensure the best experience, please let us know:',
    'booking.health': 'Health Problems or Allergies?',
    'booking.health_ph': 'Ex: Asthma, seafood allergy, heart problems. (Specify)',
    'booking.phobias': 'Any phobias?',
    'booking.phobias_ph': 'Ex: Fear of open sea, insects, enclosed places.',
    'booking.meds': 'Taking any medication?',
    'booking.meds_ph': 'Ex: Aspirin, blood pressure medicine, etc.',
    'booking.food': 'Dietary Restrictions?',
    'booking.food_ph': 'Ex: Lactose intolerance, vegan, shrimp allergy.',
    'booking.exp': 'Outdoor Activity Experience Level',
    'booking.exp_1': 'Beginner (Little or no experience)',
    'booking.exp_2': 'Intermediate (Practices occasionally)',
    'booking.exp_3': 'Advanced (Practices frequently, good fitness)',
    'booking.obs': 'General Observations (Optional)',
    'booking.obs_ph': 'Any questions or special requests?',
    'booking.disclaimer': 'Disclaimer Terminal',
    'booking.disclaimer_text': 'I declare to be aware that ecotourism activities involve inherent risks. By proceeding, I assume full responsibility for my safety.',
    'booking.submit': 'Send to WhatsApp',
    'footer.description': 'Authentic sea experiences in Moreré. Speedboat tours, canoe trips and unique experiences in Boipeba Island.',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact',
    'footer.rights': 'All rights reserved.',
    
    // Bioluminescence
    'bio.label': 'Night Experience',
    'bio.title': 'The Bioluminescence Phenomenon',
    'bio.subtitle': 'Moreré\'s waters transform into a mirror of the starry sky under the stars.',
    'bio.description': 'The bluish glow is caused by microscopic organisms (mainly dinoflagellates) that emit light when agitated. On new moon nights, it is truly magical.',
    'bio.card1.title': 'Best Time',
    'bio.card1.desc': 'New or waxing moon nights for maximum darkness and visibility.',
    'bio.card2.title': 'How it Works',
    'bio.card2.desc': 'Agitating the water (with your hands or swimming) activates the chemical reaction of the plankton.',
    'bio.card3.title': 'Where to See',
    'bio.card3.desc': 'In the calm, shallow waters of Moreré, away from the village\'s artificial lights.',
    'bio.cta': 'Schedule Night Experience'
  }
};

function VideoPreview({ src, isActive }: { src: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    } else if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 z-10 ${isActive ? 'opacity-100' : 'opacity-0'}`}
    />
  );
}

export default function App() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [gallery, setGallery] = useState<{id: string, url: string, source: string, mediaType?: string, permalink?: string}[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [language, setLanguage] = useState<'pt' | 'en'>('pt');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dynamicTranslations, setDynamicTranslations] = useState<Record<string, Record<string, string>>>({});
  
  const t = (key: string) => 
    dynamicTranslations[language]?.[key] || 
    TRANSLATIONS[language]?.[key] || 
    key;
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', text: '', rating: 5 });
  const [isCommentSubmitted, setIsCommentSubmitted] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [hoveredVideoId, setHoveredVideoId] = useState<string | null>(null);
  const [reservationForm, setReservationForm] = useState({
    nome: '',
    idade: '',
    quantidadePessoas: '1',
    temCrianca: 'Não',
    dataChegada: '',
    passeioDesejado: 'Ainda não decidi',
    problemasSaude: '',
    fobias: '',
    medicamentos: '',
    restricoesAlimentares: '',
    nivelExperiencia: 'Iniciante',
    observacoes: ''
  });
  const [aceitaTermos, setAceitaTermos] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [instaFeed, setInstaFeed] = useState<any[]>([]);

  // Carregamento inicial de dados externos (Instagram)
  const loadInstagram = async () => {
    try {
      const beholdUrl = settings?.instagram?.beholdUrl || 'https://feeds.behold.so/tNJoO9390vXCO8fbN5Wo';
      const feed = await adminService.getInstagramFeed(beholdUrl);
      setInstaFeed(feed);
    } catch (err) {
      console.error('Erro ao carregar Instagram:', err);
    }
  };

  // Listeners em tempo real para o Firestore
  useEffect(() => {
    setIsLoadingData(true);
    
    // Timeout para fallback: se Firestore não responder em 8s, 
    // para de mostrar loading e usa dados hardcoded
    const fallbackTimeout = setTimeout(() => {
      setIsLoadingData(false);
    }, 8000);
    
    const unsubTours = adminService.subscribeToTours((data) => {
      clearTimeout(fallbackTimeout);
      setTours(data);
      setIsLoadingData(false);
    });
    
    const unsubSettings = adminService.subscribeToSettings((data) => {
      setSettings(data);
    });
    
    const unsubGallery = adminService.subscribeToGallery((data) => {
      // Mesclar com o feed do instagram atual
      const manualPhotos = data;
      const defaultPhotos = data.filter(i => i.source === 'default');
      
      let finalGallery = [...manualPhotos];
      if (instaFeed.length > 0) {
        finalGallery = [...finalGallery, ...instaFeed];
      } else if (manualPhotos.length === 0) {
        finalGallery = defaultPhotos;
      }
      setGallery(finalGallery);
    });
    
    const unsubTestimonials = adminService.subscribeToTestimonials((data) => {
      setTestimonials(data.filter(t => t.approved));
    });
    
    const unsubTranslations = adminService.subscribeToTranslations((data) => {
      setDynamicTranslations(data);
    });

    return () => {
      clearTimeout(fallbackTimeout);
      unsubTours();
      unsubSettings();
      unsubGallery();
      unsubTestimonials();
      unsubTranslations();
    };
  }, [instaFeed]); // Re-calcula galeria quando instaFeed carrega

  // Carrega Instagram quando configurações mudarem
  useEffect(() => {
    if (settings?.instagram?.beholdUrl) {
      loadInstagram();
    }
  }, [settings?.instagram?.beholdUrl]);

  // Carrega inicial caso demore o settings
  useEffect(() => {
    loadInstagram();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'sun': return <Sun className="w-6 h-6 text-ocean-600" />;
      case 'camera': return <Camera className="w-6 h-6 text-ocean-600" />;
      case 'star': return <Star className="w-6 h-6 text-ocean-600" />;
      case 'house': return <Home className="w-6 h-6 text-ocean-600" />;
      default: return <img src="/images/logo-novo.png" alt="Logo" className="w-6 h-6 object-contain" />;
    }
  };

  const openReservationModal = (tourTitle = 'Ainda não decidi') => {
    setReservationForm(prev => ({ ...prev, passeioDesejado: tourTitle }));
    setIsReservationModalOpen(true);
    setIsMobileMenuOpen(false);
    
    if (analytics) {
      logEvent(analytics, 'open_reservation_modal', { tour: tourTitle });
    }
  };

  const closeReservationModal = () => {
    setIsReservationModalOpen(false);
  };

  const handleReservationSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!aceitaTermos) {
      alert("Por favor, aceite o Termo de Isenção de Responsabilidade para continuar.");
      return;
    }
    
    const { nome, idade, quantidadePessoas, temCrianca, dataChegada, passeioDesejado, problemasSaude, fobias, medicamentos, restricoesAlimentares, nivelExperiencia, observacoes } = reservationForm;
    const [ano, mes, dia] = dataChegada.split('-');
    const dataFormatada = dataChegada ? `${dia}/${mes}/${ano}` : 'Não informada';

    // formuláro
    const isEn = language === 'en';
    const message = isEn 
      ? `Hello! I'd like to make a reservation/quote.
*Name:* ${nome}
*Age:* ${idade}
*Number of people:* ${quantidadePessoas}
*Children?:* ${temCrianca}
*Arrival date on the island:* ${dataFormatada}
*Preferred tour:* ${passeioDesejado}
*Experience level (Outdoor activities):* ${nivelExperiencia}

*--- Health, Safety and Food ---*
*Health issues/allergies:* ${problemasSaude || 'None'}
*Phobias:* ${fobias || 'None'}
*Current medications:* ${medicamentos || 'None'}
*Dietary restrictions:* ${restricoesAlimentares || 'None'}
${observacoes ? `\n*Comments:* ${observacoes}` : ''}

*✅ Accepted the Liability Disclaimer Term.*`
      : `Olá! Gostaria de fazer uma reserva/orçamento.
*Nome:* ${nome}
*Idade:* ${idade}
*Quantidade de pessoas:* ${quantidadePessoas}
*Tem crianças?:* ${temCrianca}
*Data de chegada na ilha:* ${dataFormatada}
*Passeio de interesse:* ${passeioDesejado}
*Nível de experiência (Atividades ao ar livre):* ${nivelExperiencia}

*--- Saúde, Segurança e Alimentação ---*
*Problemas de saúde/alergias:* ${problemasSaude || 'Nenhum'}
*Fobias:* ${fobias || 'Nenhuma'}
*Medicamentos em uso:* ${medicamentos || 'Nenhum'}
*Restrições alimentares:* ${restricoesAlimentares || 'Nenhuma'}
${observacoes ? `\n*Observações:* ${observacoes}` : ''}

*✅ Aceitou o Termo de Isenção de Responsabilidade.*`;

    const encodedMessage = encodeURIComponent(message);
    const waLink = settings?.contact?.whatsapp1Link || '5521988643166';
    window.open(`https://wa.me/${waLink}?text=${encodedMessage}`, '_blank');
    
    if (analytics) {
      logEvent(analytics, 'send_whatsapp_reservation', {
        tour: passeioDesejado,
        qtd_pessoas: quantidadePessoas,
        has_kids: temCrianca
      });
    }

    closeReservationModal();
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollGallery = (direction: 'left' | 'right') => {
    if (galleryRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      galleryRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Previne a rolagem da página quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      await adminService.addTestimonial(commentForm);
      
      // Limpa os inputs imediatamente após o sucesso
      setCommentForm({ name: '', text: '', rating: 5 });
      setIsCommentSubmitted(true);
      
      if (analytics) {
        logEvent(analytics, 'submit_testimonial', { rating: commentForm.rating });
      }
      
      // Volta a mostrar o formulário em 4 segundos
      setTimeout(() => setIsCommentSubmitted(false), 4000);
    } catch (err) {
      console.error('Erro ao enviar depoimento:', err);
      alert('Erro ao enviar avaliação. Por favor, verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmittingComment(false);
    }
  };



  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans selection:bg-ocean-200 selection:text-ocean-900">
      <ConnectionStatus />
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-sand-50/90 backdrop-blur-md shadow-sm py-3 border-b border-sand-100/50' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <img src="/images/logo-novo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full shadow-sm" />
            <span className={`font-serif text-2xl font-semibold tracking-wide ${isScrolled ? 'text-sand-900' : 'text-white'}`}>
              Capitães <span className="italic font-light">da Areia</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase ${isScrolled ? 'text-sand-800' : 'text-white/90'}`}>
            <button onClick={() => scrollTo('sobre')} className="hover:text-ocean-500 transition-colors uppercase tracking-widest">{t('nav.about').split(' ')[0]}</button>
            <button onClick={() => scrollTo('passeios')} className="hover:text-ocean-500 transition-colors uppercase tracking-widest">{t('nav.tours').split(' ')[1] || t('nav.tours')}</button>
            <button onClick={() => scrollTo('galeria')} className="hover:text-ocean-500 transition-colors uppercase tracking-widest">{t('nav.gallery')}</button>
            <button onClick={() => scrollTo('bioluminescencia')} className="hover:text-ocean-500 transition-colors uppercase tracking-widest">{t('nav.bioluminescence')}</button>
            <button onClick={() => scrollTo('depoimentos')} className="hover:text-ocean-500 transition-colors uppercase tracking-widest">{t('nav.testimonials')}</button>
            
            {/* Language Switcher */}
            <div className="flex items-center gap-2 border-l border-sand-300/30 pl-6 ml-2">
              <button 
                onClick={() => setLanguage('pt')} 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${language === 'pt' ? 'bg-ocean-600 text-white' : 'hover:bg-sand-100/20'}`}
              >
                PT
              </button>
              <button 
                onClick={() => setLanguage('en')} 
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${language === 'en' ? 'bg-ocean-600 text-white' : 'hover:bg-sand-100/20'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`p-2 rounded-full transition-all ${isScrolled ? 'hover:bg-sand-100 text-sand-900' : 'hover:bg-white/10 text-white'}`}
              title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            <button 
              onClick={() => openReservationModal()}
              className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${isScrolled ? 'bg-ocean-600 text-white hover:bg-ocean-700' : 'bg-sand-900 text-sand-50 hover:bg-ocean-600'}`}
            >
              <MessageCircle className="w-4 h-4" />
              {t('nav.reservation')}
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setLanguage('pt')} className={`text-[10px] font-bold px-2 py-1 rounded ${language === 'pt' ? 'bg-ocean-600 text-white' : 'text-sand-600'}`}>PT</button>
              <button onClick={() => setLanguage('en')} className={`text-[10px] font-bold px-2 py-1 rounded ${language === 'en' ? 'bg-ocean-600 text-white' : 'text-sand-600'}`}>EN</button>
            </div>
            <button 
              className={`p-2 ${isScrolled ? 'text-sand-900' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-sand-50 text-sand-900 pt-24 px-6 flex flex-col gap-6 md:hidden overflow-y-auto pb-12">
          <button onClick={() => scrollTo('sobre')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">{t('nav.about')}</button>
          <button onClick={() => scrollTo('passeios')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">{t('nav.tours')}</button>
          <button onClick={() => scrollTo('galeria')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">{t('nav.gallery')}</button>
          <button onClick={() => scrollTo('bioluminescencia')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">{t('nav.bioluminescence')}</button>
          <button onClick={() => scrollTo('depoimentos')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">{t('nav.testimonials')}</button>
          <button 
            onClick={() => openReservationModal()}
            className="mt-4 bg-ocean-600 text-white py-4 rounded-xl flex justify-center items-center gap-2 text-lg font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            {t('nav.reservation')}
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LazyImage 
            src={settings?.media?.heroBg || "https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg"} 
            alt="Praia de Moreré" 
            className="w-full h-full brightness-[0.9] contrast-[1.05] saturate-[1.1]"
            referrerPolicy="no-referrer"
            priority={true}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-sand-50 via-transparent to-transparent" />
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-sand-100 uppercase tracking-[0.3em] text-sm md:text-base font-medium mb-6 block">
              Ilha de Boipeba, Bahia
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif text-white mb-6 leading-tight">
              {t('hero.title')} <br className="hidden md:block" />
              <span className="italic font-light">de Moreré</span>
            </h1>
            <p className="text-lg md:text-xl text-sand-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => openReservationModal()}
                className="w-full sm:w-auto px-8 py-4 bg-ocean-600 text-white rounded-full font-medium tracking-wide hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.cta')}
              </button>
              <button 
                onClick={() => scrollTo('passeios')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium tracking-wide hover:bg-white/20 transition-colors border border-white/30"
              >
                {t('tours.label')}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-24 px-6 md:px-12 bg-sand-50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="aspect-[3/4] rounded-t-full overflow-hidden relative z-10">
              <LazyImage 
                src={settings?.media?.aboutMain || "https://i.postimg.cc/bNKw2YLZ/005ee50d-13e6-4229-9fd6-4db34ae4d335.jpg"}
                alt="Barco em Moreré" 
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-2/3 aspect-square rounded-full overflow-hidden border-8 border-sand-50 z-20">
              <LazyImage 
                src={settings?.media?.aboutSecondary || "https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg"} 
                alt="Coqueiros" 
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute top-12 -left-6 w-24 h-24 bg-ocean-100 rounded-full -z-10" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 text-ocean-600 mb-6 uppercase tracking-widest text-sm font-semibold">
              <MapPin className="w-5 h-5" />
              <span>{t('about.label')}</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-sand-900 leading-tight">
              {t('about.title1')} <span className="italic text-ocean-800">{t('about.title2')}</span>
            </h2>
            <p className="text-lg text-sand-800 mb-6 leading-relaxed font-light">
              {t('about.p1')}
            </p>
            <p className="text-lg text-sand-800 mb-10 leading-relaxed font-light">
              {t('about.p2')}
            </p>
            
            <div className="flex gap-8">
              <div>
                <h4 className="text-3xl font-serif text-ocean-600 mb-2">10+</h4>
                <p className="text-sm text-sand-800 uppercase tracking-wider font-medium">{t('about.exp_label')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="passeios" className="py-24 px-6 md:px-12 bg-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-ocean-600 uppercase tracking-widest text-sm font-semibold mb-4 block">{t('tours.label')}</span>
            <h2 className="text-4xl md:text-5xl font-serif text-sand-900 mb-6">
              {t('tours.title').split(' ')[0]} {t('tours.title').split(' ')[1]} <span className="italic">{t('tours.title').split(' ').slice(2).join(' ')}</span>
            </h2>
            <p className="text-lg text-sand-800 font-light">
              {t('tours.subtitle')}
            </p>
          </div>

          <div className="relative">
            {/* Carousel Controls */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-sand-100 shadow-lg rounded-full p-3 text-ocean-600 hover:bg-ocean-50 transition-colors hidden md:block border border-sand-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-sand-100 shadow-lg rounded-full p-3 text-ocean-600 hover:bg-ocean-50 transition-colors hidden md:block border border-sand-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoadingData ? (
                // Tours Skeleton
                [...Array(3)].map((_, i) => <TourSkeleton key={i} />)
              ) : (
                tours.filter(t => t.visible !== false).map((tour, index) => (
                <motion.div 
                  key={tour.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="min-w-[85vw] md:min-w-[350px] lg:min-w-[400px] snap-center group rounded-2xl overflow-hidden bg-sand-50 border border-sand-100 hover:shadow-xl transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <LazyImage 
                      src={tour.image} 
                      alt={tour.title} 
                      className="w-full h-full group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      priority={index < 2}
                    />
                    <div className="absolute top-4 right-4 bg-sand-50/90 backdrop-blur-sm p-3 rounded-full text-ocean-600 shadow-sm">
                      {getIcon(tour.iconType)}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-serif text-sand-900 mb-3">{tour.title}</h3>
                    <p className="text-sand-800 font-light mb-6 flex-grow">{tour.description}</p>
                    
                    <div className="space-y-3 mb-8 pt-6 border-t border-sand-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-sand-600 uppercase tracking-wider font-medium">{t('tours.duration')}</span>
                        <span className="text-sand-900 font-medium">{tour.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sand-600 uppercase tracking-wider font-medium">{t('tours.price')}</span>
                        <span className="text-sand-900 font-medium">{tour.price}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => openReservationModal(tour.title)}
                      className="w-full py-3.5 rounded-xl border border-ocean-600 text-ocean-600 font-medium text-center hover:bg-ocean-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      {t('tours.consult')}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="galeria" className="py-24 px-6 md:px-12 bg-sand-50 relative overflow-hidden">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-8 text-center md:text-left">
            <div className="max-w-2xl">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Instagram className="w-6 h-6" />
                </div>
                <span className="text-sand-600 uppercase tracking-[0.2em] text-sm font-bold">@capitaesdaareiamorere</span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-sand-900 leading-tight">
                {t('gallery.title').split(' ').slice(0, -2).join(' ')} <br />
                <span className="italic text-ocean-600">{t('gallery.title').split(' ').slice(-2).join(' ')}</span>
              </h2>
            </div>
            <a 
              href={`https://instagram.com/${settings?.contact?.instagramLink || 'capitaesdaareiamorere'}/`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-8 py-4 bg-sand-900 text-white rounded-full hover:bg-ocean-600 transition-all shadow-xl hover:shadow-ocean-200 hover:-translate-y-1"
            >
              <Instagram className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium">{t('gallery.follow')}</span>
            </a>
          </div>

          <div className="relative">
            {/* Carousel Controls */}
            <button 
              onClick={() => scrollGallery('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-sand-100 border border-sand-100 shadow-xl rounded-full p-4 text-sand-900 hover:text-ocean-600 hover:scale-110 transition-all hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollGallery('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-sand-100 border border-sand-100 shadow-xl rounded-full p-4 text-sand-900 hover:text-ocean-600 hover:scale-110 transition-all hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={galleryRef}
              className="flex overflow-x-auto gap-6 pb-12 snap-x snap-mandatory hide-scrollbar group/carousel"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {isLoadingData ? (
                // Gallery Skeleton
                [...Array(4)].map((_, i) => <GallerySkeleton key={i} />)
              ) : (
                gallery.map((item, index) => (
                <a 
                  key={item.id || index}
                  href={item.permalink || `https://instagram.com/${settings?.contact?.instagramLink || 'capitaesdaareiamorere'}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onMouseEnter={() => item.mediaType === 'VIDEO' && setHoveredVideoId(item.id)}
                  onMouseLeave={() => setHoveredVideoId(null)}
                  className="min-w-[80vw] md:min-w-[400px] snap-center rounded-[2rem] overflow-hidden aspect-[9/11] bg-sand-100 relative group/card shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <LazyImage 
                    src={item.url} 
                    alt={item.caption || `Galeria ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Video Preview on Hover */}
                  {(item as any).mediaType === 'VIDEO' && (item as any).mediaUrl && (
                    <VideoPreview 
                      src={(item as any).mediaUrl} 
                      isActive={hoveredVideoId === item.id} 
                    />
                  )}
                  
                  {/* Video Indicator */}
                  {item.mediaType === 'VIDEO' && (
                    <div className="absolute top-6 right-6 w-12 h-12 bg-black/30 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 z-20">
                      <Play className="w-6 h-6 fill-current" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 flex items-end p-8 z-30">
                    <div className="text-white w-full">
                      <div className="flex items-center gap-2 mb-2">
                        <Instagram className="w-5 h-5" />
                        <span className="text-xs font-bold uppercase tracking-wider">Ver no Instagram</span>
                      </div>
                      {item.caption && (
                        <p className="text-sm line-clamp-2 text-sand-200 font-light leading-relaxed">
                          {item.caption}
                        </p>
                      )}
                    </div>
                  </div>
                </a>
              ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bioluminescence Section */}
      {settings?.bioluminescence?.visible !== false && (
      <section id="bioluminescencia" className="relative py-32 px-6 md:px-12 bg-[#050A0F] overflow-hidden">
        {/* Animated Particles & Glow Lights */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="bio-glow-circle w-[600px] h-[600px] -top-48 -left-48 opacity-20" />
          <div className="bio-glow-circle w-[400px] h-[400px] bottom-0 -right-24 opacity-10" />
          {[...Array(25)].map((_, i) => (
            <div 
              key={i} 
              className="bio-particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 8}s`,
                opacity: Math.random() * 0.7 + 0.3
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Star className="w-3 h-3 animate-pulse" />
                {t('bio.label')}
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight drop-shadow-[0_0_15px_rgba(0,212,255,0.3)]">
                {settings?.bioluminescence?.title || t('bio.title')}
              </h2>
              <p className="text-lg text-ocean-100/80 mb-8 leading-relaxed font-light">
                {settings?.bioluminescence?.subtitle || t('bio.subtitle')}
              </p>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl mb-10">
                <p className="text-sand-100/90 leading-relaxed italic font-light">
                  "{settings?.bioluminescence?.description || t('bio.description')}"
                </p>
              </div>
              
              <button 
                onClick={() => openReservationModal('Bioluminescência')}
                className="group px-8 py-4 bg-ocean-500 hover:bg-ocean-400 text-white rounded-full font-bold tracking-wide transition-all shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:shadow-[0_0_30px_rgba(0,212,255,0.6)] flex items-center gap-3"
              >
                <Moon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                {t('bio.cta')}
              </button>
            </motion.div>

            <div className="grid gap-6">
              {[1, 2, 3].map((num, i) => (
                <motion.div
                  key={num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.2 }}
                  className="group bg-[#0D151F] border border-white/5 p-6 rounded-3xl hover:border-ocean-500/30 transition-all hover:bg-ocean-950/20"
                >
                  <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-ocean-500/10 flex items-center justify-center text-ocean-400 group-hover:scale-110 group-hover:text-ocean-300 transition-all">
                      {num === 1 ? <Sun className="w-6 h-6" /> : num === 2 ? <Play className="w-6 h-6" /> : <MapPin className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="text-white font-serif text-xl mb-2 group-hover:text-ocean-400 transition-colors">
                        {settings?.bioluminescence?.[`card${num}Title`] || t(`bio.card${num}.title`)}
                      </h4>
                      <p className="text-sand-400/80 text-sm font-light leading-relaxed">
                        {settings?.bioluminescence?.[`card${num}Desc`] || t(`bio.card${num}.desc`)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      )}

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 px-6 md:px-12 bg-sand-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-sand-900 mb-4">
              O que dizem <span className="italic">nossos clientes</span>
            </h2>
          </div>

          {isLoadingData ? (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {[...Array(3)].map((_, i) => <TestimonialSkeleton key={i} />)}
            </div>
          ) : testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {testimonials.map((testimonial, idx) => (
                <motion.div 
                  key={testimonial.id || idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-sand-50 p-8 rounded-2xl shadow-sm border border-sand-100"
                >
                  <div className="flex gap-1 text-yellow-400 mb-6 font-bold">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sand-800 font-light italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                  <p className="font-medium text-sand-900 uppercase tracking-wide text-sm">{testimonial.name}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-20 bg-white/50 p-12 rounded-3xl border border-dashed border-sand-300">
              <Star className="w-12 h-12 text-sand-300 mx-auto mb-4 opacity-50" />
              <p className="text-sand-600 font-light italic text-lg">
                Seja o primeiro a compartilhar sua experiência conosco!
              </p>
            </div>
          )}

          {/* Comment Form */}
          <div className="max-w-2xl mx-auto bg-sand-50 p-8 md:p-10 rounded-3xl shadow-sm border border-sand-100">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-serif text-sand-900 mb-2">Deixe sua avaliação</h3>
              <p className="text-sand-600 font-light text-sm">
                Compartilhe sua experiência conosco. Seu comentário será publicado após nossa aprovação.
              </p>
            </div>

            {isCommentSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-ocean-50 text-ocean-800 p-6 rounded-xl text-center border border-ocean-100"
              >
                <Star className="w-8 h-8 text-ocean-500 mx-auto mb-3" />
                <p className="font-medium">Obrigado pela sua avaliação!</p>
                <p className="text-sm mt-1 opacity-80">Seu comentário foi enviado com sucesso e está aguardando aprovação.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleCommentSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-sand-800 mb-2">Seu Nome</label>
                  <input 
                    type="text" 
                    id="name"
                    required
                    value={commentForm.name}
                    onChange={(e) => setCommentForm({...commentForm, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all bg-sand-50"
                    placeholder="Como você quer ser chamado?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-sand-800 mb-2">Sua Nota</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCommentForm({...commentForm, rating: star})}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${star <= commentForm.rating ? 'fill-yellow-400 text-yellow-400' : 'text-sand-300'}`} 
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="text" className="block text-sm font-medium text-sand-800 mb-2">Seu Comentário</label>
                  <textarea 
                    id="text"
                    required
                    rows={4}
                    value={commentForm.text}
                    onChange={(e) => setCommentForm({...commentForm, text: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-transparent transition-all bg-sand-50 resize-none"
                    placeholder="Conte-nos como foi o seu passeio..."
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingComment}
                  className="w-full py-4 bg-sand-900 text-white rounded-xl font-medium hover:bg-sand-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Avaliação'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 md:px-12 bg-ocean-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-serif mb-8">Pronto para viver essa experiência?</h2>
          <p className="text-xl text-ocean-100 font-light mb-10">
            Entre em contato agora mesmo e garanta sua vaga nos melhores passeios de Moreré.
          </p>
          <a href={`https://wa.me/${settings?.contact?.whatsapp1Link || '5521988643166'}`} className="inline-flex items-center gap-2 px-6 py-2.5 bg-ocean-600 text-white rounded-full font-medium hover:bg-ocean-700 transition-colors shadow-lg">
            <MessageCircle className="w-5 h-5" />
            {t('nav.reservation')}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sand-900 text-sand-300 py-12 px-6 md:px-12 border-t border-sand-800">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/images/logo-novo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full" />
              <span className="font-serif text-2xl font-semibold tracking-wide text-white">
                Capitães <span className="italic font-light">da Areia</span>
              </span>
            </div>
            <p className="font-light text-sm max-w-xs">
              {t('footer.description')}
            </p>
          </div>
          
          <div className="flex flex-col gap-2 md:items-center">
            <h4 className="text-white font-medium uppercase tracking-widest text-sm mb-2">{t('footer.contact')}</h4>
            <a href={`https://wa.me/${settings?.contact?.whatsapp1Link || '5521988643166'}`} className="hover:text-white transition-colors font-light flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> {settings?.contact?.whatsapp1 || '(21) 98864-3166'}
            </a>
            <a href={`https://wa.me/${settings?.contact?.whatsapp2Link || '557599211235'}`} className="hover:text-white transition-colors font-light flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> {settings?.contact?.whatsapp2 || '(75) 9921-1235'}
            </a>
            <a href={`https://instagram.com/${settings?.contact?.instagramLink || 'capitaesdaareiamorere'}`} className="hover:text-white transition-colors font-light flex items-center gap-2">
              <Instagram className="w-4 h-4" /> {settings?.contact?.instagram || '@capitaesdaareiamorere'}
            </a>
          </div>
          
          <div className="md:text-right">
            <p className="font-light text-sm whitespace-pre-wrap">
              {settings?.contact?.address || 'Praia de Moreré, s/n\nIlha de Boipeba, Cairu - BA'}
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-sand-800 text-center text-sm font-light space-y-2">
          <p>&copy; {new Date().getFullYear()} Capitães da Areia. {t('footer.rights')}</p>
          <p className="text-xs text-sand-500">{t('footer.conductors')}: Nino, Joemersson, Diogo e Felipe.</p>
          <div className="flex items-center justify-center gap-2 text-[10px] text-ocean-600 font-medium uppercase tracking-widest opacity-80">
            <Globe className="w-3 h-3" />
            <span>{t('footer.languages')}: Português, English, Español</span>
          </div>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-[10px] text-sand-300 uppercase tracking-widest hover:text-ocean-400 transition-colors mt-8 opacity-50 hover:opacity-100"
          >
            {language === 'pt' ? 'Acesso Restrito' : 'Admin Access'}
          </button>
        </div>
      </footer>

      <AdminDashboard 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onDataUpdate={() => {}} // Não precisa mais de data update manual
      />



      {/* Reservation Modal */}
      {isReservationModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeReservationModal} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 md:p-8 overflow-y-auto hide-scrollbar">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif text-sand-900">{t('booking.title')}</h3>
                <button onClick={closeReservationModal} className="p-2 text-sand-500 hover:text-sand-900 hover:bg-sand-50 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sand-600 font-light text-sm mb-6">
                {t('booking.subtitle')}
              </p>

              <form onSubmit={handleReservationSubmit} className="space-y-5">
                <div>
                  <label htmlFor="res-nome" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.name')}</label>
                  <input 
                    type="text" id="res-nome" required
                    value={reservationForm.nome}
                    onChange={(e) => setReservationForm({...reservationForm, nome: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    placeholder={t('booking.name')}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="res-idade" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.age')}</label>
                    <input 
                      type="number" id="res-idade" required min="18"
                      value={reservationForm.idade}
                      onChange={(e) => setReservationForm({...reservationForm, idade: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                      placeholder={t('booking.age')}
                    />
                  </div>
                  <div>
                    <label htmlFor="res-qtd" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.people')}</label>
                    <input 
                      type="number" id="res-qtd" required min="1"
                      value={reservationForm.quantidadePessoas}
                      onChange={(e) => setReservationForm({...reservationForm, quantidadePessoas: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="res-crianca" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.kids')}</label>
                    <select 
                      id="res-crianca" required
                      value={reservationForm.temCrianca}
                      onChange={(e) => setReservationForm({...reservationForm, temCrianca: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    >
                      <option value={t('booking.no')}>{t('booking.no')}</option>
                      <option value={t('booking.yes')}>{t('booking.yes')}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="res-data" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.arrival')}</label>
                    <input 
                      type="date" id="res-data" required
                      value={reservationForm.dataChegada}
                      onChange={(e) => setReservationForm({...reservationForm, dataChegada: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="res-passeio" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.tour')}</label>
                  <select 
                    id="res-passeio" required
                    value={reservationForm.passeioDesejado}
                    onChange={(e) => setReservationForm({...reservationForm, passeioDesejado: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                  >
                    <option value={t('booking.decide')}>{t('booking.decide')}</option>
                    {tours.map((t, idx) => (
                      <option key={t.id || idx} value={t.title}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <h4 className="text-lg font-serif text-sand-900 mb-2">{t('booking.safety')}</h4>
                  <p className="text-xs text-sand-600 mb-4">{t('booking.safety_desc')}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="res-saude" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.health')}</label>
                      <textarea 
                        id="res-saude" rows={2}
                        value={reservationForm.problemasSaude}
                        onChange={(e) => setReservationForm({...reservationForm, problemasSaude: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder={t('booking.health_ph')}
                      />
                    </div>

                    <div>
                      <label htmlFor="res-fobias" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.phobias')}</label>
                      <textarea 
                        id="res-fobias" rows={2}
                        value={reservationForm.fobias}
                        onChange={(e) => setReservationForm({...reservationForm, fobias: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder={t('booking.phobias_ph')}
                      />
                    </div>

                    <div>
                      <label htmlFor="res-medicamentos" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.meds')}</label>
                      <textarea 
                        id="res-medicamentos" rows={2}
                        value={reservationForm.medicamentos}
                        onChange={(e) => setReservationForm({...reservationForm, medicamentos: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder={t('booking.meds_ph')}
                      />
                    </div>

                    <div>
                      <label htmlFor="res-alimentacao" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.food')}</label>
                      <textarea 
                        id="res-alimentacao" rows={2}
                        value={reservationForm.restricoesAlimentares}
                        onChange={(e) => setReservationForm({...reservationForm, restricoesAlimentares: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder={t('booking.food_ph')}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <label htmlFor="res-experiencia" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.exp')}</label>
                  <select 
                    id="res-experiencia" required
                    value={reservationForm.nivelExperiencia}
                    onChange={(e) => setReservationForm({...reservationForm, nivelExperiencia: e.target.value})}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                  >
                    <option value="Iniciante">{t('booking.exp_1')}</option>
                    <option value="Intermediário">{t('booking.exp_2')}</option>
                    <option value="Avançado">{t('booking.exp_3')}</option>
                  </select>

                  <label htmlFor="res-obs" className="block text-sm font-medium text-sand-800 mb-1">{t('booking.obs')}</label>
                  <textarea 
                    id="res-obs" rows={2}
                    value={reservationForm.observacoes}
                    onChange={(e) => setReservationForm({...reservationForm, observacoes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none"
                    placeholder={t('booking.obs_ph')}
                  />
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input 
                        type="checkbox" 
                        required
                        checked={aceitaTermos}
                        onChange={(e) => setAceitaTermos(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-sand-300 rounded-md checked:bg-ocean-600 checked:border-ocean-600 transition-colors cursor-pointer"
                      />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs text-sand-700 leading-relaxed">
                      <strong>{t('booking.disclaimer')}:</strong> {t('booking.disclaimer_text')}
                    </span>
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors flex justify-center items-center gap-2 mt-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('booking.submit')}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
