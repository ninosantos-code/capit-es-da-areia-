import React, { useState, useEffect } from 'react';
import { adminService, Tour } from '../../lib/adminService';
import { X, Save, Plus, Trash2, LogOut, Loader2 } from 'lucide-react';
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
  const [gallery, setGallery] = useState<string[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tours' | 'gallery' | 'settings'>('tours');
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
      const [toursData, galleryData, settingsData] = await Promise.all([
        adminService.getTours(),
        adminService.getGallery(),
        adminService.getSettings()
      ]);
      setTours(toursData);
      setGallery(galleryData);
      setSettings(settingsData);
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
    } catch (err) {
      alert('Erro ao atualizar configurações');
    }
  };

  const handleAddToGallery = async () => {
    if (!newImageUrl) return;
    try {
      await adminService.addToGallery(newImageUrl);
      setNewImageUrl('');
      const updatedGallery = await adminService.getGallery();
      setGallery(updatedGallery);
    } catch (err) {
      alert('Erro ao adicionar à galeria');
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
                  {(['tours', 'gallery', 'settings'] as const).map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`text-sm font-medium px-4 py-2 rounded-xl transition-all ${activeTab === tab ? 'bg-ocean-600 text-white shadow-md' : 'text-sand-600 hover:bg-sand-200'}`}
                    >
                      {tab === 'tours' ? 'Passeios' : tab === 'gallery' ? 'Galeria / Instagram' : 'Links e Contato'}
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
                    <h3 className="text-lg font-serif mb-4 text-sand-900">Adicionar Foto à Galeria</h3>
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
                    {gallery.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden bg-sand-100 group shadow-sm border border-sand-100">
                        <img src={url} alt="Galeria" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-transform hover:scale-110"
                            title="Remover foto"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
