import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Package, Calendar, User } from 'lucide-react';
import { useAppStore } from '@/store';
import { Card, Empty } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { formatPrice } from '@/utils/calculator';

export const HistoryDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { quotations } = useAppStore();

  const quotation = quotations.find((q) => q.id === id);

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Empty
          title="报价记录不存在"
          description="该记录可能已被删除"
          action={
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
            >
              返回列表
            </button>
          }
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">报价详情</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 总价卡片 */}
        <Card variant="elevated" className="bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="text-center text-white">
            <div className="text-sm opacity-90 mb-1">报价总额</div>
            <div className="text-4xl font-bold mb-2">
              {formatPrice(quotation.totalPrice)}
            </div>
            <div className="text-sm opacity-75">
              单价: {formatPrice(quotation.unitPrice)} / 个
            </div>
          </div>
        </Card>

        {/* 客户信息 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">客户信息</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">客户名称</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.customerName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">客户等级</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.customerLevel === 'vip'
                  ? '大客户'
                  : quotation.customerLevel === 'longterm'
                  ? '长期客户'
                  : '普通客户'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">订单数量</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.quantity.toLocaleString()} 个
              </span>
            </div>
          </div>
        </Card>

        {/* 纸箱参数 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-3">
            <Package className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">纸箱参数</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">箱型模板</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.templateSnapshot.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">箱型分类</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.templateSnapshot.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">尺寸</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.dimensions.length} × {quotation.dimensions.width} ×{' '}
                {quotation.dimensions.height} cm ({quotation.dimensions.type === 'outer' ? '外径' : '内径'})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">楞型</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.fluteType}楞
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">用纸配置</span>
              <span className="text-sm font-medium text-gray-900">
                {quotation.paperConfig.facePaper}/{quotation.paperConfig.innerPaper}/
                {quotation.paperConfig.mediumPaper} g
              </span>
            </div>
            {quotation.craftConfig.printing && quotation.craftConfig.printing.colors > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">印刷</span>
                <span className="text-sm font-medium text-gray-900">
                  {quotation.craftConfig.printing.colors}色(
                  {quotation.craftConfig.printing.method === 'offset' ? '胶印' : '水印'})
                </span>
              </div>
            )}
            {quotation.craftConfig.special && quotation.craftConfig.special.length > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">特殊工艺</span>
                <span className="text-sm font-medium text-gray-900">
                  {quotation.craftConfig.special
                    .map((s) =>
                      s === 'foil'
                        ? '烫金'
                        : s === 'lamination'
                        ? '覆膜'
                        : s === 'embossing'
                        ? '压纹'
                        : 'UV'
                    )
                    .join('、')}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* 成本拆解 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">成本拆解</h3>
          </div>
          <div className="space-y-2">
            {[
              { label: '纸料成本', value: quotation.costBreakdown.paperCost },
              { label: '损耗成本', value: quotation.costBreakdown.lossCost },
              { label: '工艺成本', value: quotation.costBreakdown.craftCost },
              { label: '利润', value: quotation.costBreakdown.profit },
              { label: '税费', value: quotation.costBreakdown.tax },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-gray-600">{item.label}</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatPrice(item.value)}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between">
              <span className="text-sm font-semibold text-gray-900">总计</span>
              <span className="text-sm font-bold text-blue-600">
                {formatPrice(quotation.costBreakdown.total)}
              </span>
            </div>
          </div>
        </Card>

        {/* 其他信息 */}
        <Card variant="bordered">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <h3 className="font-semibold text-gray-900">其他信息</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">创建时间</span>
              <span className="text-sm font-medium text-gray-900">
                {formatDate(quotation.createdAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">当时纸价</span>
              <span className="text-sm font-medium text-gray-900">
                {formatPrice(quotation.paperPrice)}/㎡
              </span>
            </div>
            {quotation.remark && (
              <div className="pt-2 mt-2 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-1">备注</div>
                <div className="text-sm text-gray-900">{quotation.remark}</div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
