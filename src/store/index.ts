import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type {
  Template,
  Quotation,
  Customer,
  SystemConfig,
  CustomerLevel,
  Dimensions,
  PaperConfig,
  CraftConfig,
  FluteType,
  QuotationParameters,
  BusinessRules,
  ParameterDefinition,
  Formula,
} from '@/types';
import { calculateCost, calculateUnitPrice, calculateTotalPrice } from '@/utils/calculator';

// ========== 默认模板数据 ==========

const defaultRules: BusinessRules = {
  profitRate: { normal: 0.25, longterm: 0.15, vip: 0.08 },
  lossRate: 0.05,
  taxRate: 0.13,
};

const standardOuterBoxParams: ParameterDefinition[] = [
  {
    name: 'length',
    label: '长(cm)',
    type: 'number',
    default: 40,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'width',
    label: '宽(cm)',
    type: 'number',
    default: 30,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'height',
    label: '高(cm)',
    type: 'number',
    default: 20,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'jointAllowance',
    label: '接合余量(mm)',
    type: 'number',
    default: 5,
    unit: 'mm',
    validation: { min: 0, max: 50, required: false },
  },
  {
    name: 'trimAllowance',
    label: '修边余量(mm)',
    type: 'number',
    default: 3,
    unit: 'mm',
    validation: { min: 0, max: 50, required: false },
  },
];

const standardInnerBoxParams: ParameterDefinition[] = [
  {
    name: 'length',
    label: '长(cm)',
    type: 'number',
    default: 30,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'width',
    label: '宽(cm)',
    type: 'number',
    default: 20,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'height',
    label: '高(cm)',
    type: 'number',
    default: 15,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
];

const airplaneBoxParams: ParameterDefinition[] = [
  {
    name: 'length',
    label: '长(cm)',
    type: 'number',
    default: 25,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'width',
    label: '宽(cm)',
    type: 'number',
    default: 15,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
  {
    name: 'height',
    label: '高(cm)',
    type: 'number',
    default: 8,
    unit: 'cm',
    validation: { min: 5, max: 300, required: true },
  },
];

const defaultFormula: Formula = {
  area: '根据箱型自动计算',
  weight: '面纸+里纸+瓦楞纸*伸长系数',
  cost: '纸价+损耗+工艺+利润+税费',
};

const now = new Date().toISOString();

const defaultTemplates: Template[] = [
  {
    id: 'tpl-standard-outer',
    name: '标准外箱',
    type: 'standard',
    category: '外箱',
    formula: defaultFormula,
    parameters: standardOuterBoxParams,
    rules: defaultRules,
    description: '标准外箱模板，适用于常规纸箱报价',
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-standard-inner',
    name: '标准内盒',
    type: 'standard',
    category: '内盒',
    formula: defaultFormula,
    parameters: standardInnerBoxParams,
    rules: defaultRules,
    description: '标准内盒模板，适用于内包装报价',
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'tpl-airplane',
    name: '飞机盒',
    type: 'standard',
    category: '飞机盒',
    formula: defaultFormula,
    parameters: airplaneBoxParams,
    rules: defaultRules,
    description: '飞机盒模板，适用于电商包装盒报价',
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  },
];

const defaultSystemConfig: SystemConfig = {
  paperPrice: 50,
  defaultLossRate: 0.05,
  defaultTaxRate: 0.13,
  profitRates: { normal: 0.25, longterm: 0.15, vip: 0.08 },
};

// ========== UI 状态类型 ==========

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  id: string;
  type: ToastType;
  message: string;
}

interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'default' | 'danger';
  onConfirm: () => void;
  onCancel?: () => void;
}

// ========== Store 接口 ==========

interface AppState {
  // 模板管理
  templates: Template[];
  selectedTemplateId: string | null;
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (id: string | null) => void;
  getTemplateById: (id: string) => Template | undefined;

  // 报价管理
  quotations: Quotation[];
  currentQuotation: Quotation | null;
  createQuotation: (params: {
    customerId: string;
    customerName: string;
    customerLevel: CustomerLevel;
    templateId: string;
    parameters: QuotationParameters;
    dimensions: Dimensions;
    fluteType: FluteType;
    paperConfig: PaperConfig;
    craftConfig: CraftConfig;
    quantity: number;
    paperPrice: number;
    remark?: string;
  }) => Quotation;
  deleteQuotation: (id: string) => void;
  setCurrentQuotation: (quotation: Quotation | null) => void;

