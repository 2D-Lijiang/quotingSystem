import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppStore } from '@/store';
import { Button, Input, BottomSheetSelect, Card, ConfirmDialog } from '@/components/ui';
import type { TemplateType, BoxCategory, ParameterDefinition, BusinessRules, Formula } from '@/types';
import { BOX_CATEGORY_LABELS, CUSTOMER_LEVEL_LABELS } from '@/types';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export function TemplateEditorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = id !== undefined && id !== 'new';

  const getTemplateById = useAppStore((state) => state.getTemplateById);
  const addTemplate = useAppStore((state) => state.addTemplate);
  const updateTemplate = useAppStore((state) => state.updateTemplate);
  const showToast = useAppStore((state) => state.showToast);

  const existingTemplate = useMemo(
    () => (isEdit ? getTemplateById(id!) : null),
    [isEdit, id, getTemplateById]
  );

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<TemplateType>('standard');
  const [category, setCategory] = useState<BoxCategory>('外箱');
  const [description, setDescription] = useState('');
  const [parameters, setParameters] = useState<ParameterDefinition[]>([
    { name: 'length', label: '长(cm)', type: 'number', default: 40, unit: 'cm', validation: { min: 5, max: 300, required: true } },
    { name: 'width', label: '宽(cm)', type: 'number', default: 30, unit: 'cm', validation: { min: 5, max: 300, required: true } },
    { name: 'height', label: '高(cm)', type: 'number', default: 20, unit: 'cm', validation: { min: 5, max: 300, required: true } },
  ]);
  const [profitRate, setProfitRate] = useState({ normal: 0.25, longterm: 0.15, vip: 0.08 });
  const [lossRate, setLossRate] = useState(0.05);
  const [taxRate, setTaxRate] = useState(0.13);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingTemplate) {
      setName(existingTemplate.name);
      setType(existingTemplate.type);
      setCategory(existingTemplate.category);
      setDescription(existingTemplate.description);
      setParameters(existingTemplate.parameters);
      setProfitRate(existingTemplate.rules.profitRate);
      setLossRate(existingTemplate.rules.lossRate);
      setTaxRate(existingTemplate.rules.taxRate);
    }
  }, [existingTemplate]);

  const handleAddParameter = () => {
    setParameters((prev) => [
      ...prev,
      {
        name: `param_${prev.length + 1}`,
        label: '新参数',
        type: 'number',
        default: 0,
        validation: { required: false },
      },
    ]);
  };

  const handleRemoveParameter = (index: number) => {
    setParameters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateParameter = (index: number, updates: Partial<ParameterDefinition>) => {
    setParameters((prev) =>
      prev.map((p, i) => (i === index ? { ...p, ...updates } : p))
    );
  };

  const handleSave = () => {
    if (!name) {
      showToast('error', '请输入模板名称');
      return;
    }
    setSaving(true);
    const templateData = {
      name,
      type,
      category,
      formula: {
        area: '根据箱型自动计算',
        weight: '面纸+里纸+瓦楞纸*伸长系数',
        cost: '纸价+损耗+工艺+利润+税费',
      } as Formula,
      parameters,
      rules: {
        profitRate,
        lossRate,
        taxRate,
      } as BusinessRules,
      description,
      version: '1.0.0',
    };

    try {
      if (isEdit && id) {
        updateTemplate(id, templateData);
        showToast('success', '模板已更新');
      } else {
        addTemplate(templateData);
        showToast('success', '模板已创建');
      }
      navigate('/templates');
    } catch {
      showToast('error', '保存失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/templates')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-bold">{isEdit ? '编辑模板' : '新建模板'}</h2>
      </div>

      {/* Basic Info */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">基本信息</h3>
        <div className="space-y-4">
          <Input
            label="模板名称"
            placeholder="请输入模板名称"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <BottomSheetSelect
            label="模板类型"
            options={[
              { label: '标准', value: 'standard' },
              { label: '半定制', value: 'semi-custom' },
              { label: '定制', value: 'custom' },
            ]}
            value={type}
            onChange={(v) => setType(v as TemplateType)}
          />
          <BottomSheetSelect
            label="箱型"
            options={Object.entries(BOX_CATEGORY_LABELS).map(([value, label]) => ({ label, value }))}
            value={category}
            onChange={(v) => setCategory(v as BoxCategory)}
          />
          <Input
            label="描述"
            placeholder="模板描述"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </Card>

      {/* Parameters */}
      <Card padding="md">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">参数定义</h3>
          <Button variant="ghost" size="sm" onClick={handleAddParameter}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {parameters.map((param, index) => (
            <Card key={index} variant="bordered" padding="sm">
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <Input
                    label="参数名称"
                    value={param.label}
                    onChange={(e) => handleUpdateParameter(index, { label: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="默认值"
                      type="number"
                      value={String(param.default)}
                      onChange={(e) => handleUpdateParameter(index, { default: parseFloat(e.target.value) || 0 })}
                    />
                    <Input
                      label="单位"
                      value={param.unit || ''}
                      onChange={(e) => handleUpdateParameter(index, { unit: e.target.value })}
                    />
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveParameter(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Business Rules */}
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">商业规则</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">利润率</p>
            <div className="space-y-2">
              {Object.entries(CUSTOMER_LEVEL_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-20">{label}</span>
                  <Input
                    type="number"
                    step="0.01"
                    value={String((profitRate as any)[key])}
                    onChange={(e) =>
                      setProfitRate((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value) || 0,
                      }))
                    }
                    suffix="%"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="损耗率"
              type="number"
              step="0.01"
              value={String(lossRate)}
              onChange={(e) => setLossRate(parseFloat(e.target.value) || 0)}
              suffix="%"
            />
            <Input
              label="税率"
              type="number"
              step="0.01"
              value={String(taxRate)}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              suffix="%"
            />
          </div>
        </div>
      </Card>

      {/* Save */}
      <Button fullWidth onClick={handleSave} loading={saving}>
        <Save className="h-4 w-4" />
        {isEdit ? '保存修改' : '创建模板'}
      </Button>

      <ConfirmDialog />
    </div>
  );
}
