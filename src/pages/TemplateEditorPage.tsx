import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAppStore } from '@/store';
import { Button, Input, Card, Select } from '@/components/ui';
import type { Template, TemplateType, BoxCategory } from '@/types';

export const TemplateEditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { templates, addTemplate, updateTemplate, showToast } = useAppStore();

  const isEdit = !!id;
  const existingTemplate = templates.find((t) => t.id === id);

  const [formData, setFormData] = useState<Partial<Template>>(
    existingTemplate || {
      name: '',
      type: 'standard',
      category: '外箱',
      description: '',
      formula: {
        area: '(length + width + 5) * (width + 2 * height + 3) / 10000',
        cost: 'area * paperPrice * (1 + lossRate)',
      },
      parameters: [
        {
          name: 'jointAllowance',
          label: '接头余量',
          type: 'number',
          default: 5,
          unit: 'cm',
          validation: { min: 0, max: 20, required: true },
        },
        {
          name: 'trimAllowance',
          label: '修边余量',
          type: 'number',
          default: 3,
          unit: 'cm',
          validation: { min: 0, max: 20, required: true },
        },
      ],
      rules: {
        profitRate: { normal: 0.15, longterm: 0.1, vip: 0.08 },
        lossRate: 0.05,
        taxRate: 0.13,
      },
      version: '1.0.0',
    }
  );

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      showToast('请输入模板名称', 'error');
      return;
    }

    if (!formData.formula?.area || !formData.formula?.cost) {
      showToast('请完善计算公式', 'error');
      return;
    }

    setIsSaving(true);

    try {
      if (isEdit && id) {
        updateTemplate(id, formData);
        showToast('模板更新成功', 'success');
      } else {
        addTemplate(formData as Omit<Template, 'id' | 'createdAt' | 'updatedAt'>);
        showToast('模板创建成功', 'success');
      }
      navigate('/templates');
    } catch (error) {
      showToast('保存失败,请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 顶部标题栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/templates')}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEdit ? '编辑模板' : '新建模板'}
          </h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 基础信息 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <Input
              label="模板名称"
              placeholder="输入模板名称"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  模板类型
                </label>
                <select
                  value={formData.type || 'standard'}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as TemplateType })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="standard">标准模板</option>
                  <option value="semi-custom">半定制模板</option>
                  <option value="custom">自定义模板</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  箱型分类
                </label>
                <select
                  value={formData.category || '外箱'}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as BoxCategory })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="外箱">外箱</option>
                  <option value="内盒">内盒</option>
                  <option value="天地盖">天地盖</option>
                  <option value="飞机盒">飞机盒</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                模板描述
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="输入模板描述..."
                rows={3}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* 计算公式 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">计算公式</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                面积公式
              </label>
              <textarea
                value={formData.formula?.area || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    formula: { ...formData.formula!, area: e.target.value },
                  })
                }
                placeholder="输入面积计算公式..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                可用变量: length, width, height, jointAllowance, trimAllowance
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                成本公式
              </label>
              <textarea
                value={formData.formula?.cost || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    formula: { ...formData.formula!, cost: e.target.value },
                  })
                }
                placeholder="输入成本计算公式..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                可用变量: area, paperPrice, lossRate
              </p>
            </div>
          </div>
        </Card>

        {/* 商业规则 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">商业规则</h3>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="普通客户利润率"
                type="number"
                suffix="%"
                value={(formData.rules?.profitRate?.normal || 0) * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules!,
                      profitRate: {
                        ...formData.rules!.profitRate,
                        normal: Number(e.target.value) / 100,
                      },
                    },
                  })
                }
              />
              <Input
                label="长期客户利润率"
                type="number"
                suffix="%"
                value={(formData.rules?.profitRate?.longterm || 0) * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules!,
                      profitRate: {
                        ...formData.rules!.profitRate,
                        longterm: Number(e.target.value) / 100,
                      },
                    },
                  })
                }
              />
              <Input
                label="大客户利润率"
                type="number"
                suffix="%"
                value={(formData.rules?.profitRate?.vip || 0) * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules!,
                      profitRate: {
                        ...formData.rules!.profitRate,
                        vip: Number(e.target.value) / 100,
                      },
                    },
                  })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="默认损耗率"
                type="number"
                suffix="%"
                value={(formData.rules?.lossRate || 0) * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules!,
                      lossRate: Number(e.target.value) / 100,
                    },
                  })
                }
              />
              <Input
                label="默认税率"
                type="number"
                suffix="%"
                value={(formData.rules?.taxRate || 0) * 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rules: {
                      ...formData.rules!,
                      taxRate: Number(e.target.value) / 100,
                    },
                  })
                }
              />
            </div>
          </div>
        </Card>

        {/* 保存按钮 */}
        <Button
          variant="primary"
          size="lg"
          className="w-full"
          icon={<Save className="w-5 h-5" />}
          loading={isSaving}
          onClick={handleSave}
        >
          保存模板
        </Button>
      </div>
    </div>
  );
};
