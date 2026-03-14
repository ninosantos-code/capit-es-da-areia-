import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mocks to avoid external API calls during tests
vi.mock('./components/LazyImage', () => ({
  default: ({ alt, className }: any) => <img alt={alt} className={className} data-testid="lazy-image" />
}));

vi.mock('./components/ConnectionStatus', () => ({
  default: () => <div data-testid="connection-status">Online</div>
}));

describe('App Component', () => {
  it('should render the main navigation bar and title', () => {
    render(<App />);
    expect(screen.getAllByText(/Capitães/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/da Areia/i)[0]).toBeInTheDocument();
  });

  it('should render the tours (Nossos Passeios) section', () => {
    render(<App />);
    expect(screen.getByText('Piscinas Naturais de Moreré')).toBeInTheDocument();
    expect(screen.getByText('Volta à Ilha de Lancha')).toBeInTheDocument();
  });

  it('should open the reservation modal when clicking Reservar', () => {
    render(<App />);
    const buttons = screen.getAllByText('Reservar');
    fireEvent.click(buttons[0]); // Click the first Reservar button (navbar or mobile)
    
    expect(screen.getByText('Faça sua Reserva')).toBeInTheDocument();
  });

  it('should close the reservation modal when clicking X', () => {
    render(<App />);
    // Open modal
    const reserveButton = screen.getAllByText('Reservar')[0];
    fireEvent.click(reserveButton);
    expect(screen.getByText('Faça sua Reserva')).toBeInTheDocument();

    // Close modal (find the close button by looking at its parent or context, here we find the SVG X icon parent or we can use generic role bypass)
    // Since X icon is in a button without text, we can find the button near "Faça sua Reserva"
    const heading = screen.getByText('Faça sua Reserva');
    const closeBtn = heading.nextElementSibling;
    if(closeBtn) {
        fireEvent.click(closeBtn);
    }
    
    expect(screen.queryByText('Faça sua Reserva')).not.toBeInTheDocument();
  });

  it('should alert if terms are not accepted on form submit', () => {
    // mock window.alert
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(<App />);
    
    // Open modal
    fireEvent.click(screen.getAllByText('Reservar')[0]);
    
    // Find the Send Request button inside modal
    const sendButton = screen.getByText(/Enviar para o WhatsApp/i);
    fireEvent.submit(sendButton.closest('form')!);

    expect(alertMock).toHaveBeenCalledWith('Por favor, aceite o Termo de Isenção de Responsabilidade para continuar.');
    alertMock.mockRestore();
  });
});
