import { useState, useMemo } from 'react';
import { useAppStore } from '@/store';
import { Button, Input, Card, Select, BottomSheetSelect, ConfirmDialog } from '@/components/ui';
import { formatPrice, validateDimensions } from '@/utils/calculator';
import { cn } from '@/lib/utils';
import type { Quotation, CustomerLevel, FluteType, Dimensions, CraftConfig } from '@/types';
import {
  FLUTE_TYPE_LABELS,
  CUSTOMER_LEVEL_LABELS,
} from '@/types';
import {
  Calculator,
  Package,
  Ruler,
  Layers,
  Palette,
  Hash,
  ArrowRight,
  FileText,
} from 'lucide-react';

const CUSTOMER_LEVEL_OPTIONS = [
  { label: '普通客户', value: 'normal' },
  { label: '长期客户', value: 'longterm' },
  { label: '大客户', value: 'vip' },
];

const FLUTE_OPTIONS = Object.entries(FLUTE_TYPE_LABELS).map(([value, label]) => ({
  label,
  value,
}));

// Paper weight options (g/m²)
const PAPER_WEIGHT_OPTIONS = [
  { label: '120g', value: '120' },
  { label: '140g', value: '140' },
  { label: '150g', value: '150' },
  { label: '170g', value: '170' },
  { label: '200g', value: '200' },
  { label: '230g', value: '230' },
  { label: '250g', value: '250' },
  { label: '300g', value: '300' },
];

const SPECIAL_CRAFTS = [
  { key: 'foil' as const, label: '烫金' },
  { key: 'lamination' as const, label: '覆膜' },
  { key: 'embossing' as const, label: '压花' },
  { key: 'spotUV' as const, label: '局部UV' },
];

