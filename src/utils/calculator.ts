import type {
  Dimensions,
  FluteType,
  PaperConfig,
  CraftConfig,
  CostBreakdown,
  Template,
  CustomerLevel,
  FLUTE_COEFFICIENTS,
} from '@/types';

// 楞型伸长系数
const FLUTE_COEF: Record<FluteType, number> = {
  A: 1.53,
  B: 1.36,
  C: 1.50,
  E: 1.27,
  AB: 1.53 * 1.36,
  BC: 1.50 * 1.36,
};

// 计算面积
export function calculateArea(
  dimensions: Dimensions,
  template: Template
): number {
  const { length, width, height } = dimensions;

  // 获取模板参数
  const jointAllowance = getParameterValue(template, 'jointAllowance', 5);
  const trimAllowance = getParameterValue(template, 'trimAllowance', 3);

  // 根据箱型分类使用不同的公式
  switch (template.category) {
    case '外箱':
      return ((length + width + jointAllowance) * (width + 2 * height + trimAllowance)) / 10000;
    case '内盒':
      return ((length + width + 8) * (width + height + 6)) / 10000;
    case '飞机盒':
      return ((length + 4 * height + 7) * (2 * width + 3 * height + 5)) / 10000;
    case '天地盖':
      return ((2 * height + width + 2.54) * (2 * height + length + 2.54) * 2 * 0.155) / 1000;
    default:
      return ((length + width + jointAllowance) * (width + 2 * height + trimAllowance)) / 10000;
  }
}

// 获取模板参数值
function getParameterValue(
  template: Template,
  paramName: string,
  defaultValue: number
): number {
  const param = template.parameters.find((p) => p.name === paramName);
  return param ? (param.default as number) : defaultValue;
}

// 计算纸料成本
export function calculatePaperCost(
  area: number,
  paperPrice: number
): number {
  return area * paperPrice;
}

// 计算损耗成本
export function calculateLossCost(
  paperCost: number,
  lossRate: number
): number {
  return paperCost * lossRate;
}

// 计算工艺成本
export function calculateCraftCost(craftConfig: CraftConfig): number {
  let cost = 0;

  // 印刷费用
  if (craftConfig.printing) {
    const { colors, method } = craftConfig.printing;
    const pricePerColor = method === 'offset' ? 0.1 : 0.08;
    cost += colors * pricePerColor;
  }

  // 特殊工艺
  if (craftConfig.special) {
    craftConfig.special.forEach((craft) => {
      switch (craft) {
        case 'foil':
          cost += 0.5;
          break;
        case 'lamination':
          cost += 0.3;
          break;
        case 'embossing':
          cost += 0.4;
          break;
        case 'spotUV':
          cost += 0.35;
          break;
      }
    });
  }

  return cost;
}

// 获取利润率
export function getProfitRate(
  customerLevel: CustomerLevel,
  template: Template
): number {
  return template.rules.profitRate[customerLevel];
}

// 计算完整成本
export function calculateCost(
  dimensions: Dimensions,
  fluteType: FluteType,
  paperConfig: PaperConfig,
  craftConfig: CraftConfig,
  customerLevel: CustomerLevel,
  template: Template,
  paperPrice: number
): CostBreakdown {
  // 计算面积
  const area = calculateArea(dimensions, template);

  // 纸料成本
  const paperCost = calculatePaperCost(area, paperPrice);

  // 损耗成本
  const lossCost = calculateLossCost(paperCost, template.rules.lossRate);

  // 工艺成本
  const craftCost = calculateCraftCost(craftConfig);

  // 小计
  const subtotal = paperCost + lossCost + craftCost;

  // 利润
  const profitRate = getProfitRate(customerLevel, template);
  const profit = subtotal * profitRate;

  // 税费
  const tax = (subtotal + profit) * template.rules.taxRate;

  // 总计
  const total = subtotal + profit + tax;

  return {
    paperCost: Math.round(paperCost * 100) / 100,
    lossCost: Math.round(lossCost * 100) / 100,
    craftCost: Math.round(craftCost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// 计算单价
export function calculateUnitPrice(costBreakdown: CostBreakdown): number {
  return costBreakdown.total;
}

// 计算总价
export function calculateTotalPrice(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

// 计算纸箱重量(可选)
export function calculateWeight(
  area: number,
  paperConfig: PaperConfig,
  fluteType: FluteType
): number {
  const { facePaper, innerPaper, mediumPaper } = paperConfig;
  const fluteCoef = FLUTE_COEF[fluteType];

  // 重量 = 面纸 + 里纸 + 芯纸 * 伸长系数
  const weightPerSqm = facePaper + innerPaper + mediumPaper * fluteCoef;

  return Math.round(area * weightPerSqm) / 1000; // 转换为kg
}

// 验证尺寸
export function validateDimensions(dimensions: Dimensions): {
  valid: boolean;
  message?: string;
} {
  const { length, width, height } = dimensions;

  if (length <= 0 || width <= 0 || height <= 0) {
    return { valid: false, message: '尺寸必须大于0' };
  }

  if (length > 300 || width > 300 || height > 300) {
    return { valid: false, message: '尺寸不能超过300cm' };
  }

  return { valid: true };
}

// 验证数量
export function validateQuantity(quantity: number): {
  valid: boolean;
  message?: string;
} {
  if (quantity <= 0) {
    return { valid: false, message: '数量必须大于0' };
  }

  if (quantity > 1000000) {
    return { valid: false, message: '数量不能超过100万' };
  }

  return { valid: true };
}

// 格式化金额
export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

// 格式化面积
export function formatArea(area: number): string {
  return `${area.toFixed(4)}㎡`;
}
