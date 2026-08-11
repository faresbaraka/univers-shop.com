// Safe localStorage and sessionStorage wrapper to prevent SecurityErrors on iOS Safari (iframe / private browsing)
// and QuotaExceededError when browser storage is full.
class SafeStorageWrapper implements Storage {
  private fallbackStore: Record<string, string> = {};
  private isFallbackActive = false;

  constructor(private underlying: Storage | null) {
    this.isFallbackActive = !underlying;
  }

  get length(): number {
    if (this.isFallbackActive || !this.underlying) {
      return Object.keys(this.fallbackStore).length;
    }
    try {
      return this.underlying.length;
    } catch {
      return Object.keys(this.fallbackStore).length;
    }
  }

  clear(): void {
    this.fallbackStore = {};
    if (!this.isFallbackActive && this.underlying) {
      try {
        this.underlying.clear();
      } catch (e) {
        console.warn("Failed to clear underlying storage:", e);
      }
    }
  }

  getItem(key: string): string | null {
    if (this.isFallbackActive || !this.underlying) {
      return key in this.fallbackStore ? this.fallbackStore[key] : null;
    }
    try {
      const val = this.underlying.getItem(key);
      if (val !== null) return val;
      return key in this.fallbackStore ? this.fallbackStore[key] : null;
    } catch {
      return key in this.fallbackStore ? this.fallbackStore[key] : null;
    }
  }

  key(index: number): string | null {
    if (this.isFallbackActive || !this.underlying) {
      return Object.keys(this.fallbackStore)[index] || null;
    }
    try {
      return this.underlying.key(index);
    } catch {
      return Object.keys(this.fallbackStore)[index] || null;
    }
  }

  removeItem(key: string): void {
    delete this.fallbackStore[key];
    if (!this.isFallbackActive && this.underlying) {
      try {
        this.underlying.removeItem(key);
      } catch (e) {
        console.warn("Failed to remove item from underlying storage:", e);
      }
    }
  }

  setItem(key: string, value: string): void {
    const stringValue = String(value);
    // Always update fallback store to keep state coherent if we have to fall back
    this.fallbackStore[key] = stringValue;

    if (!this.isFallbackActive && this.underlying) {
      try {
        this.underlying.setItem(key, stringValue);
      } catch (e) {
        console.warn("Storage write failed. Activating in-memory fallback for writes. Error:", e);
        // Do not crash the app! Just keep writing to memory
        this.isFallbackActive = true;
      }
    }
  }
}

export const safeLocalStorage: Storage = (() => {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return new SafeStorageWrapper(window.localStorage);
  } catch (e) {
    console.warn("localStorage is not fully accessible. Falling back to safe MemoryStorage.", e);
    return new SafeStorageWrapper(null);
  }
})();

export const safeSessionStorage: Storage = (() => {
  try {
    const testKey = '__storage_test__';
    window.sessionStorage.setItem(testKey, testKey);
    window.sessionStorage.removeItem(testKey);
    return new SafeStorageWrapper(window.sessionStorage);
  } catch (e) {
    console.warn("sessionStorage is not fully accessible. Falling back to safe MemoryStorage.", e);
    return new SafeStorageWrapper(null);
  }
})();

