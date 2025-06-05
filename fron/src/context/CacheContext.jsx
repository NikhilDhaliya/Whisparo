import { createContext, useContext, useState } from 'react';

const CacheContext = createContext();

export const CacheProvider = ({ children }) => {
  const [cache, setCache] = useState({});

  const setCacheData = (key, data) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now()
      }
    }));
  };

  const getCacheData = (key, maxAge = 30 * 60 * 1000) => { // 30 minutes default to match username cookie
    const cached = cache[key];
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      // Remove expired cache
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
      return null;
    }
    
    return cached.data;
  };

  const clearCache = (key) => {
    if (key) {
      setCache(prev => {
        const { [key]: _, ...rest } = prev;
        return rest;
      });
    } else {
      setCache({});
    }
  };

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