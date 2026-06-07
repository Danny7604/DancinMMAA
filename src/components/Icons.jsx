import React from 'react';

// Wrapper to standardize icon sizes and classes
const IconWrapper = ({ children, className = 'w-5 h-5', ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {children}
  </svg>
);

export const Wallet = (props) => (
  <IconWrapper {...props}>
    <path d="M19 7V11" />
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M21 12H17C15.8954 12 15 12.8954 15 14C15 15.1046 15.8954 16 17 16H21" />
  </IconWrapper>
);

export const TrendingUp = (props) => (
  <IconWrapper {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </IconWrapper>
);

export const TrendingDown = (props) => (
  <IconWrapper {...props}>
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </IconWrapper>
);

export const Calendar = (props) => (
  <IconWrapper {...props}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </IconWrapper>
);

export const Filter = (props) => (
  <IconWrapper {...props}>
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </IconWrapper>
);

export const Search = (props) => (
  <IconWrapper {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </IconWrapper>
);

export const ArrowUpRight = (props) => (
  <IconWrapper {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </IconWrapper>
);

export const ArrowDownLeft = (props) => (
  <IconWrapper {...props}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </IconWrapper>
);

export const X = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </IconWrapper>
);

export const ChevronRight = (props) => (
  <IconWrapper {...props}>
    <polyline points="9 18 15 12 9 6" />
  </IconWrapper>
);

export const ChevronLeft = (props) => (
  <IconWrapper {...props}>
    <polyline points="15 18 9 12 15 6" />
  </IconWrapper>
);

export const Settings = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </IconWrapper>
);

export const RefreshCw = (props) => (
  <IconWrapper {...props}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </IconWrapper>
);

export const Sliders = (props) => (
  <IconWrapper {...props}>
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </IconWrapper>
);

export const BarChart2 = (props) => (
  <IconWrapper {...props}>
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </IconWrapper>
);

export const Info = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </IconWrapper>
);

export const MessageSquare = (props) => (
  <IconWrapper {...props}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </IconWrapper>
);

export const Plus = (props) => (
  <IconWrapper {...props}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </IconWrapper>
);

export const Sun = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </IconWrapper>
);

export const Moon = (props) => (
  <IconWrapper {...props}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </IconWrapper>
);

export const GraduationCap = (props) => (
  <IconWrapper {...props}>
    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
    <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
  </IconWrapper>
);

export const Utensils = (props) => (
  <IconWrapper {...props}>
    <path d="M3 3v7a4 4 0 0 0 3 3h1v8h2v-8h1a4 4 0 0 0 3-3V3M8 3v4M5 3v4M12 3v4M18 8V3a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4h-1v10h-2V12h-1M15 3v5" />
  </IconWrapper>
);

export const Car = (props) => (
  <IconWrapper {...props}>
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" />
    <path d="M9 17h6" />
    <circle cx="17" cy="17" r="2" />
  </IconWrapper>
);

export const ShoppingBag = (props) => (
  <IconWrapper {...props}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
  </IconWrapper>
);

export const Target = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </IconWrapper>
);

export const Edit2 = (props) => (
  <IconWrapper {...props}>
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </IconWrapper>
);

export const Trash2 = (props) => (
  <IconWrapper {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
  </IconWrapper>
);

export const HelpCircle = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
  </IconWrapper>
);

export const Award = (props) => (
  <IconWrapper {...props}>
    <circle cx="12" cy="8" r="7" />
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
  </IconWrapper>
);

export const Sparkles = (props) => (
  <IconWrapper {...props}>
    <path d="M9.963 8.078a.856.856 0 0 0-1.884 0l-.678 1.956a1.711 1.711 0 0 1-1.047 1.048l-1.956.677a.856.856 0 0 0 0 1.884l1.956.678a1.711 1.711 0 0 1 1.047 1.047l.678 1.956a.856.856 0 0 0 1.884 0l.678-1.956a1.711 1.711 0 0 1 1.047-1.047l1.956-.678a.856.856 0 0 0 0-1.884l-1.956-.678a1.711 1.711 0 0 1-1.047-1.047l-.678-1.956zM19 1l-.5 1.5L17 3l1.5.5L19 5l.5-1.5L21 3l-1.5-.5L19 1zm0 18l-.5 1.5-1.5.5 1.5.5.5 1.5.5-1.5 1.5-.5-1.5-.5-.5-1.5z" />
  </IconWrapper>
);

export const Home = (props) => (
  <IconWrapper {...props}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </IconWrapper>
);

export const PieChart = (props) => (
  <IconWrapper {...props}>
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83M22 12A10 10 0 0 0 12 2v10z" />
  </IconWrapper>
);

export const Heart = (props) => (
  <IconWrapper {...props}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </IconWrapper>
);

export const ShieldAlert = (props) => (
  <IconWrapper {...props}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM12 8v4M12 16h.01" />
  </IconWrapper>
);

export const ChevronDown = (props) => (
  <IconWrapper {...props}>
    <polyline points="6 9 12 15 18 9" />
  </IconWrapper>
);

export const Check = (props) => (
  <IconWrapper {...props}>
    <polyline points="20 6 9 17 4 12" />
  </IconWrapper>
);
