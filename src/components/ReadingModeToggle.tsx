import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun, Type, Minus, Plus } from "lucide-react";

interface ReadingModeToggleProps {
  onModeChange: (dark: boolean) => void;
  onFontSizeChange: (size: number) => void;
}

const ReadingModeToggle = ({ onModeChange, onFontSizeChange }: ReadingModeToggleProps) => {
  const [dark, setDark] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [open, setOpen] = useState(false);

  const toggleDark = () => {
    setDark((d) => {
      onModeChange(!d);
      return !d;
    });
  };

  const changeFontSize = (delta: number) => {
    setFontSize((s) => {
      const next = Math.min(24, Math.max(12, s + delta));
      onFontSizeChange(next);
      return next;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-card shadow-lg"
          >
            <button
              onClick={toggleDark}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
            >
              {dark ? <Sun className="h-4 w-4 text-primary" /> : <Moon className="h-4 w-4 text-primary" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
            <div className="flex items-center gap-2 px-3 py-1">
              <Type className="h-4 w-4 text-muted-foreground" />
              <button
                onClick={() => changeFontSize(-2)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs font-mono w-8 text-center">{fontSize}</span>
              <button
                onClick={() => changeFontSize(2)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((o) => !o)}
        className="h-11 w-11 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
        aria-label="Reading settings"
      >
        <Type className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ReadingModeToggle;
