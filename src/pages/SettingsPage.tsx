import { useState } from 'react';
import { useAppStore } from '@/store';
import { Button, Input, Card, ConfirmDialog } from '@/components/ui';
import { cn } from '@/lib/utils';
import { CUSTOMER_LEVEL_LABELS } from '@/types';
import {
  Download,
  Trash2,
  Moon,
  Sun,
  Save,
  RotateCcw,
} from 'lucide-react';

export function SettingsPage() {
  const systemConfig = useAppStore((state) => state.systemConfig);
  const updateSystemConfig = useAppStore((state) => state.updateSystemConfig);
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleDarkMode = useAppStore((state) => state.toggleDarkMode);
  const showToast = useAppStore((state) => state.showToast);
  const showConfirmDialog = useAppStore((state) => state.showConfirmDialog);

  const [paperPrice, setPaperPrice] = useState(String(systemConfig.paperPrice));
  const [lossRate, setLossRate] = useState(String(systemConfig.defaultLossRate));
  const [taxRate, setTaxRate] = useState(String(systemConfig.defaultTaxRate));
  const [profitRates, setProfitRates] = useState({ ...systemConfig.profitRates });

  const handleSave = () => {
    updateSystemConfig({
      paperPrice: parseFloat(paperPrice) || 50,
      defaultLossRate: parseFloat(lossRate) || 0.05,
      defaultTaxRate: parseFloat(taxRate) || 0.13,
      profitRates: {
        normal: profitRates.normal,
        longterm: profitRates.longterm,
        vip: profitRates.vip,
      },
    });
    showToast('success', '配置已保存');
  };

  const handleReset = () => {
    showConfirmDialog({
      title: '重置配置',
      message: '确定要恢复默认配置吗？',
      confirmText: '重置',
      cancelText: '取消',
      variant: 'default',
      onConfirm: () => {
        setPaperPrice('50');
        setLossRate('0.05');
        setTaxRate('0.13');
        setProfitRates({ normal: 0.25, longterm: 0.15, vip: 0.08 });
        showToast('success', '配置已重置');
      },
    });
  };

  const handleClearData = () => {
    showConfirmDialog({
      title: '清除数据',
      message: '此操作将清除所有本地存储的报价和模板数据，确定继续吗？',
      confirmText: '清除',
      cancelText: '取消',
      variant: 'danger',
      onConfirm: () => {
        localStorage.removeItem('carton-quoting-storage');
        showToast('success', '数据已清除，页面将刷新');
        setTimeout(() => window.location.reload(), 1000);
      },
    });
  };

  const handleExport = () => {
    const data = localStorage.getItem('carton-quoting-storage');
    if (!data) {
      showToast('warning', '暂无数据可导出');
      return;
    }
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carton-quoting-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '数据已导出');
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold mb-4">设置</h2>

      {/* Appearance */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">外观</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDarkMode ? (
              <Moon className="h-5 w-5 text-gray-600" />
            ) : (
              <Sun className="h-5 w-5 text-yellow-500" />
            )}
            <span className="text-sm">深色模式</span>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className={cn(
              'w-11 h-6 rounded-full transition-colors relative',
              isDarkMode ? 'bg-primary-500' : 'bg-gray-300'
            )}
          >
            <div
              className={cn(
                'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </Card>

      {/* Pricing Config */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">价格配置</h3>
        <div className="space-y-4">
          <Input
            label="纸价 (元/㎡)"
            type="number"
            value={paperPrice}
            onChange={(e) => setPaperPrice(e.target.value)}
          />
          <Input
            label="默认损耗率"
            type="number"
            step="0.01"
            value={lossRate}
            onChange={(e) => setLossRate(e.target.value)}
            suffix="%"
          />
          <Input
            label="默认税率"
            type="number"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            suffix="%"
          />
        </div>
      </Card>

      {/* Profit Rates */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">利润率配置</h3>
        <div className="space-y-3">
          {Object.entries(CUSTOMER_LEVEL_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-gray-500 w-20">{label}</span>
              <Input
                type="number"
                step="0.01"
                value={String((profitRates as any)[key])}
                onChange={(e) =>
                  setProfitRates((prev) => ({
                    ...prev,
                    [key]: parseFloat(e.target.value) || 0,
                  }))
                }
                suffix="%"
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Actions */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">数据管理</h3>
        <div className="space-y-3">
          <Button variant="outline" fullWidth onClick={handleExport}>
            <Download className="h-4 w-4" />
            导出数据
          </Button>
          <Button variant="outline" fullWidth onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            恢复默认配置
          </Button>
          <Button variant="danger" fullWidth onClick={handleClearData}>
            <Trash2 className="h-4 w-4" />
            清除所有数据
          </Button>
        </div>
      </Card>

      {/* Save */}
      <Button fullWidth onClick={handleSave}>
        <Save className="h-4 w-4" />
        保存配置
      </Button>

      <ConfirmDialog />
    </div>
  );
}
