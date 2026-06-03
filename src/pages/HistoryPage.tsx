import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  User,
  Package,
  TrendingUp,
  ChevronRight,
  Trash2,
  Copy,
  Filter,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Card, Empty, ConfirmDialog, BottomSheetSelect } from '@/components/ui';
import { formatRelativeTime } from '@/lib/utils';
import { formatPrice } from '@/utils/calculator';
import type { FluteType } from '@/types';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { quotations, deleteQuotation, showToast, templates, addQuotation } = useAppStore();

  const [filter, setFilter] = useState<{
    fluteType?: FluteType;
    dateRange?: 'today' | 'week' | 'month' | 'all';
  }>({ dateRange: 'all' });

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilter, setShowFilter] = useState(false);

  // 筛选报价记录
  const filteredQuotations = useMemo(() => {
    let result = [...quotations];

    if (filter.fluteType) {
      result = result.filter((q) => q.fluteType === filter.fluteType);
    }

    if (filter.dateRange && filter.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (filter.dateRange) {
        case 'today':
          result = result.filter((q) => new Date(q.createdAt) >= today);
          break;
        case 'week':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          result = result.filter((q) => new Date(q.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          result = result.filter((q) => new Date(q.createdAt) >= monthAgo);
          break;
      }
    }

    return result;
  }, [quotations, filter]);

  // 统计数据
  const statistics = useMemo(() => {
    const total = filteredQuotations.length;
    const totalAmount = filteredQuotations.reduce(
      (sum, q) => sum + q.totalPrice,
      0
    );
    const avgAmount = total > 0 ? totalAmount / total : 0;

    return {
      total,
      totalAmount,
      avgAmount,
    };
  }, [filteredQuotations]);

  const handleDelete = (id: string) => {
    deleteQuotation(id);
    showToast('报价记录已删除', 'success');
    setDeleteId(null);
  };

  const handleCopy = (quotation: typeof quotations[0]) => {
    // 复制报价并跳转到报价页面
    navigate('/', {
      state: {
        copyData: quotation,
      },
    });
    showToast('已复制报价参数', 'success');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">历史记录</h1>
          <button
            onClick={() => setShowFilter(true)}
            className={`p-2 rounded-lg transition-colors ${
              filter.fluteType || filter.dateRange !== 'all'
                ? 'bg-blue-100 text-blue-600'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="px-4 pb-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <div className="text-2xl font-bold text-blue-600">{statistics.total}</div>
              <div className="text-xs text-blue-600 mt-1">报价次数</div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-green-600">
                {formatPrice(statistics.totalAmount)}
              </div>
              <div className="text-xs text-green-600 mt-1">总金额</div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <div className="text-lg font-bold text-purple-600">
                {formatPrice(statistics.avgAmount)}
              </div>
              <div className="text-xs text-purple-600 mt-1">平均单价</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {filteredQuotations.length === 0 ? (
          <Empty
            icon={<Calendar className="w-8 h-8 text-gray-400" />}
            title="暂无报价记录"
            description="开始创建您的第一个报价吧"
            action={
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium"
              >
                创建报价
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {filteredQuotations.map((quotation, index) => (
              <motion.div
                key={quotation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  variant="bordered"
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/history/${quotation.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {quotation.customerName}
                        </span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                          {quotation.customerLevel === 'vip'
                            ? '大客户'
                            : quotation.customerLevel === 'longterm'
                            ? '长期'
                            : '普通'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" />
                          {quotation.templateSnapshot.name}
                        </span>
                        <span>{quotation.fluteType}楞</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatPrice(quotation.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatPrice(quotation.unitPrice)}/个
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{formatRelativeTime(quotation.createdAt)}</span>
                    <span>数量: {quotation.quantity.toLocaleString()}</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(quotation);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                      复制
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteId(quotation.id);
                      }}
                      className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 筛选器 */}
      <BottomSheetSelect
        open={showFilter}
        onClose={() => setShowFilter(false)}
        title="筛选条件"
        options={[
          { value: 'all', label: '全部时间' },
          { value: 'today', label: '今天' },
          { value: 'week', label: '最近7天' },
          { value: 'month', label: '最近30天' },
        ]}
        value={filter.dateRange || 'all'}
        onChange={(value) => {
          setFilter({ ...filter, dateRange: value as any });
          setShowFilter(false);
        }}
      />

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="删除报价记录"
        message="确定要删除这条报价记录吗?此操作无法撤销。"
        confirmText="删除"
        variant="danger"
      />
    </div>
  );
};
