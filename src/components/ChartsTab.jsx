import React, { useState, useMemo } from 'react';
import * as Icons from './Icons';
import { DonutChart, AreaChart } from './CustomCharts';

export default function ChartsTab({
  transactions = [],
  monthlyIncome = 45200000,
  monthlyExpense = 18500000,
  trendChartData,
  trendCategory = 'all',
  setTrendCategory,
  triggerHaptic,
}) {
  const [periodPreset, setPeriodPreset] = useState('this_month'); // this_month, last_month, this_year

  // Donut chart dropdown filter toggle states
  const [showIncomeDropdown, setShowIncomeDropdown] = useState(false);
  const [incomeL1Filter, setIncomeL1Filter] = useState('all');

  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [expenseL1Filter, setExpenseL1Filter] = useState('all');

  // Trend chart dropdown toggle state
  const [showTrendDropdown, setShowTrendDropdown] = useState(false);

  // Available filter options for Income Donut (Level 1 main categories)
  const incomeL1Options = useMemo(() => {
    const set = new Set(transactions.filter(t => t.type === 'thu').map(t => t.level1).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [transactions]);

  // Available filter options for Expense Donut (Level 1 main categories)
  const expenseL1Options = useMemo(() => {
    const set = new Set(transactions.filter(t => t.type === 'chi').map(t => t.level1).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [transactions]);

  // Available Level 2 categories for Trend Dropdown filter
  const trendL2Options = useMemo(() => {
    const set = new Set(transactions.filter(t => t.type === 'chi').map(t => t.level2).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [transactions]);

  // Compute Income Structure data based on transactions or mock fallback
  // Defaults to Level 2 (subcategory) grouping!
  const incomeChartData = useMemo(() => {
    const incomes = transactions.filter(t => {
      if (t.type !== 'thu') return false;
      if (incomeL1Filter !== 'all' && t.level1 !== incomeL1Filter) return false;
      return true;
    });
    
    if (incomes.length === 0) {
      if (transactions.filter(t => t.type === 'thu').length > 0) {
        return [];
      }
      return [
        { label: 'Lương chính', value: monthlyIncome * 0.70 },
        { label: 'Job phụ', value: monthlyIncome * 0.20 },
        { label: 'Thu nhập khác', value: monthlyIncome * 0.10 },
      ];
    }

    const groups = {};
    incomes.forEach(t => {
      // Group by Level 2 (subcategory) falling back to Level 1
      const cat = t.level2 || t.level1 || 'Thu nhập khác';
      groups[cat] = (groups[cat] || 0) + t.amount;
    });

    return Object.keys(groups).map(label => ({
      label,
      value: groups[label]
    })).sort((a, b) => b.value - a.value);
  }, [transactions, monthlyIncome, incomeL1Filter]);

  // Compute Expense allocation data based on transactions or mock fallback
  // Defaults to Level 2 (subcategory) grouping!
  const expenseChartData = useMemo(() => {
    const expenses = transactions.filter(t => {
      if (t.type !== 'chi') return false;
      if (expenseL1Filter !== 'all' && t.level1 !== expenseL1Filter) return false;
      return true;
    });
    
    if (expenses.length === 0) {
      if (transactions.filter(t => t.type === 'chi').length > 0) {
        return [];
      }
      return [
        { label: 'Ăn uống', value: monthlyExpense * 0.35 },
        { label: 'Tiền thuê nhà', value: monthlyExpense * 0.30 },
        { label: 'Mua sắm gia đình', value: monthlyExpense * 0.15 },
        { label: 'Điện nước', value: monthlyExpense * 0.10 },
        { label: 'Quỹ tiết kiệm', value: monthlyExpense * 0.05 },
        { label: 'Khác', value: monthlyExpense * 0.05 },
      ];
    }

    const groups = {};
    expenses.forEach(t => {
      // Group by Level 2 (subcategory) falling back to Level 1
      const cat = t.level2 || t.level1 || 'Chi tiêu khác';
      groups[cat] = (groups[cat] || 0) + t.amount;
    });

    return Object.keys(groups).map(label => ({
      label,
      value: groups[label]
    })).sort((a, b) => b.value - a.value);
  }, [transactions, monthlyExpense, expenseL1Filter]);

  // Compute sums for the top summary cards
  const filteredIncomeSum = useMemo(() => {
    return incomeChartData.reduce((sum, item) => sum + item.value, 0);
  }, [incomeChartData]);

  const filteredExpenseSum = useMemo(() => {
    return expenseChartData.reduce((sum, item) => sum + item.value, 0);
  }, [expenseChartData]);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Period Presets Tabs */}
      <div className="bg-stone-100 dark:bg-stone-900/60 p-1 rounded-xl flex gap-1">
        {[
          { id: 'this_month', label: 'Tháng này' },
          { id: 'last_month', label: 'Tháng trước' },
          { id: 'this_year', label: 'Năm nay' },
        ].map(p => (
          <button
            key={p.id}
            onClick={() => {
              triggerHaptic('light');
              setPeriodPreset(p.id);
            }}
            className={`flex-grow py-1.5 text-xs font-bold rounded-lg transition-all ${
              periodPreset === p.id 
                ? 'bg-white dark:bg-stone-800 text-[#111827] dark:text-white shadow-sm' 
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 2. Income Structure Donut Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-extrabold text-[#111827] dark:text-white tracking-tight">
            Cơ cấu thu nhập
          </h3>
          <div className="flex gap-2 relative">
            <button 
              onClick={() => {
                triggerHaptic('light');
                setShowIncomeDropdown(!showIncomeDropdown);
              }}
              className={`text-stone-400 hover:text-[#111827] dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-850 ${
                incomeL1Filter !== 'all' ? 'text-indigo-650 dark:text-indigo-400 font-extrabold' : ''
              }`}
            >
              <Icons.Sliders className="w-4 h-4" />
            </button>

            {showIncomeDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowIncomeDropdown(false)} />
                <div className="absolute right-0 mt-8 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/60 shadow-xl py-1.5 z-20 max-h-56 overflow-y-auto no-scrollbar animate-scale-up origin-top-right">
                  <div className="px-3 py-1 text-[9px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-850 mb-1">
                    Lọc danh mục Cấp 1
                  </div>
                  {incomeL1Options.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        triggerHaptic('light');
                        setIncomeL1Filter(cat);
                        setShowIncomeDropdown(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                        incomeL1Filter === cat
                          ? 'bg-stone-100 dark:bg-stone-800 text-[#111827] dark:text-white'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
                      }`}
                    >
                      <span>{cat === 'all' ? 'Tất cả danh mục' : cat}</span>
                      {incomeL1Filter === cat && <Icons.Check className="w-3.5 h-3.5 text-stone-900 dark:text-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button className="text-stone-400 hover:text-[#111827] p-1"><Icons.TrendingUp className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Total Summary Block at the top */}
        <div className="mt-2 mb-6">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-extrabold block tracking-wide">
            {incomeL1Filter === 'all' ? 'Tổng thu' : `Tổng thu (${incomeL1Filter})`}
          </span>
          <span className="text-3xl font-black text-[#111827] dark:text-white leading-none block mt-1.5">
            {filteredIncomeSum.toLocaleString('vi-VN')} đ
          </span>
          <span className="text-[11px] text-stone-550 dark:text-stone-450 block mt-1.5">
            {incomeChartData.length} danh mục cấp 2
          </span>
        </div>

        {incomeChartData.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-850/20 rounded-2xl">
            Chưa có dữ liệu thu nhập tháng này.
          </div>
        ) : (
          <DonutChart 
            data={incomeChartData} 
            totalLabel="Tổng thu" 
            currencySymbol="đ"
          />
        )}
      </div>

      {/* 3. Expense Allocation Donut Card */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-extrabold text-[#111827] dark:text-white tracking-tight">
            Phân bổ chi tiêu
          </h3>
          <div className="flex gap-2 relative">
            <button 
              onClick={() => {
                triggerHaptic('light');
                setShowExpenseDropdown(!showExpenseDropdown);
              }}
              className={`text-stone-400 hover:text-[#111827] dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-850 ${
                expenseL1Filter !== 'all' ? 'text-indigo-650 dark:text-indigo-400 font-extrabold' : ''
              }`}
            >
              <Icons.Sliders className="w-4 h-4" />
            </button>

            {showExpenseDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExpenseDropdown(false)} />
                <div className="absolute right-0 mt-8 w-48 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/60 shadow-xl py-1.5 z-20 max-h-56 overflow-y-auto no-scrollbar animate-scale-up origin-top-right">
                  <div className="px-3 py-1 text-[9px] font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100 dark:border-stone-850 mb-1">
                    Lọc danh mục Cấp 1
                  </div>
                  {expenseL1Options.map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        triggerHaptic('light');
                        setExpenseL1Filter(cat);
                        setShowExpenseDropdown(false);
                      }}
                      className={`flex items-center justify-between w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                        expenseL1Filter === cat
                          ? 'bg-stone-100 dark:bg-stone-800 text-[#111827] dark:text-white'
                          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
                      }`}
                    >
                      <span>{cat === 'all' ? 'Tất cả danh mục' : cat}</span>
                      {expenseL1Filter === cat && <Icons.Check className="w-3.5 h-3.5 text-stone-900 dark:text-white" />}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button className="text-stone-400 hover:text-[#111827] p-1"><Icons.PieChart className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Total Summary Block at the top */}
        <div className="mt-2 mb-6">
          <span className="text-[10px] text-stone-500 dark:text-stone-400 font-extrabold block tracking-wide">
            {expenseL1Filter === 'all' ? 'Tổng chi' : `Tổng chi (${expenseL1Filter})`}
          </span>
          <span className="text-3xl font-black text-[#111827] dark:text-white leading-none block mt-1.5">
            {filteredExpenseSum.toLocaleString('vi-VN')} đ
          </span>
          <span className="text-[11px] text-stone-550 dark:text-stone-450 block mt-1.5">
            {expenseChartData.length} danh mục cấp 2
          </span>
        </div>

        {expenseChartData.length === 0 ? (
          <div className="text-center py-12 text-stone-500 text-xs italic bg-stone-50/50 dark:bg-stone-900/30 border border-stone-200/60 dark:border-stone-850/20 rounded-2xl">
            Chưa có dữ liệu chi tiêu tháng này.
          </div>
        ) : (
          <DonutChart 
            data={expenseChartData} 
            totalLabel="Tổng chi" 
            currencySymbol="đ"
          />
        )}
      </div>

      {/* 4. Spend Trend Comparison line Chart */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">
              Xu hướng Chi tiêu
            </h3>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wide">
              So sánh với chu kỳ trước
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Legend (Hiện tại & Trước) */}
            <div className="flex gap-2.5 text-[9px] font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-1 bg-stone-900 dark:bg-white inline-block rounded-full" />
                <span className="text-stone-600 dark:text-stone-305">Hiện tại</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-px border-t border-dashed border-stone-400 dark:border-stone-600 inline-block" />
                <span className="text-stone-500 dark:text-stone-400">Trước</span>
              </div>
            </div>

            {/* Category Filter Dropdown for Trend (Aligned on the same row) */}
            <div className="relative">
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  setShowTrendDropdown(!showTrendDropdown);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-black bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-750 text-stone-700 dark:text-stone-300 transition-colors border border-stone-200/40 dark:border-stone-850/20"
              >
                <Icons.Filter className="w-3.5 h-3.5" />
                <span className="max-w-[75px] truncate">{trendCategory === 'all' ? 'Tất cả' : trendCategory}</span>
                <Icons.ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-60" />
              </button>

              {showTrendDropdown && (
                <>
                  {/* Backdrop to close dropdown on click outside */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowTrendDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800/60 shadow-xl py-1.5 z-20 max-h-56 overflow-y-auto no-scrollbar animate-scale-up origin-top-right">
                    {trendL2Options.map(cat => (
                      <button
                        key={cat}
                        onClick={() => {
                          triggerHaptic('light');
                          setTrendCategory(cat);
                          setShowTrendDropdown(false);
                        }}
                        className={`flex items-center justify-between w-full text-left px-4 py-2 text-xs font-bold transition-colors ${
                          trendCategory === cat
                            ? 'bg-stone-100 dark:bg-stone-800 text-[#111827] dark:text-white'
                            : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-850'
                        }`}
                      >
                        <span>{cat === 'all' ? 'Tất cả danh mục' : cat}</span>
                        {trendCategory === cat && <Icons.Check className="w-3.5 h-3.5 text-stone-900 dark:text-white" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <AreaChart 
          currentData={trendChartData.currentTrend} 
          previousData={trendChartData.previousTrend} 
        />
      </div>

      {/* 5. AI warning toast overlay */}
      <div className="bg-[#231604] border border-[#3d270b]/35 p-4.5 rounded-2xl flex gap-3.5 items-center justify-between text-left relative overflow-hidden">
        <div className="flex gap-3 items-center">
          <div className="w-8 h-8 rounded-full bg-[#170e02] border border-[#3d270b]/35 flex items-center justify-center flex-shrink-0">
            <Icons.Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <p className="text-[11px] text-stone-300 leading-normal font-semibold">
            Chi tiêu <strong className="text-white">ăn uống</strong> của bạn tăng <strong className="text-rose-450">15%</strong> so với tháng trước, hãy chú ý nhé!
          </p>
        </div>
        <button 
          onClick={() => { triggerHaptic('light'); alert('Đang chuyển tới báo cáo ăn uống...'); }}
          className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex-shrink-0 underline pl-2"
        >
          Xem chi tiết
        </button>
      </div>

      {/* 6. Mascot bottom banner */}
      <div className="flex flex-col items-center justify-center text-center py-4">
        <div className="w-16 h-16 rounded-full bg-stone-100/60 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-850/20 flex items-center justify-center mb-3">
          <svg viewBox="0 0 100 100" className="w-10 h-10 text-stone-800 dark:text-[#FAF6F0] fill-current">
            {/* Paw Pad Center */}
            <path d="M 50,45 C 32,45 27,58 27,70 C 27,82 37,84 50,84 C 63,84 73,82 73,70 C 73,58 68,45 50,45 Z" />
            {/* Toes */}
            <ellipse cx="23" cy="47" rx="9" ry="11" transform="rotate(-15 23 47)" />
            <ellipse cx="40" cy="31" rx="10" ry="13" transform="rotate(-5 40 31)" />
            <ellipse cx="60" cy="31" rx="10" ry="13" transform="rotate(5 60 31)" />
            <ellipse cx="77" cy="47" rx="9" ry="11" transform="rotate(15 77 47)" />
          </svg>
        </div>
        <p className="text-[10px] text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider max-w-[280px] leading-relaxed">
          Dancin đang giúp bạn theo dõi từng đồng xu để tương lai rạng rỡ hơn!
        </p>
      </div>
    </div>
  );
}
