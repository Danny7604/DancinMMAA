import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as Icons from './Icons';

const JAR_NAMES = {
  nec: 'Hũ Thiết yếu',
  edu: 'Hũ Giáo dục',
  ltss: 'Hũ Tiết kiệm',
  play: 'Hũ Hưởng thụ',
  ffa: 'Hũ Tự do tài chính',
  give: 'Hũ Cho đi'
};

const CATEGORY_EMOJIS = {
  // Chi phí sinh hoạt
  "Ăn uống": "🍔",
  "Coffee": "☕",
  "Mua sắm gia đình": "🛒",
  "Online shopping": "🛍️",
  "Dating": "❤️",
  "Pet": "🐱",
  "Thể thao": "⚽",
  "Di chuyển": "🚗",
  "Game": "🎮",
  // Chi phí cố định
  "Tiền thuê nhà": "🏠",
  "Điện nước": "⚡",
  "Internet": "🌐",
  "Bảo hiểm": "🛡️",
  "Học phí": "🎓",
  // Chi phí phát sinh
  "Nhậu": "🍻",
  "Đám tiệc": "🎉",
  "Quà cáp": "🎁",
  "Y tế": "🏥",
  "Du lịch": "✈️",
  "Sửa xe": "🔧",
  "Household": "🧹",
  "Công việc": "💼",
  "Tín dụng": "💳",
  "Cho mượn": "💸",
  // Đầu tư - Tiết kiệm
  "Quỹ tiết kiệm": "🐖",
  "Chứng khoán / Vàng": "📈",
  "Quỹ khác": "💰",
  // Thu nhập
  "Lương chính": "💵",
  "Job phụ": "🛠️",
  "Job phụ 2": "💻",
  // Lãi/Lời
  "Lãi tiết kiệm": "🏦",
  "Lãi đầu tư": "📊",
  "Cổ tức": "🪙",
  // Thưởng/Quà
  "Thưởng": "🏆",
  "Được tặng": "🎁",
  "Trúng thưởng": "🎟️",
  // Khác
  "Thu hồi nợ": "🤝",
  "Bán đồ cũ": "📦"
};

const ALL_EXPENSE_CATEGORIES = [
  {
    id: 'sinhhoat',
    name: 'Chi phí sinh hoạt',
    sub: [
      { name: "Ăn uống", icon: "🍔" },
      { name: "Coffee", icon: "☕" },
      { name: "Mua sắm gia đình", icon: "🛒" },
      { name: "Online shopping", icon: "🛍️" },
      { name: "Dating", icon: "❤️" },
      { name: "Pet", icon: "🐱" },
      { name: "Thể thao", icon: "⚽" },
      { name: "Di chuyển", icon: "🚗" },
      { name: "Game", icon: "🎮" }
    ],
  },
  {
    id: 'codinh',
    name: 'Chi phí cố định',
    sub: [
      { name: "Tiền thuê nhà", icon: "🏠" },
      { name: "Điện nước", icon: "⚡" },
      { name: "Internet", icon: "🌐" },
      { name: "Bảo hiểm", icon: "🛡️" },
      { name: "Học phí", icon: "🎓" }
    ],
  },
  {
    id: 'phatsinh',
    name: 'Chi phí phát sinh',
    sub: [
      { name: "Nhậu", icon: "🍻" },
      { name: "Đám tiệc", icon: "🎉" },
      { name: "Quà cáp", icon: "🎁" },
      { name: "Y tế", icon: "🏥" },
      { name: "Du lịch", icon: "✈️" },
      { name: "Sửa xe", icon: "🔧" },
      { name: "Household", icon: "🧹" },
      { name: "Công việc", icon: "💼" },
      { name: "Tín dụng", icon: "💳" },
      { name: "Cho mượn", icon: "💸" }
    ],
  },
  {
    id: 'daututietkiem',
    name: 'Đầu tư - Tiết kiệm',
    sub: [
      { name: "Quỹ tiết kiệm", icon: "🐖" },
      { name: "Chứng khoán / Vàng", icon: "📈" },
      { name: "Quỹ khác", icon: "💰" }
    ],
  },
];


