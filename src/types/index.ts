// 客户等级
export type CustomerLevel = 'normal' | 'longterm' | 'vip';

// 楞型
export type FluteType = 'A' | 'B' | 'C' | 'E' | 'AB' | 'BC';

// 模板类型
export type TemplateType = 'standard' | 'semi-custom' | 'custom';

// 箱型分类
export type BoxCategory = '外箱' | '内盒' | '天地盖' | '飞机盒' | '其他';

// 尺寸类型
export type DimensionType = 'outer' | 'inner';

// 印刷方式
export type PrintingMethod = 'offset' | 'flexo';

// 特殊工艺
export type SpecialCraft = 'foil' | 'lamination' | 'embossing' | 'spotUV';

// 参数定义
export interface ParameterDefinition {
  name: string;
  label: string;
  type: 'number' | 'string' | 'select';
  default: number | string;
  unit?: string;
  options?: string[];
  validation: {
    min?: number;
    max?: number;
    required: boolean;
  };
}

// 计算公式
export interface Formula {
  area: string;
  weight?: string;
  cost: string;
}

// 商业规则
export interface BusinessRules {
  profitRate: {
    normal: number;
    longterm: number;
    vip: number;
  };
  lossRate: number;
  taxRate: number;
}

// 模板
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  category: BoxCategory;
  formula: Formula;
  parameters: ParameterDefinition[];
  rules: BusinessRules;
  description: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

// 尺寸参数
export interface Dimensions {
  length: number;
  width: number;
  height: number;
  type: DimensionType;
}

// 用纸配置
export interface PaperConfig {
  facePaper: number;
  innerPaper: number;
  mediumPaper: number;
}

// 印刷配置
export interface PrintingConfig {
  colors: number;
  method: PrintingMethod;
}

// 工艺配置
export interface CraftConfig {
  printing?: PrintingConfig;
  special?: SpecialCraft[];
}

// 成本拆解
export interface CostBreakdown {
  paperCost: number;
  lossCost: number;
  craftCost: number;
  profit: number;
  tax: number;
  total: number;
}

// 报价参数
export interface QuotationParameters {
  [key: string]: number | string;
}

// 报价记录
export interface Quotation {
  id: string;
  customerId: string;
  customerName: string;
  customerLevel: CustomerLevel;
  templateId: string;
  templateSnapshot: Template;
  parameters: QuotationParameters;
  dimensions: Dimensions;
  fluteType: FluteType;
  paperConfig: PaperConfig;
  craftConfig: CraftConfig;
  quantity: number;
  costBreakdown: CostBreakdown;
  unitPrice: number;
  totalPrice: number;
  paperPrice: number;
  createdAt: string;
  remark?: string;
}

// 客户
export interface Customer {
  id: string;
  name: string;
  level: CustomerLevel;
  contact?: string;
  phone?: string;
  quotationCount: number;
  lastQuotation?: string;
}

// 系统配置
export interface SystemConfig {
  paperPrice: number;
  defaultLossRate: number;
  defaultTaxRate: number;
  profitRates: {
    normal: number;
    longterm: number;
    vip: number;
  };
}

// 楞型伸长系数
export const FLUTE_COEFFICIENTS: Record<FluteType, number> = {
  A: 1.53,
  B: 1.36,
  C: 1.50,
  E: 1.27,
  AB: 1.53 * 1.36,
  BC: 1.50 * 1.36,
};

// 客户等级标签
export const CUSTOMER_LEVEL_LABELS: Record<CustomerLevel, string> = {
  normal: '普通客户',
  longterm: '长期客户',
  vip: '大客户',
};

// 楞型标签
export const FLUTE_TYPE_LABELS: Record<FluteType, string> = {
  A: 'A楞',
  B: 'B楞',
  C: 'C楞',
  E: 'E楞',
  AB: 'AB楞',
  BC: 'BC楞',
};

// 箱型分类标签
export const BOX_CATEGORY_LABELS: Record<BoxCategory, string> = {
  '外箱': '外箱',
  '内盒': '内盒',
  '天地盖': '天地盖',
  '飞机盒': '飞机盒',
  '其他': '其他',
};
