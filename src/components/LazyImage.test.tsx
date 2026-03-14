import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LazyImage from './LazyImage';

describe('LazyImage Component', () => {
  beforeEach(() => {
    // Reset any mocks
    vi.clearAllMocks();
  });

  it('should render a shimmer placeholder initially if not eager', () => {
    render(<LazyImage src="test.jpg" alt="test image" />);
    const wrapper = screen.getByTestId('lazy-image-wrapper');
    expect(wrapper).toBeInTheDocument();
    
    // Original image tag should not be in the DOM before intersection
    const img = screen.queryByAltText('test image');
    expect(img).not.toBeInTheDocument();
  });

  it('should render the image immediately if eager is true', () => {
    render(<LazyImage src="test.jpg" alt="test image" eager={true} />);
    const img = screen.getByAltText('test image');
    // Should be visible instantly
    expect(img).toHaveAttribute('src', 'test.jpg');
    // The shimmer should be gone since loading is bypassed/done
  });
});
