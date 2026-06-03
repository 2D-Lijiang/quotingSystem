import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button, Card, Select, Empty, ConfirmDialog } from '@/components/ui';
import { formatPrice } from '@/utils/calculator';
import { formatRelativeTime } from '@/lib/utils';
import { CUSTOMER_LEVEL_LABELS, FLUTE_TYPE_LABELS } from '@/types';
import { Eye, Trash2 } from 'lucide-react';

export function HistoryPage() {
  const navigate = useNavigate();
  const quotations = useAppStore((state) => state.quotations);
  const deleteQuotation = useAppStore((state) => state.deleteQuotation);
  const showConfirmDialog = useAppStore((state) => state.showConfirmDialog);
  const showToast = useAppStore((state) => state.showToast);

  const [filterLevel, setFilterLevel] = useState<string>('');

  const levelOptions = [
    { label: '全部等级', value: '' },
    ...Object.entries(CUSTOMER_LEVEL_LABELS).map(([value, label]) => ({ label, value })),
  ];

  const filteredQuotations = useMemo(() => {
    if (!filterLevel) return quotations;
    return quotations.filter((q) => q.customerLevel === filterLevel);
  }, [quotations, filterLevel]);

  // Stats
  const stats = useMemo(() => {
    const total = quotations.length;
    const totalAmount = quotations.reduce((sum, q) => sum + q.totalPrice, 0);
    const avgUnitPrice = total > 0 ? quotations.reduce((sum, q) => sum + q.unitPrice, 0) / total : 0;
    return { total, totalAmount, avgUnitPrice };
  }, [quotations]);

  const handleDelete = (id: string) => {
    showConfirmDialog({
      title: '删除报价',
      message: '确定要删除此报价记录吗？',
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
      onConfirm: () => {
        deleteQuotation(id);
        showToast('success', '报价记录已删除');
      },
    });
  };

  if (quotations.length === 0) {
    return (
      <Empty
        title="暂无报价记录"
        description="完成一次报价后这里会显示历史记录"
        action={
          <Button onClick={() => navigate('/')}>
            开始报价
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="text-center">
          <p className="text-xs text-gray-500">总次数</p>
          <p className="text-xl font-bold text-primary-600">{stats.total}</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-xs text-gray-500">总金额</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(stats.totalAmount)}</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-xs text-gray-500">均价</p>
          <p className="text-lg font-bold text-gray-900">{formatPrice(stats.avgUnitPrice)}</p>
        </Card>
      </div>

      {/* Filter */}
      <Card padding="sm">
        <Select
          options={levelOptions}
          value={filterLevel}
          onChange={setFilterLevel}
        />
      </Card>

      {/* List */}
      <div className="space-y-3">
        {filteredQuotations.length === 0 ? (
          <Empty title="没有匹配的记录" description="请调整筛选条件" />
        ) : (
          filteredQuotations.map((q) => (
            <Card key={q.id} padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{q.customerName}</h3>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md text-xs">
                      {CUSTOMER_LEVEL_LABELS[q.customerLevel]}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {q.templateSnapshot.name} · {FLUTE_TYPE_LABELS[q.fluteType]} · {q.quantity}件
                  </p>
                  <p className="text-xs text-gray-400">{formatRelativeTime(q.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-primary-600">{formatPrice(q.unitPrice)}</p>
                  <p className="text-xs text-gray-400">/件</p>
                </div>
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(`/history/${q.id}`)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  详情
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(q.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}
