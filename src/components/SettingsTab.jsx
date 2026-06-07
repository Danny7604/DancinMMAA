import React, { useState, useEffect } from 'react';
import * as Icons from './Icons';

export default function SettingsTab({
  jarsAllocation = { nec: 55, edu: 10, ltss: 10, play: 10, ffa: 10, give: 5 },
  onUpdateJars,
  categoryLimits = [],
  onUpdateLimits,
  onAddCategoryLimit,
  savingsGoals = [],
  onUpdateGoals,
  triggerHaptic,
}) {
  const [activeSubTab, setActiveSubTab] = useState('categories'); // categories, finance
  const [categoryType, setCategoryType] = useState('expense'); // expense, income
  const [expandedAccordion, setExpandedAccordion] = useState('sinhhoat');

  // Sliders/Finance State
  const [jars, setJars] = useState({ ...jarsAllocation });
  const [goals, setGoals] = useState([...savingsGoals]);
  const [limits, setLimits] = useState([...categoryLimits]);

  // Categories Local Mocks matching FIXED_EXPENSE / FIXED_INCOME in database
  const [expenseCategories, setExpenseCategories] = useState([
    {
      id: 'sinhhoat',
      name: 'Chi phí sinh hoạt',
      icon: <Icons.Utensils className="w-4 h-4 text-indigo-500" />,
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
      icon: <Icons.Home className="w-4 h-4 text-stone-500" />,
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
      icon: <Icons.ShoppingBag className="w-4 h-4 text-rose-500" />,
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
      icon: <Icons.TrendingUp className="w-4 h-4 text-purple-500" />,
      sub: [
        { name: "Quỹ tiết kiệm", icon: "🐖" },
        { name: "Chứng khoán / Vàng", icon: "📈" },
        { name: "Quỹ khác", icon: "💰" }
      ],
    },
  ]);

  const [incomeCategories, setIncomeCategories] = useState([
    {
      id: 'thunhap',
      name: 'Thu nhập',
      icon: <Icons.Wallet className="w-4 h-4 text-emerald-500" />,
      sub: [
        { name: "Lương chính", icon: "💵" },
        { name: "Job phụ", icon: "🛠️" },
        { name: "Job phụ 2", icon: "💻" }
      ],
    },
    {
      id: 'lailoi',
      name: 'Lãi/Lời',
      icon: <Icons.Target className="w-4 h-4 text-amber-500" />,
      sub: [
        { name: "Lãi tiết kiệm", icon: "🏦" },
        { name: "Lãi đầu tư", icon: "📊" },
        { name: "Cổ tức", icon: "🪙" }
      ],
    },
    {
      id: 'thuongqua',
      name: 'Thưởng/Quà',
      icon: <Icons.Award className="w-4 h-4 text-indigo-500" />,
      sub: [
        { name: "Thưởng", icon: "🏆" },
        { name: "Được tặng", icon: "🎁" },
        { name: "Trúng thưởng", icon: "🎟️" }
      ],
    },
    {
      id: 'khac',
      name: 'Khác',
      icon: <Icons.HelpCircle className="w-4 h-4 text-stone-500" />,
      sub: [
        { name: "Thu hồi nợ", icon: "🤝" },
        { name: "Bán đồ cũ", icon: "📦" }
      ],
    },
  ]);

  // Handle local Jars slider changes
  const handleJarChange = (key, val) => {
    const parsedVal = parseInt(val) || 0;
    setJars(prev => ({ ...prev, [key]: parsedVal }));
  };

  // Sum of jars percentage
  const totalJarsPercentage = Object.values(jars).reduce((sum, v) => sum + v, 0);

  // Sync props when they change
  useEffect(() => {
    setJars({ ...jarsAllocation });
  }, [jarsAllocation]);

  useEffect(() => {
    setGoals([...savingsGoals]);
  }, [savingsGoals]);

  useEffect(() => {
    setLimits([...categoryLimits]);
  }, [categoryLimits]);

  // Handle Save
  const handleSaveSettings = () => {
    triggerHaptic('success');
    
    if (totalJarsPercentage !== 100) {
      alert(`Cảnh báo: Tổng tỷ lệ phân bổ 6 hũ đang là ${totalJarsPercentage}%. Vui lòng điều chỉnh để tổng đạt đúng 100%!`);
      return;
    }

    onUpdateJars(jars);
    onUpdateLimits(limits);
    onUpdateGoals(goals);
    
    alert('Đã lưu cấu hình cài đặt tài chính thành công!');
  };

  // Accordion Toggle
  const toggleAccordion = (id) => {
    triggerHaptic('light');
    setExpandedAccordion(expandedAccordion === id ? null : id);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Tab Switcher */}
      <div className="bg-stone-100 dark:bg-stone-900/60 p-1.5 rounded-[1.25rem] grid grid-cols-2 gap-1">
        <button
          onClick={() => { triggerHaptic('light'); setActiveSubTab('categories'); }}
          className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeSubTab === 'categories' 
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          Cài đặt danh mục
        </button>
        <button
          onClick={() => { triggerHaptic('light'); setActiveSubTab('finance'); }}
          className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
            activeSubTab === 'finance' 
              ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm' 
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700'
          }`}
        >
          Cài đặt tài chính
        </button>
      </div>

      {/* --- SUBTAB A: CATEGORY CONFIGURATION (Screenshot 4 - Left Side) --- */}
      {activeSubTab === 'categories' && (
        <div className="space-y-4 animate-fade-in">
          {/* Category Type toggle (Chi tiêu/Thu nhập) */}
          <div className="bg-stone-100 dark:bg-stone-900/40 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => { triggerHaptic('light'); setCategoryType('expense'); }}
              className={`flex-grow py-1.5 text-xs font-bold rounded-lg transition-all ${
                categoryType === 'expense' 
                  ? 'bg-[#111827] dark:bg-stone-800 text-white' 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              Chi tiêu
            </button>
            <button
              onClick={() => { triggerHaptic('light'); setCategoryType('income'); }}
              className={`flex-grow py-1.5 text-xs font-bold rounded-lg transition-all ${
                categoryType === 'income' 
                  ? 'bg-[#111827] dark:bg-stone-800 text-white' 
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800'
              }`}
            >
              Thu nhập
            </button>
          </div>

          {/* Info Banner */}
          <div className="bg-amber-500/5 dark:bg-amber-500/5 border border-amber-500/10 p-3 rounded-2xl flex gap-2.5 items-start">
            <Icons.Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-stone-700 dark:text-amber-300 leading-relaxed font-semibold">
              Danh mục cấp 1 là cố định để đảm bảo báo cáo chính xác. Bạn có thể tự tùy chỉnh các danh mục cấp 2.
            </p>
          </div>

          {/* Accordion Categories List */}
          <div className="space-y-3">
            {(categoryType === 'expense' ? expenseCategories : incomeCategories).map(cat => {
              const isExpanded = expandedAccordion === cat.id;
              return (
                <div 
                  key={cat.id} 
                  className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-2xl overflow-hidden shadow-sm"
                >
                  {/* Header */}
                  <button
                    onClick={() => toggleAccordion(cat.id)}
                    className="w-full p-4.5 flex justify-between items-center text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-stone-50 dark:bg-stone-800 flex items-center justify-center">
                        {cat.icon}
                      </div>
                      <div>
                        <span className="text-xs font-extrabold text-[#111827] dark:text-white block">{cat.name}</span>
                        <span className="text-[9px] text-stone-500 dark:text-stone-400 font-bold block mt-0.5">
                          {cat.sub.length} danh mục con
                        </span>
                      </div>
                    </div>
                    <Icons.ChevronRight className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`} />
                  </button>

                  {/* Body Expanded */}
                  {isExpanded && (
                    <div className="px-4.5 pb-4 border-t border-stone-100 dark:border-stone-800/40 pt-3 space-y-3 bg-stone-50/20 dark:bg-stone-900/10">
                      {cat.sub.map((subCat, i) => (
                        <div key={i} className="flex justify-between items-center bg-white dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800/20 p-2.5 rounded-xl text-xs font-semibold text-stone-800 dark:text-stone-200">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{subCat.icon || "📁"}</span>
                            <span>{subCat.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-stone-400 dark:text-stone-500">
                            <button className="hover:text-indigo-500 p-1"><Icons.Edit2 className="w-3.5 h-3.5" /></button>
                            <button className="hover:text-rose-500 p-1"><Icons.Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}

                      {/* Add new subcategory button */}
                      <button 
                        onClick={() => { triggerHaptic('light'); alert('Vui lòng nhập tên danh mục mới trên thanh chat bot.'); }}
                        className="w-full py-2.5 border border-dashed border-stone-200 dark:border-stone-800 hover:border-stone-400 text-stone-500 dark:text-stone-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1 bg-white dark:bg-stone-900/40"
                      >
                        <Icons.Plus className="w-4 h-4" />
                        <span>Thêm mới danh mục con</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- SUBTAB B: FINANCIAL/BUDGETING CONFIGURATION (Screenshot 4 - Right Side) --- */}
      {activeSubTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          {/* Subtitle */}
          <div className="text-left">
            <h3 className="text-sm font-black text-[#111827] dark:text-white uppercase tracking-wider">Cài đặt tài chính</h3>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 font-bold uppercase tracking-wide">Quản lý mục tiêu và phân bổ ngân sách</span>
          </div>

          {/* Section 1: Savings Targets list with sliders */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black text-[#111827] dark:text-white uppercase tracking-wider">Quỹ tiết kiệm</h4>
              <button 
                onClick={() => { triggerHaptic('light'); alert('Chức năng thêm quỹ sẽ ra mắt trong bản cập nhật kế tiếp.'); }}
                className="text-[10px] font-bold text-white dark:text-stone-950 bg-stone-950 dark:bg-slate-100 px-2 py-1 rounded-lg hover:scale-105"
              >
                + Thêm
              </button>
            </div>

            <div className="space-y-4">
              {goals.map((goal, idx) => {
                const pct = Math.round((goal.current / goal.target) * 100);
                return (
                  <div key={goal.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-extrabold text-[#111827] dark:text-white">{goal.name}</span>
                      <span className="font-bold text-stone-500 dark:text-stone-400">{pct}%</span>
                    </div>
                    {/* Goal detail values */}
                    <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-bold">
                      <span>Đã có: {formatVND(goal.current)}</span>
                      <span>Còn: {formatVND(goal.target - goal.current)}</span>
                    </div>
                    {/* Slider input */}
                    <input 
                      type="range"
                      min="0"
                      max={goal.target}
                      step="500000"
                      value={goal.current}
                      onChange={(e) => {
                        const updated = [...goals];
                        updated[idx].current = parseFloat(e.target.value);
                        setGoals(updated);
                      }}
                      className="w-full accent-[#111827] dark:accent-stone-100 h-1 rounded-full cursor-pointer bg-stone-100 dark:bg-stone-800"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Spending Limits */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black text-[#111827] dark:text-white uppercase tracking-wider">Hạn mức chi tiêu</h4>
              <button 
                onClick={() => {
                  triggerHaptic('light');
                  const name = prompt("Nhập tên danh mục muốn đặt hạn mức (ví dụ: Mua sắm, Ăn uống, Tiệc tùng):");
                  if (!name) return;
                  const targetInput = prompt(`Nhập số tiền hạn mức tối đa cho "${name}" (đơn vị: VNĐ):`);
                  if (!targetInput) return;
                  
                  const cleaned = targetInput.replace(/[^0-9]/g, '');
                  const target = parseFloat(cleaned);
                  
                  if (isNaN(target) || target <= 0) {
                    alert("Số tiền hạn mức không hợp lệ!");
                    return;
                  }
                  
                  if (onAddCategoryLimit) {
                    onAddCategoryLimit({ name, current: 0, target });
                  }
                }}
                className="text-[10px] font-bold text-white dark:text-stone-950 bg-stone-950 dark:bg-stone-100 px-2 py-1 rounded-lg hover:scale-105"
              >
                + Thêm hạn mức
              </button>
            </div>

            <div className="space-y-4">
              {limits.map((limit, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#111827] dark:text-white">{limit.name}</span>
                    <input 
                      type="text" 
                      value={limit.target}
                      onChange={(e) => {
                        const updated = [...limits];
                        updated[idx].target = parseFloat(e.target.value) || 0;
                        setLimits(updated);
                      }}
                      className="w-24 text-right bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700/60 rounded px-1.5 py-0.5 text-xs text-[#111827] dark:text-stone-200 font-extrabold"
                    />
                  </div>
                  {/* Detailed remaining stats */}
                  <div className="flex justify-between text-[10px] text-stone-400 dark:text-stone-500 font-bold">
                    <span>Đã dùng: {formatVND(limit.current)}</span>
                    <span>Còn: {formatVND(Math.max(limit.target - limit.current, 0))}</span>
                  </div>
                  {/* Slider indicator style */}
                  <input 
                    type="range"
                    min="0"
                    max="10000000"
                    step="200000"
                    value={limit.target}
                    onChange={(e) => {
                      const updated = [...limits];
                      updated[idx].target = parseFloat(e.target.value);
                      setLimits(updated);
                    }}
                    className="w-full accent-[#111827] dark:accent-stone-100 h-1 rounded-full cursor-pointer bg-stone-100 dark:bg-stone-800"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: 6 Jars Sliders distribution */}
          <div className="bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800/40 rounded-3xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-xs font-black text-[#111827] dark:text-white uppercase tracking-wider">Phân bổ 6 hũ</h4>
              <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                totalJarsPercentage === 100 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                Tổng: {totalJarsPercentage}%
              </span>
            </div>

            {/* Sliders list matching Jars model */}
            <div className="space-y-4">
              {[
                { key: 'nec', label: 'NEC (Cần thiết)', colorClass: 'accent-[#111827] dark:accent-stone-300' },
                { key: 'edu', label: 'EDU (Giáo dục)', colorClass: 'accent-emerald-600' },
                { key: 'play', label: 'PLAY (Hưởng thụ)', colorClass: 'accent-amber-500' },
                { key: 'ffa', label: 'FFA (Tự do tài chính)', colorClass: 'accent-amber-700' },
                { key: 'give', label: 'GIVE (Cho đi)', colorClass: 'accent-rose-500' },
                { key: 'ltss', label: 'LTSS (Tiết kiệm dài hạn)', colorClass: 'accent-stone-500' },
              ].map(jarSpec => (
                <div key={jarSpec.key} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-stone-800 dark:text-stone-300">{jarSpec.label}</span>
                    <span className="font-extrabold text-[#111827] dark:text-white">{jars[jarSpec.key]}%</span>
                  </div>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={jars[jarSpec.key]}
                    onChange={(e) => handleJarChange(jarSpec.key, e.target.value)}
                    className={`w-full ${jarSpec.colorClass} h-1 rounded-full cursor-pointer bg-stone-100 dark:bg-stone-800`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Action Save Button */}
          <button
            onClick={handleSaveSettings}
            className="w-full py-3.5 bg-[#111827] dark:bg-stone-100 text-white dark:text-[#111827] rounded-2xl text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95 uppercase tracking-widest pt-4"
          >
            Lưu cài đặt
          </button>
        </div>
      )}
    </div>
  );
}
