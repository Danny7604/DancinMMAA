import React, { useState } from 'react';
import * as Icons from './Icons';

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
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '0', image: '💰', note: '' });
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [newLimit, setNewLimit] = useState({ name: '', target: '' });

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

        <div className="space-y-5">
          {jars.map(jar => {
            // Calculate percentage used of the monthly budget allocated
            const usedPercent = jar.targetVal > 0 ? Math.min(Math.round((jar.currentVal / jar.targetVal) * 100), 100) : 0;
            return (
              <div key={jar.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800/60 flex items-center justify-center">
                      {jar.icon}
                    </div>
                    <span className="font-extrabold text-[#111827] dark:text-white">{jar.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{usedPercent}% used</span>
                    <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-medium">
                      Cần {formatVND(jar.targetVal)}
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
    </div>
  );
}
