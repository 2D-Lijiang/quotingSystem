import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Calculator, Package, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Calculator, label: '报价' },
    { path: '/templates', icon: Package, label: '模板' },
    { path: '/history', icon: Clock, label: '历史' },
    { path: '/settings', icon: Settings, label: '我的' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 主内容区 */}
      <main className="pb-16">
        <Outlet />
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400'
                )}
              >
                <Icon className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
