import { createContext, useEffect, useState } from 'react';

import { readStorage, writeStorage } from '../utils/storage';

export const ThemeContext = createContext(null);

const THEME_STORAGE_KEY = 'cloudtask-pro-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => readStorage(THEME_STORAGE_KEY, 'light'));

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeStorage(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}
