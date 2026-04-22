import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from './App';
import { logEvent } from 'firebase/analytics';

// Mocks to avoid external API calls during tests
vi.mock('./components/LazyImage', () => ({
  default: ({ alt, className }: any) => <img alt={alt} className={className} data-testid="lazy-image" />
}));

vi.mock('./components/ConnectionStatus', () => ({
  default: () => <div data-testid="connection-status">Online</div>
}));

vi.mock('firebase/analytics', () => ({
  logEvent: vi.fn(),
  getAnalytics: vi.fn()
}));

vi.mock('./lib/firebase', () => ({
  analytics: {},
  db: {},
  app: { name: '[DEFAULT]' },
  auth: {},
  firebaseConfig: {}
}));

vi.mock('./lib/adminService', () => ({
  adminService: {
    subscribeToTours: vi.fn((cb: any) => { cb([]); return vi.fn(); }),
    subscribeToSettings: vi.fn((cb: any) => { cb({}); return vi.fn(); }),
    subscribeToGallery: vi.fn((cb: any) => { cb([]); return vi.fn(); }),
    subscribeToTestimonials: vi.fn((cb: any) => { cb([]); return vi.fn(); }),
    subscribeToTranslations: vi.fn((cb: any) => { cb({}); return vi.fn(); }),
    onConnectionChange: vi.fn(() => vi.fn()),
    addTestimonial: vi.fn(() => Promise.resolve()),
    getInstagramFeed: vi.fn(() => Promise.resolve([])),
    seedDatabase: vi.fn(() => Promise.resolve()),
    verifyPassword: vi.fn(() => false),
  },
  Tour: {},
}));

describe('App Component', () => {
  it('● deve renderizar a barra de navegação e título', () => {
    render(<App />);
    expect(screen.getAllByText(/Capitães/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/da Areia/i)[0]).toBeInTheDocument();
  });

  it('● deve renderizar o botão de Reservar Agora na navbar', () => {
    render(<App />);
    expect(screen.getAllByText(/Reservar Agora/i).length).toBeGreaterThan(0);
  });

  it('● deve abrir modal de reserva ao clicar em Reservar Agora e enviar evento analytics', () => {
    render(<App />);
    const buttons = screen.getAllByText(/Reservar Agora/i);
    fireEvent.click(buttons[0]);
    
    expect(screen.getByText(/Solicitar Reserva/i)).toBeInTheDocument();
    
    expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'open_reservation_modal', {
       tour: 'Ainda não decidi'
    });
  });

  it('● deve alertar se termos não forem aceitos ao enviar formulário', () => {
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    
    // Abre modal
    fireEvent.click(screen.getAllByText(/Reservar Agora/i)[0]);
    
    // Encontra o botão de envio
    const sendButton = screen.getByText(/Enviar para o WhatsApp/i);
    fireEvent.submit(sendButton.closest('form')!);

    expect(alertMock).toHaveBeenCalledWith('Por favor, aceite o Termo de Isenção de Responsabilidade para continuar.');
    alertMock.mockRestore();
  });

  it('● deve enviar evento analytics ao submeter reserva válida', async () => {
    const windowOpenMock = vi.spyOn(window, 'open').mockImplementation(() => null);
    render(<App />);
    
    // Abre modal
    fireEvent.click(screen.getAllByText(/Reservar Agora/i)[0]);
    
    // Aceita termos
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    // Envia formulário
    const sendButton = screen.getByText(/Enviar para o WhatsApp/i);
    fireEvent.submit(sendButton.closest('form')!);

    await waitFor(() => {
      expect(windowOpenMock).toHaveBeenCalled();
      expect(logEvent).toHaveBeenCalledWith(expect.anything(), 'send_whatsapp_reservation', expect.objectContaining({
        tour: 'Ainda não decidi',
        qtd_pessoas: '1',
        has_kids: 'Não'
      }));
    });

    windowOpenMock.mockRestore();
  });

  it('● deve exibir seções básicas com traduções hardcoded quando Firestore está vazio', () => {
    render(<App />);
    // Verifica seções com tradução hardcoded (TRANSLATIONS)
    expect(screen.getAllByText(/Capitães/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Ilha de Boipeba/i).length).toBeGreaterThan(0);
  });

  it('● deve renderizar a prévia da Bioluminescência na Home', () => {
    render(<App />);
    expect(screen.getByText(/O Fenômeno da Bioluminescência/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver Detalhes da Experiência/i)).toBeInTheDocument();
  });

  it('● deve navegar para a página detalhada de Passeios Noturnos', async () => {
    render(<App />);
    const detailButton = screen.getByText(/Ver Detalhes da Experiência/i);
    
    await act(async () => {
      fireEvent.click(detailButton);
    });

    await waitFor(() => {
      expect(screen.getByText(/O que esperar da experiência/i)).toBeInTheDocument();
      expect(screen.getByText(/Voltar para o Início/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('● deve voltar para a Home ao clicar em Voltar na página de Passeios Noturnos', async () => {
    render(<App />);
    // Vai para a página detalhada
    await act(async () => {
      fireEvent.click(screen.getByText(/Ver Detalhes da Experiência/i));
    });
    
    // Clica em voltar
    const backButton = await screen.findByText(/Voltar para o Início/i);
    await act(async () => {
      fireEvent.click(backButton);
    });

    await waitFor(() => {
      // "Ilha de Boipeba, Bahia" é o texto no Hero da Home
      expect(screen.getByText(/Ilha de Boipeba, Bahia/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});
