import React, { useState, useEffect } from 'react';
import { adminService, Tour } from '../../lib/adminService';
import { X, Save, Plus, Trash2, LogOut, Loader2, Instagram, MapPin, Play, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminDashboard({ isOpen, onClose }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [tours, setTours] = useState<Tour[]>([]);
  const [gallery, setGallery] = useState<{id: string, url: string, source: string, mediaType?: string}[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tours' | 'gallery' | 'testimonials' | 'settings'>('tours');
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(password)) {
      setIsAuthenticated(true);
      setError('');
      fetchInitialData();
    } else {
      setError('Senha incorreta');
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [toursData, galleryData, settingsData, testimonialsData] = await Promise.all([
        adminService.getTours(),
        adminService.getGallery(),
        adminService.getSettings(),
        adminService.getTestimonials()
      ]);
      setTours(toursData);
      setGallery(galleryData);
      setSettings(settingsData);
      setTestimonials(testimonialsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTour = async (id: string, data: Partial<Tour>) => {
    try {
      await adminService.updateTour(id, data);
      const updatedTours = await adminService.getTours();
      setTours(updatedTours);
    } catch (err) {
      alert('Erro ao atualizar passeio');
    }
  };

  const handleAddTour = async () => {
    // Add logic to service if needed, or just alert for now
    alert('Funcionalidade de adicionar passeio em desenvolvimento');
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
    } catch (err) {
      alert('Erro ao remover foto');
    } finally {
      setLoading(false);
    }
  };
  const handleApproveTestimonial = async (id: string) => {
    try {
      await adminService.approveTestimonial(id);
      const updated = await adminService.getTestimonials();
      setTestimonials(updated);
    } catch (err) {
      alert('Erro ao aprovar depoimento');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Deseja realmente remover este depoimento?')) return;
    try {
      await adminService.deleteTestimonial(id);
      const updated = await adminService.getTestimonials();
      setTestimonials(updated);
    } catch (err) {
      alert('Erro ao remover depoimento');
    }
  };


  const handleSeedDatabase = async () => {
    if (!confirm('Deseja inicializar o banco de dados com as informações padrão? Isso não apagará seus dados atuais, apenas preencherá o que estiver vazio.')) return;
    setLoading(true);
    try {
      await adminService.seedDatabase();
      await fetchInitialData();
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
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
                <h2 className="text-2xl font-serif text-sand-900">Painel de Controle</h2>
                <nav className="flex gap-2">
                  {(['tours', 'gallery', 'testimonials', 'settings'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-ocean-600 text-white shadow-md' : 'text-sand-600 hover:bg-sand-200'}`}
                    >
                      {tab === 'tours' ? 'Passeios' : tab === 'gallery' ? 'Galeria / Instagram' : tab === 'testimonials' ? 'Depoimentos' : 'Links e Contato'}
                    </button>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsAuthenticated(false)} className="p-2 text-sand-400 hover:text-red-500 transition-colors" title="Sair">
                  <LogOut className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-sand-400 hover:text-sand-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-sand-50/30">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-sand-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-ocean-500" />
                  <p className="font-light">Sincronizando com o banco de dados...</p>
                </div>
              ) : activeTab === 'tours' ? (
                <div className="grid gap-6">
                  {tours.map(tour => (
                    <div key={tour.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sand-100 grid md:grid-cols-[180px_1fr] gap-6 group hover:shadow-md transition-shadow">
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
                        <div className="flex gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-wider text-sand-400 font-bold">Duração</label>
                            <input 
                              defaultValue={tour.duration}
                              onBlur={(e) => handleUpdateTour(tour.id!, { duration: e.target.value })}
                              className="w-full text-xs uppercase tracking-wider font-medium text-sand-900 px-2 py-1 rounded bg-transparent hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={handleAddTour}
                    className="py-10 border-2 border-dashed border-sand-200 rounded-3xl text-sand-400 hover:text-ocean-600 hover:border-ocean-300 hover:bg-ocean-50 transition-all flex flex-col items-center justify-center gap-2 font-medium"
                  >
                    <Plus className="w-8 h-8" />
                    <span>Adicionar Novo Passeio</span>
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
                        
                        {/* Video Indicator in Admin */}
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
                        {/* Source Tag */}
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
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-sand-200 text-center text-sand-400">
                      Nenhum depoimento encontrado.
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {testimonials.map((t) => (
                        <div key={t.id} className={`bg-white p-6 rounded-2xl border ${t.approved ? 'border-green-100 shadow-sm' : 'border-amber-200 shadow-md transform scale-[1.01]'} transition-all`}>
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
              ) : (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* WhatsApp Settings */}
                  <div className="bg-white p-8 rounded-3xl border border-sand-100 shadow-sm space-y-6">
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
                      
                      <div className="pt-4 space-y-3 bg-ocean-50/50 p-6 rounded-2xl border border-ocean-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Instagram className="w-4 h-4 text-ocean-600" />
                          <label className="text-xs uppercase tracking-wider text-ocean-600 font-bold">Configuração do Feed Automático (Behold.so)</label>
                        </div>
                        <p className="text-xs text-ocean-800 font-light mb-2">Cole o link da "JSON URL" gerada no Behold para que o site se atualize sozinho.</p>
                        <div className="flex gap-2">
                          <input 
                            type="text"
                            placeholder="https://feeds.behold.so/v1/..."
                            key={settings?.instagram?.beholdUrl || 'empty'}
                            defaultValue={settings?.instagram?.beholdUrl}
                            id="behold-url-input"
                            className="flex-grow px-4 py-3 rounded-xl bg-white border border-ocean-200 outline-none focus:ring-2 focus:ring-ocean-500 text-sm shadow-sm"
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

                  {/* Other Settings */}
                  <div className="bg-white p-8 rounded-3xl border border-sand-100 shadow-sm space-y-6 flex flex-col">
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
                    <div className="p-4 bg-ocean-50 rounded-2xl text-xs text-ocean-700 italic font-light">
                      Dica: Alterar os links aqui atualizará automaticamente todos os botões "Reservar" e o rodapé do site.
                    </div>

                    <div className="pt-8 border-t border-sand-100 flex flex-col gap-4">
                      <h4 className="text-sm font-serif text-sand-900">Manutenção do Sistema</h4>
                      <button 
                        onClick={handleSeedDatabase}
                        className="w-full py-4 border-2 border-dashed border-sand-200 rounded-2xl text-sand-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all flex items-center justify-center gap-2 font-medium"
                      >
                        <Trash2 className="w-5 h-5" />
                        Inicializar Banco de Dados com Padrões
                      </button>
                      <p className="text-[10px] text-sand-400 text-center italic">
                        Use esta opção se o seu banco de dados estiver vazio para carregar as informações iniciais (Passeios, Fotos e Contatos).
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