  // 客户管理
  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'quotationCount'>) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  getCustomerById: (id: string) => Customer | undefined;

  // 系统配置
  systemConfig: SystemConfig;
  updateSystemConfig: (updates: Partial<SystemConfig>) => void;

  // UI 状态
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Toast
  toast: ToastState | null;
  showToast: (type: ToastType, message: string) => void;
  hideToast: () => void;

  // Modal
  confirmDialog: ConfirmDialogState | null;
  showConfirmDialog: (options: Omit<ConfirmDialogState, 'open'>) => void;
  hideConfirmDialog: () => void;
}

// ========== Store 创建 ==========

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 模板管理
      templates: defaultTemplates,
      selectedTemplateId: null,

      addTemplate: (templateData) => {
        const now = new Date().toISOString();
        const newTemplate: Template = {
          ...templateData,
          id: uuidv4(),
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          templates: [...state.templates, newTemplate],
          selectedTemplateId: newTemplate.id,
        }));
      },

      updateTemplate: (id, updates) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplateId: state.selectedTemplateId === id ? null : state.selectedTemplateId,
        }));
      },

      selectTemplate: (id) => {
        set({ selectedTemplateId: id });
      },

      getTemplateById: (id) => {
        return get().templates.find((t) => t.id === id);
      },

      // 报价管理
      quotations: [],
      currentQuotation: null,

      createQuotation: ({
        customerId,
        customerName,
        customerLevel,
        templateId,
        parameters,
        dimensions,
        fluteType,
        paperConfig,
        craftConfig,
        quantity,
        paperPrice,
        remark,
      }) => {
        const template = get().getTemplateById(templateId);
        if (!template) {
          throw new Error('模板不存在');
        }

        const costBreakdown = calculateCost(
          dimensions,
          fluteType,
          paperConfig,
          craftConfig,
          customerLevel,
          template,
          paperPrice
        );

        const unitPrice = calculateUnitPrice(costBreakdown);
        const totalPrice = calculateTotalPrice(unitPrice, quantity);

        const quotation: Quotation = {
          id: uuidv4(),
          customerId,
          customerName,
          customerLevel,
          templateId,
          templateSnapshot: template,
          parameters,
          dimensions,
          fluteType,
          paperConfig,
          craftConfig,
          quantity,
          costBreakdown,
          unitPrice,
          totalPrice,
          paperPrice,
          createdAt: new Date().toISOString(),
          remark,
        };

        set((state) => ({
          quotations: [quotation, ...state.quotations],
          currentQuotation: quotation,
        }));

        // 更新客户的报价统计
        const customers = get().customers;
        const customerIndex = customers.findIndex((c) => c.id === customerId);
        if (customerIndex !== -1) {
          const updatedCustomers = [...customers];
          updatedCustomers[customerIndex] = {
            ...updatedCustomers[customerIndex],
            quotationCount: updatedCustomers[customerIndex].quotationCount + 1,
            lastQuotation: new Date().toISOString(),
          };
          set({ customers: updatedCustomers });
        }

        return quotation;
      },

      deleteQuotation: (id) => {
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
          currentQuotation: state.currentQuotation?.id === id ? null : state.currentQuotation,
        }));
      },

      setCurrentQuotation: (quotation) => {
        set({ currentQuotation: quotation });
      },

      // 客户管理
      customers: [],

      addCustomer: (customerData) => {
        const newCustomer: Customer = {
          ...customerData,
          id: uuidv4(),
          quotationCount: 0,
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((c) => c.id !== id),
        }));
      },

      getCustomerById: (id) => {
        return get().customers.find((c) => c.id === id);
      },

      // 系统配置
      systemConfig: defaultSystemConfig,

      updateSystemConfig: (updates) => {
        set((state) => ({
          systemConfig: { ...state.systemConfig, ...updates },
        }));
      },

      // UI 状态
      activeTab: 'quotations',
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      isDarkMode: false,
      toggleDarkMode: () => {
        set((state) => ({ isDarkMode: !state.isDarkMode }));
      },

      // Toast
      toast: null,
      showToast: (type, message) => {
        const id = uuidv4();
        set({ toast: { id, type, message } });
        setTimeout(() => set({ toast: null }), 3000);
      },
      hideToast: () => {
        set({ toast: null });
      },

      // Modal
      confirmDialog: null,
      showConfirmDialog: (options) => {
        set({ confirmDialog: { ...options, open: true } });
      },
      hideConfirmDialog: () => {
        set({ confirmDialog: null });
      },
    }),
    {
      name: 'carton-quoting-storage',
    }
  )
);
