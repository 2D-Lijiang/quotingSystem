import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '请选择',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const handleToggle = useCallback(() => {
    if (!disabled) setOpen((prev) => !prev);
  }, [disabled]);

  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('space-y-1.5', className)}>
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        <button
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className={cn(
            'w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-sm text-left',
            'flex items-center justify-between gap-2',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-500 focus:ring-red-500',
            !selectedOption && 'text-gray-400'
          )}
        >
          <span className="truncate">{selectedOption?.label || placeholder}</span>
          <ChevronDown className={cn('h-4 w-4 text-gray-400 transition-transform', open && 'rotate-180')} />
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-3 py-2.5 text-sm text-left flex items-center justify-between gap-2',
                      'hover:bg-gray-50 transition-colors',
                      option.value === value && 'bg-primary-50 text-primary-600',
                      option.disabled && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && <Check className="h-4 w-4 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

// Bottom Sheet Select - 移动端友好
export function BottomSheetSelect({
  options,
  value,
  onChange,
  placeholder = '请选择',
  label,
  error,
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  const handleOpen = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const handleClose = useCallback(() => setOpen(false), []);

  const handleSelect = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      onChange?.(option.value);
      setOpen(false);
    },
    [onChange]
  );

  return (
    <>
      <div className={cn('space-y-1.5', className)}>
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            'w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-sm text-left',
            'flex items-center justify-between gap-2',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error && 'border-red-500',
            !selectedOption && 'text-gray-400'
          )}
        >
          <span className="truncate">{selectedOption?.label || placeholder}</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-50"
              onClick={handleClose}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <span className="text-base font-semibold text-gray-900">{label || '请选择'}</span>
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              {/* Options */}
              <div className="overflow-y-auto flex-1 pb-6">
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-3.5 text-left flex items-center justify-between',
                      'active:bg-gray-50 transition-colors',
                      option.value === value && 'bg-primary-50 text-primary-600',
                      option.disabled && 'opacity-50 pointer-events-none'
                    )}
                  >
                    <span>{option.label}</span>
                    {option.value === value && <Check className="h-5 w-5 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
