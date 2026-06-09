import React, { useState } from 'react';
import * as Icons from './Icons';

export default function OverviewTab({
  totalBalance = 24500000,
  monthlyIncome = 8200000,
  monthlyExpense = 3450000,
  transactions = [],
  wallets = [],
  onSelectWalletToEdit,
  onSelectTransaction,
  triggerHaptic,
  onViewAll,
  walletMode = 'normal',
}) {
  const [typeFilter, setTypeFilter] = useState('all'); // all, thu, chi

  // Helper to parse DD/MM/YYYY into date
  const parseDateStr = (str) => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  // Helper to compute wallet monthly spent
  const getWalletMonthlySpent = (walletName) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return (transactions || []).reduce((sum, t) => {
      if (t.type === 'chi' && t.account_name === walletName) {
        const tDate = parseDateStr(t.date);
        if (tDate && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
          return sum + (t.amount || 0);
        }
      }
      return sum;
    }, 0);
  };

  // Filter transactions based on local pills
  const filtered = transactions.filter(t => {
    if (typeFilter === 'all') return true;
    return t.type === typeFilter;
  });

  const formatVND = (val) => val.toLocaleString('vi-VN') + 'đ';

  // Helper to map category/type to correct icons
  const getTxIcon = (item) => {
    const l1 = item.level1?.toLowerCase() || '';
    const l2 = item.level2?.toLowerCase() || '';
    const note = item.note?.toLowerCase() || '';

    if (l1.includes('ăn uống') || l2.includes('coffee') || note.includes('cafe') || note.includes('cà phê') || note.includes('ăn')) {
      return <Icons.Utensils className="w-5 h-5 text-amber-500" />;
    }
    if (l1.includes('di chuyển') || l2.includes('grab') || note.includes('grab') || note.includes('taxi')) {
      return <Icons.Car className="w-5 h-5 text-indigo-500" />;
    }
    if (l1.includes('mua sắm') || note.includes('siêu thị') || note.includes('mua')) {
      return <Icons.ShoppingBag className="w-5 h-5 text-rose-500" />;
    }
    if (item.type === 'thu') {
      return <Icons.Wallet className="w-5 h-5 text-emerald-500" />;
    }
    return <Icons.ArrowDownLeft className="w-5 h-5 text-stone-500" />;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Overall Balance Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-6 shadow-sm">
        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wider block mb-1">
          Tổng số dư
        </span>
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black text-[#111827] dark:text-white">
            {formatVND(totalBalance)}
          </h2>
          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/5 px-2.5 py-1 rounded-full border border-emerald-500/10">
            <Icons.TrendingUp className="w-3 h-3" />
            <span>+12.5%</span>
          </span>
        </div>

        {/* Income & Expense cards */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/30 p-4 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[9px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
              <Icons.ArrowDownLeft className="w-3.5 h-3.5 text-emerald-500 rotate-180" />
              <span>Thu nhập</span>
            </div>
            <span className="text-base font-extrabold text-[#111827] dark:text-white">
              {formatVND(monthlyIncome)}
            </span>
          </div>
          <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/30 p-4 rounded-2xl flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[9px] text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider">
              <Icons.ArrowDownLeft className="w-3.5 h-3.5 text-rose-500" />
              <span>Chi tiêu</span>
            </div>
            <span className="text-base font-extrabold text-[#111827] dark:text-white">
              {formatVND(monthlyExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Accounts & Wallets Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
            Tài khoản & Ví
          </h3>
          <button 
            onClick={() => { triggerHaptic('light'); alert('Chức năng cài đặt tài khoản đang được mở rộng.'); }}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:text-indigo-500"
          >
            Sửa
          </button>
        </div>

        {/* Horizontal scroll box */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar scroll-smooth w-full">
          {(!wallets || wallets.length === 0) ? (
            <div className="w-full text-center py-6 text-stone-500 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-850/20 rounded-2xl">
              Đang kết nối danh sách ví...
            </div>
          ) : (
            wallets.map((wallet, index) => {
              const isCash = wallet.account_type === 'tien_mat' || wallet.account_name === 'Tiền mặt';
            const isBank = wallet.account_type === 'ngan_hang' || wallet.account_name === 'Tài khoản chính' || wallet.account_name === 'Tài khoản ngân hàng';
            const isCredit = wallet.account_type === 'tin_dung' || wallet.account_name === 'Thẻ tín dụng' || wallet.account_name === 'Ví tiết kiệm';

            let cardClass = "flex-shrink-0 w-44 bg-stone-50/50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 p-4 rounded-2xl shadow-sm relative cursor-pointer active:scale-[0.98] transition-all hover:border-indigo-500/50";
            let iconClass = "w-9 h-9 rounded-xl bg-stone-200/60 dark:bg-stone-800/60 flex items-center justify-center mb-4";
            let nameClass = "text-[10px] text-stone-500 dark:text-stone-400 font-semibold block";
            let balanceClass = "text-base font-black text-[#111827] dark:text-white block mt-0.5";
            let IconComp = Icons.Wallet;
            let iconColorClass = "w-5 h-5 text-stone-600 dark:text-stone-300";

            if (isBank) {
              cardClass = "flex-shrink-0 w-44 bg-stone-50/50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800/80 p-4 rounded-2xl shadow-sm relative cursor-pointer active:scale-[0.98] transition-all hover:border-amber-500/50";
              iconClass = "w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center mb-4";
              nameClass = "text-[10px] text-stone-500 dark:text-stone-400 font-semibold block";
              balanceClass = "text-base font-black text-[#111827] dark:text-white block mt-0.5";
              IconComp = Icons.Target;
              iconColorClass = "w-5 h-5 text-amber-500 dark:text-amber-400";
            } else if (isCredit) {
              cardClass = "flex-shrink-0 w-44 bg-stone-100/60 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800/30 p-4 rounded-2xl shadow-sm relative cursor-pointer active:scale-[0.98] transition-all hover:border-indigo-500/50";
              iconClass = "w-9 h-9 rounded-xl bg-stone-200/40 dark:bg-stone-800/60 flex items-center justify-center mb-4";
              IconComp = Icons.Award;
              iconColorClass = "w-5 h-5 text-stone-600 dark:text-stone-300";
            }

            return (
              <div 
                key={wallet.id || index} 
                className={cardClass}
                onClick={() => {
                  triggerHaptic('medium');
                  if (onSelectWalletToEdit) {
                    onSelectWalletToEdit(wallet);
                  }
                }}
              >
                {wallet.is_default && (
                  <span className="absolute top-4 right-4 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/15 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider scale-90">
                    Mặc định
                  </span>
                )}
                <div className={iconClass}>
                  <IconComp className={iconColorClass} />
                </div>
                <span className={nameClass}>{wallet.account_name}</span>
                <span className={balanceClass}>
                  {formatVND(wallet.balance || 0)}
                </span>
                <span className="text-[9px] text-stone-400 dark:text-stone-500 font-extrabold block mt-0.5 uppercase tracking-wide">
                  Số dư thực tế
                </span>
              </div>
            );
          }))}
        </div>

        {/* Advanced Mode Tip Banner */}
        {walletMode === 'advanced' && (
          <div className="mt-3 bg-indigo-500/5 dark:bg-indigo-500/5 border border-indigo-500/10 p-3 rounded-2xl flex gap-2 items-start animate-fade-in text-left">
            <Icons.Info className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-stone-600 dark:text-indigo-300 leading-relaxed font-semibold">
              <strong>Mẹo Nâng cao:</strong> Đừng quên ghi nhận các giao dịch chuyển khoản (ví dụ: <em>"chuyển khoản 1 triệu sang tiền mặt"</em>) khi bạn rút/nạp tiền để số dư các ví luôn khớp thực tế.
            </p>
          </div>
        )}
      </div>

      {/* 3. Recent Transactions Section */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
            Giao dịch gần đây
          </h3>
          <button 
            onClick={() => { 
              triggerHaptic('light'); 
              if (onViewAll) onViewAll();
            }}
            className="text-xs text-stone-500 dark:text-stone-400 font-bold hover:text-stone-800"
          >
            Xem tất cả
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-4">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'thu', label: 'Thu nhập' },
            { id: 'chi', label: 'Chi tiêu' },
          ].map(pill => {
            const isActive = typeFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => {
                  triggerHaptic('light');
                  setTypeFilter(pill.id);
                }}
                className={`text-xs px-4 py-1.5 rounded-full font-bold transition-all border ${
                  isActive
                    ? 'bg-[#111827] dark:bg-stone-100 border-[#111827] dark:border-stone-100 text-white dark:text-stone-950 shadow-sm'
                    : pill.id === 'thu'
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
                      : pill.id === 'chi'
                        ? 'bg-rose-500/5 dark:bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Vertical List */}
        <div className="space-y-3">
          {filtered.slice(0, 5).map(t => {
            const isIncome = t.type === 'thu';
            
            // Format dynamic date relative labels
            const getRelativeDay = (dateStr) => {
              const today = new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
              
              if (dateStr === today) return 'Hôm nay';
              if (dateStr === yesterday) return 'Hôm qua';
              return dateStr;
            };

            return (
              <div
                key={t.id}
                onClick={() => {
                  triggerHaptic('light');
                  onSelectTransaction(t);
                }}
                className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 hover:bg-stone-50 dark:hover:bg-stone-850/20 p-4 rounded-2xl flex items-center justify-between shadow-sm cursor-pointer transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 truncate max-w-[70%]">
                  <div className="w-10 h-10 rounded-full bg-stone-50 dark:bg-stone-800/50 border border-stone-200/30 dark:border-stone-800/20 flex items-center justify-center flex-shrink-0">
                    {getTxIcon(t)}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-extrabold text-stone-900 dark:text-white truncate">
                      {t.note || t.level2 || t.level1}
                    </p>
                    <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold mt-0.5">
                      {t.level1} • {t.created_at ? new Date(t.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '10:00'}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-xs font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isIncome ? '+' : '-'}{t.amount.toLocaleString('vi-VN')}đ
                  </p>
                  <p className="text-[9px] text-stone-400 dark:text-stone-500 font-bold mt-0.5 uppercase tracking-wide">
                    {getRelativeDay(t.date)}
                  </p>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-center py-8 text-stone-500 text-xs italic bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-2xl">
              Không tìm thấy giao dịch nào phù hợp.
            </div>
          )}
        </div>
      </div>

      {/* 4. Mascot Footer Branding */}
      <div className="bg-[#231604] border border-[#3d270b]/35 p-5 rounded-3xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Glow backdrop decorative */}
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
        
        {/* Dancin cat-paw logo symbol */}
        <div className="w-16 h-16 bg-[#170e02] border border-[#3d270b]/35 rounded-2xl flex flex-col items-center justify-center p-2 mb-3">
          <svg viewBox="0 0 100 100" className="w-9 h-9 text-white fill-current">
            {/* Paw Pad Center */}
            <path d="M 50,45 C 32,45 27,58 27,70 C 27,82 37,84 50,84 C 63,84 73,82 73,70 C 73,58 68,45 50,45 Z" />
            {/* Toes */}
            <ellipse cx="23" cy="47" rx="9" ry="11" transform="rotate(-15 23 47)" />
            <ellipse cx="40" cy="31" rx="10" ry="13" transform="rotate(-5 40 31)" />
            <ellipse cx="60" cy="31" rx="10" ry="13" transform="rotate(5 60 31)" />
            <ellipse cx="77" cy="47" rx="9" ry="11" transform="rotate(15 77 47)" />
          </svg>
          <span className="text-[7px] text-amber-400 font-extrabold uppercase tracking-widest mt-1">DANCIN</span>
        </div>
        <p className="text-[10px] text-amber-300 uppercase tracking-widest font-extrabold mb-1">Dancin MMAA</p>
        <p className="text-xs text-stone-300 dark:text-stone-300 font-medium max-w-[240px] leading-relaxed">
          Dancin MMAA đang theo dõi tài chính giúp bạn một cách thông minh.
        </p>
      </div>
    </div>
  );
}
