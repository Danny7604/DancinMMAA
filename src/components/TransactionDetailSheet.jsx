import React, { useEffect } from 'react';
import * as Icons from './Icons';

/**
 * Slide-up Bottom Sheet for Transaction Details
 * @param {Object} transaction - Selected transaction object
 * @param {Function} onClose - Close callback
 */
export default function TransactionDetailSheet({ transaction, onClose }) {
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

  if (!transaction) return null;

  const isIncome = transaction.type === 'thu';
  const isTransfer = transaction.type === 'chuyen_tien' || transaction.type === 'chuyen_khoan' || transaction.level1 === 'Chuyển khoản';
  
  // Format transaction amount
  const formatAmount = (val) => {
    const formatted = Math.abs(val).toLocaleString('vi-VN');
    if (isIncome) return `+${formatted} đ`;
    if (isTransfer) return `${formatted} đ`;
    return `-${formatted} đ`;
  };

  // Amount color styles
  const amountColorClass = () => {
    if (isIncome) return 'text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_12px_rgba(16,185,129,0.25)]';
    if (isTransfer) return 'text-sky-600 dark:text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.25)]';
    return 'text-rose-600 dark:text-rose-400 drop-shadow-[0_0_12px_rgba(244,63,94,0.25)]';
  };

  // Copy to clipboard helper
  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Trigger haptic feedback if available
        const tg = window.Telegram?.WebApp;
        if (tg?.HapticFeedback) {
          tg.HapticFeedback.notificationOccurred('success');
        }
        alert(`Đã sao chép ${label}!`);
      })
      .catch((err) => {
        console.error('Lỗi sao chép:', err);
      });
  };

  // Bot commands
  const deleteCommand = `/xoa ${transaction.id}`;
  const editCommand = `/sua ${transaction.id}`;

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-[#111827]/80 z-40 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] glass-card animate-slide-up pb-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Pull Indicator Bar */}
        <div className="w-12 h-1 bg-stone-400 dark:bg-stone-700/60 rounded-full mx-auto my-3.5" onClick={onClose} />
        
        {/* Header */}
        <div className="px-6 flex items-center justify-between border-b border-stone-200 dark:border-stone-850/40 pb-3">
          <h3 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
            Chi tiết giao dịch
          </h3>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Amount Card */}
          <div className="text-center py-6 bg-stone-100/55 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/30 rounded-2xl mb-6">
            <span className="text-xs text-stone-500 dark:text-stone-400 uppercase tracking-widest font-bold block mb-1">
              Số tiền
            </span>
            <span className={`text-3xl font-extrabold ${amountColorClass()}`}>
              {formatAmount(transaction.amount)}
            </span>
            <div className="mt-3 flex justify-center">
              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                isTransfer ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {isIncome ? 'Thu nhập' : isTransfer ? 'Chuyển khoản' : 'Chi phí'}
              </span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-4">
            {/* Category Level 1 */}
            <div className="flex justify-between items-start">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Danh mục chính</span>
              <span className="text-xs text-stone-700 dark:text-white font-semibold bg-stone-100 dark:bg-stone-800/50 px-2 py-0.5 rounded-lg border border-stone-200 dark:border-stone-800/30">
                {transaction.level1 || 'Chưa phân loại'}
              </span>
            </div>

            {/* Category Level 2 */}
            {transaction.level2 && (
              <div className="flex justify-between items-start">
                <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Danh mục phụ</span>
                <span className="text-xs text-stone-700 dark:text-stone-300 font-semibold">
                  {transaction.level2}
                </span>
              </div>
            )}

            <div className="h-px bg-stone-200 dark:bg-stone-850/40" />

            {/* Wallet / Account */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Ví thanh toán</span>
              <div className="flex items-center gap-1.5">
                <Icons.Wallet className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs text-stone-800 dark:text-stone-200 font-bold">
                  {transaction.account_name || 'Ví mặc định'}
                </span>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Thời gian</span>
              <div className="flex items-center gap-1.5">
                <Icons.Calendar className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                <span className="text-xs text-stone-800 dark:text-stone-200 font-semibold">
                  {transaction.date} {transaction.created_at ? new Date(transaction.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            </div>

            {/* Note */}
            {transaction.note && (
              <>
                <div className="h-px bg-stone-200 dark:bg-stone-850/40" />
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Ghi chú</span>
                  <div className="bg-stone-100/50 dark:bg-stone-900/30 p-3 rounded-xl border border-stone-200 dark:border-stone-800/30 text-xs text-stone-700 dark:text-stone-300 italic whitespace-pre-line leading-relaxed">
                    {transaction.note}
                  </div>
                </div>
              </>
            )}

            <div className="h-px bg-stone-200 dark:bg-stone-850/40" />

            {/* Transaction ID */}
            <div className="flex flex-col gap-1">
              <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">Mã giao dịch</span>
              <div className="flex items-center justify-between bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800/30 px-3 py-2 rounded-xl">
                <code className="text-[10px] text-stone-600 dark:text-stone-400 select-all truncate max-w-[240px]">
                  {transaction.id}
                </code>
                <button 
                  onClick={() => copyToClipboard(transaction.id, 'mã giao dịch')}
                  className="text-[10px] text-stone-900 dark:text-stone-300 font-bold hover:text-stone-700 dark:hover:text-stone-100 transition-colors uppercase tracking-wider"
                >
                  Sao chép
                </button>
              </div>
            </div>
          </div>

          {/* Quick Telegram Bot Actions */}
          <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-850/50">
            <h4 className="text-[10px] text-stone-400 dark:text-stone-500 uppercase tracking-widest font-bold mb-3">
              Thao tác nhanh trên Bot Telegram
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Copy Delete command */}
              <button
                onClick={() => copyToClipboard(deleteCommand, 'lệnh xóa')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-350 dark:border-rose-500/20 bg-rose-50/50 dark:bg-rose-500/5 hover:bg-rose-100 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all"
              >
                <Icons.X className="w-4 h-4" />
                <span>Sao chép lệnh xóa</span>
              </button>

              {/* Copy Edit command */}
              <button
                onClick={() => copyToClipboard(editCommand, 'lệnh sửa')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-500/20 bg-stone-50/50 dark:bg-stone-500/5 hover:bg-stone-100 dark:hover:bg-stone-500/10 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all"
              >
                <Icons.Sliders className="w-4 h-4" />
                <span>Sao chép lệnh sửa</span>
              </button>
            </div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-3 text-center">
              💡 Sau khi sao chép lệnh, hãy gửi tin nhắn trực tiếp cho Bot để xóa/sửa giao dịch này.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
