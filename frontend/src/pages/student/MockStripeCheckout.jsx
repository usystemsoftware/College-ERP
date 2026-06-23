import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { stripeWebhookAPI } from '../../api/fees.api';
import toast from 'react-hot-toast';
import { Lock, CreditCard, ShieldCheck } from 'lucide-react';

const MockStripeCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const feeId = searchParams.get('feeId');
  const installmentId = searchParams.get('installmentId');
  const amount = searchParams.get('amount');

  const [loading, setLoading] = useState(false);

  const handlePay = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Simulate network delay for realism
      await new Promise(resolve => setTimeout(resolve, 1500));

      const transactionId = `txn_${Math.random().toString(36).substr(2, 9)}`;
      
      await stripeWebhookAPI({
        feeId,
        installmentId,
        amount,
        transactionId
      });

      toast.success('Payment successful!');
      navigate('/student/fees');
    } catch (error) {
      toast.error('Payment failed. Please try again.');
      setLoading(false);
    }
  };

  if (!feeId || !amount) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <p className="text-red-500">Invalid checkout URL.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 font-sans text-slate-800">
      <div className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-center text-white">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Lock size={24} className="text-white/80" />
          </div>
          <h2 className="text-xl font-bold">Secure Checkout</h2>
          <p className="mt-1 text-sm text-slate-400">Powered by College ERP (Mock Mode)</p>
        </div>

        {/* Payment Summary */}
        <div className="border-b border-slate-100 bg-slate-50 p-6">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500">Amount Due</p>
          <p className="mt-1 text-center text-4xl font-extrabold text-slate-900">₹{Number(amount).toLocaleString()}</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handlePay} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Card Information</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <CreditCard size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="4242 4242 4242 4242"
                  defaultValue="4242 4242 4242 4242"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 py-3 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Expiry</label>
                <input
                  type="text"
                  required
                  placeholder="MM/YY"
                  defaultValue="12/26"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">CVC</label>
                <input
                  type="text"
                  required
                  placeholder="123"
                  defaultValue="123"
                  className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name on Card</label>
              <input
                type="text"
                required
                defaultValue="Student User"
                className="block w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Processing...
                </div>
              ) : (
                `Pay ₹${Number(amount).toLocaleString()}`
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-slate-500">
            <ShieldCheck size={14} className="text-green-500" />
            Guaranteed safe & secure checkout
          </div>
          <button 
            onClick={() => navigate('/student/fees')} 
            className="mt-4 block w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700"
          >
            Cancel and return
          </button>
        </div>
      </div>
    </div>
  );
};

export default MockStripeCheckout;
