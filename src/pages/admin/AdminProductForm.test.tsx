import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminProductForm from './AdminProductForm';
import api from '../../api/api';

const mockNavigate = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('../../api/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../hooks/hooks', () => ({
  useAppSelector: () => mockUseAppSelector(),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({}),
  };
});

describe('AdminProductForm image upload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue({ role: 'ADMIN' });
    (api.post as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
    (api.put as ReturnType<typeof vi.fn>).mockResolvedValue({ success: true });
  });

  it('submits multipart image uploads without forcing a manual content-type header', async () => {
    const { container } = render(<AdminProductForm />);

    fireEvent.change(container.querySelector('input[name="name"]') as HTMLInputElement, {
      target: { value: 'Test Product' },
    });
    fireEvent.change(container.querySelector('textarea[name="description"]') as HTMLTextAreaElement, {
      target: { value: 'A nice product description for testing' },
    });
    fireEvent.change(container.querySelector('input[name="price"]') as HTMLInputElement, {
      target: { value: '199.99' },
    });
    fireEvent.change(container.querySelector('input[name="category"]') as HTMLInputElement, {
      target: { value: 'Electronics' },
    });

    const file = new File(['image-content'], 'product.png', { type: 'image/png' });
    fireEvent.change(container.querySelector('input[type="file"]') as HTMLInputElement, {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole('button', { name: /create product/i }));

    await waitFor(() => expect(api.post).toHaveBeenCalled());

    expect(api.post).toHaveBeenCalledWith(
      '/api/products',
      expect.any(FormData),
      undefined,
    );
  });
});
