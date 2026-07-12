import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safe localStorage Polyfill for iOS Safari iframe restrictions
try {
  const testKey = '__storage_test__';
  window.localStorage.setItem(testKey, testKey);
  window.localStorage.removeItem(testKey);
} catch (e) {
  console.warn("localStorage is not accessible (common on iOS Safari private/iframe). Implementing safe memory-based fallback.", e);
  const memoryStore: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => (key in memoryStore ? memoryStore[key] : null),
    setItem: (key: string, value: string) => { memoryStore[key] = String(value); },
    removeItem: (key: string) => { delete memoryStore[key]; },
    clear: () => { for (const key in memoryStore) delete memoryStore[key]; },
    key: (index: number) => Object.keys(memoryStore)[index] || null,
    get length() { return Object.keys(memoryStore).length; }
  };
  try {
    Object.defineProperty(window, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true
    });
  } catch (err) {
    console.error("Failed to redefine window.localStorage", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

