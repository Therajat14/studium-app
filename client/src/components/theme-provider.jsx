import { createContext, useContext, useEffect, useState } from "react";

// Define the initial state structure for the context
const initialState = {
  theme: "system", // The current theme ('dark', 'light', or 'system')
  setTheme: () => null, // A function to update the theme
};

// Create the Context object
const ThemeProviderContext = createContext(initialState);

/**
 * Provides the theme state and functionality to the entire application.
 * It handles setting the 'light'/'dark' class on the document root (<html>)
 * and persists the selected theme in localStorage.
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}) {
  // 1. Initialize theme state
  const [theme, setTheme] = useState(
    // Get theme from local storage on load, or use defaultTheme
    () => localStorage.getItem(storageKey) || defaultTheme,
  );

  // 2. useEffect for applying the theme class to the document root
  useEffect(() => {
    const root = window.document.documentElement; // The <html> tag

    // Remove old theme classes
    root.classList.remove("light", "dark");

    // Handle 'system' theme logic
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light"; // Determine OS theme preference

      root.classList.add(systemTheme);
      return;
    }

    // Apply the selected theme class ('light' or 'dark')
    root.classList.add(theme);
  }, [theme]); // Re-run whenever the theme state changes

  // 3. Context value object
  const value = {
    theme,
    // Wrapper function to set state AND save to local storage
    setTheme: (newTheme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

/**
 * Custom hook to consume the theme context.
 * Returns the current theme and the setTheme function.
 * Throws an error if used outside of a ThemeProvider.
 */
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