export default function JarsTab({
  jarsAllocation = {
    nec: 55, // Nhu cầu thiết yếu
    edu: 10, // Giáo dục
    ltss: 10, // Tiết kiệm dài hạn
    play: 10, // Hưởng thụ
    ffa: 10,  // Tự do tài chính
    give: 5,  // Cho đi
  },
  savingsGoals = [],
  onAddSavingsGoal,
  categoryLimits = [],
  onAddCategoryLimit,
  transactions = [],
  monthlyIncome = 0,
  triggerHaptic,
  categoryJars = {},
  onUpdateCategoryJar,
  categories = [],
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '0', image: '💰', note: '' });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState({ name: '', target: '' });
  const [expandedJar, setExpandedJar] = useState(null);
  const [activeMappingJar, setActiveMappingJar] = useState(null);

  // Group expense categories dynamically from database prop categories
  const expenseCategories = useMemo(() => {
    const sourceList = categories.length > 0 ? categories : [];
    const chiCats = sourceList.filter(c => c.transaction_type === 'chi');
    
    const grouped = {};
    chiCats.forEach(c => {
      if (!c.level_1 || !c.level_2) return;
      if (!grouped[c.level_1]) {
        grouped[c.level_1] = [];
      }
      if (!grouped[c.level_1].some(item => item.name === c.level_2)) {
        grouped[c.level_1].push({
          name: c.level_2,
          icon: CATEGORY_EMOJIS[c.level_2] || '📁'
        });
      }
    });

    if (Object.keys(grouped).length === 0) {
      return ALL_EXPENSE_CATEGORIES;
    }

    const order = ['Chi phí sinh hoạt', 'Chi phí cố định', 'Chi phí phát sinh', 'Đầu tư - Tiết kiệm'];
    const result = [];
    
    // First, add standard groups in order
    order.forEach(l1 => {
      if (grouped[l1]) {
        const id = l1 === 'Chi phí sinh hoạt' ? 'sinhhoat'
                 : l1 === 'Chi phí cố định' ? 'codinh'
                 : l1 === 'Chi phí phát sinh' ? 'phatsinh'
                 : 'daututietkiem';
        result.push({
          id,
          name: l1,
          sub: grouped[l1]
        });
        delete grouped[l1];
      }
    });
    
    // Then add any remaining custom groups
    Object.keys(grouped).forEach(l1 => {
      const id = l1.toLowerCase().replace(/[^a-z0-9]/g, '');
      result.push({
        id,
        name: l1,
        sub: grouped[l1]
      });
    });

    return result;
  }, [categories]);

  useEffect(() => {
    if (activeMappingJar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeMappingJar]);

  const formatVND = (val) => val.toLocaleString('vi-VN') + 'đ';

  // Total income used to scale the 6 jars cap, dynamically loaded from database (defaults to 10M if 0)
  const baseIncome = monthlyIncome || 10000000;

  const parseDateStr = (str) => {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) return null;
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  };

  const getJarForTransaction = (t) => {
    const l1 = t.level1 || '';
    const l2 = t.level2 || '';

    // First check user's custom mapping
    if (categoryJars && categoryJars[l2]) {
      return categoryJars[l2];
    }
    if (categoryJars && categoryJars[l1]) {
      return categoryJars[l1];
    }

    const l1Lower = l1.toLowerCase();
    const l2Lower = l2.toLowerCase();

    // 1. GIVE (Cho đi)
    if (l2Lower.includes('quà') || l2Lower.includes('cho mượn') || l2Lower.includes('cho đi') || l2Lower.includes('từ thiện') || l2Lower.includes('ủng hộ')) {
      return 'give';
    }

    // 2. FFA (Tự do tài chính)
    if (l2Lower.includes('chứng khoán') || l2Lower.includes('vàng') || l2Lower.includes('đầu tư') || l2Lower.includes('cổ phiếu') || l2Lower.includes('quỹ khác')) {
      return 'ffa';
    }

    // 3. LTSS (Tiết kiệm dài hạn)
    if (l2Lower.includes('tiết kiệm') || l2Lower.includes('tích lũy')) {
      return 'ltss';
    }

    // 4. EDU (Giáo dục)
    if (l2Lower.includes('học') || l2Lower.includes('sách') || l2Lower.includes('khoá học') || l2Lower.includes('công việc')) {
      return 'edu';
    }

    // 5. PLAY (Hưởng thụ)
    if (l2Lower.includes('nhậu') || l2Lower.includes('du lịch') || l2Lower.includes('tiệc') || l2Lower.includes('dating') || l2Lower.includes('game') || l2Lower.includes('giải trí') || l2Lower.includes('hưởng thụ')) {
      return 'play';
    }

    // 6. NEC (Nhu cầu thiết yếu)
    if (l1Lower.includes('sinh hoạt') || l1Lower.includes('cố định') || l2Lower.includes('ăn uống') || l2Lower.includes('coffee') || l2Lower.includes('di chuyển') || l2Lower.includes('y tế') || l2Lower.includes('sửa xe') || l2Lower.includes('household') || l2Lower.includes('thuê nhà') || l2Lower.includes('điện nước')) {
      return 'nec';
    }

    return 'nec'; // Fallback
  };

  const getCategorySpentThisMonth = (categoryName) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const nameLower = categoryName.toLowerCase().trim();

    return (transactions || []).reduce((sum, t) => {
      if (t.type === 'chi') {
        const l1 = (t.level1 || '').toLowerCase();
        const l2 = (t.level2 || '').toLowerCase();
        const note = (t.note || '').toLowerCase();
        
        if (l1 === nameLower || l2 === nameLower || note.includes(nameLower)) {
          const tDate = parseDateStr(t.date);
          if (tDate && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
            return sum + (t.amount || 0);
          }
        }
      }
      return sum;
    }, 0);
  };

  // Define 6 jars configs
  const jars = [
    {
      id: 'nec',
      name: 'Hũ Nhu cầu thiết yếu',
      percent: jarsAllocation.nec,
      icon: <Icons.Utensils className="w-5 h-5 text-stone-700 dark:text-stone-300" />,
      targetVal: baseIncome * (jarsAllocation.nec / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'nec')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-[#111827] dark:bg-stone-400',
    },
    {
      id: 'edu',
      name: 'Hũ Giáo dục/Phát triển',
      percent: jarsAllocation.edu,
      icon: <Icons.GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      targetVal: baseIncome * (jarsAllocation.edu / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'edu')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-emerald-600',
    },
    {
      id: 'ltss',
      name: 'Hũ Tiết kiệm dài hạn',
      percent: jarsAllocation.ltss,
      icon: <Icons.Target className="w-5 h-5 text-stone-500 dark:text-stone-400" />,
      targetVal: baseIncome * (jarsAllocation.ltss / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'ltss')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-stone-500',
    },
    {
      id: 'play',
      name: 'Hũ Hưởng thụ',
      percent: jarsAllocation.play,
      icon: <Icons.Award className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      targetVal: baseIncome * (jarsAllocation.play / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'play')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-amber-600',
    },
    {
      id: 'ffa',
      name: 'Hũ Tự do tài chính',
      percent: jarsAllocation.ffa,
      icon: <Icons.TrendingUp className="w-5 h-5 text-amber-700 dark:text-amber-400" />,
      targetVal: baseIncome * (jarsAllocation.ffa / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'ffa')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-amber-700',
    },
    {
      id: 'give',
      name: 'Hũ Cho đi',
      percent: jarsAllocation.give,
      icon: <Icons.Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      targetVal: baseIncome * (jarsAllocation.give / 100),
      currentVal: transactions
        .filter(t => t.type === 'chi' && getJarForTransaction(t) === 'give')
        .reduce((sum, t) => sum + (t.amount || 0), 0),
      colorClass: 'bg-rose-500',
    },
  ];

  const handleSubmitGoal = (e) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    
    triggerHaptic('success');
    onAddSavingsGoal({
      id: 'mock-g-' + Date.now(),
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current) || 0,
      image: newGoal.image,
      note: newGoal.note || 'Cố lên từng ngày!',
    });
    
    setIsModalOpen(false);
    setNewGoal({ name: '', target: '', current: '0', image: '💰', note: '' });
  };

  const handleSubmitLimit = (e) => {
    e.preventDefault();
    if (!newLimit.name || !newLimit.target) return;
    
    triggerHaptic('success');
    if (onAddCategoryLimit) {
      onAddCategoryLimit({
        name: newLimit.name,
        current: 0,
        target: parseFloat(newLimit.target)
      });
    }
    
    setIsLimitModalOpen(false);
    setNewLimit({ name: '', target: '' });
  };

  const handleToggleCategory = (categoryName) => {
    triggerHaptic('light');
    const currentJar = categoryJars[categoryName] || 'nec';
    if (currentJar === activeMappingJar) {
      if (activeMappingJar !== 'nec') {
        if (onUpdateCategoryJar) onUpdateCategoryJar(categoryName, 'nec');
      }
    } else {
      if (onUpdateCategoryJar) onUpdateCategoryJar(categoryName, activeMappingJar);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16 relative">
      {/* 1. Jars Segment */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-850/50 pb-3 mb-4">
          <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
            Hũ chi tiêu tháng này
          </h3>
          <button 
            onClick={() => { triggerHaptic('light'); alert('Đang tải danh sách hũ chi tiết...'); }}
            className="text-xs text-stone-500 dark:text-stone-400 font-bold hover:text-stone-900 flex items-center gap-1"
          >
            <span>Xem chi tiết</span>
            <Icons.ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-4">
          {jars.map(jar => {
            // Calculate percentage used of the monthly budget allocated
            const usedPercent = jar.targetVal > 0 ? Math.min(Math.round((jar.currentVal / jar.targetVal) * 100), 100) : 0;
            const isExpanded = expandedJar === jar.id;
            const mappedSubcategories = Object.keys(categoryJars).filter(
              subCatName => categoryJars[subCatName] === jar.id
            );

            return (
              <div 
                key={jar.id} 
                className="space-y-1.5 p-3 -mx-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-850/20 transition-all cursor-pointer select-none active:scale-[0.99] border border-transparent hover:border-stone-150 dark:hover:border-stone-800/40"
                onClick={() => {
                  triggerHaptic('light');
                  setExpandedJar(expandedJar === jar.id ? null : jar.id);
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center">
                      {jar.icon}
                    </div>
                    <span className="font-extrabold text-[#111827] dark:text-white">{jar.name}</span>
                  </div>
                  <div className="text-right flex flex-col justify-center items-end">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{usedPercent}% used</span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-medium mt-0.5">
                      Chi: {formatVND(jar.currentVal)} / {formatVND(jar.targetVal)}
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${jar.colorClass} rounded-full transition-all duration-500`}
                    style={{ width: `${usedPercent}%` }}
                  />
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="mt-3 pl-10.5 pr-2.5 space-y-2 border-l-2 border-stone-200 dark:border-stone-800 ml-4 animate-fade-in text-left">
                    <span className="text-[9px] text-stone-400 dark:text-stone-500 font-extrabold uppercase tracking-wide block mb-1">
                      Danh mục liên kết:
                    </span>
                    {mappedSubcategories.length === 0 ? (
                      <span className="text-[10.5px] text-stone-450 font-medium italic block py-0.5">
                        Chưa có danh mục nào được liên kết với hũ này.
                      </span>
                    ) : (
                      mappedSubcategories.map((subCat) => {
                        const spent = getCategorySpentThisMonth(subCat);
                        return (
                          <div key={subCat} className="flex justify-between items-center text-[11px] font-semibold text-stone-700 dark:text-stone-300">
                            <span>{subCat}</span>
                            <span className="font-extrabold text-stone-900 dark:text-stone-100">
                              {formatVND(spent)}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <div className="pt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerHaptic('medium');
                          setActiveMappingJar(jar.id);
                        }}
                        className="w-full py-2 bg-stone-100 hover:bg-stone-250 dark:bg-stone-800 dark:hover:bg-stone-700/80 text-[10.5px] text-stone-800 dark:text-stone-200 font-bold rounded-xl transition-all border border-stone-200 dark:border-stone-700 flex items-center justify-center gap-1.5"
                      >
                        <Icons.Settings className="w-3.5 h-3.5" />
                        <span>⚙ Quản lý liên kết</span>
                      </button>
                    </div>
                    <span className="text-[8.5px] text-stone-400 dark:text-stone-500 font-bold block pt-1.5 border-t border-dashed border-stone-150 dark:border-stone-800/40 mt-1">
                      💡 Mẹo: Bạn cũng có thể liên kết nhanh bằng cách bấm nút trên.
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Limits segment */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
            Hạn mức chi tiêu danh mục
          </h3>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setIsLimitModalOpen(true);
            }}
            className="text-[10px] font-extrabold text-white dark:text-stone-950 bg-stone-950 dark:bg-stone-100 px-2.5 py-1 rounded-lg hover:scale-105 transition-all"
          >
            + Thêm
          </button>
        </div>

        <div className="space-y-4">
          {categoryLimits.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-850/20 rounded-2xl">
              Chưa thiết lập hạn mức nào. Nhấn "+ Thêm" để tạo mới!
            </div>
          ) : (
            categoryLimits.map((limit, i) => {
              const currentSpent = getCategorySpentThisMonth(limit.name);
              const pct = Math.min(Math.round((currentSpent / limit.target) * 100), 100);
              const isDanger = pct >= 80;
              const nameLower = limit.name.toLowerCase();
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 font-extrabold text-[#111827] dark:text-white">
                      {nameLower.includes('mua sắm') || nameLower.includes('shopping') ? (
                        <Icons.ShoppingBag className="w-4 h-4 text-rose-500" />
                      ) : nameLower.includes('ăn uống') || nameLower.includes('nhà hàng') || nameLower.includes('ăn') ? (
                        <Icons.Utensils className="w-4 h-4 text-amber-500" />
                      ) : nameLower.includes('di chuyển') || nameLower.includes('xe') || nameLower.includes('grab') ? (
                        <Icons.Car className="w-4 h-4 text-indigo-500" />
                      ) : (
                        <Icons.Award className="w-4 h-4 text-amber-500" />
                      )}
                      <span>{limit.name}</span>
                    </div>
                    <div className="text-right font-bold text-stone-500 dark:text-stone-400">
                      <span className={isDanger ? 'text-rose-500' : 'text-stone-700 dark:text-stone-300'}>{pct}% used</span>
                      <span className="text-[10px] block font-medium">
                        {formatVND(currentSpent)} / {formatVND(limit.target)}
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${isDanger ? 'bg-rose-600' : 'bg-[#111827] dark:bg-stone-300'} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Savings goals segments */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
            Quỹ tiết kiệm
          </h3>
          <button 
            onClick={() => {
              triggerHaptic('light');
              setIsModalOpen(true);
            }}
            className="text-[10px] font-extrabold text-white dark:text-stone-950 bg-stone-950 dark:bg-stone-100 px-2.5 py-1 rounded-lg hover:scale-105 transition-all"
          >
            + Thêm
          </button>
        </div>

        <div className="space-y-4">
          {savingsGoals.length === 0 ? (
            <div className="text-center py-8 text-stone-500 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-850/20 rounded-2xl">
              Chưa có quỹ tiết kiệm nào. Nhấn "Thêm" để tạo mới!
            </div>
          ) : (
            savingsGoals.map(goal => {
              const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
              return (
                <div 
                  key={goal.id}
                  className="bg-stone-50/30 dark:bg-stone-900/40 border border-stone-100 dark:border-stone-800/20 p-4.5 rounded-3xl flex gap-4 items-center"
                >
                  {/* Visual Avatar Emoji representation */}
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-2xl flex-shrink-0">
                    {goal.image}
                  </div>

                  <div className="flex-grow space-y-1 text-left">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#111827] dark:text-white">{goal.name}</span>
                      <span className="font-extrabold text-[#111827] dark:text-stone-200">{pct}% đạt được</span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-bold block">
                      {goal.current.toLocaleString('vi-VN')} / {formatVND(goal.target)}
                    </span>
                    
                    {/* Goal bar */}
                    <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#111827] dark:bg-stone-100 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    {goal.note && (
                      <div className="flex items-center gap-1 text-[9px] text-stone-500 dark:text-stone-400 font-bold italic pt-1">
                        <span>{goal.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 5. Add Goal Modal Overlay */}
      {isModalOpen && (
        <>
          <div className="fixed inset-0 bg-[#111827]/80 z-40 animate-fade-in backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] glass-card animate-slide-up p-6 pb-8">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-stone-200 dark:border-stone-800/40">
              <h3 className="text-sm font-bold text-[#111827] dark:text-stone-300 uppercase tracking-wider">Thêm mục tiêu mới</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/40"><Icons.X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSubmitGoal} className="space-y-4">
              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Tên mục tiêu</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Mua Macbook Pro, Đi du lịch Nhật..."
                  value={newGoal.name}
                  onChange={e => setNewGoal({ ...newGoal, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl glass-input"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Số tiền mục tiêu (đ)</label>
                  <input 
                    type="number" 
                    placeholder="20000000"
                    value={newGoal.target}
                    onChange={e => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl glass-input"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Đã tích lũy sẵn (đ)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={newGoal.current}
                    onChange={e => setNewGoal({ ...newGoal, current: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl glass-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Biểu tượng (Emoji)</label>
                  <input 
                    type="text" 
                    value={newGoal.image}
                    onChange={e => setNewGoal({ ...newGoal, image: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl glass-input text-center text-lg"
                    maxLength="4"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Câu châm ngôn</label>
                  <input 
                    type="text" 
                    placeholder="Cố gắng mỗi ngày một ít!"
                    value={newGoal.note}
                    onChange={e => setNewGoal({ ...newGoal, note: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl glass-input"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#111827] hover:bg-[#111827]/90 dark:bg-[#FAF6F0] dark:hover:bg-[#FAF6F0]/90 dark:text-[#111827] rounded-2xl text-xs font-bold transition-all shadow-md uppercase tracking-widest pt-3"
              >
                Tạo mục tiêu tiết kiệm
              </button>
            </form>
          </div>
        </>
      )}
      {/* 6. Add Limit Modal Overlay */}
      {isLimitModalOpen && (
        <>
          <div className="fixed inset-0 bg-[#111827]/80 z-40 animate-fade-in backdrop-blur-sm" onClick={() => setIsLimitModalOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 rounded-t-[2.5rem] glass-card animate-slide-up p-6 pb-8 text-left">
            <div className="flex justify-between items-center mb-5 pb-2 border-b border-stone-200 dark:border-stone-800/40">
              <h3 className="text-sm font-bold text-[#111827] dark:text-stone-300 uppercase tracking-wider">Thêm hạn mức chi tiêu</h3>
              <button onClick={() => setIsLimitModalOpen(false)} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/40"><Icons.X className="w-5 h-5 text-stone-400" /></button>
            </div>

            <form onSubmit={handleSubmitLimit} className="space-y-4">
              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Tên danh mục</label>
                <input 
                  type="text" 
                  placeholder="Ví dụ: Ăn uống, Mua sắm, Di chuyển..."
                  value={newLimit.name}
                  onChange={e => setNewLimit({ ...newLimit, name: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl glass-input"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider block mb-1">Số tiền hạn mức tối đa (đ)</label>
                <input 
                  type="number" 
                  placeholder="Ví dụ: 3000000"
                  value={newLimit.target}
                  onChange={e => setNewLimit({ ...newLimit, target: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl glass-input"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#111827] hover:bg-[#111827]/90 dark:bg-[#FAF6F0] dark:hover:bg-[#FAF6F0]/90 dark:text-[#111827] rounded-2xl text-xs font-bold transition-all shadow-md uppercase tracking-widest pt-3"
              >
                Thiết lập hạn mức
              </button>
            </form>
          </div>
        </>
      )}
      {/* 7. Category Mapping Bottom Sheet Modal */}
      {activeMappingJar && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-[#111827]/60 dark:bg-black/80 z-[100] animate-fade-in backdrop-blur-sm" 
            onClick={() => {
              triggerHaptic('light');
              setActiveMappingJar(null);
            }} 
          />
          <div 
            className="fixed bottom-0 left-0 right-0 z-[101] rounded-t-[2.5rem] bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 shadow-2xl flex flex-col h-[75vh] max-h-[75vh] animate-slide-up transition-colors duration-300 text-left"
          >
            {/* Top fixed area: Drag handle & Header */}
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              {/* Drag indicator/handle */}
              <div className="w-12 h-1.5 bg-stone-300 dark:bg-stone-700 rounded-full mx-auto mb-4" />
              
              {/* Header block */}
              <div className="flex justify-between items-start pb-2 border-b border-stone-200/60 dark:border-stone-800/40">
                <div className="text-left">
                  <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
                    Liên kết danh mục
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold mt-1">
                    Chọn danh mục cấp 2 tương thích với <span className="text-indigo-600 dark:text-indigo-400 font-extrabold">{JAR_NAMES[activeMappingJar]}</span>
                  </p>
                </div>
                <button 
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveMappingJar(null);
                  }} 
                  className="p-1.5 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <Icons.X className="w-5 h-5 text-stone-400" />
                </button>
              </div>
            </div>

            <div className="flex-grow overflow-y-auto no-scrollbar px-6 py-2 space-y-5">
              {expenseCategories.map(group => (
                <div key={group.id} className="space-y-2">
                  <h4 className="text-[10px] text-stone-400 dark:text-stone-500 font-black uppercase tracking-wider pl-1 flex items-center gap-1.5">
                    {group.id === 'sinhhoat' ? (
                      <Icons.Utensils className="w-3.5 h-3.5 text-indigo-500" />
                    ) : group.id === 'codinh' ? (
                      <Icons.Home className="w-3.5 h-3.5 text-stone-500" />
                    ) : group.id === 'phatsinh' ? (
                      <Icons.ShoppingBag className="w-3.5 h-3.5 text-rose-500" />
                    ) : (
                      <Icons.TrendingUp className="w-3.5 h-3.5 text-purple-500" />
                    )}
                    <span>{group.name}</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {group.sub.map(subCat => {
                      const mappedJar = categoryJars[subCat.name] || 'nec';
                      const isLinked = mappedJar === activeMappingJar;
                      
                      return (
                        <button
                          key={subCat.name}
                          type="button"
                          onClick={() => handleToggleCategory(subCat.name)}
                          className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all duration-250 active:scale-[0.97] h-[72px] ${
                            isLinked
                              ? 'bg-indigo-600/10 dark:bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-350 shadow-sm ring-1 ring-indigo-500/30'
                              : 'bg-stone-50/50 dark:bg-stone-900/50 border-stone-200/50 dark:border-stone-800/40 text-stone-700 dark:text-stone-300 hover:bg-stone-100/50 dark:hover:bg-stone-800/50'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-base">{subCat.icon}</span>
                            {isLinked && (
                              <span className="w-4 h-4 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-[10px] text-white font-black">
                                ✓
                              </span>
                            )}
                          </div>
                          <div className="mt-1 min-w-0 w-full">
                            <span className="text-[11px] font-extrabold block truncate leading-tight">{subCat.name}</span>
                            {!isLinked && (
                              <span className="text-[9px] text-stone-400 dark:text-stone-500 font-bold block truncate mt-0.5">
                                {JAR_NAMES[mappedJar]}
                              </span>
                            )}
                            {isLinked && (
                              <span className="text-[9px] text-indigo-600 dark:text-indigo-400 font-black block truncate mt-0.5">
                                Đã liên kết
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom fixed area: Save/Confirm button */}
            <div className="px-6 pt-2 pb-8 border-t border-stone-100 dark:border-stone-850 flex-shrink-0 bg-white dark:bg-stone-900 rounded-b-[2.5rem]">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('success');
                  setActiveMappingJar(null);
                }}
                className="w-full py-3.5 bg-[#111827] dark:bg-stone-100 text-white dark:text-[#111827] rounded-2xl text-xs font-black transition-all shadow-md hover:scale-[1.01] active:scale-[0.99] uppercase tracking-widest pt-4"
              >
                Xác nhận liên kết
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
