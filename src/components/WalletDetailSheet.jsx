import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

/**
 * Slide-up Bottom Sheet for Wallet Details & Configuration
 * @param {Object} wallet - Selected wallet object to edit
 * @param {Function} onClose - Close callback
 * @param {Function} onUpdateWallet - Update callback that saves changes (name, balance, default status) to backend
 * @param {Function} triggerHaptic - Haptic feedback callback
 */
export default function WalletDetailSheet({ wallet, onClose, onUpdateWallet, triggerHaptic }) {
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  useEffect(() => {
    // Hook into Telegram's BackButton if available
    const tg = window.Telegram?.WebApp;
    if (tg && tg.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
    }

    return () => {
      if (tg && tg.BackButton) {
        tg.BackButton.hide();
        tg.BackButton.offClick(onClose);
      }
    };
  }, [onClose]);

  // Synchronize state when wallet changes
  useEffect(() => {
    if (wallet) {
      setName(wallet.account_name || '');
      setBalance(wallet.balance !== undefined ? wallet.balance.toString() : '0');
      setIsDefault(!!wallet.is_default);
    }
  }, [wallet]);

  if (!wallet) return null;

  const handleSave = () => {
    triggerHaptic('medium');
    const parsedBalance = parseInt(balance.replace(/[^0-9-]/g, ''), 10);
    
    if (isNaN(parsedBalance)) {
      alert("Số dư không hợp lệ! Vui lòng nhập số nguyên.");
      return;
    }

    if (!name.trim()) {
      alert("Tên ví không được để trống!");
      return;
    }

    onUpdateWallet(wallet.id, {
      account_name: name.trim(),
      balance: parsedBalance,
      is_default: isDefault
    });
    
    onClose();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#111827]/80 z-40 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] glass-card animate-slide-up pb-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Pull Indicator Bar */}
        <div className="w-12 h-1 bg-stone-400 dark:bg-stone-700/60 rounded-full mx-auto my-3.5" onClick={onClose} />
        
        {/* Header */}
        <div className="px-6 flex items-center justify-between border-b border-stone-200 dark:border-stone-850/40 pb-3">
          <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Thiết lập ví / tài khoản
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* 1. Wallet Type Icon Badge */}
          <div className="flex items-center gap-4 bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/30 p-4 rounded-2xl">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center flex-shrink-0">
              <Icons.Wallet className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                {wallet.account_name}
              </h4>
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase mt-0.5 tracking-wider">
                Loại ví: {
                  wallet.account_type === 'tien_mat' ? 'Tiền mặt' : 
                  wallet.account_type === 'ngan_hang' ? 'Ngân hàng' : 'Thẻ tín dụng'
                }
              </p>
            </div>
            {isDefault && (
              <span className="ml-auto text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Ví chính
              </span>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* 2. Account Name Field */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Tên ví/tài khoản
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên ví (ví dụ: Techcombank, Tiền mặt...)"
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder-stone-400 dark:placeholder-stone-500"
              />
            </div>

            {/* 3. Account Balance Field */}
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                Số dư hiện tại (VNĐ)
              </label>
              <input
                type="text"
                value={balance}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/[^0-9-]/g, '');
                  setBalance(cleaned);
                }}
                placeholder="Nhập số dư ví..."
                className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 text-xs text-stone-900 dark:text-white font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder-stone-400 dark:placeholder-stone-500"
              />
              <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium italic mt-0.5 pl-1">
                Số dư định dạng: {parseInt(balance || 0, 10).toLocaleString('vi-VN')} đ
              </p>
            </div>

            <div className="h-px bg-stone-200 dark:bg-stone-850/40" />

            {/* 4. Default Wallet Toggle Card */}
            <div 
              onClick={() => {
                if (!isDefault) {
                  triggerHaptic('light');
                  setIsDefault(true);
                }
              }}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer select-none ${
                isDefault 
                  ? 'bg-indigo-500/5 dark:bg-indigo-500/5 border-indigo-500/30' 
                  : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-indigo-500/25'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isDefault ? 'bg-indigo-500/10' : 'bg-stone-100 dark:bg-stone-800'
                }`}>
                  <Icons.Award className={`w-4.5 h-4.5 ${isDefault ? 'text-indigo-500' : 'text-stone-400 dark:text-stone-500'}`} />
                </div>
                <div className="text-left">
                  <h5 className="text-xs font-bold text-stone-900 dark:text-white">
                    Đặt làm tài khoản chính (Mặc định)
                  </h5>
                  <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium mt-0.5 leading-relaxed">
                    AI sẽ tự động trừ ví này nếu câu mô tả không ghi tên ví.
                  </p>
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className={`w-5.5 h-5.5 rounded-full border flex items-center justify-center transition-all ${
                  isDefault 
                    ? 'bg-indigo-500 border-indigo-500 text-white' 
                    : 'border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900'
                }`}>
                  {isDefault && <Icons.Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-grow py-3 px-4 rounded-2xl border border-stone-200 dark:border-stone-850/50 hover:bg-stone-50 dark:hover:bg-stone-850/20 text-stone-600 dark:text-stone-400 text-xs font-bold transition-all"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-grow py-3 px-4 rounded-2xl bg-[#111827] dark:bg-stone-100 border border-[#111827] dark:border-stone-100 hover:bg-stone-800 dark:hover:bg-white text-white dark:text-stone-950 text-xs font-bold transition-all shadow-md"
            >
              Lưu thay đổi
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
