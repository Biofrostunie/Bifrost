import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Apply persisted theme before React renders
(function applyPersistedTheme() {
  try {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = saved ? saved : (prefersDark ? 'dark' : 'light');
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {}
})();

createRoot(document.getElementById("root")!).render(<App />);
