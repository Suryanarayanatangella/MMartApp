import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { selectCartItems, clearCart } from '../store/cartSlice';
import { selectCurrentUser, selectIsLoggedIn } from '../store/authSlice';
import api from '../api/api';

// ── Extend Window for Razorpay ────────────────────────────────────────────

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// ── Schema ────────────────────────────────────────────────────────────────

const shippingSchema = z.object({
  shippingAddress: z.string().min(5,  'Address is required'),
  shippingCity:    z.string().min(2,  'City is required'),
  shippingState:   z.string().min(2,  'State is required'),
  shippingZip:     z.string().min(4,  'PIN code is required'),
  shippingPhone:   z.string().min(10, 'Valid phone number is required'),
});

type ShippingFormData = z.infer<typeof shippingSchema>;

// ── Component ─────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const dispatch   = useAppDispatch();
  const navigate   = useNavigate();
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const user       = useAppSelector(selectCurrentUser);
  const items      = useAppSelector(selectCartItems);

  const [paying, setPaying] = useState<boolean>(false);
  const [error,  setError]  = useState<string>('');

  // Load Razorpay script on mount
  useEffect(() => {
    const preconnect    = document.createElement('link');
    preconnect.rel      = 'preconnect';
    preconnect.href     = 'https://checkout.razorpay.com';
    document.head.appendChild(preconnect);

    const script        = document.createElement('script');
    script.src          = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async        = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
      document.head.removeChild(preconnect);
    };
  }, []);

  useEffect(() => { if (!isLoggedIn) navigate('/login?redirect=/checkout'); }, [isLoggedIn, navigate]);
  useEffect(() => { if (isLoggedIn && items.length === 0) navigate('/cart'); }, [items, isLoggedIn, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
  });

  const subtotal   = useMemo(() => items.reduce((sum, item) => {
    const price    = Number(item.product.price)    || 0;
    const discount = Number(item.product.discount) || 0;
    return sum + (price - (price * discount) / 100) * item.quantity;
  }, 0), [items]);

  const delivery   = subtotal >= 500 ? 0 : 50;
  const grandTotal = subtotal + delivery;

  const onSubmit = async (shippingData: ShippingFormData): Promise<void> => {
    setError('');
    setPaying(true);
    try {
      const orderData = await api.post<{ orderId: string; amount: number; currency: string; keyId: string }>(
        '/api/orders/razorpay/create-order', {}
      );
      const { orderId, amount, currency, keyId } = orderData as unknown as {
        orderId: string; amount: number; currency: string; keyId: string;
      };

      const options: Record<string, unknown> = {
        key:         keyId,
        amount,
        currency,
        name:        'M-Mart',
        description: 'Order Payment',
        order_id:    orderId,
        prefill: {
          name:    `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
          email:   user?.email ?? '',
          contact: shippingData.shippingPhone,
        },
        theme: { color: '#2563eb' },
        handler: async (response: Record<string, string>) => {
          try {
            const result = await api.post<{ order: { id: string } }>('/api/orders/razorpay/verify', {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              ...shippingData,
            });
            dispatch(clearCart());
            navigate(`/order-success?orderId=${(result as unknown as { order: { id: string } }).order.id}`);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment verification failed');
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate payment');
      setPaying(false);
    }
  };

  return (
    <div>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">{error}</div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Shipping form */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Shipping Details</h2>
              <div>
                <label htmlFor="shippingAddress" className="block text-sm font-medium mb-1">Full Address</label>
                <textarea {...register('shippingAddress')} rows={3}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House no, Street, Area" />
                {errors.shippingAddress && <p className="text-red-500 text-xs mt-1">{errors.shippingAddress.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {([
                  { field: 'shippingCity',  label: 'City',     placeholder: 'Hyderabad'  },
                  { field: 'shippingState', label: 'State',    placeholder: 'Telangana'  },
                  { field: 'shippingZip',   label: 'PIN Code', placeholder: '500001'     },
                  { field: 'shippingPhone', label: 'Phone',    placeholder: '9876543210' },
                ] as const).map(({ field, label, placeholder }) => (
                  <div key={field}>
                    <label htmlFor={field} className="block text-sm font-medium mb-1">{label}</label>
                    <input {...register(field)} placeholder={placeholder}
                      className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field]?.message}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {items.map((item) => {
                    const price    = Number(item.product.price)    || 0;
                    const discount = Number(item.product.discount) || 0;
                    const final    = price - (price * discount) / 100;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <img src={item.product.image || 'https://placehold.co/48x48'} alt={item.product.name}
                          loading="lazy" className="w-12 h-12 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 line-clamp-1">{item.product.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">₹{(final * item.quantity).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
                <hr className="mb-4" />
                <div className="space-y-2 text-sm text-gray-600 mb-6">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span className={delivery === 0 ? 'text-green-600 font-medium' : 'font-medium text-gray-900'}>
                      {delivery === 0 ? 'FREE' : `₹${delivery}`}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between text-base font-bold text-gray-900">
                    <span>Total</span><span>₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button aria-label="Proceed to payment" type="submit" disabled={paying}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 transition-colors">
                  {paying
                    ? <><Loader2 size={18} className="animate-spin" /> Processing...</>
                    : <><ShieldCheck size={18} /> Pay ₹{grandTotal.toFixed(2)}</>
                  }
                </button>
                <p className="text-xs text-center text-gray-400 mt-3">Secured by Razorpay</p>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
