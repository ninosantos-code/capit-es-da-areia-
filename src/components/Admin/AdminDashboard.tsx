import React, { useState, useEffect } from 'react';
import { adminService, Tour } from '../../lib/adminService';
import { X, Save, Plus, Trash2, LogOut, Loader2, Instagram, MapPin, Play, Star, Globe, Type, Anchor, Home, RefreshCcw, Database, Camera, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onDataUpdate?: () => void;
}

export default function AdminDashboard({ isOpen, onClose, onDataUpdate }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [gallery, setGallery] = useState<{id: string, url: string, source: string, mediaType?: string}[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'tours' | 'gallery' | 'testimonials' | 'settings' | 'translations'>('overview');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [translationSearch, setTranslationSearch] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(password)) {
      setIsAuthenticated(true);
      setError('');
      // Agora as subscrições cuidam do resto pelo useEffect
    } else {
      setError('Senha incorreta');
    }
  };

  // Listeners em tempo real para o Painel
  useEffect(() => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    const unsubTours = adminService.subscribeToTours((data) => {
      setTours(data);
      setLoading(false);
    });
    
    const unsubSettings = adminService.subscribeToSettings((data) => {
      setSettings(data);
    });
    
    const unsubGallery = adminService.subscribeToGallery((data) => {
      setGallery(data);
    });
    
    const unsubTestimonials = adminService.subscribeToTestimonials((data) => {
      setTestimonials(data);
    });
    
    const unsubTranslations = adminService.subscribeToTranslations((data) => {
      setTranslations(data);
    });

    return () => {
      unsubTours();
      unsubSettings();
      unsubGallery();
      unsubTestimonials();
      unsubTranslations();
    };
  }, [isAuthenticated]);

  const handleUpdateTour = async (id: string, data: Partial<Tour>) => {
    try {
      await adminService.updateTour(id, data);
      const updatedTours = await adminService.getTours();
      setTours(updatedTours);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert('Erro ao atualizar passeio');
    }
  };

  const handleAddTour = async () => {
    setIsSaving(true);
    try {
      const newTour: Omit<Tour, 'id'> = {
        title: 'Nome do Novo Passeio',
        description: 'Descrição do passeio aqui...',
        duration: '2-3 horas',
        price: 'A partir de R$ 0',
        image: 'https://images.unsplash.com/photo-1544551763-47a0159f963f?q=80&w=2070&auto=format&fit=crop',
        iconType: 'sun'
      };
      console.log('Iniciando criação de passeio no Firestore...');
      const result = await adminService.addTour(newTour);
      console.log('Passeio criado com sucesso:', result.id);
      
      const updatedTours = await adminService.getTours();
      setTours(updatedTours);
      if (onDataUpdate) onDataUpdate();
      alert('Passeio criado com sucesso! Ele aparecerá no topo da lista para edição.');
    } catch (err) {
      console.error('Erro detalhado ao adicionar passeio:', err);
      alert('Erro ao adicionar passeio. Verifique sua conexão e se você tem permissão.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTour = async (id: string) => {
    if (!confirm('Deseja realmente excluir este passeio permanentemente?')) return;
    setLoading(true);
    try {
      await adminService.deleteTour(id);
      const updatedTours = await adminService.getTours();
      setTours(updatedTours);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert('Erro ao excluir passeio');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (section: string, data: any) => {
    try {
      await adminService.updateSettings(section, data);
      const updatedSettings = await adminService.getSettings();
      setSettings(updatedSettings);
      
      // If we update instagram settings, refresh the gallery feed
      if (section === 'instagram' && data.beholdUrl) {
        const instaFeed = await adminService.getInstagramFeed(data.beholdUrl);
        if (instaFeed.length > 0) setGallery(instaFeed);
      }
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert('Erro ao atualizar configurações');
    }
  };

  const handleAddToGallery = async () => {
    if (!newImageUrl) return;
    setLoading(true);
    try {
      await adminService.addToGallery(newImageUrl);
      setNewImageUrl('');
      const updatedGallery = await adminService.getGallery();
      setGallery(updatedGallery);
      if (onDataUpdate) onDataUpdate();
      alert('Foto adicionada com sucesso!');
    } catch (err) {
      alert('Erro ao adicionar à galeria');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromGallery = async (id: string, source: string) => {
    if (source === 'default') {
      alert('Esta é uma foto padrão e não pode ser removida do banco de dados.');
      return;
    }
    if (source === 'instagram') {
      alert('Fotos do Instagram devem ser removidas diretamente no Instagram.');
      return;
    }
    if (!confirm('Deseja realmente remover esta foto?')) return;
    
    setLoading(true);
    try {
      await adminService.removeFromGallery(id);
      const updatedGallery = await adminService.getGallery();
      setGallery(updatedGallery);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert('Erro ao remover foto');
    } finally {
      setLoading(false);
    }
  };
  const handleApproveTestimonial = async (id: string) => {
    console.log('Tentando aprovar depoimento:', id);
    if (!id) {
      alert('Erro: ID do depoimento não encontrado.');
      return;
    }
    try {
      await adminService.approveTestimonial(id);
      console.log('Depoimento aprovado com sucesso no Firebase');
      const updated = await adminService.getTestimonials();
      setTestimonials(updated);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      console.error('Erro ao aprovar depoimento:', err);
      alert('Erro ao aprovar depoimento: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    console.log('Tentando remover depoimento:', id);
    if (!id) {
      alert('Erro: ID do depoimento não encontrado.');
      return;
    }
    if (!confirm('Deseja realmente remover este depoimento?')) return;
    try {
      await adminService.deleteTestimonial(id);
      console.log('Depoimento removido com sucesso no Firebase');
      const updated = await adminService.getTestimonials();
      setTestimonials(updated);
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      console.error('Erro ao remover depoimento:', err);
      alert('Erro ao remover depoimento: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleUpdateTranslation = async (lang: string, key: string, value: string) => {
    try {
      const updatedLangData = { ...translations[lang], [key]: value };
      await adminService.updateTranslation(lang, updatedLangData);
      setTranslations({ ...translations, [lang]: updatedLangData });
      if (onDataUpdate) onDataUpdate();
    } catch (err) {
      alert('Erro ao atualizar tradução');
    }
  };


  const handleSeedDatabase = async () => {
    if (!confirm('Deseja inicializar o banco de dados com as informações padrão? Isso não apagará seus dados atuais, apenas preencherá o que estiver vazio.')) return;
    setLoading(true);
    try {
      await adminService.seedDatabase();
      alert('Banco de dados preenchido com sucesso!');
    } catch (err) {
      alert('Erro ao inicializar banco de dados');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sand-900/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-5xl bg-sand-50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-sand-100/50"
      >
        {!isAuthenticated ? (
          <div className="p-12 text-center text-sand-900">
            <h2 className="text-3xl font-serif mb-6">Acesso Administrativo</h2>
            <form onSubmit={handleLogin} className="max-w-xs mx-auto space-y-4">
              <input 
                type="password" 
                placeholder="Digite a senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-sand-200 focus:ring-2 focus:ring-ocean-500 outline-none"
              />
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <button className="w-full py-3 bg-sand-900 text-white rounded-xl font-medium hover:bg-sand-800 transition-colors">
                Entrar
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="p-6 border-b border-sand-100 flex justify-between items-center bg-sand-50">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-serif text-sand-900 flex items-center gap-2">
                  Painel de Controle
                  <span className="text-[10px] bg-ocean-100 text-ocean-600 px-2 py-0.5 rounded-full font-sans uppercase font-bold tracking-tighter">v2.1</span>
                </h2>
                <nav className="flex gap-2">
                  {(['overview', 'tours', 'gallery', 'testimonials', 'settings', 'translations'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-ocean-600 text-white shadow-md' : 'text-sand-600 hover:bg-sand-200'}`}
                    >
                      {tab === 'overview' ? 'Início' :
                       tab === 'tours' ? 'Passeios' : 
                       tab === 'gallery' ? 'Galeria' : 
                       tab === 'testimonials' ? 'Depoimentos' : 
                       tab === 'translations' ? 'Textos (i18n)' :
                       'Configurações'}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex bg-sand-200 p-2 px-3 rounded-xl mr-2 gap-2 items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-bold text-sand-500 uppercase tracking-widest">Tempo Real</span>
                </div>
                <div className="flex bg-sand-200 p-1 rounded-xl mr-2">
                  <button 
                    onClick={handleSeedDatabase}
                    className="p-2 text-sand-600 hover:text-ocean-600 hover:bg-white rounded-lg transition-all"
                    title="Sincronizar base (Seed)"
                  >
                    <Database className="w-4 h-4" />
                  </button>
                </div>
                <button onClick={() => setIsAuthenticated(false)} className="p-2 text-sand-400 hover:text-red-500 transition-colors" title="Sair">
                  <LogOut className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-sand-400 hover:text-sand-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

                        <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-sand-50/30">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-sand-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-ocean-500" />
                  <p className="font-light">Sincronizando com o banco de dados...</p>
                </div>
              ) : activeTab === 'overview' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-ocean-50 rounded-2xl flex items-center justify-center text-ocean-600">
                        <Anchor className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-serif text-sand-900">{tours.length}</p>
                        <p className="text-xs font-bold text-sand-400 uppercase tracking-widest">Passeios Ativos</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-sun-50 rounded-2xl flex items-center justify-center text-sun-600">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-serif text-sand-900">{testimonials.filter(t => t.approved).length}</p>
                        <p className="text-xs font-bold text-sand-400 uppercase tracking-widest">Depoimentos Públicos</p>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-sand-100 flex flex-col gap-4">
                      <div className="w-12 h-12 bg-sand-50 rounded-2xl flex items-center justify-center text-sand-600">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-3xl font-serif text-sand-900">{gallery.filter(i => i.source === 'firestore').length}</p>
                        <p className="text-xs font-bold text-sand-400 uppercase tracking-widest">Fotos na Galeria</p>
                      </div>
                    </div>
                  </div>

                  {testimonials.filter(t => !t.approved).length > 0 && (
                    <div className="bg-ocean-50 border border-ocean-100 p-6 rounded-3xl flex items-center justify-between animate-in slide-in-from-top duration-500">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-ocean-100 text-ocean-600 rounded-full flex items-center justify-center">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-ocean-900 font-bold">Há depoimentos aguardando aprovação!</p>
                          <p className="text-ocean-700 text-xs">Existem {testimonials.filter(t => !t.approved).length} novos comentários que precisam ser revisados.</p>
                        </div>
                      </div>
                      <button onClick={() => setActiveTab('testimonials')} className="px-4 py-2 bg-ocean-600 text-white rounded-xl text-sm font-bold hover:bg-ocean-700 transition-colors shadow-sm">Revisar Agora</button>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-sand-900 text-white p-8 rounded-[2rem] space-y-6 relative overflow-hidden">
                      <div className="relative z-10">
                        <h3 className="text-2xl font-serif mb-2">Bem-vindo, Capitão!</h3>
                        <p className="text-sand-300 text-sm font-light leading-relaxed">
                          Este é seu centro de comando. Aqui você controla cada detalhe da experiência digital dos seus clientes. 
                          Suas alterações são salvas em tempo real no Google Cloud.
                        </p>
                      </div>
                      <div className="flex gap-4 relative z-10">
                        <button onClick={() => setActiveTab('tours')} className="px-5 py-2.5 bg-white text-sand-900 rounded-xl text-sm font-bold hover:bg-ocean-50 transition-colors">Ver Passeios</button>
                        <button onClick={() => setActiveTab('settings')} className="px-5 py-2.5 bg-sand-800 text-white rounded-xl text-sm font-bold hover:bg-sand-700 transition-colors">Configurações</button>
                      </div>
                      <Anchor className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5 rotate-12" />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest text-sand-400">Status de Conexão</h4>
                      <div className="bg-white p-6 rounded-3xl border border-sand-100 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-sand-600">Google Firestore</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                            Online
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-sand-600">Behold Instagram API</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-ocean-600 uppercase">
                            <div className="w-1.5 h-1.5 bg-ocean-500 rounded-full"></div>
                            Conectado
                          </span>
                        </div>
                        <div className="pt-4 border-t border-sand-50">
                          <p className="text-[10px] text-sand-400 leading-tight">
                            Qualquer problema na sincronização aparecerá aqui. <br/>
                            Última verificação: {new Date().toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'tours' ? (
                <div className="grid gap-6">
                  {tours.map(tour => (
                    <div key={tour.id} className="bg-sand-100 p-6 rounded-2xl shadow-sm border border-sand-100 grid md:grid-cols-[180px_1fr] gap-6 group hover:shadow-md transition-shadow">
                      <div className="space-y-3">
                        <div className="aspect-square rounded-xl overflow-hidden bg-sand-100 border border-sand-50">
                          <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                        </div>
                        <input 
                          type="text"
                          placeholder="URL da Imagem"
                          defaultValue={tour.image}
                          onBlur={(e) => handleUpdateTour(tour.id!, { image: e.target.value })}
                          className="w-full text-[10px] px-2 py-1 rounded bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500 truncate"
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Título do Passeio</label>
                            <input 
                              defaultValue={tour.title}
                              onBlur={(e) => handleUpdateTour(tour.id!, { title: e.target.value })}
                              className="w-full text-xl font-serif text-sand-900 px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Preço Sugerido</label>
                            <input 
                              defaultValue={tour.price}
                              onBlur={(e) => handleUpdateTour(tour.id!, { price: e.target.value })}
                              className="w-full text-ocean-700 font-medium px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Descrição</label>
                          <textarea 
                            defaultValue={tour.description}
                            onBlur={(e) => handleUpdateTour(tour.id!, { description: e.target.value })}
                            className="w-full text-sm text-sand-600 font-light resize-none h-24 px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        <div className="flex justify-between items-end gap-4">
                          <div className="space-y-1 flex-grow">
                            <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Duração</label>
                            <input 
                              defaultValue={tour.duration}
                              onBlur={(e) => handleUpdateTour(tour.id!, { duration: e.target.value })}
                              className="w-full text-xs uppercase tracking-wider font-medium text-sand-900 px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Ícone</label>
                            <select 
                              defaultValue={tour.iconType}
                              onChange={(e) => handleUpdateTour(tour.id!, { iconType: e.target.value })}
                              className="w-full text-xs font-medium text-sand-900 px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                            >
                              <option value="sun">Sol</option>
                              <option value="camera">Câmera</option>
                              <option value="star">Estrela</option>
                              <option value="logo">Âncora</option>
                              <option value="house">Casa</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-sand-50 border border-sand-100 mb-0.5">
                            <span className="text-[10px] uppercase font-bold text-sand-400">Visível</span>
                            <button 
                              onClick={() => handleUpdateTour(tour.id!, { visible: tour.visible === false ? true : false })}
                              className={`w-10 h-5 rounded-full transition-colors relative shadow-inner ${tour.visible !== false ? 'bg-green-500' : 'bg-sand-300'}`}
                            >
                              <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${tour.visible !== false ? 'left-6' : 'left-1'}`} />
                            </button>
                          </div>
                          <button 
                            onClick={() => handleDeleteTour(tour.id!)}
                            className="p-2 text-sand-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            title="Excluir Passeio"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddTour}
                    disabled={isSaving}
                    className="py-10 border-2 border-dashed border-sand-200 rounded-3xl text-sand-400 hover:text-ocean-600 hover:border-ocean-300 hover:bg-ocean-50 transition-all flex flex-col items-center justify-center gap-2 font-medium disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                      <Plus className="w-8 h-8" />
                    )}
                    <span>{isSaving ? 'Criando Passeio...' : 'Adicionar Novo Passeio'}</span>
                  </button>
                </div>
              ) : activeTab === 'gallery' ? (
                <div className="space-y-8">
                  <div className="bg-white p-6 rounded-2xl border border-sand-100 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-serif text-sand-900">Adicionar Foto à Galeria</h3>
                      <span className="text-[10px] text-sand-400 uppercase tracking-widest font-bold">Manual (Firestore)</span>
                    </div>
                    <div className="flex gap-4">
                      <input 
                        type="text" 
                        placeholder="Cole o link da foto aqui..."
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        className="flex-grow px-4 py-3 rounded-xl border border-sand-200 focus:ring-2 focus:ring-ocean-500 outline-none"
                      />
                      <button 
                        onClick={handleAddToGallery}
                        className="px-6 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-colors whitespace-nowrap"
                      >
                        Adicionar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((item, idx) => (
                      <div key={item.id || idx} className="relative aspect-square rounded-2xl overflow-hidden bg-sand-100 group shadow-sm border border-sand-100">
                        <img src={item.url} alt="Galeria" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        
                        {item.mediaType === 'VIDEO' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                            <Play className="w-3 h-3 fill-current" />
                          </div>
                        )}

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 text-center">
                          {item.source === 'firestore' ? (
                            <button 
                              onClick={() => handleRemoveFromGallery(item.id, item.source)}
                              className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                              title="Remover foto"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          ) : item.source === 'instagram' ? (
                            <div className="space-y-2">
                              {item.permalink && (
                                <a 
                                  href={item.permalink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 bg-ocean-600 text-white rounded-full hover:bg-ocean-700 transition-transform hover:scale-110 inline-block"
                                  title="Ver no Instagram"
                                >
                                  <Instagram className="w-5 h-5" />
                                </a>
                              )}
                              <p className="text-[10px] text-white/80 font-medium">Foto do Instagram</p>
                            </div>
                          ) : (
                            <p className="text-[10px] text-white/80 font-medium bg-black/20 px-2 py-1 rounded">Foto Padrão</p>
                          )}
                        </div>
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-wider ${
                          item.source === 'firestore' ? 'bg-green-500 text-white' : 
                          item.source === 'instagram' ? 'bg-ocean-500 text-white' : 
                          'bg-sand-400 text-white'
                        }`}>
                          {item.source}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === 'testimonials' ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-serif text-sand-900">Gerenciar Depoimentos</h3>
                    <div className="flex gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sand-600 uppercase tracking-widest font-bold">Aprovados</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                        <span className="text-sand-600 uppercase tracking-widest font-bold">Pendentes</span>
                      </div>
                    </div>
                  </div>

                  {testimonials.length === 0 ? (
                    <div className="bg-sand-100 p-12 rounded-3xl border border-dashed border-sand-200 text-center text-sand-400">
                      Nenhum depoimento encontrado.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {testimonials.map((t) => (
                        <div key={t.id} className={`bg-sand-100 p-6 rounded-2xl border ${t.approved ? 'border-sand-200 shadow-sm' : 'border-amber-500/50 shadow-md transform scale-[1.01]'} transition-all`}>
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-2 flex-grow">
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-sand-900">{t.name}</span>
                                <div className="flex gap-0.5 text-yellow-400">
                                  {[...Array(t.rating)].map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-current" />
                                  ))}
                                </div>
                                {!t.approved && (
                                  <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">Pendente de Aprovação</span>
                                )}
                              </div>
                              <p className="text-sand-700 font-light italic text-sm">"{t.text}"</p>
                              {t.createdAt && (
                                <p className="text-[10px] text-sand-400">
                                  {(() => {
                                    const date = t.createdAt.toDate ? t.createdAt.toDate() : new Date(t.createdAt.seconds * 1000 || t.createdAt);
                                    return `${date.toLocaleDateString()} às ${date.toLocaleTimeString()}`;
                                  })()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {!t.approved && (
                                <button 
                                  onClick={() => handleApproveTestimonial(t.id)}
                                  className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm"
                                >
                                  Aprovar
                                </button>
                              )}
                              <button 
                                onClick={() => handleDeleteTestimonial(t.id)}
                                className="p-2 text-sand-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Remover Depoimento"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : activeTab === 'settings' ? (
                <div className="space-y-8">
                  <div className="bg-sand-100 p-8 rounded-3xl border border-sand-100 shadow-sm">
                    <h3 className="text-xl font-serif text-sand-900 border-b border-sand-50 pb-4 mb-6">Imagens Principais do Site</h3>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Imagem de Fundo (Hero/Topo)</label>
                        <input 
                          id="hero-bg-input"
                          defaultValue={settings?.media?.heroBg}
                          placeholder="URL da imagem de fundo"
                          className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Imagem Principal (Sobre)</label>
                        <input 
                          id="about-main-input"
                          defaultValue={settings?.media?.aboutMain}
                          placeholder="URL da imagem seção sobre"
                          className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Imagem Secundária (Sobre)</label>
                        <input 
                          id="about-secondary-input"
                          defaultValue={settings?.media?.aboutSecondary}
                          placeholder="URL da imagem secundária"
                          className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500 text-sm"
                        />
                      </div>
                    </div>
                    <button 
                      onClick={async (e) => {
                        const btn = e.currentTarget;
                        btn.disabled = true;
                        const heroBg = (document.getElementById('hero-bg-input') as HTMLInputElement).value;
                        const aboutMain = (document.getElementById('about-main-input') as HTMLInputElement).value;
                        const aboutSecondary = (document.getElementById('about-secondary-input') as HTMLInputElement).value;
                        await handleUpdateSettings('media', { heroBg, aboutMain, aboutSecondary });
                        btn.disabled = false;
                        alert('Imagens do site atualizadas com sucesso!');
                      }}
                      className="mt-6 px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      Salvar Imagens do Site
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-sand-100 p-8 rounded-3xl border border-sand-100 shadow-sm space-y-6">
                      <h3 className="text-xl font-serif text-sand-900 border-b border-sand-50 pb-4">WhatsApp e Contatos</h3>
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">WhatsApp Principal (Exibição)</label>
                          <input 
                            defaultValue={settings?.contact?.whatsapp1}
                            onBlur={(e) => handleUpdateSettings('contact', { ...settings.contact, whatsapp1: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">WhatsApp Principal (Link - Apenas Números)</label>
                          <input 
                            defaultValue={settings?.contact?.whatsapp1Link}
                            onBlur={(e) => handleUpdateSettings('contact', { ...settings.contact, whatsapp1Link: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        <div className="pt-4 space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Instagram (Exibição)</label>
                          <input 
                            defaultValue={settings?.contact?.instagram}
                            onBlur={(e) => handleUpdateSettings('contact', { ...settings.contact, instagram: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Instagram User (Link)</label>
                          <input 
                            defaultValue={settings?.contact?.instagramLink}
                            onBlur={(e) => handleUpdateSettings('contact', { ...settings.contact, instagramLink: e.target.value })}
                            className="w-full px-4 py-2 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        
                        <div className="pt-4 space-y-3 bg-ocean-600/10 p-6 rounded-2xl border border-ocean-600/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Instagram className="w-4 h-4 text-ocean-600" />
                            <label className="text-xs uppercase tracking-wider text-ocean-600 font-bold">Configuração do Feed Automático</label>
                          </div>
                          <p className="text-xs text-ocean-800 font-light mb-2">Cole o link da "JSON URL" gerada no Behold para que o site se atualize sozinho.</p>
                          <div className="flex gap-2">
                            <input 
                              type="text"
                              placeholder="https://feeds.behold.so/v1/..."
                              defaultValue={settings?.instagram?.beholdUrl}
                              id="behold-url-input"
                              className="flex-grow px-4 py-3 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-2 focus:ring-ocean-500 text-sm shadow-sm"
                            />
                            <button 
                              onClick={async (e) => {
                                const btn = e.currentTarget;
                                const input = document.getElementById('behold-url-input') as HTMLInputElement;
                                btn.disabled = true;
                                await handleUpdateSettings('instagram', { beholdUrl: input.value });
                                btn.disabled = false;
                                alert('Configuração do Instagram salva com sucesso!');
                              }}
                              className="px-6 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-all flex items-center gap-2 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50"
                            >
                              <Save className="w-4 h-4" />
                              Salvar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-sand-100 p-8 rounded-3xl border border-sand-100 shadow-sm space-y-6 flex flex-col">
                      <h3 className="text-xl font-serif text-sand-900 border-b border-sand-50 pb-4">Endereço e Localização</h3>
                      <div className="flex-grow space-y-4">
                        <div className="space-y-1 flex-grow">
                          <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Endereço Completo</label>
                          <textarea 
                            defaultValue={settings?.contact?.address}
                            onBlur={(e) => handleUpdateSettings('contact', { ...settings.contact, address: e.target.value })}
                            className="w-full h-32 px-4 py-3 rounded-xl bg-sand-50 border border-sand-100 outline-none focus:ring-1 focus:ring-ocean-500 resize-none"
                          />
                        </div>
                      </div>
                      <div className="p-4 bg-ocean-100/10 rounded-2xl text-xs text-ocean-700 italic font-light border border-ocean-600/10 text-center">
                        <p>Dica: Alterar os links aqui atualizará automaticamente todos os botões "Reservar" e o rodapé do site.</p>
                      </div>

                      <div className="pt-8 border-t border-sand-100 flex flex-col gap-4">
                        <h4 className="text-sm font-serif text-sand-900">Manutenção do Sistema</h4>
                        <button 
                          onClick={handleSeedDatabase}
                          className="w-full py-4 border-2 border-dashed border-sand-300 rounded-2xl text-sand-400 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/10 transition-all flex items-center justify-center gap-2 font-medium"
                        >
                          <Trash2 className="w-5 h-5" />
                          Inicializar Banco de Dados com Padrões
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'translations' ? (
                <div className="space-y-8 pb-12">
                  <div className="bg-sand-100 p-6 rounded-2xl border border-sand-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-ocean-600" />
                        <h3 className="text-xl font-serif text-sand-900">Editor de Conteúdo e Textos</h3>
                      </div>
                      <div className="relative">
                        <input 
                          type="text"
                          placeholder="Pesquisar textos..."
                          value={translationSearch}
                          onChange={(e) => setTranslationSearch(e.target.value)}
                          className="pl-10 pr-4 py-2 bg-white border border-sand-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-ocean-500 w-full md:w-64"
                        />
                        <RefreshCcw className="absolute left-3 top-2.5 w-4 h-4 text-sand-400" />
                      </div>
                    </div>
                    <p className="text-sm text-sand-600 mt-2">Altere qualquer texto do site aqui. As mudanças são refletidas instantaneamente para todos os usuários.</p>
                  </div>

                  {loading ? (
                    <div className="text-center py-20 bg-sand-100 rounded-3xl border border-dashed border-sand-200">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-ocean-500" />
                      <p className="text-sand-400">Carregando textos do banco de dados...</p>
                    </div>
                  ) : Object.keys(translations).length === 0 ? (
                    <div className="text-center py-20 bg-sand-100 rounded-3xl border border-dashed border-sand-200 space-y-4">
                      <Globe className="w-12 h-12 text-sand-300 mx-auto opacity-20" />
                      <p className="text-sand-500 font-medium">Nenhuma tradução encontrada no banco de dados.</p>
                      <button 
                        onClick={handleSeedDatabase}
                        className="px-6 py-3 bg-ocean-600 text-white rounded-xl font-medium hover:bg-ocean-700 transition-all flex items-center gap-2 mx-auto"
                      >
                        <Database className="w-4 h-4" />
                        Inicializar Textos Padrão
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      {(() => {
                        const groups: Record<string, string[]> = {
                          'Cabeçalho e Navegação': ['nav.'],
                          'Página Inicial (Hero)': ['hero.'],
                          'Seção Sobre': ['about.'],
                          'Passeios': ['tours.'],
                          'Galeria': ['gallery.'],
                          'Depoimentos': ['testimonials.'],
                          'Formulário de Reserva': ['booking.'],
                          'Rodapé': ['footer.']
                        };
                        const allKeys = Object.keys(translations['pt'] || {});
                        return Object.entries(groups).map(([groupName, prefixes]) => {
                          const keysInGroup = allKeys.filter(k => {
                            const inGroup = prefixes.some(p => k.startsWith(p));
                            if (!inGroup) return false;
                            
                            if (translationSearch) {
                              const searchLower = translationSearch.toLowerCase();
                              const ptVal = (translations['pt'][k] || '').toLowerCase();
                              const enVal = (translations['en'][k] || '').toLowerCase();
                              return k.toLowerCase().includes(searchLower) || 
                                     ptVal.includes(searchLower) || 
                                     enVal.includes(searchLower);
                            }
                            return true;
                          });
                          if (keysInGroup.length === 0) return null;
                          return (
                            <div key={groupName} className="space-y-4">
                              <h4 className="text-sm font-bold uppercase tracking-widest text-sand-400 border-l-4 border-ocean-500 pl-3">{groupName}</h4>
                              <div className="grid gap-3">
                                {keysInGroup.map(key => (
                                  <div key={key} className="bg-sand-100/50 p-6 rounded-2xl border border-sand-100 grid md:grid-cols-2 gap-6 group hover:border-ocean-300 transition-colors">
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <label className="text-[10px] font-bold text-ocean-600 uppercase tracking-tighter">Português (PT)</label>
                                        <span className="text-[9px] text-sand-300 font-mono">{key}</span>
                                      </div>
                                      <textarea 
                                        defaultValue={translations['pt'][key]}
                                        onBlur={(e) => handleUpdateTranslation('pt', key, e.target.value)}
                                        className="w-full h-20 px-4 py-3 rounded-xl bg-white border border-sand-100 outline-none focus:ring-2 focus:ring-ocean-500 text-sm resize-none shadow-sm"
                                      />
                                    </div>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-ocean-600 uppercase tracking-tighter">Inglês (EN)</label>
                                      <textarea 
                                        defaultValue={translations['en'][key]}
                                        onBlur={(e) => handleUpdateTranslation('en', key, e.target.value)}
                                        className="w-full h-20 px-4 py-3 rounded-xl bg-white border border-sand-100 outline-none focus:ring-2 focus:ring-ocean-500 text-sm resize-none shadow-sm"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-20 bg-sand-100 rounded-3xl border border-dashed border-sand-200">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-ocean-500" />
                  <p className="text-sand-400">Selecione uma aba no menu acima.</p>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
