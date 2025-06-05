import { createContext, useContext, useState, useCallback } from 'react';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const setCacheData = useCallback((key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []); // Empty dependency array means this function is created once

  const getCacheData = useCallback((key, maxAge = 30 * 60 * 1000) => { // 30 minutes default to match username cookie
    const cached = cache[key];
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      // Remove expired cache - Note: this might cause a re-render
      // Consider a separate mechanism for cleanup if this is an issue
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return null;
    }
    
    return cached.data;
  }, [cache]); // Depends on cache state

  const clearCache = useCallback((key) => {
    if (key) {
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setCache({});
    }
  }, []); // Empty dependency array means this function is created once

  return (
    <CacheContext.Provider value={{ setCacheData, getCacheData, clearCache }}>
      {children}
    </CacheContext.Provider>
  );
};

export const useCache = () => {
  const context = useContext(CacheContext);
  if (!context) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
}; 