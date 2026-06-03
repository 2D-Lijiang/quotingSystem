import React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, onChange, value, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className={cn(
            'w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-gray-900 transition-all duration-200 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            'bg-no-repeat bg-right',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundSize: '1.5em 1.5em',
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

// 底部弹出选择器(移动端友好)
interface BottomSheetSelectProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
}

export const BottomSheetSelect: React.FC<BottomSheetSelectProps> = ({
  open,
  onClose,
  title,
  options,
  value,
  onChange,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* 底部弹出内容 */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[70vh] overflow-hidden animate-slide-up">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 选项列表 */}
        <div className="overflow-y-auto max-h-[60vh]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                onClose();
              }}
              className={cn(
                'w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50',
                value === option.value && 'bg-blue-50 text-blue-600 font-medium'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
