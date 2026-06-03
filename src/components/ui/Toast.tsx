import { useAppStore } from '@/store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export function Toast() {
  const toast = useAppStore((state) => state.toast);
  const hideToast = useAppStore((state) => state.hideToast);

  if (!toast) return null;

  const Icon = iconMap[toast.type];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="fixed top-4 left-4 right-4 z-[100] flex justify-center"
      >
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full"
          style={{
            ...(toast.type === 'success' ? { backgroundColor: '#f0fdf4', color: '#166534', borderColor: '#bbf7d0' } : {}),
            ...(toast.type === 'error' ? { backgroundColor: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' } : {}),
            ...(toast.type === 'warning' ? { backgroundColor: '#fefce8', color: '#854d0e', borderColor: '#fde047' } : {}),
            ...(toast.type === 'info' ? { backgroundColor: '#eff6ff', color: '#1e40af', borderColor: '#bfdbfe' } : {}),
          }}
        >
          <Icon className={cn('h-5 w-5 flex-shrink-0', iconColorMap[toast.type])} />
          <span className="text-sm font-medium flex-1">{toast.message}</span>
          <button
            type="button"
            onClick={hideToast}
            className="p-0.5 rounded-md hover:bg-black/5 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

function cn(...inputs: (string | undefined | false | null)[]) {
  return inputs.filter(Boolean).join(' ');
}
