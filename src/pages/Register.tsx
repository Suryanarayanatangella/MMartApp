import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axios from 'axios';
import { useAppDispatch } from '../hooks/hooks';

// ── Schema ────────────────────────────────────────────────────────────────

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName:  z.string().min(2, 'Last name must be at least 2 characters'),
  email:     z.string().email('Invalid email address'),
  password:  z.string().min(6, 'Password must be at least 6 characters'),
  phone:     z.string().optional(),
});

type RegisterFormData = z.infer<typeof registerSchema>;

// ── Step type ─────────────────────────────────────────────────────────────

type Step = 'form' | 'otp';

// ── Constants ─────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// ── Component ─────────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [step,          setStep]          = useState<Step>('form');
  const [pendingEmail,  setPendingEmail]  = useState<string>('');
  const [otp,           setOtp]           = useState<string>('');
  const [loading,       setLoading]       = useState<boolean>(false);
  const [error,         setError]         = useState<string>('');
  const [showPassword,  setShowPassword]  = useState<boolean>(false);
  const [resendTimer,   setResendTimer]   = useState<number>(0);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // ── Step 1: Send OTP ─────────────────────────────────────────────────

  const onSubmit = async (data: RegisterFormData): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/send-otp`, data);
      setPendingEmail(data.email);
      setStep('otp');
      startResendTimer();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to send OTP');
      } else {
        setError('Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ───────────────────────────────────────────────

  const handleVerifyOtp = async (): Promise<void> => {
    if (otp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_BASE}/auth/verify-otp`, {
        email: pendingEmail,
        otp,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      dispatch({ type: 'auth/register/fulfilled', payload: res.data });
      navigate('/store');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Invalid OTP');
      } else {
        setError('Invalid OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────

  const handleResend = async (): Promise<void> => {
    if (resendTimer > 0) return;
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_BASE}/auth/send-otp`, getValues());
      startResendTimer();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || 'Failed to resend OTP');
      } else {
        setError('Failed to resend OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const startResendTimer = (): void => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ── OTP input handler ─────────────────────────────────────────────────

  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {step === 'form' ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Create an Account</h2>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input
                    {...register('firstName')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input
                    {...register('lastName')}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="you@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    className="w-full border rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone (optional)</label>
                <input
                  {...register('phone')}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="9876543210"
                />
              </div>

              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-blue-600 font-medium">Login</a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Continue'}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* OTP screen */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h2 className="text-2xl font-bold">Check your email</h2>
              <p className="text-gray-500 text-sm mt-2">
                We sent a 6-digit OTP to{' '}
                <span className="font-semibold text-gray-800">{pendingEmail}</span>
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Enter OTP</label>
                <input
                  value={otp}
                  onChange={handleOtpChange}
                  maxLength={6}
                  placeholder="123456"
                  className="w-full border rounded-lg px-3 py-3 text-center text-2xl tracking-[0.5em] font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length !== 6}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="text-center text-sm text-gray-500">
                Didn't receive it?{' '}
                <button
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-blue-600 font-medium disabled:text-gray-400"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </div>

              <button
                onClick={() => { setStep('form'); setError(''); setOtp(''); }}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to registration
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
