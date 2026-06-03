import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Save,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { Button, Input, Card, BottomSheetSelect } from '@/components/ui';
import type {
  Template,
  CustomerLevel,
  PrintingMethod,
  SpecialCraft,
} from '@/types';
import {
  calculateCost,
  calculateUnitPrice,
  calculateTotalPrice,
  formatPrice,
  validateDimensions,
  validateQuantity,
} from '@/utils/calculator';

export const QuotationPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    templates,
    config,
    addQuotation,
    showToast,
    customers,
    quotationDraft,
    updateQuotationDraft,
    resetQuotationDraft,
  } = useAppStore();

  const selectedTemplate = useMemo(() => {
    return templates.find(t => t.id === quotationDraft.selectedTemplateId) || null;
  }, [templates, quotationDraft.selectedTemplateId]);

  const [showTemplateSelector, setShowTemplateSelector] = React.useState(false);
  const [showFluteSelector, setShowFluteSelector] = React.useState(false);
  const [showLevelSelector, setShowLevelSelector] = React.useState(false);
  const [showCostBreakdown, setShowCostBreakdown] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // 客户建议列表
  const customerSuggestions = useMemo(() => {
    if (!quotationDraft.customerName) return [];
    return customers
      .filter((c) => c.name.includes(quotationDraft.customerName))
      .slice(0, 5);
  }, [quotationDraft.customerName, customers]);

  // 计算报价
  const quotation = useMemo(() => {
    if (!selectedTemplate) return null;

    const validation = validateDimensions(quotationDraft.dimensions);
    if (!validation.valid) return null;

    const costBreakdown = calculateCost(
      quotationDraft.dimensions,
      quotationDraft.fluteType,
      quotationDraft.paperConfig,
      quotationDraft.craftConfig,
      quotationDraft.customerLevel,
      selectedTemplate,
      config.paperPrice
    );

    const unitPrice = calculateUnitPrice(costBreakdown);
    const totalPrice = calculateTotalPrice(unitPrice, quotationDraft.quantity);

    return {
      costBreakdown,
      unitPrice,
      totalPrice,
    };
  }, [
    selectedTemplate,
    quotationDraft,
    config.paperPrice,
  ]);

  // 保存报价
  const handleSave = async () => {
    if (!selectedTemplate) {
      showToast('请选择箱型模板', 'error');
      return;
    }

    if (!quotationDraft.customerName.trim()) {
      showToast('请输入客户名称', 'error');
      return;
    }

    const validation = validateDimensions(quotationDraft.dimensions);
    if (!validation.valid) {
      showToast(validation.message || '尺寸无效', 'error');
      return;
    }

    const qtyValidation = validateQuantity(quotationDraft.quantity);
    if (!qtyValidation.valid) {
      showToast(qtyValidation.message || '数量无效', 'error');
      return;
    }

    if (!quotation) {
      showToast('报价计算失败', 'error');
      return;
    }

    setIsSaving(true);

    try {
      addQuotation({
        customerId: '',
        customerName: quotationDraft.customerName,
        customerLevel: quotationDraft.customerLevel,
        templateId: selectedTemplate.id,
        templateSnapshot: selectedTemplate,
        parameters: {},
        dimensions: quotationDraft.dimensions,
        fluteType: quotationDraft.fluteType,
        paperConfig: quotationDraft.paperConfig,
        craftConfig: quotationDraft.craftConfig,
        quantity: quotationDraft.quantity,
        costBreakdown: quotation.costBreakdown,
        unitPrice: quotation.unitPrice,
        totalPrice: quotation.totalPrice,
        paperPrice: config.paperPrice,
        remark: quotationDraft.remark,
      });

      showToast('报价保存成功', 'success');

      // 重置表单
      resetQuotationDraft();
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
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">纸箱报价</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* 客户信息 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <div className="relative">
              <Input
                label="客户名称"
                placeholder="输入客户名称"
                value={quotationDraft.customerName}
                onChange={(e) => updateQuotationDraft({ customerName: e.target.value })}
              />
              {customerSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-10">
                  {customerSuggestions.map((customer) => (
                    <button
                      key={customer.id}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      onClick={() => {
                        updateQuotationDraft({
                          customerName: customer.name,
                          customerLevel: customer.level,
                        });
                      }}
                    >
                      <div className="font-medium text-gray-900">{customer.name}</div>
                      <div className="text-sm text-gray-500">
                        {customer.level === 'vip' ? '大客户' : customer.level === 'longterm' ? '长期客户' : '普通客户'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                客户等级
              </label>
              <button
                onClick={() => setShowLevelSelector(true)}
                className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-left flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {quotationDraft.customerLevel === 'vip' ? '大客户' : quotationDraft.customerLevel === 'longterm' ? '长期客户' : '普通客户'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
        </Card>

        {/* 模板选择 */}
        <Card variant="bordered">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              箱型模板
            </label>
            {selectedTemplate ? (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full p-4 rounded-xl border-2 border-blue-500 bg-blue-50 text-left"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">{selectedTemplate.name}</div>
                    <div className="text-sm text-blue-600 mt-0.5">{selectedTemplate.category}</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-blue-600" />
                </div>
              </button>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full h-24 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
              >
                <Package className="w-8 h-8 mb-1" />
                <span className="text-sm">选择箱型模板</span>
              </button>
            )}
          </div>
        </Card>

        {/* 尺寸参数 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">纸箱尺寸</label>
              <div className="flex gap-2">
                <button
                  onClick={() => updateQuotationDraft({
                    dimensions: { ...quotationDraft.dimensions, type: 'outer' }
                  })}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    quotationDraft.dimensions.type === 'outer'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  外径
                </button>
                <button
                  onClick={() => updateQuotationDraft({
                    dimensions: { ...quotationDraft.dimensions, type: 'inner' }
                  })}
                  className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                    quotationDraft.dimensions.type === 'inner'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  内径
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="长"
                type="number"
                suffix="cm"
                value={quotationDraft.dimensions.length || ''}
                onChange={(e) => updateQuotationDraft({
                  dimensions: { ...quotationDraft.dimensions, length: Number(e.target.value) }
                })}
              />
              <Input
                label="宽"
                type="number"
                suffix="cm"
                value={quotationDraft.dimensions.width || ''}
                onChange={(e) => updateQuotationDraft({
                  dimensions: { ...quotationDraft.dimensions, width: Number(e.target.value) }
                })}
              />
              <Input
                label="高"
                type="number"
                suffix="cm"
                value={quotationDraft.dimensions.height || ''}
                onChange={(e) => updateQuotationDraft({
                  dimensions: { ...quotationDraft.dimensions, height: Number(e.target.value) }
                })}
              />
            </div>
          </div>
        </Card>

        {/* 楞型和用纸 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                楞型
              </label>
              <button
                onClick={() => setShowFluteSelector(true)}
                className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-left flex items-center justify-between"
              >
                <span className="text-gray-900">
                  {quotationDraft.fluteType === 'A' ? 'A楞' : quotationDraft.fluteType === 'B' ? 'B楞' : quotationDraft.fluteType === 'C' ? 'C楞' : quotationDraft.fluteType === 'E' ? 'E楞' : quotationDraft.fluteType === 'AB' ? 'AB楞' : 'BC楞'}
                </span>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="面纸"
                type="number"
                suffix="g"
                value={quotationDraft.paperConfig.facePaper || ''}
                onChange={(e) => updateQuotationDraft({
                  paperConfig: { ...quotationDraft.paperConfig, facePaper: Number(e.target.value) }
                })}
              />
              <Input
                label="里纸"
                type="number"
                suffix="g"
                value={quotationDraft.paperConfig.innerPaper || ''}
                onChange={(e) => updateQuotationDraft({
                  paperConfig: { ...quotationDraft.paperConfig, innerPaper: Number(e.target.value) }
                })}
              />
              <Input
                label="芯纸"
                type="number"
                suffix="g"
                value={quotationDraft.paperConfig.mediumPaper || ''}
                onChange={(e) => updateQuotationDraft({
                  paperConfig: { ...quotationDraft.paperConfig, mediumPaper: Number(e.target.value) }
                })}
              />
            </div>
          </div>
        </Card>

        {/* 工艺配置 */}
        <Card variant="bordered">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="印刷色数"
                type="number"
                suffix="色"
                value={quotationDraft.craftConfig.printing?.colors || 0}
                onChange={(e) => updateQuotationDraft({
                  craftConfig: {
                    ...quotationDraft.craftConfig,
                    printing: {
                      colors: Number(e.target.value),
                      method: quotationDraft.craftConfig.printing?.method || 'offset',
                    },
                  },
                })}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  印刷方式
                </label>
                <select
                  value={quotationDraft.craftConfig.printing?.method || 'offset'}
                  onChange={(e) => updateQuotationDraft({
                    craftConfig: {
                      ...quotationDraft.craftConfig,
                      printing: {
                        colors: quotationDraft.craftConfig.printing?.colors || 0,
                        method: e.target.value as PrintingMethod,
                      },
                    },
                  })}
                  className="w-full h-11 px-3 rounded-xl border border-gray-300 bg-white"
                >
                  <option value="offset">胶印</option>
                  <option value="flexo">水印</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                特殊工艺
              </label>
              <div className="flex flex-wrap gap-2">
                {['烫金', '覆膜', '压纹', 'UV'].map((craft) => {
                  const craftValue = craft === '烫金' ? 'foil' : craft === '覆膜' ? 'lamination' : craft === '压纹' ? 'embossing' : 'spotUV';
                  const isSelected = quotationDraft.craftConfig.special?.includes(craftValue as SpecialCraft);

                  return (
                    <button
                      key={craft}
                      onClick={() => {
                        const special = quotationDraft.craftConfig.special || [];
                        if (isSelected) {
                          updateQuotationDraft({
                            craftConfig: {
                              ...quotationDraft.craftConfig,
                              special: special.filter((s) => s !== craftValue),
                            },
                          });
                        } else {
                          updateQuotationDraft({
                            craftConfig: {
                              ...quotationDraft.craftConfig,
                              special: [...special, craftValue as SpecialCraft],
                            },
                          });
                        }
                      }}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {craft}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* 订单数量 */}
        <Card variant="bordered">
          <Input
            label="订单数量"
            type="number"
            suffix="个"
            value={quotationDraft.quantity || ''}
            onChange={(e) => updateQuotationDraft({ quantity: Number(e.target.value) })}
          />
        </Card>

        {/* 报价结果 */}
        {quotation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
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

            {/* 成本拆解 */}
            <Card variant="bordered">
              <button
                onClick={() => setShowCostBreakdown(!showCostBreakdown)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-600" />
                  <span className="font-medium text-gray-900">成本拆解</span>
                </div>
                {showCostBreakdown ? (
                  <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showCostBreakdown && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 space-y-2">
                      {[
                        { label: '纸料成本', value: quotation.costBreakdown.paperCost },
                        { label: '损耗成本', value: quotation.costBreakdown.lossCost },
                        { label: '工艺成本', value: quotation.costBreakdown.craftCost },
                        { label: '利润', value: quotation.costBreakdown.profit },
                        { label: '税费', value: quotation.costBreakdown.tax },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                        >
                          <span className="text-sm text-gray-600">{item.label}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}

        {/* 备注 */}
        <Card variant="bordered">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              备注(可选)
            </label>
            <textarea
              value={quotationDraft.remark}
              onChange={(e) => updateQuotationDraft({ remark: e.target.value })}
              placeholder="输入备注信息..."
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            icon={<FileText className="w-5 h-5" />}
            onClick={() => navigate('/history')}
          >
            历史记录
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            icon={<Save className="w-5 h-5" />}
            loading={isSaving}
            onClick={handleSave}
          >
            保存报价
          </Button>
        </div>
      </div>

      {/* 模板选择器 */}
      <BottomSheetSelect
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        title="选择箱型模板"
        options={templates.map((t) => ({
          value: t.id,
          label: `${t.name} (${t.category})`,
        }))}
        value={quotationDraft.selectedTemplateId}
        onChange={(value) => {
          updateQuotationDraft({ selectedTemplateId: value });
        }}
      />

      {/* 楞型选择器 */}
      <BottomSheetSelect
        open={showFluteSelector}
        onClose={() => setShowFluteSelector(false)}
        title="选择楞型"
        options={[
          { value: 'A', label: 'A楞' },
          { value: 'B', label: 'B楞' },
          { value: 'C', label: 'C楞' },
          { value: 'E', label: 'E楞' },
          { value: 'AB', label: 'AB楞' },
          { value: 'BC', label: 'BC楞' },
        ]}
        value={quotationDraft.fluteType}
        onChange={(value) => updateQuotationDraft({ fluteType: value as any })}
      />

      {/* 客户等级选择器 */}
      <BottomSheetSelect
        open={showLevelSelector}
        onClose={() => setShowLevelSelector(false)}
        title="选择客户等级"
        options={[
          { value: 'normal', label: '普通客户 (15%利润率)' },
          { value: 'longterm', label: '长期客户 (10%利润率)' },
          { value: 'vip', label: '大客户 (8%利润率)' },
        ]}
        value={quotationDraft.customerLevel}
        onChange={(value) => updateQuotationDraft({ customerLevel: value as CustomerLevel })}
      />
    </div>
  );
};
