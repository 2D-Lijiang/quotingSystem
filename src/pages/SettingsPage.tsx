import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Database, HelpCircle, Info } from 'lucide-react';
import { Card } from '@/components/ui';
import { useAppStore } from '@/store';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, updateConfig, showToast } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">设置</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 系统配置 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">系统配置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                当前纸板单价 (元/㎡)
              </label>
              <input
                type="number"
                step="0.01"
                value={config.paperPrice}
                onChange={(e) => {
                  updateConfig({ paperPrice: Number(e.target.value) });
                  showToast('纸板单价已更新', 'success');
                }}
                className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  默认损耗率 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.defaultLossRate * 100}
                  onChange={(e) => {
                    updateConfig({ defaultLossRate: Number(e.target.value) / 100 });
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  默认税率 (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={config.defaultTaxRate * 100}
                  onChange={(e) => {
                    updateConfig({ defaultTaxRate: Number(e.target.value) / 100 });
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* 数据管理 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">数据管理</h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                const data = {
                  templates: useAppStore.getState().templates,
                  quotations: useAppStore.getState().quotations,
                  customers: useAppStore.getState().customers,
                  config: useAppStore.getState().config,
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], {
                  type: 'application/json',
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `纸箱报价数据_${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);
                showToast('数据导出成功', 'success');
              }}
              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white text-left hover:bg-gray-50 transition-colors"
            >
              导出所有数据
            </button>

            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = (event) => {
                    try {
                      const data = JSON.parse(event.target?.result as string);
                      localStorage.setItem(
                        'carton-quotation-storage',
                        JSON.stringify({ state: data })
                      );
                      showToast('数据导入成功,请刷新页面', 'success');
                      setTimeout(() => window.location.reload(), 1500);
                    } catch (error) {
                      showToast('数据格式错误', 'error');
                    }
                  };
                  reader.readAsText(file);
                };
                input.click();
              }}
              className="w-full h-11 px-4 rounded-xl border border-gray-300 bg-white text-left hover:bg-gray-50 transition-colors"
            >
              导入数据
            </button>

            <button
              onClick={() => {
                if (confirm('确定要清除所有数据吗?此操作无法撤销。')) {
                  localStorage.clear();
                  showToast('数据已清除,请刷新页面', 'success');
                  setTimeout(() => window.location.reload(), 1500);
                }
              }}
              className="w-full h-11 px-4 rounded-xl border border-red-300 bg-red-50 text-red-600 text-left hover:bg-red-100 transition-colors"
            >
              清除所有数据
            </button>
          </div>
        </Card>

        {/* 关于 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-4">
            <Info className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">关于</h3>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>版本</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>作者</span>
              <span className="font-medium">AI Assistant</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
