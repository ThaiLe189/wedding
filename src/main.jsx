import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './design/styles/index.css';

// Link mời dùng dạng /#to=...&with=... để crawler (Messenger, Zalo) coi mọi link là trang gốc
// và dùng chung preview đã cache. Chuyển sang query để phần còn lại của app đọc như cũ.
const hashParams = new URLSearchParams(window.location.hash.slice(1));
if (hashParams.has('to') || hashParams.has('with')) {
  window.history.replaceState(null, '', `${window.location.pathname}?${hashParams}`);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
