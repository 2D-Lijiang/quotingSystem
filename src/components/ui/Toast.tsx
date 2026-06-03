import React from 'react';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store';

export const Toast: React.FC = () => {
  const { toast, hideToast } = useAppStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-600" />,
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-orange-50 border-orange-200',
  };

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-xl border shadow-lg',
          bgColors[toast.type]
        )}
      >
        {icons[toast.type]}
        <p className="flex-1 text-sm font-medium text-gray-900">
          {toast.message}
        </p>
        <button
          onClick={hideToast}
          className="p-1 hover:bg-white/50 rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};
