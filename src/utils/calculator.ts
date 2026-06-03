import type {
  Dimensions,
  FluteType,
  PaperConfig,
  CraftConfig,
  CostBreakdown,
  Template,
  CustomerLevel,
} from '@/types';

const FLUTE_COEF: Record<FluteType, number> = {
  A: 1.53,
  B: 1.36,
  C: 1.50,
  E: 1.27,
  AB: 1.53 * 1.36,
  BC: 1.50 * 1.36,
};

export function calculateArea(dimensions: Dimensions, template: Template): number {
  const { length, width, height } = dimensions;
  const jointAllowance = getParameterValue(template, 'jointAllowance', 5);
  const trimAllowance = getParameterValue(template, 'trimAllowance', 3);

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

function getParameterValue(template: Template, paramName: string, defaultValue: number): number {
  const param = template.parameters.find((p) => p.name === paramName);
  return param ? (param.default as number) : defaultValue;
}

export function calculatePaperCost(area: number, paperPrice: number): number {
  return area * paperPrice;
}

export function calculateLossCost(paperCost: number, lossRate: number): number {
  return paperCost * lossRate;
}

export function calculateCraftCost(craftConfig: CraftConfig): number {
  let cost = 0;
  if (craftConfig.printing) {
    const { colors, method } = craftConfig.printing;
    const pricePerColor = method === 'offset' ? 0.1 : 0.08;
    cost += colors * pricePerColor;
  }
  if (craftConfig.special) {
    craftConfig.special.forEach((craft) => {
      switch (craft) {
        case 'foil': cost += 0.5; break;
        case 'lamination': cost += 0.3; break;
        case 'embossing': cost += 0.4; break;
        case 'spotUV': cost += 0.35; break;
      }
    });
  }
  return cost;
}

export function getProfitRate(customerLevel: CustomerLevel, template: Template): number {
  return template.rules.profitRate[customerLevel];
}

export function calculateCost(
  dimensions: Dimensions,
  _fluteType: FluteType,
  _paperConfig: PaperConfig,
  craftConfig: CraftConfig,
  customerLevel: CustomerLevel,
  template: Template,
  paperPrice: number
): CostBreakdown {
  const area = calculateArea(dimensions, template);
  const paperCost = calculatePaperCost(area, paperPrice);
  const lossCost = calculateLossCost(paperCost, template.rules.lossRate);
  const craftCost = calculateCraftCost(craftConfig);
  const subtotal = paperCost + lossCost + craftCost;
  const profitRate = getProfitRate(customerLevel, template);
  const profit = subtotal * profitRate;
  const tax = (subtotal + profit) * template.rules.taxRate;
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

export function calculateUnitPrice(costBreakdown: CostBreakdown): number {
  return costBreakdown.total;
}

export function calculateTotalPrice(unitPrice: number, quantity: number): number {
  return Math.round(unitPrice * quantity * 100) / 100;
}

export function calculateWeight(area: number, paperConfig: PaperConfig, fluteType: FluteType): number {
  const { facePaper, innerPaper, mediumPaper } = paperConfig;
  const fluteCoef = FLUTE_COEF[fluteType];
  const weightPerSqm = facePaper + innerPaper + mediumPaper * fluteCoef;
  return Math.round(area * weightPerSqm) / 1000;
}

export function validateDimensions(dimensions: Dimensions): { valid: boolean; message?: string } {
  const { length, width, height } = dimensions;
  if (length <= 0 || width <= 0 || height <= 0) {
    return { valid: false, message: '尺寸必须大于0' };
  }
  if (length > 300 || width > 300 || height > 300) {
    return { valid: false, message: '尺寸不能超过300cm' };
  }
  return { valid: true };
}

export function validateQuantity(quantity: number): { valid: boolean; message?: string } {
  if (quantity <= 0) return { valid: false, message: '数量必须大于0' };
  if (quantity > 1000000) return { valid: false, message: '数量不能超过100万' };
  return { valid: true };
}

export function formatPrice(price: number): string {
  return `¥${price.toFixed(2)}`;
}

export function formatArea(area: number): string {
  return `${area.toFixed(4)}㎡`;
}
