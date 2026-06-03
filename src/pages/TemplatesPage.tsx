import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button, Card, Select, Empty, ConfirmDialog } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import type { TemplateType } from '@/types';
import { BOX_CATEGORY_LABELS } from '@/types';
import { Plus, Trash2, Edit3, Package } from 'lucide-react';

export function TemplatesPage() {
  const navigate = useNavigate();
  const templates = useAppStore((state) => state.templates);
  const deleteTemplate = useAppStore((state) => state.deleteTemplate);
  const showConfirmDialog = useAppStore((state) => state.showConfirmDialog);
  const showToast = useAppStore((state) => state.showToast);

  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');

  const categoryOptions = [
    { label: '全部箱型', value: '' },
    ...Object.entries(BOX_CATEGORY_LABELS).map(([value, label]) => ({ label, value })),
  ];

  const typeOptions = [
    { label: '全部类型', value: '' },
    { label: '标准', value: 'standard' },
    { label: '半定制', value: 'semi-custom' },
    { label: '定制', value: 'custom' },
  ];

  const filteredTemplates = useMemo(() => {
    return templates.filter((t) => {
      if (filterCategory && t.category !== filterCategory) return false;
      if (filterType && t.type !== filterType) return false;
      return true;
    });
  }, [templates, filterCategory, filterType]);

  const handleDelete = (id: string) => {
    showConfirmDialog({
      title: '删除模板',
      message: '确定要删除此模板吗？此操作不可撤销。',
      confirmText: '删除',
      cancelText: '取消',
      variant: 'danger',
      onConfirm: () => {
        deleteTemplate(id);
        showToast('success', '模板已删除');
      },
    });
  };

  const typeLabel = (type: TemplateType) => {
    switch (type) {
      case 'standard': return '标准';
      case 'semi-custom': return '半定制';
      case 'custom': return '定制';
    }
  };

  if (templates.length === 0) {
    return (
      <Empty
        title="暂无模板"
        description="创建你的第一个报价模板"
        action={
          <Button onClick={() => navigate('/templates/new')}>
            <Plus className="h-4 w-4" />
            创建模板
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">模板列表</h2>
        <Button size="sm" onClick={() => navigate('/templates/new')}>
          <Plus className="h-4 w-4" />
          新建
        </Button>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex gap-2">
          <Select
            options={categoryOptions}
            value={filterCategory}
            onChange={setFilterCategory}
          />
          <Select
            options={typeOptions}
            value={filterType}
            onChange={setFilterType}
          />
        </div>
      </Card>

      {/* Template List */}
      <div className="space-y-3">
        {filteredTemplates.length === 0 ? (
          <Empty title="没有匹配的模板" description="请调整筛选条件" />
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} padding="md">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Package className="h-4 w-4 text-primary-500" />
                    <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md">{template.category}</span>
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md">{typeLabel(template.type)}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{template.description}</p>
                  <p className="text-xs text-gray-400 mt-1">更新于 {formatDate(template.updatedAt)}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/templates/${template.id}`)}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}
