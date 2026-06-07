import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

// Register Chart.js components
Chart.register(...registerables);

// Helper function to darken hex colors for 3D depth/shadow
function darkenColor(hex, percent) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return hex;
  let num = parseInt(hex.slice(1), 16),
      amt = Math.round(2.55 * percent * 100),
      R = (num >> 16) - amt,
      G = (num >> 8 & 0x00FF) - amt,
      B = (num & 0x0000FF) - amt;
  return '#' + (0x1000000 + (R < 0 ? 0 : R > 255 ? 255 : R) * 0x10000 + (G < 0 ? 0 : G > 255 ? 255 : G) * 0x100 + (B < 0 ? 0 : B > 255 ? 255 : B)).toString(16).slice(1);
}

/**
 * Donut Chart Component (Pie Chart with simulated 3D view using Chart.js v4)
 * @param {Array} data - Array of { label, value }
 * @param {string} currencySymbol - Optional currency symbol
 */
export function DonutChart({ data = [], currencySymbol = 'đ', totalLabel = 'Tổng chi' }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipState, setTooltipState] = useState({
    visible: false,
    x: 0,
    y: 0,
    label: '',
    value: 0,
    percentage: 0,
    color: ''
  });

  // Filter out zero values and sort
  const chartData = data.filter(item => item.value > 0);
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Destroy existing chart instance
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    if (total === 0) return;

    const colors = [
      '#111827', // Dark Charcoal (Primary)
      '#15803d', // Forest Green (Warm success)
      '#b45309', // Warm Amber (Tertiary step)
      '#b91c1c', // Brick Red (Warm danger)
      '#75777F', // Medium Slate (Secondary)
      '#a16207', // Gold/ochre
      '#7c2d12', // Terracotta
      '#787778', // Neutral Gray
    ];

    const labels = chartData.map(item => item.label);
    const values = chartData.map(item => item.value);
    const bgColors = chartData.map((_, i) => colors[i % colors.length]);

    const ctx = canvasRef.current.getContext('2d');

    // Custom Chart.js plugin to draw 3D thickness (extrusion wall)
    const thicknessPlugin = {
      id: 'thickness',
      beforeDatasetsDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || meta.data.length === 0) return;

        ctx.save();
        const thickness = 10; // Draw 10 layers for a visible cylinder wall thickness

        // Draw from bottom to top to build the wall
        for (let i = thickness; i > 0; i--) {
          ctx.save();
          ctx.translate(0, i);

          meta.data.forEach((element) => {
            const originalColor = element.options.backgroundColor;
            const originalBorderColor = element.options.borderColor;
            const originalBorderWidth = element.options.borderWidth;

            // Make the extrusion wall darker than the top surface
            element.options.backgroundColor = darkenColor(originalColor, 0.22);
            element.options.borderColor = 'transparent';
            element.options.borderWidth = 0; // Completely remove white/gray borders

            element.draw(ctx);

            // Restore original element styles
            element.options.backgroundColor = originalColor;
            element.options.borderColor = originalBorderColor;
            element.options.borderWidth = originalBorderWidth;
          });

          ctx.restore();
        }

        ctx.restore();
      }
    };

    // Custom Chart.js plugin to draw connector/leader lines
    const connectorLinesPlugin = {
      id: 'connectorLines',
      afterDraw(chart) {
        const { ctx } = chart;
        const meta = chart.getDatasetMeta(0);
        if (!meta.data || meta.data.length === 0) return;

        ctx.save();
        const isDark = document.documentElement.classList.contains('dark');

        meta.data.forEach((element, index) => {
          const { x, y, outerRadius, startAngle, endAngle } = element;
          const midAngle = (startAngle + endAngle) / 2;
          const color = element.options.backgroundColor;

          // Starting point (on the boundary of the slice)
          const startX = x + Math.cos(midAngle) * outerRadius;
          const startY = y + Math.sin(midAngle) * outerRadius;

          // Ending point (outside the slice)
          const lineLength = 16;
          const endX = x + Math.cos(midAngle) * (outerRadius + lineLength);
          const endY = y + Math.sin(midAngle) * (outerRadius + lineLength);

          // Horizontal shoulder line
          const shoulderLength = 8;
          const isRightSide = Math.cos(midAngle) > 0;
          const shoulderX = endX + (isRightSide ? shoulderLength : -shoulderLength);

          // Draw the connector lines
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineTo(shoulderX, endY);
          ctx.strokeStyle = color || (isDark ? '#4b5563' : '#9ca3af');
          ctx.lineWidth = 1.2;
          ctx.stroke();
        });

        ctx.restore();
      }
    };

    const config = {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: bgColors,
          borderWidth: 0, // Set to 0 to completely remove border lines
          hoverBorderWidth: 0,
          hoverOffset: 12,
        }]
      },
      plugins: [ChartDataLabels, thicknessPlugin, connectorLinesPlugin],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: 30 // Make sure there's enough space around the chart so lines and labels aren't clipped
        },
        plugins: {
          legend: {
            display: false // We render our custom HTML 2-column flexbox legend below the chart
          },
          tooltip: {
            enabled: false // Disable standard canvas-drawn tooltips to prevent tilted text boxes
          },
          datalabels: {
            anchor: 'end',
            align: (context) => {
              const meta = context.chart.getDatasetMeta(context.datasetIndex);
              const element = meta.data[context.dataIndex];
              if (!element) return 'end';
              const midAngle = (element.startAngle + element.endAngle) / 2;
              return Math.cos(midAngle) > 0 ? 'right' : 'left';
            },
            offset: 22, // Pushes text beyond the end of the line
            formatter: (value) => {
              if (total === 0) return '0%';
              return ((value / total) * 100).toFixed(1) + '%';
            },
            color: () => {
              const isDark = document.documentElement.classList.contains('dark');
              return isDark ? '#d1d5db' : '#4b5563';
            },
            font: {
              weight: 'bold',
              size: 10,
              family: 'Outfit, Inter, sans-serif'
            }
          }
        },
        onHover: (event, activeElements, chart) => {
          if (activeElements && activeElements.length > 0) {
            const index = activeElements[0].index;
            setHoveredIndex(index);

            // Calculate exact position of cursor relative to canvas parent
            const rect = chart.canvas.getBoundingClientRect();
            const parentRect = chart.canvas.parentElement.parentElement.getBoundingClientRect();
            const x = event.x + (rect.left - parentRect.left);
            const y = event.y + (rect.top - parentRect.top) - 15;

            const label = labels[index];
            const value = values[index];
            const percentage = value / total;
            const color = bgColors[index];

            setTooltipState({
              visible: true,
              x,
              y,
              label,
              value,
              percentage,
              color
            });
          } else {
            setHoveredIndex(null);
            setTooltipState(prev => ({ ...prev, visible: false }));
          }
        }
      }
    };

    chartRef.current = new Chart(ctx, config);

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, total]);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-stone-500 dark:text-stone-400 text-sm">
        <p>Không có dữ liệu chi tiêu trong kỳ này</p>
      </div>
    );
  }

  // Define colors again to build custom legend
  const colors = [
    '#111827',
    '#15803d',
    '#b45309',
    '#b91c1c',
    '#75777F',
    '#a16207',
    '#7c2d12',
    '#787778',
  ];

  const slices = chartData.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    percentage: item.value / total,
  }));

  return (
    <div 
      className="w-full flex flex-col items-center select-none"
      style={{
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        backgroundColor: 'var(--card-bg, transparent)'
      }}
    >
      {/* 3D Tilted Chart Canvas Container */}
      <div 
        className="relative w-full max-w-[280px] h-[190px] flex items-center justify-center overflow-visible"
        style={{ perspective: '400px' }}
      >
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{ 
            transform: 'rotateX(36deg)',
            transformStyle: 'preserve-3d',
            filter: 'drop-shadow(0px 8px 12px rgba(0, 0, 0, 0.12))'
          }}
        >
          <canvas ref={canvasRef} />
        </div>

        {/* 2D Flat Tooltip (Chính diện, 2D phẳng, absolute-positioned) */}
        {tooltipState.visible && (
          <div 
            className="absolute z-30 pointer-events-none transition-all duration-75 ease-out"
            style={{ 
              left: `${tooltipState.x}px`, 
              top: `${tooltipState.y}px`,
              transform: 'translate(-50%, -100%)' // Center horizontally and display above point
            }}
          >
            <div className="bg-white dark:bg-stone-900 border border-stone-200/85 dark:border-stone-800 shadow-xl px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 min-w-[125px]">
              <span className="font-extrabold text-stone-500 uppercase tracking-wider text-[9px] block">
                {tooltipState.label}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: tooltipState.color }} />
                <span className="text-stone-850 dark:text-stone-300 font-bold text-[11px] whitespace-nowrap">
                  {tooltipState.value.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <span className="text-[10px] text-stone-450 dark:text-stone-500 font-bold block mt-0.5">
                Tỷ lệ: {(tooltipState.percentage * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Legend below the chart layout - 2-column flexbox list */}
      <div className="flex flex-wrap w-full mt-4 -mx-1">
        {slices.map((slice, index) => (
          <div key={index} className="w-1/2 p-1">
            <button
              onClick={() => {
                const isCurrentlySelected = hoveredIndex === index;
                setHoveredIndex(isCurrentlySelected ? null : index);
                
                if (chartRef.current) {
                  const chart = chartRef.current;
                  const activeElements = isCurrentlySelected ? [] : [{ datasetIndex: 0, index }];
                  chart.setActiveElements(activeElements);
                  chart.update();
                }

                if (isCurrentlySelected) {
                  setTooltipState(prev => ({ ...prev, visible: false }));
                } else if (chartRef.current) {
                  const chart = chartRef.current;
                  const meta = chart.getDatasetMeta(0);
                  const element = meta.data[index];
                  if (element) {
                    const rect = chart.canvas.getBoundingClientRect();
                    const parentRect = chart.canvas.parentElement.parentElement.getBoundingClientRect();
                    
                    const midAngle = (element.startAngle + element.endAngle) / 2;
                    const distance = element.outerRadius * 0.7;
                    const sliceX = element.x + Math.cos(midAngle) * distance;
                    const sliceY = element.y + Math.sin(midAngle) * distance;
                    
                    const x = sliceX + (rect.left - parentRect.left);
                    const y = sliceY + (rect.top - parentRect.top) - 15;

                    setTooltipState({
                      visible: true,
                      x,
                      y,
                      label: slice.label,
                      value: slice.value,
                      percentage: slice.percentage,
                      color: slice.color
                    });
                  }
                }
              }}
              onMouseEnter={() => {
                setHoveredIndex(index);
                if (chartRef.current) {
                  const chart = chartRef.current;
                  const meta = chart.getDatasetMeta(0);
                  const element = meta.data[index];
                  chart.setActiveElements([{ datasetIndex: 0, index }]);
                  chart.update();

                  if (element) {
                    const rect = chart.canvas.getBoundingClientRect();
                    const parentRect = chart.canvas.parentElement.parentElement.getBoundingClientRect();
                    
                    const midAngle = (element.startAngle + element.endAngle) / 2;
                    const distance = element.outerRadius * 0.7;
                    const sliceX = element.x + Math.cos(midAngle) * distance;
                    const sliceY = element.y + Math.sin(midAngle) * distance;
                    
                    const x = sliceX + (rect.left - parentRect.left);
                    const y = sliceY + (rect.top - parentRect.top) - 15;

                    setTooltipState({
                      visible: true,
                      x,
                      y,
                      label: slice.label,
                      value: slice.value,
                      percentage: slice.percentage,
                      color: slice.color
                    });
                  }
                }
              }}
              onMouseLeave={() => {
                setHoveredIndex(null);
                setTooltipState(prev => ({ ...prev, visible: false }));
                if (chartRef.current) {
                  const chart = chartRef.current;
                  chart.setActiveElements([]);
                  chart.update();
                }
              }}
              className={`flex items-center justify-between text-left px-2.5 py-1.5 rounded-xl transition-all w-full border ${
                hoveredIndex === index 
                  ? 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-750 shadow-sm' 
                  : 'hover:bg-stone-55 dark:hover:bg-stone-800/30 border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-[11px] text-stone-850 dark:text-stone-300 font-bold truncate">
                  {slice.label}
                </span>
              </div>
              <span className="text-[11px] text-stone-550 dark:text-stone-450 font-black ml-2">
                {(slice.percentage * 100).toFixed(1)}%
              </span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Interactive Area Trend Chart with optional Comparison Line
 * @param {Array} currentData - Array of { date, value }
 * @param {Array} previousData - Optional array of { date, value } for comparison
 * @param {string} currencySymbol - Optional currency symbol
 */
export function AreaChart({ currentData = [], previousData = [], currencySymbol = 'đ' }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (currentData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-500 dark:text-stone-400 text-sm">
        <p>Không có dữ liệu xu hướng</p>
      </div>
    );
  }

  // Dimension settings
  const width = 500;
  const height = 180;
  const paddingLeft = 45;
  const paddingRight = 15;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Max value to scale Y axis
  const allValues = [
    ...currentData.map(d => d.value),
    ...previousData.map(d => d.value || 0)
  ];
  const maxValue = Math.max(...allValues, 10000); // minimum scale

  // Compute X and Y coords
  const getCoords = (data, index, totalPoints) => {
    const x = paddingLeft + (index / (totalPoints - 1)) * chartWidth;
    // Invert Y because SVG coordinates starts from top-left (0,0)
    const y = paddingTop + chartHeight - (data.value / maxValue) * chartHeight;
    return { x, y };
  };

  // Generate SVG Path for current data
  const currentPoints = currentData.map((d, i) => getCoords(d, i, currentData.length));
  
  let currentLinePath = '';
  let currentAreaPath = '';

  if (currentPoints.length > 0) {
    currentLinePath = `M ${currentPoints[0].x} ${currentPoints[0].y} ` +
      currentPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

    currentAreaPath = `${currentLinePath} L ${currentPoints[currentPoints.length - 1].x} ${paddingTop + chartHeight} L ${currentPoints[0].x} ${paddingTop + chartHeight} Z`;
  }

  // Generate SVG Path for previous data (comparison baseline)
  const previousPoints = previousData.length > 0 
    ? previousData.map((d, i) => getCoords(d, i, previousData.length)) 
    : [];

  let previousLinePath = '';
  if (previousPoints.length > 0) {
    previousLinePath = `M ${previousPoints[0].x} ${previousPoints[0].y} ` +
      previousPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
  }

  // Handle pointer interactions to trigger Tooltip details
  const handleMouseMove = (e) => {
    const svgRect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX - svgRect.left;
    
    // Convert clientX to chart coordinates relative to viewBox width (500)
    const relativeX = (clientX / svgRect.width) * width;
    
    // Find closest index
    let closestIndex = 0;
    let minDiff = Infinity;

    currentPoints.forEach((point, index) => {
      const diff = Math.abs(point.x - relativeX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = index;
      }
    });

    if (closestIndex >= 0 && closestIndex < currentData.length) {
      setHoveredPoint({
        index: closestIndex,
        current: currentData[closestIndex],
        previous: previousData[closestIndex] || null,
        coords: currentPoints[closestIndex],
      });
    }
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Generate Y axis grids
  const gridTicks = [0, 0.5, 1];

  return (
    <div className="relative w-full">
      <div 
        className="w-full h-48 overflow-hidden select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={(e) => {
          if (e.touches.length > 0) {
            handleMouseMove(e.touches[0]);
          }
        }}
        onTouchEnd={handleMouseLeave}
      >
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full"
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.1" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridTicks.map((tick, i) => {
            const y = paddingTop + chartHeight - tick * chartHeight;
            const valueLabel = Math.round(tick * maxValue);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  className="stroke-stone-200 dark:stroke-stone-800"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  className="font-medium fill-stone-500 dark:fill-stone-400"
                  fontSize="9"
                  textAnchor="end"
                >
                  {valueLabel >= 1000000 
                    ? `${(valueLabel / 1000000).toFixed(1)}M` 
                    : valueLabel >= 1000 
                      ? `${(valueLabel / 1000).toFixed(0)}k` 
                      : valueLabel}
                </text>
              </g>
            );
          })}

          {/* Previous period line (baseline comparison) */}
          {previousLinePath && (
            <path
              d={previousLinePath}
              fill="none"
              className="stroke-stone-400/50 dark:stroke-stone-700/60 transition-all duration-300"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
          )}

          {/* Current period area and line */}
          {currentAreaPath && (
            <path
              d={currentAreaPath}
              fill="url(#areaGrad)"
            />
          )}

          {currentLinePath && (
            <path
              d={currentLinePath}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          )}

          {/* Interactive vertical cursor line */}
          {hoveredPoint && (
            <line
              x1={hoveredPoint.coords.x}
              y1={paddingTop}
              x2={hoveredPoint.coords.x}
              y2={paddingTop + chartHeight}
              className="stroke-stone-400 dark:stroke-stone-600"
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />
          )}

          {/* Glowing circle at hover intersection */}
          {hoveredPoint && (
            <>
              <circle
                cx={hoveredPoint.coords.x}
                cy={hoveredPoint.coords.y}
                r="6"
                fill="currentColor"
                className="stroke-white dark:stroke-stone-950 glow-primary"
                strokeWidth="2"
              />
              {hoveredPoint.previous && previousPoints[hoveredPoint.index] && (
                <circle
                  cx={hoveredPoint.coords.x}
                  cy={previousPoints[hoveredPoint.index].y}
                  r="4.5"
                  className="fill-stone-400 dark:fill-stone-500 stroke-white dark:stroke-stone-950"
                  strokeWidth="1.5"
                />
              )}
            </>
          )}

          {/* X Axis Labels */}
          {currentData.map((d, i) => {
            // Label only first, middle, last points to prevent overlapping
            const showLabel = i === 0 || i === Math.floor(currentData.length / 2) || i === currentData.length - 1;
            if (!showLabel) return null;
            const p = currentPoints[i];
            return (
              <text
                key={i}
                x={p.x}
                y={height - 8}
                className="font-medium fill-stone-500 dark:fill-stone-400"
                fontSize="9"
                textAnchor="middle"
              >
                {d.date}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Floating Info Box (Tooltip) below chart for better mobile usability */}
      <div className="mt-2 text-center h-12 flex items-center justify-center">
        {hoveredPoint ? (
          <div className="glass-panel-light px-3 py-1.5 rounded-xl flex items-center gap-4 text-xs max-w-sm animate-fade-in border border-stone-200/50 dark:border-stone-800/30">
            <div>
              <span className="text-stone-500 dark:text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Thời gian</span>
              <span className="text-stone-800 dark:text-white font-semibold">{hoveredPoint.current.date}</span>
            </div>
            <div className="h-6 w-px bg-stone-200 dark:bg-stone-850" />
            <div>
              <span className="text-indigo-600 dark:text-indigo-400 block text-[9px] uppercase font-bold tracking-wider">Kỳ này</span>
              <span className="text-stone-800 dark:text-white font-extrabold">{hoveredPoint.current.value.toLocaleString('vi-VN')}{currencySymbol}</span>
            </div>
            {hoveredPoint.previous && (
              <>
                <div className="h-6 w-px bg-stone-200 dark:bg-stone-850" />
                <div>
                  <span className="text-stone-500 dark:text-stone-400 block text-[9px] uppercase font-bold tracking-wider">Kỳ trước</span>
                  <span className="text-stone-700 dark:text-stone-305 font-semibold">{hoveredPoint.previous.value.toLocaleString('vi-VN')}{currencySymbol}</span>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
            {previousData.length > 0 
              ? '💡 Vuốt/di chuột lên biểu đồ để so sánh chi tiết kỳ này (—) & kỳ trước (---)'
              : '💡 Vuốt/di chuột lên biểu đồ để xem chi tiết số liệu từng ngày'}
          </p>
        )}
      </div>
    </div>
  );
}
