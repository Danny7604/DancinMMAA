import React, { useEffect } from 'react';
import * as Icons from './Icons';

/**
 * Slide-up Bottom Sheet for Advanced Filtering
 * @param {Object} filters - Current active filters
 * @param {Function} setFilters - Filter update callback
 * @param {Array} availableAccounts - Array of account names in database
 * @param {Array} availableCategories - Array of category names in database
 * @param {boolean} isOpen - Controls visibility
 * @param {Function} onClose - Close callback
 */
export default function FilterDrawer({
  filters,
  setFilters,
  availableAccounts = [],
  availableCategories = [],
  isOpen,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Connect to Telegram's BackButton if available
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
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Preset Date handlers
  const datePresets = [
    { id: 'today', label: 'Hôm nay' },
    { id: 'this_week', label: 'Tuần này' },
    { id: 'this_month', label: 'Tháng này' },
    { id: 'last_month', label: 'Tháng trước' },
    { id: 'custom', label: 'Tự chọn' },
  ];

  // Helper to toggle array filter values (accounts/categories)
  const toggleArrayFilter = (field, value) => {
    const currentList = filters[field] || [];
    let updatedList;
    
    if (currentList.includes(value)) {
      updatedList = currentList.filter(item => item !== value);
    } else {
      updatedList = [...currentList, value];
    }

    setFilters({ ...filters, [field]: updatedList });

    // Haptic feedback
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.impactOccurred('light');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      preset: 'this_month',
      startDate: '',
      endDate: '',
      type: 'all',
      accounts: [],
      categories: [],
    });
    
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('warning');
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#111827]/80 z-40 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] glass-card animate-slide-up pb-8 max-h-[90vh] flex flex-col">
        {/* Pull Handle */}
        <div className="w-12 h-1 bg-stone-400 dark:bg-stone-700/60 rounded-full mx-auto my-3.5 flex-shrink-0" onClick={onClose} />
        
        {/* Title Bar */}
        <div className="px-6 flex items-center justify-between border-b border-stone-200 dark:border-stone-800/40 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Icons.Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-[#111827] dark:text-stone-300 uppercase tracking-wider">
              Bộ lọc nâng cao
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={resetFilters}
              className="text-xs text-stone-500 dark:text-stone-400 font-bold hover:text-stone-900 dark:hover:text-white transition-colors"
            >
              Đặt lại
            </button>
            <button 
              onClick={onClose}
              className="p-1 rounded-full bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400 hover:text-[#111827] dark:hover:text-white transition-colors"
            >
              <Icons.X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Area */}
        <div className="px-6 py-4 space-y-6 overflow-y-auto no-scrollbar flex-grow">
          {/* Preset Dates */}
          <div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-2.5">
              Thời gian
            </span>
            <div className="flex flex-wrap gap-2">
              {datePresets.map(preset => {
                const isActive = filters.preset === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setFilters({ ...filters, preset: preset.id });
                      const tg = window.Telegram?.WebApp;
                      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
                    }}
                    className={`text-xs px-3.5 py-2 rounded-xl font-semibold transition-all border ${
                      isActive 
                        ? 'bg-[#111827] border-[#111827] dark:bg-stone-100 dark:border-stone-100 text-white dark:text-[#111827] shadow-md' 
                        : 'bg-stone-100 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom Dates Selectors */}
            {filters.preset === 'custom' && (
              <div className="grid grid-cols-2 gap-3 mt-3.5 animate-fade-in">
                <div>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400 font-semibold mb-1 block">Từ ngày</span>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl glass-input"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-stone-500 dark:text-stone-400 font-semibold mb-1 block">Đến ngày</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl glass-input"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="h-px bg-stone-200 dark:bg-stone-850/40" />

          {/* Transaction Type */}
          <div>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-2.5">
              Loại giao dịch
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'thu', label: 'Thu nhập' },
                { id: 'chi', label: 'Chi phí' },
              ].map(type => {
                const isActive = filters.type === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFilters({ ...filters, type: type.id });
                      const tg = window.Telegram?.WebApp;
                      if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
                    }}
                    className={`text-xs py-2 rounded-xl font-bold transition-all border ${
                      isActive 
                        ? type.id === 'thu' 
                          ? 'bg-emerald-600 border-emerald-500 text-white glow-success'
                          : type.id === 'chi'
                            ? 'bg-rose-600 border-rose-500 text-white glow-danger'
                            : 'bg-[#111827] border-[#111827] dark:bg-stone-100 dark:border-stone-100 text-white dark:text-[#111827] shadow-md'
                        : 'bg-stone-100 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/60 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800/40'
                    }`}
                  >
                    {type.label}
                  </button>
                );
              })}
            </div>
          </div>

          {availableAccounts.length > 0 && (
            <>
              <div className="h-px bg-stone-200 dark:bg-stone-850/40" />
              {/* Account/Wallet Filters */}
              <div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-2.5">
                  Tài khoản / Ví ({availableAccounts.length})
                </span>
                <div className="flex flex-wrap gap-2">
                  {availableAccounts.map(account => {
                    const isSelected = (filters.accounts || []).includes(account);
                    return (
                      <button
                        key={account}
                        onClick={() => toggleArrayFilter('accounts', account)}
                        className={`text-xs px-3.5 py-1.5 rounded-xl font-medium transition-all border flex items-center gap-1.5 ${
                          isSelected 
                            ? 'bg-[#111827]/10 border-stone-850 text-[#111827] dark:bg-stone-100/10 dark:border-stone-400 dark:text-stone-200' 
                            : 'bg-stone-100 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800/40 text-stone-600 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-300'
                        }`}
                      >
                        <Icons.Wallet className="w-3 h-3 text-stone-600 dark:text-stone-400" />
                        <span>{account}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {availableCategories.length > 0 && (
            <>
              <div className="h-px bg-stone-200 dark:bg-stone-850/40" />
              {/* Categories Filters */}
              <div>
                <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-2.5">
                  Danh mục ({availableCategories.length})
                </span>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto no-scrollbar pr-1">
                  {availableCategories.map(category => {
                    const isSelected = (filters.categories || []).includes(category);
                    return (
                      <button
                        key={category}
                        onClick={() => toggleArrayFilter('categories', category)}
                        className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all border ${
                          isSelected 
                            ? 'bg-[#111827]/10 border-stone-850 text-[#111827] dark:bg-stone-100/10 dark:border-stone-400 dark:text-stone-200' 
                            : 'bg-stone-100 dark:bg-stone-900/30 border-stone-200 dark:border-stone-800/40 text-stone-600 dark:text-stone-400 hover:text-stone-850 dark:hover:text-stone-300'
                        }`}
                      >
                        {category}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action Button */}
        <div className="px-6 pt-3 border-t border-stone-200 dark:border-stone-800/40 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#111827] hover:bg-[#111827]/90 dark:bg-stone-100 dark:hover:bg-stone-200 dark:text-[#111827] rounded-2xl text-xs font-bold transition-all shadow-md uppercase tracking-widest"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </div>
    </>
  );
}