export function QuotationPage() {
  const templates = useAppStore((state) => state.templates);
  const systemConfig = useAppStore((state) => state.systemConfig);
  const createQuotation = useAppStore((state) => state.createQuotation);
  const showToast = useAppStore((state) => state.showToast);

  // Step tracking
  const [step, setStep] = useState(0);

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [customerLevel, setCustomerLevel] = useState<CustomerLevel>('normal');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
  const [dimensionType, setDimensionType] = useState<'outer' | 'inner'>('outer');
  const [fluteType, setFluteType] = useState<FluteType>('B');
  const [paperConfig, setPaperConfig] = useState({ facePaper: 150, innerPaper: 150, mediumPaper: 120 });
  const [craftConfig, setCraftConfig] = useState<CraftConfig>({ printing: { colors: 1, method: 'flexo' }, special: [] });
  const [quantity, setQuantity] = useState('');
  const [remark, setRemark] = useState('');

  // Quote result
  const [result, setResult] = useState<Quotation | null>(null);

  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId),
    [templates, selectedTemplateId]
  );

  const templateOptions = useMemo(
    () => templates.map((t) => ({ label: `${t.name} (${t.category})`, value: t.id })),
    [templates]
  );

  const handleToggleSpecialCraft = (craft: 'foil' | 'lamination' | 'embossing' | 'spotUV') => {
    setCraftConfig((prev) => {
      const special = prev.special || [];
      const updated = special.includes(craft)
        ? special.filter((c) => c !== craft)
        : [...special, craft];
      return { ...prev, special: updated };
    });
  };

  const handleCalculate = () => {
    if (!customerName) {
      showToast('error', '请输入客户名称');
      return;
    }
    if (!selectedTemplateId) {
      showToast('error', '请选择模板');
      return;
    }
    const len = parseFloat(dimensions.length);
    const wid = parseFloat(dimensions.width);
    const hei = parseFloat(dimensions.height);
    const dims: Dimensions = { length: len, width: wid, height: hei, type: dimensionType };
    const validation = validateDimensions(dims);
    if (!validation.valid) {
      showToast('error', validation.message || '尺寸验证失败');
      return;
    }
    const qty = parseInt(quantity);
    if (!qty || qty <= 0) {
      showToast('error', '请输入有效数量');
      return;
    }

    try {
      const quotation = createQuotation({
        customerId: 'default',
        customerName,
        customerLevel,
        templateId: selectedTemplateId,
        parameters: {
          length: len,
          width: wid,
          height: hei,
        },
        dimensions: dims,
        fluteType,
        paperConfig: {
          facePaper: paperConfig.facePaper,
          innerPaper: paperConfig.innerPaper,
          mediumPaper: paperConfig.mediumPaper,
        },
        craftConfig,
        quantity: qty,
        paperPrice: systemConfig.paperPrice,
        remark: remark || undefined,
      });
      setResult(quotation);
      showToast('success', '报价计算成功');
    } catch {
      showToast('error', '报价计算失败');
    }
  };

  const steps = [
    { key: 'customer', label: '客户信息', icon: Package },
    { key: 'template', label: '模板选择', icon: FileText },
    { key: 'size', label: '尺寸配置', icon: Ruler },
    { key: 'flute', label: '楞型用纸', icon: Layers },
    { key: 'craft', label: '工艺配置', icon: Palette },
    { key: 'quantity', label: '数量报价', icon: Hash },
  ];

  if (result) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" onClick={() => setResult(null)}>
            <ArrowRight className="h-4 w-4 rotate-180" />
            返回
          </Button>
          <h2 className="text-lg font-bold">报价结果</h2>
        </div>

        {/* Price Card */}
        <Card variant="elevated" padding="lg" className="text-center">
          <p className="text-sm text-gray-500 mb-1">单价</p>
          <p className="text-3xl font-bold text-primary-600">{formatPrice(result.unitPrice)}</p>
          <div className="mt-2 pt-3 border-t border-gray-100 flex justify-between text-sm">
            <span className="text-gray-500">总价 ({result.quantity}件)</span>
            <span className="font-semibold text-gray-900">{formatPrice(result.totalPrice)}</span>
          </div>
        </Card>

        {/* Cost Breakdown */}
        <Card padding="md">
          <h3 className="font-semibold mb-3">成本拆解</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: '纸张成本', value: result.costBreakdown.paperCost },
              { label: '损耗成本', value: result.costBreakdown.lossCost },
              { label: '工艺成本', value: result.costBreakdown.craftCost },
              { label: '利润', value: result.costBreakdown.profit },
              { label: '税费', value: result.costBreakdown.tax },
            ].map((item) => (
              <div key={item.label} className="flex justify-between">
                <span className="text-gray-500">{item.label}</span>
                <span className="font-medium">{formatPrice(item.value)}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Info */}
        <Card padding="md">
          <h3 className="font-semibold mb-3">报价信息</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">客户</span>
              <span>{result.customerName} ({CUSTOMER_LEVEL_LABELS[result.customerLevel]})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">模板</span>
              <span>{result.templateSnapshot.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">楞型</span>
              <span>{FLUTE_TYPE_LABELS[result.fluteType]}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">尺寸</span>
              <span>{result.dimensions.length}×{result.dimensions.width}×{result.dimensions.height}cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">用纸</span>
              <span>面{result.paperConfig.facePaper}g/里{result.paperConfig.innerPaper}g/芯{result.paperConfig.mediumPaper}g</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 -mx-4 px-4">
        {steps.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <>
              <button
                key={s.key}
                type="button"
                onClick={() => setStep(i)}
                className={cn(
                  'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                  isActive && 'bg-primary-500 text-white',
                  isDone && 'bg-primary-100 text-primary-600',
                  !isActive && !isDone && 'bg-gray-100 text-gray-400'
                )}
              >
                <s.icon className="h-3 w-3" />
                {s.label}
              </button>
              {i < steps.length - 1 && <div className="w-4 h-px bg-gray-200 flex-shrink-0" />}
            </>
          );
        })}
      </div>

      {/* Step 0: Customer */}
      {step === 0 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">客户信息</h2>
          <div className="space-y-4">
            <Input
              label="客户名称"
              placeholder="请输入客户名称"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
            <BottomSheetSelect
              label="客户等级"
              options={CUSTOMER_LEVEL_OPTIONS}
              value={customerLevel}
              onChange={(v) => setCustomerLevel(v as CustomerLevel)}
            />
          </div>
        </Card>
      )}

      {/* Step 1: Template */}
      {step === 1 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">模板选择</h2>
          <div className="space-y-4">
            <BottomSheetSelect
              label="选择模板"
              options={templateOptions}
              value={selectedTemplateId}
              onChange={setSelectedTemplateId}
              placeholder="请选择模板"
            />
            {selectedTemplate && (
              <div className="p-3 bg-primary-50 rounded-xl text-sm space-y-1">
                <p><span className="text-gray-500">箱型：</span>{selectedTemplate.category}</p>
                <p><span className="text-gray-500">类型：</span>{selectedTemplate.type === 'standard' ? '标准' : selectedTemplate.type === 'semi-custom' ? '半定制' : '定制'}</p>
                <p><span className="text-gray-500">说明：</span>{selectedTemplate.description}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Step 2: Dimensions */}
      {step === 2 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">尺寸配置</h2>
          <div className="space-y-4">
            <Select
              label="尺寸类型"
              options={[
                { label: '外尺寸', value: 'outer' },
                { label: '内尺寸', value: 'inner' },
              ]}
              value={dimensionType}
              onChange={(v) => setDimensionType(v as 'outer' | 'inner')}
            />
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="长(cm)"
                type="number"
                placeholder="长"
                value={dimensions.length}
                onChange={(e) => setDimensions((p) => ({ ...p, length: e.target.value }))}
              />
              <Input
                label="宽(cm)"
                type="number"
                placeholder="宽"
                value={dimensions.width}
                onChange={(e) => setDimensions((p) => ({ ...p, width: e.target.value }))}
              />
              <Input
                label="高(cm)"
                type="number"
                placeholder="高"
                value={dimensions.height}
                onChange={(e) => setDimensions((p) => ({ ...p, height: e.target.value }))}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Flute & Paper */}
      {step === 3 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">楞型与用纸</h2>
          <div className="space-y-4">
            <BottomSheetSelect
              label="楞型"
              options={FLUTE_OPTIONS}
              value={fluteType}
              onChange={(v) => setFluteType(v as FluteType)}
            />
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">面纸克重</p>
              <BottomSheetSelect
                options={PAPER_WEIGHT_OPTIONS}
                value={String(paperConfig.facePaper)}
                onChange={(v) => setPaperConfig((p) => ({ ...p, facePaper: parseInt(v) }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">里纸克重</p>
              <BottomSheetSelect
                options={PAPER_WEIGHT_OPTIONS}
                value={String(paperConfig.innerPaper)}
                onChange={(v) => setPaperConfig((p) => ({ ...p, innerPaper: parseInt(v) }))}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">芯纸克重</p>
              <BottomSheetSelect
                options={PAPER_WEIGHT_OPTIONS}
                value={String(paperConfig.mediumPaper)}
                onChange={(v) => setPaperConfig((p) => ({ ...p, mediumPaper: parseInt(v) }))}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Craft */}
      {step === 4 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">工艺配置</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">印刷方式</p>
              <Select
                options={[
                  { label: '胶印', value: 'offset' },
                  { label: '柔印', value: 'flexo' },
                ]}
                value={craftConfig.printing?.method || 'flexo'}
                onChange={(v) =>
                  setCraftConfig((p) => ({
                    ...p,
                    printing: { ...p.printing!, method: v as 'offset' | 'flexo' },
                  }))
                }
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">印刷色数</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() =>
                      setCraftConfig((p) => ({
                        ...p,
                        printing: { ...p.printing!, colors: n },
                      }))
                    }
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium border transition-colors',
                      craftConfig.printing?.colors === n
                        ? 'bg-primary-500 text-white border-primary-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'
                    )}
                  >
                    {n}色
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">特殊工艺</p>
              <div className="flex flex-wrap gap-2">
                {SPECIAL_CRAFTS.map((craft) => {
                  const active = (craftConfig.special || []).includes(craft.key);
                  return (
                    <button
                      key={craft.key}
                      type="button"
                      onClick={() => handleToggleSpecialCraft(craft.key)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm border transition-colors',
                        active
                          ? 'bg-primary-100 text-primary-700 border-primary-300'
                          : 'bg-white text-gray-600 border-gray-200'
                      )}
                    >
                      {craft.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Step 5: Quantity */}
      {step === 5 && (
        <Card padding="md">
          <h2 className="text-base font-semibold mb-4">数量与报价</h2>
          <div className="space-y-4">
            <Input
              label="数量"
              type="number"
              placeholder="请输入数量"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              suffix="件"
            />
            <Input
              label="备注"
              placeholder="备注信息（可选）"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />
          </div>
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 pb-4">
        {step > 0 && (
          <Button variant="outline" fullWidth onClick={() => setStep((s) => s - 1)}>
            上一步
          </Button>
        )}
        {step < steps.length - 1 ? (
          <Button
            fullWidth
            onClick={() => setStep((s) => s + 1)}
            disabled={step === 0 && !customerName}
          >
            下一步
          </Button>
        ) : (
          <Button fullWidth onClick={handleCalculate}>
            <Calculator className="h-4 w-4" />
            计算报价
          </Button>
        )}
      </div>

      <ConfirmDialog />
    </div>
  );
}
