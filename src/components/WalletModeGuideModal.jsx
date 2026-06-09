import React from 'react';
import * as Icons from './Icons';

export default function WalletModeGuideModal({ isOpen, onClose, currentMode, triggerHaptic }) {
  if (!isOpen) return null;

  const handleClose = () => {
    if (triggerHaptic) triggerHaptic('light');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-5 bg-stone-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white/95 dark:bg-stone-900/95 border border-stone-200/50 dark:border-stone-800/50 rounded-[2rem] max-w-sm w-full p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[85vh]">
        {/* Glow Effects */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 border-b border-stone-100 dark:border-stone-800 pb-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Icons.Sliders className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
              Chế độ quản trị ví
            </h3>
            <span className="text-[9px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wide">
              Cách hệ thống vận hành dòng tiền
            </span>
          </div>
        </div>

        {/* Content - Scrollable if screen is small */}
        <div className="space-y-5 flex-grow overflow-y-auto no-scrollbar pr-0.5 text-left">
          {/* Mode 1: Normal */}
          <div className={`p-4 rounded-2.5xl border transition-all ${
            currentMode === 'normal'
              ? 'bg-stone-50/55 dark:bg-stone-800/35 border-stone-300 dark:border-stone-700/80 ring-1 ring-stone-250 dark:ring-stone-700'
              : 'bg-white dark:bg-stone-900/40 border-stone-100 dark:border-stone-800/40'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#111827] dark:text-white">Chế độ Thường (Normal)</span>
                {currentMode === 'normal' && (
                  <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Đang chọn
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-3 leading-relaxed">
              Đơn giản hóa việc theo dõi tài chính. Phù hợp khi bạn chỉ muốn biết mình còn bao nhiêu tiền trong mỗi tài khoản.
            </p>
            <ul className="space-y-1.5 text-[10px] text-stone-700 dark:text-stone-350 font-medium">
              <li className="flex gap-2 items-start">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Thẻ ví trên màn hình sẽ hiển thị <strong>"Số dư thực tế"</strong> (Số dư đầu kỳ + Thu nhập - Chi tiêu).</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Tổng số dư trên cùng vẫn được tính gộp tự động để bạn nắm tổng tài sản.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-emerald-500 mt-0.5">✓</span>
                <span>Tự do chi tiêu và quản lý dòng tiền gộp mà không cần ghi chép quá khắt khe các giao dịch chuyển khoản nội bộ.</span>
              </li>
            </ul>
          </div>

          {/* Mode 2: Advanced */}
          <div className={`p-4 rounded-2.5xl border transition-all ${
            currentMode === 'advanced'
              ? 'bg-indigo-50/10 dark:bg-indigo-950/10 border-indigo-500/30 ring-1 ring-indigo-500/20'
              : 'bg-white dark:bg-stone-900/40 border-stone-100 dark:border-stone-800/40'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-[#111827] dark:text-white">Chế độ Nâng cao (Advanced)</span>
                {currentMode === 'advanced' && (
                  <span className="text-[8px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Đang chọn
                  </span>
                )}
              </div>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mb-3 leading-relaxed">
              Theo dõi chi tiết số dư chính xác từng tài khoản và nhắc nhở đối chiếu dòng tiền chặt chẽ như một CFO thực thụ.
            </p>
            <ul className="space-y-1.5 text-[10px] text-stone-700 dark:text-stone-350 font-medium">
              <li className="flex gap-2 items-start">
                <span className="text-indigo-500 mt-0.5">★</span>
                <span>Hiển thị <strong>"Số dư thực tế"</strong> kèm các gợi ý và nhắc nhở đối khớp số dư trực quan trên Dashboard.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-indigo-500 mt-0.5">★</span>
                <span><strong>Kiểm soát số dư âm</strong>: Tiền mặt và Ngân hàng không được âm (ràng buộc từ DB); Thẻ tín dụng được âm.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="text-indigo-500 mt-0.5">★</span>
                <span>Yêu cầu ghi chép đầy đủ giao dịch chuyển tiền giữa các ví (rút/nạp tiền) để đảm bảo tính khớp số dư thực tế.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Action */}
        <button
          onClick={handleClose}
          className="w-full py-3.5 bg-[#111827] dark:bg-stone-100 text-white dark:text-[#111827] rounded-2xl text-xs font-black transition-all hover:scale-105 active:scale-95 uppercase tracking-widest mt-5"
        >
          Tôi đã hiểu
        </button>
      </div>
    </div>
  );
}
