'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Wallet, CreditCard, Banknote, Receipt, Download, Printer, Eye,
  CheckCircle, XCircle, Clock, AlertCircle, Calendar, Users,
  LogOut, Moon, Sun, MessageCircle, Bell, Settings, Home, ChevronRight,
  Plus, Send, Phone, Mail, ArrowRight, Lock, Shield, CreditCard as CardIcon
} from 'lucide-react';
import { useTheme } from '@/components/theme-provider';
import ActionButtons from '@/app/components/ActionButtons';

interface FeeItem {
  id: string;
  childName: string;
  className: string;
  term: string;
  amount: number;
  paid: number;
  due: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'unpaid';
}

interface PaymentHistory {
  id: string;
  childName: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: 'success' | 'pending' | 'failed';
}

export default function PaymentsPage() {
  const [user, setUser] = useState<any>(null);
  const [schoolName, setSchoolName] = useState('Your School');
  const [selectedChild, setSelectedChild] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mock fee data
  const [feeItems, setFeeItems] = useState<FeeItem[]>([
    {
      id: '1',
      childName: 'Adeola K.',
      className: 'SS2 Science',
      term: 'First Term 2024',
      amount: 150000,
      paid: 150000,
      due: 0,
      dueDate: '2024-03-30',
      status: 'paid'
    },
    {
      id: '2',
      childName: 'Adeola K.',
      className: 'SS2 Science',
      term: 'Second Term 2024',
      amount: 150000,
      paid: 0,
      due: 150000,
      dueDate: '2024-07-30',
      status: 'unpaid'
    },
    {
      id: '3',
      childName: 'Bola K.',
      className: 'JSS3 Art',
      term: 'First Term 2024',
      amount: 120000,
      paid: 100000,
      due: 20000,
      dueDate: '2024-03-30',
      status: 'partial'
    },
    {
      id: '4',
      childName: 'Bola K.',
      className: 'JSS3 Art',
      term: 'Second Term 2024',
      amount: 120000,
      paid: 0,
      due: 120000,
      dueDate: '2024-07-30',
      status: 'unpaid'
    }
  ]);

  // Mock payment history
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([
    {
      id: '1',
      childName: 'Adeola K.',
      amount: 150000,
      date: '2024-03-25',
      method: 'Card Payment',
      reference: 'TRX-001234',
      status: 'success'
    },
    {
      id: '2',
      childName: 'Bola K.',
      amount: 100000,
      date: '2024-03-20',
      method: 'Bank Transfer',
      reference: 'TRX-001235',
      status: 'success'
    }
  ]);

  useEffect(() => {
    setMounted(true);
    const savedUser = localStorage.getItem('classora_user');
    const savedSchool = localStorage.getItem('classora_school_name');
    if (savedUser) setUser(JSON.parse(savedUser));
    else window.location.href = '/';
    if (savedSchool) setSchoolName(savedSchool);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  const getStatusColor = (status: string) => {
    if (status === 'paid') return 'text-green-400 bg-green-500/20';
    if (status === 'partial') return 'text-yellow-400 bg-yellow-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'paid') return <CheckCircle className="w-4 h-4" />;
    if (status === 'partial') return <AlertCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const handlePayNow = (fee: FeeItem) => {
    setSelectedFee(fee);
    setPaymentAmount(fee.due);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      if (selectedFee) {
        // Update fee status
        setFeeItems(feeItems.map(f => 
          f.id === selectedFee.id 
            ? { ...f, paid: f.amount, due: 0, status: 'paid' }
            : f
        ));
        
        // Add to payment history
        const newPayment: PaymentHistory = {
          id: (paymentHistory.length + 1).toString(),
          childName: selectedFee.childName,
          amount: paymentAmount,
          date: new Date().toISOString().split('T')[0],
          method: paymentMethod === 'card' ? 'Card Payment' : 'Bank Transfer',
          reference: 'TRX-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          status: 'success'
        };
        setPaymentHistory([newPayment, ...paymentHistory]);
      }
      
      setProcessing(false);
      setShowPaymentModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      setSelectedFee(null);
    }, 2000);
  };

  const filteredFees = selectedChild === 'all' 
    ? feeItems 
    : feeItems.filter(f => f.childName === selectedChild);

  const totalDue = feeItems.reduce((sum, f) => sum + f.due, 0);
  const totalPaid = feeItems.reduce((sum, f) => sum + f.paid, 0);
  const children = [...new Set(feeItems.map(f => f.childName))];

  if (!mounted || !user) return null;
  if (user.role !== 'parent') { window.location.href = '/'; return null; }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      <ActionButtons />

      {/* Header */}
      <div className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Link href="/dashboard/parent">
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ChevronRight className="w-5 h-5 text-white rotate-180" />
                </button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <span className="text-white font-semibold hidden sm:inline">Classora</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-white/80 text-sm">{schoolName}</span>
                <span className="text-white/30 hidden sm:inline">•</span>
                <span className="text-green-400 text-sm">Payments</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleTheme} className="p-2 rounded-full bg-white/5">
                {theme === 'light' ? <Moon className="w-5 h-5 text-white/70" /> : <Sun className="w-5 h-5 text-yellow-400" />}
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm hover:bg-red-500/30 transition-colors">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Fee Payments</h1>
          <p className="text-gray-400">View and pay school fees for your children</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <Wallet className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">₦{totalDue.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Due</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">₦{totalPaid.toLocaleString()}</p>
            <p className="text-gray-400 text-sm">Total Paid</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6 text-center">
            <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{feeItems.filter(f => f.status === 'unpaid').length}</p>
            <p className="text-gray-400 text-sm">Pending Payments</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-gray-400 text-sm">Filter by child:</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedChild('all')}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedChild === 'all' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
              >
                All Children
              </button>
              {children.map(child => (
                <button
                  key={child}
                  onClick={() => setSelectedChild(child)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${selectedChild === child ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'text-gray-400 hover:text-white'}`}
                >
                  {child}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Items Table */}
        <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 mb-8">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Child</th>
                  <th className="p-4">Class</th>
                  <th className="p-4">Term</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Paid</th>
                  <th className="p-4">Due</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white font-medium">{fee.childName}</td>
                    <td className="p-4 text-gray-300">{fee.className}</td>
                    <td className="p-4 text-gray-300">{fee.term}</td>
                    <td className="p-4 text-white">₦{fee.amount.toLocaleString()}</td>
                    <td className="p-4 text-green-400">₦{fee.paid.toLocaleString()}</td>
                    <td className="p-4 text-red-400">₦{fee.due.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{fee.dueDate}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 w-fit ${getStatusColor(fee.status)}`}>
                        {getStatusIcon(fee.status)}
                        {fee.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {fee.due > 0 && (
                        <button
                          onClick={() => handlePayNow(fee)}
                          className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 text-sm hover:bg-green-500/30 transition-colors"
                        >
                          Pay Now
                        </button>
                      )}
                      {fee.due === 0 && (
                        <span className="text-green-400 text-sm">Fully Paid</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-green-400" />
              Payment History
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr className="text-left text-gray-400 text-sm">
                  <th className="p-4">Child</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Reference</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paymentHistory.map((payment) => (
                  <tr key={payment.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-white">{payment.childName}</td>
                    <td className="p-4 text-white font-semibold">₦{payment.amount.toLocaleString()}</td>
                    <td className="p-4 text-gray-300">{payment.date}</td>
                    <td className="p-4 text-gray-300">{payment.method}</td>
                    <td className="p-4 text-gray-300">{payment.reference}</td>
                    <td className="p-4">
                      <span className="text-green-400 text-xs flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Success
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                        <Download className="w-4 h-4 text-blue-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedFee && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPaymentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 p-6"
            >
              <div className="text-center mb-6">
                <CreditCard className="w-12 h-12 text-green-400 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-white">Make Payment</h3>
                <p className="text-gray-400 text-sm mt-1">
                  {selectedFee.childName} - {selectedFee.term}
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount Due</span>
                    <span className="text-white font-bold">₦{selectedFee.due.toLocaleString()}</span>
                  </div>
                  <div>
                    <label className="block text-gray-400 text-sm mb-2">Payment Amount</label>
                    <input
                      type="number"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-green-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 text-sm mb-2">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'card' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-gray-400'}`}
                    >
                      <CardIcon className="w-4 h-4" />
                      Card
                    </button>
                    <button
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${paymentMethod === 'transfer' ? 'border-green-500 bg-green-500/10 text-green-400' : 'border-white/10 text-gray-400'}`}
                    >
                      <Banknote className="w-4 h-4" />
                      Transfer
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-green-500 outline-none"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'transfer' && (
                  <div className="p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
                    <p className="text-blue-400 text-sm flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Bank: First Bank of Nigeria
                    </p>
                    <p className="text-blue-400 text-sm mt-2">Account: 2034567890</p>
                    <p className="text-blue-400 text-sm">Name: Classora School Fees</p>
                  </div>
                )}

                <button
                  onClick={processPayment}
                  disabled={processing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Pay ₦{paymentAmount.toLocaleString()}
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={() => setShowPaymentModal(false)}
                className="mt-4 w-full py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 z-50 bg-green-500/90 backdrop-blur-xl rounded-xl p-4 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-white" />
              <div>
                <p className="text-white font-semibold">Payment Successful!</p>
                <p className="text-white/80 text-sm">Your payment has been processed.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @keyframes float { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(30px, -30px); } }
        @keyframes float-delayed { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(-30px, 30px); } }
        .animate-float { animation: float 12s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 14s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
