import { render, screen, act, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ConnectionStatus from './ConnectionStatus';

describe('ConnectionStatus Component', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    originalOnLine = navigator.onLine;
  });

  afterEach(() => {
    // Restore navigator.onLine mock status if changed
    vi.restoreAllMocks();
  });

  const setOnlineStatus = (status: boolean) => {
    vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(status);
  };

  it('should not show anything when online', () => {
    setOnlineStatus(true);
    const { container } = render(<ConnectionStatus />);
    
    // Nothing should be rendered in the document
    expect(container.firstChild).toBeNull();
  });

  it('should show offline banner when offline', () => {
    setOnlineStatus(false);
    render(<ConnectionStatus />);
    
    // Should show the offline banner
    expect(screen.getByText(/Você está offline/i)).toBeInTheDocument();
  });

  it('should react to offline/online events', () => {
    setOnlineStatus(true);
    const { container, rerender } = render(<ConnectionStatus />);
    expect(container.firstChild).toBeNull();

    // Trigger offline event
    act(() => {
      setOnlineStatus(false);
      window.dispatchEvent(new Event('offline'));
    });
    
    expect(screen.getByText(/Você está offline/i)).toBeInTheDocument();

    // Trigger online event
    act(() => {
      setOnlineStatus(true);
      window.dispatchEvent(new Event('online'));
    });

    // It should hide when online again
    expect(container.firstChild).toBeNull();
  });
});
