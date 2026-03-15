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
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'tours' | 'settings'>('tours');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminService.verifyPassword(password)) {
      setIsAuthenticated(true);
      setError('');
      fetchData();
    } else {
      setError('Senha incorreta');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getTours();
      setTours(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTour = async (id: string, data: Partial<Tour>) => {
    try {
      await adminService.updateTour(id, data);
      fetchData();
    } catch (err) {
      alert('Erro ao atualizar');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-sand-900/80 backdrop-blur-md" onClick={onClose} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {!isAuthenticated ? (
          <div className="p-12 text-center">
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
                <h2 className="text-2xl font-serif">Painel de Controle</h2>
                <nav className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('tours')}
                    className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${activeTab === 'tours' ? 'bg-ocean-600 text-white' : 'text-sand-600 hover:bg-sand-200'}`}
                  >
                    Passeios
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`text-sm font-medium px-3 py-1 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-ocean-600 text-white' : 'text-sand-600 hover:bg-sand-200'}`}
                  >
                    Configurações
                  </button>
                </nav>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsAuthenticated(false)} className="p-2 text-sand-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-5 h-5" />
                </button>
                <button onClick={onClose} className="p-2 text-sand-400 hover:text-sand-900 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-6 space-y-8 bg-sand-50/30">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-sand-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2" />
                  <p>Carregando dados...</p>
                </div>
              ) : activeTab === 'tours' ? (
                <div className="grid gap-6">
                  {tours.map(tour => (
                    <div key={tour.id} className="bg-white p-6 rounded-2xl shadow-sm border border-sand-100 grid md:grid-cols-[150px_1fr] gap-6">
                      <div className="aspect-square rounded-xl overflow-hidden bg-sand-100">
                        <img src={tour.image} alt={tour.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <input 
                            defaultValue={tour.title}
                            onBlur={(e) => handleUpdateTour(tour.id!, { title: e.target.value })}
                            className="text-xl font-serif px-2 py-1 rounded hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                          <input 
                            defaultValue={tour.price}
                            onBlur={(e) => handleUpdateTour(tour.id!, { price: e.target.value })}
                            className="text-ocean-700 font-medium px-2 py-1 rounded hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                        <textarea 
                          defaultValue={tour.description}
                          onBlur={(e) => handleUpdateTour(tour.id!, { description: e.target.value })}
                          className="w-full text-sm text-sand-600 font-light resize-none h-20 px-2 py-1 rounded hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                        />
                        <div className="flex gap-4">
                          <input 
                            defaultValue={tour.duration}
                            onBlur={(e) => handleUpdateTour(tour.id!, { duration: e.target.value })}
                            className="text-xs uppercase tracking-wider font-medium text-sand-400 px-2 py-1 rounded hover:bg-sand-50 outline-none focus:ring-1 focus:ring-ocean-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button className="py-4 border-2 border-dashed border-sand-200 rounded-2xl text-sand-400 hover:text-ocean-600 hover:border-ocean-300 transition-all flex items-center justify-center gap-2 font-medium">
                    <Plus className="w-5 h-5" />
                    Adicionar Novo Passeio
                  </button>
                </div>
              ) : (
                <div className="p-8 text-center text-sand-400 font-light italic">
                  Configurações do site (links, contatos) em breve.
                </div>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
