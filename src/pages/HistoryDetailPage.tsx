import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button, Card, Empty } from '@/components/ui';
import { formatPrice } from '@/utils/calculator';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { CUSTOMER_LEVEL_LABELS, FLUTE_TYPE_LABELS } from '@/types';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';

export function HistoryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const quotations = useAppStore((state) => state.quotations);

  const quotation = useMemo(
    () => quotations.find((q) => q.id === id),
    [quotations, id]
  );

  if (!quotation) {
    return (
      <Empty
        title="报价记录不存在"
        description="该报价记录可能已被删除"
        action={
          <Button onClick={() => navigate('/history')}>返回历史</Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/history')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold">报价详情</h2>
      </div>

      {/* Price Summary */}
      <Card variant="elevated" padding="lg" className="text-center">
        <p className="text-sm text-gray-500 mb-1">单价</p>
        <p className="text-3xl font-bold text-primary-600">{formatPrice(quotation.unitPrice)}</p>
        <div className="mt-2 pt-3 border-t border-gray-100 flex justify-between text-sm">
          <span className="text-gray-500">总价 ({quotation.quantity}件)</span>
          <span className="font-semibold text-gray-900">{formatPrice(quotation.totalPrice)}</span>
        </div>
      </Card>

      {/* Customer Info */}
      <Card padding="md">
        <h3 className="font-semibold mb-3">客户信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">客户名称</span>
            <span>{quotation.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">客户等级</span>
            <span>{CUSTOMER_LEVEL_LABELS[quotation.customerLevel]}</span>
          </div>
        </div>
      </Card>

      {/* Product Info */}
      <Card padding="md">
        <h3 className="font-semibold mb-3">产品信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">模板</span>
            <span>{quotation.templateSnapshot.name} ({quotation.templateSnapshot.category})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">楞型</span>
            <span>{FLUTE_TYPE_LABELS[quotation.fluteType]}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">尺寸</span>
            <span>{quotation.dimensions.length}×{quotation.dimensions.width}×{quotation.dimensions.height}cm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">数量</span>
            <span>{quotation.quantity}件</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">用纸</span>
            <span>面{quotation.paperConfig.facePaper}g/里{quotation.paperConfig.innerPaper}g/芯{quotation.paperConfig.mediumPaper}g</span>
          </div>
          {quotation.remark && (
            <div className="flex justify-between">
              <span className="text-gray-500">备注</span>
              <span>{quotation.remark}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Cost Breakdown */}
      <Card padding="md">
        <h3 className="font-semibold mb-3">成本拆解</h3>
        <div className="space-y-2 text-sm">
          {[
            { label: '纸张成本', value: quotation.costBreakdown.paperCost, color: 'text-blue-600' },
            { label: '损耗成本', value: quotation.costBreakdown.lossCost, color: 'text-orange-600' },
            { label: '工艺成本', value: quotation.costBreakdown.craftCost, color: 'text-purple-600' },
            { label: '利润', value: quotation.costBreakdown.profit, color: 'text-green-600' },
            { label: '税费', value: quotation.costBreakdown.tax, color: 'text-red-600' },
          ].map((item) => {
            const percentage = quotation.costBreakdown.total > 0
              ? ((item.value / quotation.costBreakdown.total) * 100).toFixed(1)
              : '0.0';
            return (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={cn('font-medium', item.color)}>{formatPrice(item.value)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', item.color.replace('text-', 'bg-'))}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Meta Info */}
      <Card padding="md">
        <h3 className="font-semibold mb-3">其他信息</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">创建时间</span>
            <span>{formatDate(quotation.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">纸价基准</span>
            <span>{formatPrice(quotation.paperPrice)}/㎡</span>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-4">
        <Button variant="outline" fullWidth>
          <Share2 className="h-4 w-4" />
          分享
        </Button>
        <Button fullWidth>
          <Printer className="h-4 w-4" />
          打印
        </Button>
      </div>
    </div>
  );
}
