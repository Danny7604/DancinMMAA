import React, { useState, useEffect, useMemo } from 'react';
import * as Icons from './components/Icons';
import OverviewTab from './components/OverviewTab';
import JarsTab from './components/JarsTab';
import ChartsTab from './components/ChartsTab';
import SettingsTab from './components/SettingsTab';
import FilterDrawer from './components/FilterDrawer';
import TransactionDetailSheet from './components/TransactionDetailSheet';

// --- MOCK TRANSACTION HISTORY DATABASE ---
const MOCK_HISTORICAL_TRANSACTIONS = [];

// Helper to parse DD/MM/YYYY into date
const parseDateStr = (str) => {
  if (!str) return null;
  const parts = str.split('/');
  if (parts.length !== 3) return null;
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wallets state - dynamic from database, starts empty
  const [wallets, setWallets] = useState([]);
  
  // Navigation Tabs state
  const [activeTab, setActiveTab] = useState('overview'); // overview, jars, charts, history, settings
  const [trendCategory, setTrendCategory] = useState('all');

  // Configuration States (Synchronized between tabs)
  const [jarsAllocation, setJarsAllocation] = useState({
    nec: 55, edu: 10, ltss: 10, play: 10, ffa: 10, give: 5
  });
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [categoryLimits, setCategoryLimits] = useState([]);

  // Theme state
  const [theme, setTheme] = useState(() => {
    const tg = window.Telegram?.WebApp;
    if (tg && tg.themeParams?.bg_color) {
      const color = tg.themeParams.bg_color.replace('#', '');
      if (color.length === 6) {
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 140 ? 'dark' : 'light';
      }
    }
    if (tg && tg.colorScheme) return tg.colorScheme;
    
    const saved = localStorage.getItem('dancin-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light';
    }
    return 'dark';
  });

  const [tgUser, setTgUser] = useState(null);
  const [greeting, setGreeting] = useState('Chào bạn');

  // Bottom sheets controls
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Search and Advanced Filters
  const [filters, setFilters] = useState({
    preset: 'this_month',
    startDate: '',
    endDate: '',
    type: 'all',
    accounts: [],
    categories: [],
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Greeting dynamic calculation
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) setGreeting('Chào buổi sáng ☀️');
    else if (hour >= 12 && hour < 18) setGreeting('Chào buổi chiều 🌤️');
    else setGreeting('Chào buổi tối 🌙');
  }, []);

  // Update theme variables
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    localStorage.setItem('dancin-theme', theme);

    const tg = window.Telegram?.WebApp;
    const hasTgTheme = tg && tg.themeParams && Object.keys(tg.themeParams).length > 0;
    
    let isMatchingTgScheme = false;
    if (hasTgTheme && tg.themeParams?.bg_color) {
      const color = tg.themeParams.bg_color.replace('#', '');
      if (color.length === 6) {
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        const tgScheme = brightness < 140 ? 'dark' : 'light';
        isMatchingTgScheme = tgScheme === theme;
      }
    }
    
    if (hasTgTheme && isMatchingTgScheme) {
      const params = tg.themeParams;
      if (params.bg_color) root.style.setProperty('--tg-bg-color', params.bg_color);
      if (params.secondary_bg_color) root.style.setProperty('--tg-secondary-bg-color', params.secondary_bg_color);
      if (params.text_color) root.style.setProperty('--tg-text-color', params.text_color);
      if (params.hint_color) root.style.setProperty('--tg-hint-color', params.hint_color);
      if (params.link_color) root.style.setProperty('--tg-link-color', params.link_color);
      if (params.button_color) root.style.setProperty('--tg-button-color', params.button_color);
      if (params.button_text_color) root.style.setProperty('--tg-button-text-color', params.button_text_color);
    } else {
      if (theme === 'dark') {
        root.style.setProperty('--tg-bg-color', '#161412');
        root.style.setProperty('--tg-secondary-bg-color', '#1f1c19');
        root.style.setProperty('--tg-text-color', '#FAF6F0');
        root.style.setProperty('--tg-hint-color', '#75777F');
        root.style.setProperty('--tg-link-color', '#EFEAE2');
        root.style.setProperty('--tg-button-color', '#FAF6F0');
        root.style.setProperty('--tg-button-text-color', '#111827');
      } else {
        root.style.setProperty('--tg-bg-color', '#FBF8F3');
        root.style.setProperty('--tg-secondary-bg-color', '#ffffff');
        root.style.setProperty('--tg-text-color', '#111827');
        root.style.setProperty('--tg-hint-color', '#75777F');
        root.style.setProperty('--tg-link-color', '#111827');
        root.style.setProperty('--tg-button-color', '#111827');
        root.style.setProperty('--tg-button-text-color', '#ffffff');
      }
    }
  }, [theme]);

  // Initial WebApp load
  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();

      tg.onEvent('themeChanged', () => {
        const bg = tg.themeParams?.bg_color;
        if (bg) {
          const color = bg.replace('#', '');
          if (color.length === 6) {
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            setTheme(brightness < 140 ? 'dark' : 'light');
            return;
          }
        }
        setTheme(tg.colorScheme || 'dark');
      });

      if (tg.initDataUnsafe?.user) {
        setTgUser(tg.initDataUnsafe.user);
      }
    }

    // Call API
    const chatId = tg?.initDataUnsafe?.user?.id || '1458262316';
    const workerUrl = 'https://dancin-quanlychitieu.thuongvn-work.workers.dev';

    // 1. Fetch Dashboard data
    fetch(`${workerUrl}/api/dashboard?chat_id=${chatId}`)
      .then(res => res.json())
      .then(result => {
        const apiTransactions = (result.recent_transactions || []).sort((a, b) => {
          const dateA = parseDateStr(a.date) || new Date(0);
          const dateB = parseDateStr(b.date) || new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setData({
          total_balance: result.total_balance ?? 0,
          monthly_income: result.monthly_income ?? 0,
          monthly_expense: result.monthly_expense ?? 0,
          transactions: apiTransactions,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Lỗi fetch API dashboard:", err);
        // Fallback empty data
        setData({
          total_balance: 0,
          monthly_income: 0,
          monthly_expense: 0,
          transactions: [],
        });
        setLoading(false);
      });

    // 2. Fetch wallets dynamically
    fetch(`${workerUrl}/api/wallets?chat_id=${chatId}`)
      .then(res => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
      })
      .then(walletsList => {
        if (Array.isArray(walletsList) && walletsList.length > 0) {
          setWallets(walletsList);
        }
      })
      .catch(err => {
        console.error("Lỗi fetch API wallets:", err);
      });
  }, []);

  const triggerHaptic = (type = 'light') => {
    const tg = window.Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      if (type === 'light') tg.HapticFeedback.impactOccurred('light');
      else if (type === 'medium') tg.HapticFeedback.impactOccurred('medium');
      else if (type === 'success') tg.HapticFeedback.notificationOccurred('success');
    }
  };

  const handleCloseWebApp = () => {
    triggerHaptic('medium');
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.openTelegramLink("https://t.me/Dancin_quanlychitieu_bot");
      tg.close();
    } else {
      window.open("https://t.me/Dancin_quanlychitieu_bot", "_blank");
    }
  };

  const handleUpdateWalletBalance = async (walletId, newBalance) => {
    // 1. Optimistic UI update
    setWallets(prevWallets => {
      const updated = prevWallets.map(w => w.id === walletId ? { ...w, balance: newBalance } : w);
      // Recalculate total balance
      const newTotal = updated.reduce((sum, w) => sum + parseInt(w.balance || 0), 0);
      setData(prevData => prevData ? { ...prevData, total_balance: newTotal } : null);
      return updated;
    });

    // 2. Send PATCH API request to update wallet balance on Supabase DB
    const workerUrl = 'https://dancin-quanlychitieu.thuongvn-work.workers.dev';
    try {
      const response = await fetch(`${workerUrl}/api/wallets`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: walletId, balance: newBalance })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }
      triggerHaptic('success');
    } catch (err) {
      console.error("Lỗi cập nhật số dư ví:", err);
      alert("Không thể đồng bộ số dư mới lên máy chủ. Số dư đang được cập nhật tạm thời trên thiết bị.");
    }
  };

  // Date boundary presets calculations
  const dateRangeBoundaries = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let start = new Date(0);
    let end = new Date(today.getTime() + 86400000 * 2);

    const preset = filters.preset;
    
    if (preset === 'today') {
      start = new Date(today);
      end = new Date(today.getTime() + 86400000);
    } 
    else if (preset === 'this_week') {
      const day = today.getDay();
      const diff = today.getDate() - day + (day === 0 ? -6 : 1);
      start = new Date(today.setDate(diff));
      end = new Date(start.getTime() + 7 * 86400000);
    } 
    else if (preset === 'this_month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } 
    else if (preset === 'last_month') {
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 1);
    } 
    else if (preset === 'custom') {
      if (filters.startDate) start = new Date(filters.startDate);
      if (filters.endDate) {
        end = new Date(filters.endDate);
        end.setDate(end.getDate() + 1);
      }
    }

    return { start, end };
  }, [filters.preset, filters.startDate, filters.endDate]);

  // Available unique accounts & categories for filter options
  const { availableAccounts, availableCategories } = useMemo(() => {
    if (!data?.transactions) return { availableAccounts: [], availableCategories: [] };
    
    const accs = new Set();
    const cats = new Set();
    
    data.transactions.forEach(t => {
      if (t.account_name) accs.add(t.account_name);
      if (t.level1) cats.add(t.level1);
    });

    return {
      availableAccounts: Array.from(accs),
      availableCategories: Array.from(cats),
    };
  }, [data?.transactions]);

  // Main filtered transactions array
  const filteredTransactions = useMemo(() => {
    if (!data?.transactions) return [];

    return data.transactions.filter(t => {
      const tDate = parseDateStr(t.date);
      if (!tDate) return false;

      const inDateRange = tDate >= dateRangeBoundaries.start && tDate < dateRangeBoundaries.end;
      if (!inDateRange) return false;

      if (filters.type !== 'all' && t.type !== filters.type) return false;
      if (filters.accounts.length > 0 && !filters.accounts.includes(t.account_name)) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(t.level1)) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const noteMatch = t.note?.toLowerCase().includes(query);
        const l1Match = t.level1?.toLowerCase().includes(query);
        const l2Match = t.level2?.toLowerCase().includes(query);
        const accountMatch = t.account_name?.toLowerCase().includes(query);
        if (!noteMatch && !l1Match && !l2Match && !accountMatch) return false;
      }

      return true;
    });
  }, [data?.transactions, dateRangeBoundaries, filters.type, filters.accounts, filters.categories, searchQuery]);

  const groupedTransactionsByDate = useMemo(() => {
    const groups = {};
    filteredTransactions.forEach(t => {
      if (!groups[t.date]) {
        groups[t.date] = [];
      }
      groups[t.date].push(t);
    });
    return Object.keys(groups).map(date => ({
      date,
      transactions: groups[date]
    }));
  }, [filteredTransactions]);

  // Dynamic charts daily trends sums
  const trendChartData = useMemo(() => {
    const daysList = [];
    const tempDate = new Date(dateRangeBoundaries.start);
    const endLimit = new Date(dateRangeBoundaries.end);
    
    let iterations = 0;
    while (tempDate < endLimit && iterations < 90) {
      daysList.push(new Date(tempDate));
      tempDate.setDate(tempDate.getDate() + 1);
      iterations++;
    }

    let currentAccumulated = 0;
    const currentTrend = daysList.map(date => {
      const dateStr = date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const dailyExpense = filteredTransactions
        .filter(t => {
          if (t.date !== dateStr || t.type !== 'chi') return false;
          if (trendCategory !== 'all' && t.level2 !== trendCategory) return false;
          return true;
        })
        .reduce((sum, t) => sum + t.amount, 0);
      
      currentAccumulated += dailyExpense;
      
      return {
        date: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        value: currentAccumulated,
      };
    });

    const diffTime = Math.abs(dateRangeBoundaries.end.getTime() - dateRangeBoundaries.start.getTime());
    
    let previousAccumulated = 0;
    const previousTrend = daysList.map(date => {
      const prevDate = new Date(date.getTime() - diffTime);
      const dateStr = prevDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      
      const dailyExpense = (data?.transactions || [])
        .filter(t => {
          if (t.date !== dateStr || t.type !== 'chi') return false;
          if (filters.accounts.length > 0 && !filters.accounts.includes(t.account_name)) return false;
          if (filters.categories.length > 0 && !filters.categories.includes(t.level1)) return false;
          if (trendCategory !== 'all' && t.level2 !== trendCategory) return false;
          return true;
        })
        .reduce((sum, t) => sum + t.amount, 0);

      previousAccumulated += dailyExpense;

      return {
        date: prevDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        value: previousAccumulated,
      };
    });

    return { currentTrend, previousTrend };
  }, [filteredTransactions, data?.transactions, dateRangeBoundaries, filters.accounts, filters.categories, trendCategory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center text-stone-800 dark:text-stone-100 p-6">
        <div className="relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-stone-900/10 dark:border-stone-100/10 border-t-stone-900 dark:border-t-stone-100 animate-spin" />
        </div>
        <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 animate-pulse-slow">
          ⏳ Đang kết nối dữ liệu tài chính Dancin...
        </p>
      </div>
    );
  }

  const userName = tgUser ? `${tgUser.first_name} ${tgUser.last_name || ''}`.trim() : 'Khách';
  const userPhoto = tgUser?.photo_url;

  return (
    <div 
      className="min-h-screen text-[#111827] dark:text-[#FAF6F0] font-sans pb-28 transition-colors duration-300 overflow-x-hidden no-scrollbar bg-stone-50 dark:bg-stone-950"
      style={{ 
        backgroundColor: 'var(--tg-bg-color)', 
        color: 'var(--tg-text-color)' 
      }}
    >
      {/* 1. TOP BAR */}
      <header className="px-5 pt-5 pb-3 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md bg-[var(--tg-bg-color)]/75 border-b border-stone-200/40 dark:border-stone-900/40">
        <div className="flex items-center gap-3">
          {userPhoto ? (
            <img 
              src={userPhoto} 
              alt={userName} 
              className="w-10 h-10 rounded-full border-2 border-stone-800/60 object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-stone-900 border border-stone-400/20 flex items-center justify-center text-white">
              <svg viewBox="0 0 100 100" className="w-6 h-6 fill-current">
                {/* Paw Pad Center */}
                <path d="M 50,45 C 32,45 27,58 27,70 C 27,82 37,84 50,84 C 63,84 73,82 73,70 C 73,58 68,45 50,45 Z" />
                {/* Toes */}
                <ellipse cx="23" cy="47" rx="9" ry="11" transform="rotate(-15 23 47)" />
                <ellipse cx="40" cy="31" rx="10" ry="13" transform="rotate(-5 40 31)" />
                <ellipse cx="60" cy="31" rx="10" ry="13" transform="rotate(5 60 31)" />
                <ellipse cx="77" cy="47" rx="9" ry="11" transform="rotate(15 77 47)" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold tracking-wide uppercase">Dancin MMMA</p>
            <h1 className="text-xs font-extrabold text-stone-900 dark:text-stone-100">
              {activeTab === 'overview' && `${greeting}, ${tgUser?.first_name || 'Khách'}`}
              {activeTab === 'jars' && 'Ví & Hũ chi tiêu'}
              {activeTab === 'charts' && 'Phân tích tài chính'}
              {activeTab === 'history' && 'Lịch sử giao dịch'}
              {activeTab === 'settings' && 'Cài đặt tài chính'}
            </h1>
          </div>
        </div>

        <div className="flex gap-2">
          {/* Light/Dark Toggle */}
          <button 
            onClick={() => {
              triggerHaptic('light');
              setTheme(prev => prev === 'dark' ? 'light' : 'dark');
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/40 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
          >
            {theme === 'dark' ? <Icons.Sun className="w-4 h-4 text-amber-400 animate-pulse" /> : <Icons.Moon className="w-4 h-4 text-stone-800" />}
          </button>

          {/* Quick sync reload */}
          <button 
            onClick={() => {
              triggerHaptic('medium');
              window.location.reload();
            }}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-900/60 border border-stone-200/60 dark:border-stone-800/40 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors"
          >
            <Icons.RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. BODY CONTENT (TAB ROUTER) */}
      <main className="px-5 mt-4">
        
        {activeTab === 'overview' && (
          <OverviewTab 
            totalBalance={data.total_balance}
            monthlyIncome={data.monthly_income}
            monthlyExpense={data.monthly_expense}
            transactions={data.transactions}
            wallets={wallets}
            onUpdateWalletBalance={handleUpdateWalletBalance}
            onSelectTransaction={setSelectedTransaction}
            triggerHaptic={triggerHaptic}
            onViewAll={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'jars' && (
          <JarsTab 
            jarsAllocation={jarsAllocation}
            savingsGoals={savingsGoals}
            onAddSavingsGoal={(goal) => setSavingsGoals([...savingsGoals, goal])}
            categoryLimits={categoryLimits}
            onAddCategoryLimit={(limit) => setCategoryLimits([...categoryLimits, limit])}
            transactions={data.transactions}
            monthlyIncome={data.monthly_income}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'charts' && (
          <ChartsTab 
            transactions={data.transactions}
            monthlyIncome={data.monthly_income}
            monthlyExpense={data.monthly_expense}
            trendChartData={trendChartData}
            trendCategory={trendCategory}
            setTrendCategory={setTrendCategory}
            triggerHaptic={triggerHaptic}
          />
        )}

        {activeTab === 'history' && (
          <div className="space-y-4 animate-fade-in pb-12">
            {/* Search and filter action bar */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Tìm ghi chú, danh mục, tài khoản..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-xs font-semibold placeholder-stone-400 dark:placeholder-stone-500"
                />
                <Icons.Search className="absolute left-3 top-3.5 w-4 h-4 text-stone-400 dark:text-stone-500" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3.5 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-white"
                  >
                    <Icons.X className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setIsFilterOpen(true);
                }}
                className={`p-2.5 rounded-2xl border transition-all relative ${
                  filters.type !== 'all' || filters.accounts.length > 0 || filters.categories.length > 0
                    ? 'bg-[#111827] border-[#111827] dark:bg-stone-100 dark:border-stone-100 text-white dark:text-stone-900 glow-primary' 
                    : 'bg-stone-100 dark:bg-stone-900/60 border-stone-200/60 dark:border-stone-800/40 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
                }`}
              >
                <Icons.Filter className="w-4.5 h-4.5" />
                {(filters.type !== 'all' || filters.accounts.length > 0 || filters.categories.length > 0) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-stone-100 dark:ring-stone-950" />
                )}
              </button>
            </div>

            {/* List grouped by date */}
            <div className="space-y-5 mt-2">
              {groupedTransactionsByDate.map(group => (
                <div key={group.date} className="space-y-2">
                  <h4 className="text-[10px] text-stone-500 dark:text-stone-500 font-extrabold uppercase tracking-widest pl-2">
                    {group.date}
                  </h4>

                  <div className="space-y-2">
                    {group.transactions.map(t => {
                      const isIncome = t.type === 'thu';
                      return (
                        <div
                          key={t.id}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedTransaction(t);
                          }}
                          className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-2xl p-4 flex items-center justify-between transition-all cursor-pointer active:scale-[0.98]"
                        >
                          <div className="flex items-center gap-3 truncate max-w-[70%]">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              isIncome ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {isIncome ? <Icons.ArrowUpRight className="w-5 h-5" /> : <Icons.ArrowDownLeft className="w-5 h-5" />}
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-extrabold text-stone-900 dark:text-stone-100 truncate">
                                {t.note || t.level2 || t.level1}
                              </p>
                              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-semibold mt-0.5">
                                {t.level1} • {t.account_name}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isIncome ? '+' : '-'}{t.amount.toLocaleString('vi-VN')}đ
                            </p>
                            <p className="text-[9px] text-stone-500 dark:text-stone-400 font-medium mt-0.5">
                              {t.created_at ? new Date(t.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="text-center py-12">
                  <span className="text-2xl block mb-2">🔍</span>
                  <p className="text-xs text-stone-500 font-semibold italic">
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc hiện tại.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <SettingsTab 
            jarsAllocation={jarsAllocation}
            onUpdateJars={setJarsAllocation}
            categoryLimits={categoryLimits}
            onUpdateLimits={setCategoryLimits}
            onAddCategoryLimit={(limit) => setCategoryLimits([...categoryLimits, limit])}
            savingsGoals={savingsGoals}
            onUpdateGoals={setSavingsGoals}
            triggerHaptic={triggerHaptic}
          />
        )}
      </main>

      {/* 3. FIXED BOTTOM TAB BAR (Screenshots Footer) */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200/20 dark:border-stone-850/50 px-4 py-2 flex justify-around items-center shadow-lg pb-safe">
        {[
          { id: 'overview', label: 'Tổng quan', icon: <Icons.Home className="w-5.5 h-5.5" /> },
          { id: 'jars', label: 'Ví & Hũ', icon: <Icons.Wallet className="w-5.5 h-5.5" /> },
          { id: 'charts', label: 'Biểu đồ', icon: <Icons.PieChart className="w-5.5 h-5.5" /> },
          { id: 'history', label: 'Lịch sử', icon: <Icons.Calendar className="w-5.5 h-5.5" /> },
          { id: 'settings', label: 'Cài đặt', icon: <Icons.Settings className="w-5.5 h-5.5" /> },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id);
              }}
              className={`flex flex-col items-center gap-1 transition-all ${
                isActive 
                  ? 'text-stone-950 dark:text-white font-extrabold scale-105' 
                  : 'text-stone-400 dark:text-stone-500 hover:text-stone-600 font-medium'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                isActive 
                  ? 'bg-[#111827] text-white dark:bg-stone-100 dark:text-stone-900 shadow-md' 
                  : 'text-stone-400 dark:text-stone-500'
              }`}>
                {tab.icon}
              </div>
              <span className="text-[8px] uppercase tracking-wider font-semibold mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </footer>

      {/* 4. SHEET DRAWERS OVERLAYS */}
      <FilterDrawer
        filters={filters}
        setFilters={setFilters}
        availableAccounts={availableAccounts}
        availableCategories={availableCategories}
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {selectedTransaction && (
        <TransactionDetailSheet
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {/* Floating Chat/Voice Button */}
      <button
        onClick={handleCloseWebApp}
        className="fixed bottom-24 right-5 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/25 active:scale-95 hover:scale-105 transition-all border border-amber-400/20 duration-200"
        title="Quay lại chat với Bot MMAA"
      >
        <Icons.MessageSquare className="w-4 h-4 text-white" />
        <span className="text-xs font-bold tracking-wide">Chat/Voice</span>
      </button>
    </div>
  );
}