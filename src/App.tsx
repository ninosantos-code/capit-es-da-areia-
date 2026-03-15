import AdminDashboard from './components/Admin/AdminDashboard';
import { adminService, Tour } from './lib/adminService';

const INITIAL_TOURS: Tour[] = [
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
  }
];

export default function App() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: '', text: '', rating: 5 });
  const [isCommentSubmitted, setIsCommentSubmitted] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
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
    const loadData = async () => {
      try {
        const fetchedTours = await adminService.getTours();
        if (fetchedTours.length === 0) {
          // Fallback + Seed Initial Data (only for dev/first run)
          setTours(INITIAL_TOURS);
          console.log("Empty DB, showing initial tours.");
        } else {
          setTours(fetchedTours);
        }
      } catch (err) {
        setTours(INITIAL_TOURS);
      }
    };
    loadData();
  }, [isAdminOpen]); // Refresh data when closing admin

  const getIcon = (type: string) => {
    switch(type) {
      case 'sun': return <Sun className="w-6 h-6 text-ocean-600" />;
      case 'camera': return <Camera className="w-6 h-6 text-ocean-600" />;
      case 'star': return <Star className="w-6 h-6 text-ocean-600" />;
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
    const message = `Olá! Gostaria de fazer uma reserva/orçamento.
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
    window.open(`https://wa.me/557599211235?text=${encodedMessage}`, '_blank');
    
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

  const handleCommentSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Em um cenário real, isso enviaria os dados para um banco de dados para aprovação
    setIsCommentSubmitted(true);
    
    if (analytics) {
      logEvent(analytics, 'submit_testimonial', { rating: commentForm.rating });
    }

    setCommentForm({ name: '', text: '', rating: 5 });
    
    setTimeout(() => setIsCommentSubmitted(false), 5000);
  };



  return (
    <div className="min-h-screen bg-sand-50 text-sand-900 font-sans selection:bg-ocean-200 selection:text-ocean-900">
      <ConnectionStatus />
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollTo('home')}>
            <img src="/images/logo-novo.png" alt="Logo" className="w-8 h-8 object-contain rounded-full shadow-sm" />
            <span className={`font-serif text-2xl font-semibold tracking-wide ${isScrolled ? 'text-sand-900' : 'text-white'}`}>
              Capitães <span className="italic font-light">da Areia</span>
            </span>
          </div>
          
          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-8 text-sm font-medium tracking-wide uppercase ${isScrolled ? 'text-sand-800' : 'text-white/90'}`}>
            <button onClick={() => scrollTo('sobre')} className="hover:text-ocean-500 transition-colors">Sobre</button>
            <button onClick={() => scrollTo('passeios')} className="hover:text-ocean-500 transition-colors">Passeios</button>
            <button onClick={() => scrollTo('galeria')} className="hover:text-ocean-500 transition-colors">Galeria</button>
            <button onClick={() => scrollTo('depoimentos')} className="hover:text-ocean-500 transition-colors">Depoimentos</button>
            <button 
              onClick={() => openReservationModal()}
              className={`px-5 py-2.5 rounded-full flex items-center gap-2 transition-all ${isScrolled ? 'bg-ocean-600 text-white hover:bg-ocean-700' : 'bg-white text-sand-900 hover:bg-sand-50'}`}
            >
              <MessageCircle className="w-4 h-4" />
              Reservar
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 ${isScrolled ? 'text-sand-900' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-sand-50 pt-24 px-6 flex flex-col gap-6 md:hidden">
          <button onClick={() => scrollTo('sobre')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">Sobre Moreré</button>
          <button onClick={() => scrollTo('passeios')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">Nossos Passeios</button>
          <button onClick={() => scrollTo('galeria')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">Galeria</button>
          <button onClick={() => scrollTo('depoimentos')} className="text-2xl font-serif text-left border-b border-sand-200 pb-4">Depoimentos</button>
          <button 
            onClick={() => openReservationModal()}
            className="mt-4 bg-ocean-600 text-white py-4 rounded-xl flex justify-center items-center gap-2 text-lg font-medium"
          >
            <MessageCircle className="w-5 h-5" />
            Reservar Passeio
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LazyImage 
            src="https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg" 
            alt="Praia de Moreré" 
            className="w-full h-full"
            referrerPolicy="no-referrer"
            eager
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
              Descubra a magia <br className="hidden md:block" />
              <span className="italic font-light">de Moreré</span>
            </h1>
            <p className="text-lg md:text-xl text-sand-100 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Passeios de lancha, mergulho nas piscinas naturais e experiências autênticas em um dos vilarejos mais charmosos do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={() => openReservationModal()}
                className="w-full sm:w-auto px-8 py-4 bg-ocean-600 text-white rounded-full font-medium tracking-wide hover:bg-ocean-700 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Agendar Passeio
              </button>
              <button 
                onClick={() => scrollTo('passeios')}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full font-medium tracking-wide hover:bg-white/20 transition-colors border border-white/30"
              >
                Ver Roteiros
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
                src="https://i.postimg.cc/bNKw2YLZ/005ee50d-13e6-4229-9fd6-4db34ae4d335.jpg"
                alt="Barco em Moreré" 
                className="w-full h-full"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-2/3 aspect-square rounded-full overflow-hidden border-8 border-sand-50 z-20">
              <LazyImage 
                src="https://i.postimg.cc/Nfpfp7gD/ninocomrede.jpg" 
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
              <span>Nosso Paraíso</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-sand-900 leading-tight">
              Muito mais que um destino, <span className="italic text-ocean-800">uma experiência.</span>
            </h2>
            <p className="text-lg text-sand-800 mb-6 leading-relaxed font-light">
              Moreré é um pequeno vilarejo de pescadores na Ilha de Boipeba, conhecido por suas águas calmas, piscinas naturais repletas de vida marinha e um ritmo de vida que nos convida a desacelerar.
            </p>
            <p className="text-lg text-sand-800 mb-10 leading-relaxed font-light">
              Nossa missão é proporcionar a você os melhores passeios da região, com segurança, conforto e o caloroso acolhimento baiano. Conhecemos cada canto dessa ilha e queremos compartilhar seus segredos com você.
            </p>
            
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="text-3xl font-serif text-ocean-600 mb-2">10+</h4>
                <p className="text-sm text-sand-800 uppercase tracking-wider font-medium">Anos de Experiência</p>
              </div>
              <div>
                <h4 className="text-3xl font-serif text-ocean-600 mb-2">5k+</h4>
                <p className="text-sm text-sand-800 uppercase tracking-wider font-medium">Clientes Satisfeitos</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tours Section */}
      <section id="passeios" className="py-24 px-6 md:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-ocean-600 uppercase tracking-widest text-sm font-semibold mb-4 block">Nossos Roteiros</span>
            <h2 className="text-4xl md:text-5xl font-serif text-sand-900 mb-6">
              Escolha sua <span className="italic">próxima aventura</span>
            </h2>
            <p className="text-lg text-sand-800 font-light">
              Passeios privativos ou em pequenos grupos para garantir a melhor experiência nas águas de Boipeba.
            </p>
          </div>

          <div className="relative">
            {/* Carousel Controls */}
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-white shadow-lg rounded-full p-3 text-ocean-600 hover:bg-ocean-50 transition-colors hidden md:block border border-sand-100"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-white shadow-lg rounded-full p-3 text-ocean-600 hover:bg-ocean-50 transition-colors hidden md:block border border-sand-100"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {tours.map((tour, index) => (
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
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full text-ocean-600 shadow-sm">
                      {getIcon(tour.iconType)}
                    </div>
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-serif text-sand-900 mb-3">{tour.title}</h3>
                    <p className="text-sand-800 font-light mb-6 flex-grow">{tour.description}</p>
                    
                    <div className="space-y-3 mb-8 pt-6 border-t border-sand-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-sand-600 uppercase tracking-wider font-medium">Duração</span>
                        <span className="text-sand-900 font-medium">{tour.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-sand-600 uppercase tracking-wider font-medium">Valor</span>
                        <span className="text-sand-900 font-medium">{tour.price}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => openReservationModal(tour.title)}
                      className="w-full py-3.5 rounded-xl border border-ocean-600 text-ocean-600 font-medium text-center hover:bg-ocean-600 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                      Consultar Disponibilidade
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="galeria" className="py-24 px-6 md:px-12 bg-sand-900 text-sand-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-2xl">
              <span className="text-ocean-400 uppercase tracking-widest text-sm font-semibold mb-4 block">Galeria</span>
              <h2 className="text-4xl md:text-5xl font-serif mb-4">
                Um vislumbre do <span className="italic text-sand-300">paraíso</span>
              </h2>
            </div>
            <a 
              href="https://instagram.com/capitaesdaareiamorere/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sand-300 hover:text-white transition-colors pb-2 border-b border-sand-300/30 hover:border-white"
            >
              <Instagram className="w-5 h-5" />
              <span>Siga no Instagram</span>
            </a>
          </div>

          <div className="relative">
            {/* Carousel Controls */}
            <button 
              onClick={() => scrollGallery('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 z-10 bg-sand-900 border border-sand-700 shadow-lg rounded-full p-3 text-sand-300 hover:text-white hover:bg-sand-800 transition-colors hidden md:block"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollGallery('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 z-10 bg-sand-900 border border-sand-700 shadow-lg rounded-full p-3 text-sand-300 hover:text-white hover:bg-sand-800 transition-colors hidden md:block"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Carousel Container */}
            <div 
              ref={galleryRef}
              className="flex overflow-x-auto gap-4 pb-8 snap-x snap-mandatory hide-scrollbar"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {[
                { src: "https://i.postimg.cc/HsJLx80T/0f4b3716-7319-4b50-af1e-75dff028038a.jpg", alt: "Galeria 1" },
                { src: "https://i.postimg.cc/GhZms3zv/448f988f-9bd6-41e8-90dd-d43d715f7532.jpg", alt: "Galeria 2" },
                { src: "https://i.postimg.cc/TYZ3W2QC/47288200-9dbc-460a-82f2-b03621056bfc.jpg", alt: "Galeria 3" },
                { src: "https://i.postimg.cc/y8cYhqrX/4d97432c-6d05-4102-8910-d1e54fd6db76.jpg", alt: "Galeria 4" },
                { src: "https://i.postimg.cc/Nfpfp7gb/ninodeitado.jpg", alt: "Galeria 5" },
                { src: "https://i.postimg.cc/xTtTty0X/ninodrip.jpg", alt: "Galeria 6" }
              ].map((img, idx) => (
                <div key={idx} className="min-w-[85vw] md:min-w-[350px] lg:min-w-[300px] snap-center shrink-0">
                  <LazyImage src={img.src} alt={img.alt} className="w-full h-64 md:h-80 rounded-2xl shadow-xl border border-sand-800/50" referrerPolicy="no-referrer" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="depoimentos" className="py-24 px-6 md:px-12 bg-sand-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif text-sand-900 mb-4">
              O que dizem <span className="italic">nossos clientes</span>
            </h2>
          </div>

          {TESTIMONIALS.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              {TESTIMONIALS.map((testimonial, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-sm"
                >
                  <div className="flex gap-1 text-yellow-400 mb-6">
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
          <div className="max-w-2xl mx-auto bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-sand-100">
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
                  className="w-full py-4 bg-sand-900 text-white rounded-xl font-medium hover:bg-sand-800 transition-colors flex justify-center items-center gap-2"
                >
                  Enviar Avaliação
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
          <button 
            onClick={() => openReservationModal()}
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-ocean-700 rounded-full font-medium text-lg hover:bg-sand-50 transition-colors shadow-lg hover:shadow-xl"
          >
            <MessageCircle className="w-6 h-6" />
            Falar com a equipe
          </button>
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
              Sua agência de turismo receptivo na Ilha de Boipeba. Experiências autênticas e inesquecíveis.
            </p>
          </div>
          
          <div className="flex flex-col gap-2 md:items-center">
            <h4 className="text-white font-medium uppercase tracking-widest text-sm mb-2">Contato</h4>
            <a href="https://wa.me/557599211235" className="hover:text-white transition-colors font-light flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> (75) 9921-1235
            </a>
            <a href="https://wa.me/5521988643166" className="hover:text-white transition-colors font-light flex items-center gap-2">
              <MessageCircle className="w-4 h-4" /> (21) 98864-3166
            </a>
            <a href="https://instagram.com/capitaesdaareiamorere" className="hover:text-white transition-colors font-light flex items-center gap-2">
              <Instagram className="w-4 h-4" /> @capitaesdaareia
            </a>
          </div>
          
          <div className="md:text-right">
            <p className="font-light text-sm">
              Praia de Moreré, s/n<br />
              Ilha de Boipeba, Cairu - BA
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-sand-800 text-center text-sm font-light space-y-2">
          <p>&copy; {new Date().getFullYear()} Capitães da Areia. Todos os direitos reservados.</p>
          <p className="text-xs text-sand-500">Condutores: Nino, Joemersson, Diogo e Felipe.</p>
          <button 
            onClick={() => setIsAdminOpen(true)}
            className="text-[10px] text-sand-700 uppercase tracking-widest hover:text-ocean-500 transition-colors mt-4"
          >
            Acesso Restrito
          </button>
        </div>
      </footer>

      <AdminDashboard isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />



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
                <h3 className="text-2xl font-serif text-sand-900">Faça sua Reserva</h3>
                <button onClick={closeReservationModal} className="p-2 text-sand-500 hover:text-sand-900 hover:bg-sand-50 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <p className="text-sand-600 font-light text-sm mb-6">
                Preencha os dados abaixo. Você será redirecionado para o nosso WhatsApp com as informações prontas para agilizarmos seu atendimento!
              </p>

              <form onSubmit={handleReservationSubmit} className="space-y-5">
                <div>
                  <label htmlFor="res-nome" className="block text-sm font-medium text-sand-800 mb-1">Nome Completo</label>
                  <input 
                    type="text" id="res-nome" required
                    value={reservationForm.nome}
                    onChange={(e) => setReservationForm({...reservationForm, nome: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    placeholder="Seu nome"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="res-idade" className="block text-sm font-medium text-sand-800 mb-1">Idade</label>
                    <input 
                      type="number" id="res-idade" required min="18"
                      value={reservationForm.idade}
                      onChange={(e) => setReservationForm({...reservationForm, idade: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                      placeholder="Sua idade"
                    />
                  </div>
                  <div>
                    <label htmlFor="res-qtd" className="block text-sm font-medium text-sand-800 mb-1">Qtd. Pessoas</label>
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
                    <label htmlFor="res-crianca" className="block text-sm font-medium text-sand-800 mb-1">Tem Crianças?</label>
                    <select 
                      id="res-crianca" required
                      value={reservationForm.temCrianca}
                      onChange={(e) => setReservationForm({...reservationForm, temCrianca: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    >
                      <option value="Não">Não</option>
                      <option value="Sim">Sim</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="res-data" className="block text-sm font-medium text-sand-800 mb-1">Data de Chegada</label>
                    <input 
                      type="date" id="res-data" required
                      value={reservationForm.dataChegada}
                      onChange={(e) => setReservationForm({...reservationForm, dataChegada: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="res-passeio" className="block text-sm font-medium text-sand-800 mb-1">Passeio de Interesse</label>
                  <select 
                    id="res-passeio" required
                    value={reservationForm.passeioDesejado}
                    onChange={(e) => setReservationForm({...reservationForm, passeioDesejado: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                  >
                    <option value="Ainda não decidi">Ainda não decidi</option>
                    {tours.map((t, idx) => (
                      <option key={t.id || idx} value={t.title}>{t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <h4 className="text-lg font-serif text-sand-900 mb-2">Saúde e Segurança</h4>
                  <p className="text-xs text-sand-600 mb-4">Para garantirmos a melhor experiência, por favor, nos informe:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="res-saude" className="block text-sm font-medium text-sand-800 mb-1">Problemas de Saúde ou Alergias?</label>
                      <textarea 
                        id="res-saude" rows={2}
                        value={reservationForm.problemasSaude}
                        onChange={(e) => setReservationForm({...reservationForm, problemasSaude: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder="Ex: Asma, alergia a frutos do mar, problemas cardíacos. (Especifique)"
                      />
                    </div>

                    <div>
                      <label htmlFor="res-fobias" className="block text-sm font-medium text-sand-800 mb-1">Possui alguma fobia?</label>
                      <textarea 
                        id="res-fobias" rows={2}
                        value={reservationForm.fobias}
                        onChange={(e) => setReservationForm({...reservationForm, fobias: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder="Ex: Medo de mar aberto, insetos, lugares fechados. (Avisaremos o que encontrará no caminho)"
                      />
                    </div>

                    <div>
                      <label htmlFor="res-medicamentos" className="block text-sm font-medium text-sand-800 mb-1">Toma algum medicamento?</label>
                      <textarea 
                        id="res-medicamentos" rows={2}
                        value={reservationForm.medicamentos}
                        onChange={(e) => setReservationForm({...reservationForm, medicamentos: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder="Ex: Aspirina, remédio para pressão, etc."
                      />
                    </div>

                    <div>
                      <label htmlFor="res-alimentacao" className="block text-sm font-medium text-sand-800 mb-1">Restrições Alimentares?</label>
                      <textarea 
                        id="res-alimentacao" rows={2}
                        value={reservationForm.restricoesAlimentares}
                        onChange={(e) => setReservationForm({...reservationForm, restricoesAlimentares: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none text-sm"
                        placeholder="Ex: Intolerância à lactose, vegano, alergia a camarão."
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-sand-200">
                  <label htmlFor="res-experiencia" className="block text-sm font-medium text-sand-800 mb-1">Nível de Experiência em Atividades ao Ar Livre</label>
                  <select 
                    id="res-experiencia" required
                    value={reservationForm.nivelExperiencia}
                    onChange={(e) => setReservationForm({...reservationForm, nivelExperiencia: e.target.value})}
                    className="w-full px-4 py-3 mb-4 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50"
                  >
                    <option value="Iniciante">Iniciante (Pouca ou nenhuma experiência)</option>
                    <option value="Intermediário">Intermediário (Pratica atividades ocasionalmente)</option>
                    <option value="Avançado">Avançado (Pratica frequentemente, bom preparo físico)</option>
                  </select>

                  <label htmlFor="res-obs" className="block text-sm font-medium text-sand-800 mb-1">Observações Gerais (Opcional)</label>
                  <textarea 
                    id="res-obs" rows={2}
                    value={reservationForm.observacoes}
                    onChange={(e) => setReservationForm({...reservationForm, observacoes: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:outline-none focus:ring-2 focus:ring-ocean-500 bg-sand-50 resize-none"
                    placeholder="Alguma dúvida ou pedido especial?"
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
                      <strong>Termo de Isenção de Responsabilidade:</strong> Declaro estar ciente de que as atividades de ecoturismo envolvem riscos inerentes. Ao prosseguir, assumo total responsabilidade por minha segurança, isentando a agência Capitães da Areia de qualquer responsabilidade civil ou criminal em caso de acidentes ou lesões durante os passeios.
                    </span>
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors flex justify-center items-center gap-2 mt-4"
                >
                  <MessageCircle className="w-5 h-5" />
                  Enviar para o WhatsApp
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
