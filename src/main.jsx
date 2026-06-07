import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Phải có dòng này thì các style Tailwind mới được áp dụng
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);