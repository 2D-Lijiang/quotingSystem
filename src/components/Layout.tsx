import { useLayoutEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Calculator, FileText, History, Settings } from 'lucide-react';
import { useAppStore } from '@/store';

const tabs = [
  { key: 'quotations', label: '报价', icon: Calculator, path: '/' },
  { key: 'templates', label: '模板', icon: FileText, path: '/templates' },
  { key: 'history', label: '历史', icon: History, path: '/history' },
  { key: 'settings', label: '我的', icon: Settings, path: '/settings' },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useAppStore((state) => state.activeTab);
  const setActiveTab = useAppStore((state) => state.setActiveTab);

  useLayoutEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/quotations') setActiveTab('quotations');
    else if (path.startsWith('/templates')) setActiveTab('templates');
    else if (path.startsWith('/history')) setActiveTab('history');
    else if (path.startsWith('/settings')) setActiveTab('settings');
  }, [location.pathname, setActiveTab]);

  return (
    <div className="min-h-screen bg-gray-50 pb-[calc(4rem+env(safe-area-inset-bottom))]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-lg font-bold text-gray-900">纸箱报价系统</h1>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-4 max-w-lg mx-auto">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-lg border-t border-gray-100">
        <div className="flex items-center h-16 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  navigate(tab.path);
                }}
                className={cn(
                  'flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors',
                  isActive ? 'text-primary-500' : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <tab.icon className={cn('h-5 w-5', isActive && 'scale-110')} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Safe area bottom padding */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  );
}
