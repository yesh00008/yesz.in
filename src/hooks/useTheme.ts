import { useEffect } from "react";

export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return { theme: "light" as const, toggleTheme: () => {} };
}
