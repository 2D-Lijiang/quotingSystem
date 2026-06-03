import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Package, ChevronRight } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button, Card, Empty, ConfirmDialog } from '@/components/ui';
import type { Template, TemplateType, BoxCategory } from '@/types';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { templates, deleteTemplate, showToast } = useAppStore();

  const [filter, setFilter] = useState<'all' | TemplateType>('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredTemplates = templates.filter(
    (t) => filter === 'all' || t.type === filter
  );

  const handleDelete = (id: string) => {
    deleteTemplate(id);
    showToast('模板已删除', 'success');
    setDeleteId(null);
  };

  const getTemplateTypeLabel = (type: TemplateType) => {
    const labels = {
      standard: '标准',
      'semi-custom': '半定制',
      custom: '自定义',
    };
    return labels[type];
  };

  const getTemplateTypeColor = (type: TemplateType) => {
    const colors = {
      standard: 'bg-blue-100 text-blue-700',
      'semi-custom': 'bg-purple-100 text-purple-700',
      custom: 'bg-orange-100 text-orange-700',
    };
    return colors[type];
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">箱型模板</h1>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => navigate('/templates/create')}
          >
            新建
          </Button>
        </div>

        {/* 筛选标签 */}
        <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
          {['all', 'standard', 'semi-custom', 'custom'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as 'all' | TemplateType)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {type === 'all'
                ? '全部'
                : type === 'standard'
                ? '标准'
                : type === 'semi-custom'
                ? '半定制'
                : '自定义'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {filteredTemplates.length === 0 ? (
          <Empty
            icon={<Package className="w-8 h-8 text-gray-400" />}
            title="暂无模板"
            description="点击右上角按钮创建新模板"
          />
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="bordered" className="hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">{template.name}</h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${getTemplateTypeColor(
                            template.type
                          )}`}
                        >
                          {getTemplateTypeLabel(template.type)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{template.category}</p>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => navigate(`/templates/edit/${template.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => setDeleteId(template.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                    <span>版本 {template.version}</span>
                    <span>
                      更新于 {new Date(template.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 删除确认对话框 */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="删除模板"
        message="确定要删除这个模板吗?此操作无法撤销。"
        confirmText="删除"
        variant="danger"
      />
    </div>
  );
};
