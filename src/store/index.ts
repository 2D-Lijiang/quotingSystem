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
  FluteType,
  PaperConfig,
  CraftConfig,
} from '@/types';

// 默认系统配置
const defaultConfig: SystemConfig = {
  paperPrice: 2.8,
  defaultLossRate: 0.05,
  defaultTaxRate: 0.13,
  profitRates: {
    normal: 0.15,
    longterm: 0.10,
    vip: 0.08,
  },
};

// 默认模板数据
const defaultTemplates: Template[] = [
  {
    id: 'template-color-printing-box',
    name: '通用彩印箱',
    type: 'standard',
    category: '外箱',
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
      profitRate: defaultConfig.profitRates,
      lossRate: defaultConfig.defaultLossRate,
      taxRate: defaultConfig.defaultTaxRate,
    },
    description: '通用彩印箱模板，适用于各类产品包装',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-standard-outer',
    name: '标准外箱',
    type: 'standard',
    category: '外箱',
    formula: {
      area: '(length + width + jointAllowance) * (width + 2 * height + trimAllowance) / 10000',
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
      profitRate: defaultConfig.profitRates,
      lossRate: defaultConfig.defaultLossRate,
      taxRate: defaultConfig.defaultTaxRate,
    },
    description: '标准外箱计算模板,适用于常规运输包装',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-standard-inner',
    name: '标准内盒',
    type: 'standard',
    category: '内盒',
    formula: {
      area: '(length + width + 8) * (width + height + 6) / 10000',
      cost: 'area * paperPrice * (1 + lossRate)',
    },
    parameters: [
      {
        name: 'jointAllowance',
        label: '接头余量',
        type: 'number',
        default: 8,
        unit: 'cm',
        validation: { min: 0, max: 20, required: true },
      },
    ],
    rules: {
      profitRate: defaultConfig.profitRates,
      lossRate: defaultConfig.defaultLossRate,
      taxRate: defaultConfig.defaultTaxRate,
    },
    description: '标准内盒计算模板,适用于产品内包装',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'template-aircraft-box',
    name: '飞机盒',
    type: 'standard',
    category: '飞机盒',
    formula: {
      area: '(length + 4 * height + 7) * (2 * width + 3 * height + 5) / 10000',
      cost: 'area * paperPrice * (1 + lossRate)',
    },
    parameters: [
      {
        name: 'wingCoefficient',
        label: '翼长系数',
        type: 'number',
        default: 1.2,
        validation: { min: 0.8, max: 2.5, required: true },
      },
    ],
    rules: {
      profitRate: defaultConfig.profitRates,
      lossRate: defaultConfig.defaultLossRate,
      taxRate: defaultConfig.defaultTaxRate,
    },
    description: '飞机盒计算模板,适用于电商快递包装',
    version: '1.0.0',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface AppState {
  // 模板相关
  templates: Template[];
  currentTemplate: Template | null;

  // 报价相关
  quotations: Quotation[];
  currentQuotation: Quotation | null;

  // 报价草稿
  quotationDraft: {
    customerName: string;
    customerLevel: CustomerLevel;
    selectedTemplateId: string | null;
    dimensions: Dimensions;
    fluteType: FluteType;
    paperConfig: PaperConfig;
    craftConfig: CraftConfig;
    quantity: number;
    remark: string;
  };

  // 客户相关
  customers: Customer[];

  // 配置
  config: SystemConfig;

  // UI状态
  isLoading: boolean;
  toast: {
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null;

  // 模板操作
  addTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (id: string, template: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  setCurrentTemplate: (template: Template | null) => void;

  // 报价草稿操作
  updateQuotationDraft: (draft: Partial<AppState['quotationDraft']>) => void;
  resetQuotationDraft: () => void;
  copyQuotationToDraft: (quotation: Quotation) => void;

  // 报价操作
  addQuotation: (quotation: Omit<Quotation, 'id' | 'createdAt'>) => void;
  deleteQuotation: (id: string) => void;
  setCurrentQuotation: (quotation: Quotation | null) => void;

  // 客户操作
  addCustomer: (customer: Omit<Customer, 'id' | 'quotationCount'>) => void;
  updateCustomer: (id: string, customer: Partial<Customer>) => void;
  getOrCreateCustomer: (name: string, level: CustomerLevel) => Customer;

  // 配置操作
  updateConfig: (config: Partial<SystemConfig>) => void;

  // UI操作
  showToast: (message: string, type: 'success' | 'error' | 'warning') => void;
  hideToast: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 初始状态
      templates: defaultTemplates,
      currentTemplate: null,
      quotations: [],
      currentQuotation: null,
      quotationDraft: {
        customerName: '',
        customerLevel: 'normal',
        selectedTemplateId: 'template-color-printing-box', // 默认选择彩印箱
        dimensions: {
          length: 40,
          width: 30,
          height: 20,
          type: 'outer',
        },
        fluteType: 'B',
        paperConfig: {
          facePaper: 250,
          innerPaper: 250,
          mediumPaper: 150,
        },
        craftConfig: {
          printing: { colors: 4, method: 'offset' },
          special: [],
        },
        quantity: 1000,
        remark: '',
      },
      customers: [],
      config: defaultConfig,
      isLoading: false,
      toast: null,

      // 模板操作
      addTemplate: (templateData) => {
        const template: Template = {
          ...templateData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          templates: [...state.templates, template],
        }));
      },

      updateTemplate: (id, templateData) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id
              ? { ...t, ...templateData, updatedAt: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      setCurrentTemplate: (template) => {
        set({ currentTemplate: template });
      },

      // 报价操作
      addQuotation: (quotationData) => {
        const quotation: Quotation = {
          ...quotationData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          quotations: [quotation, ...state.quotations],
        }));

        // 更新客户信息
        const { customers } = get();
        const existingCustomer = customers.find(
          (c) => c.name === quotationData.customerName
        );
        if (existingCustomer) {
          get().updateCustomer(existingCustomer.id, {
            quotationCount: existingCustomer.quotationCount + 1,
            lastQuotation: quotation.createdAt,
          });
        } else {
          get().addCustomer({
            name: quotationData.customerName,
            level: quotationData.customerLevel,
            lastQuotation: quotation.createdAt,
          });
        }
      },

      deleteQuotation: (id) => {
        set((state) => ({
          quotations: state.quotations.filter((q) => q.id !== id),
        }));
      },

      setCurrentQuotation: (quotation) => {
        set({ currentQuotation: quotation });
      },

      // 客户操作
      addCustomer: (customerData) => {
        const customer: Customer = {
          ...customerData,
          id: uuidv4(),
          quotationCount: 0,
        };
        set((state) => ({
          customers: [...state.customers, customer],
        }));
        return customer;
      },

      updateCustomer: (id, customerData) => {
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, ...customerData } : c
          ),
        }));
      },

      getOrCreateCustomer: (name, level) => {
        const { customers } = get();
        const existingCustomer = customers.find((c) => c.name === name);
        if (existingCustomer) {
          return existingCustomer;
        }
        const newCustomer: Customer = {
          id: uuidv4(),
          name,
          level,
          quotationCount: 0,
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
        }));
        return newCustomer;
      },

      // 配置操作
      updateConfig: (configData) => {
        set((state) => ({
          config: { ...state.config, ...configData },
        }));
      },

      // UI操作
      showToast: (message, type) => {
        set({ toast: { message, type } });
        setTimeout(() => {
          set({ toast: null });
        }, 3000);
      },

      hideToast: () => {
        set({ toast: null });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      // 报价草稿操作
      updateQuotationDraft: (draft) => {
        set((state) => ({
          quotationDraft: { ...state.quotationDraft, ...draft },
        }));
      },

      resetQuotationDraft: () => {
        set({
          quotationDraft: {
            customerName: '',
            customerLevel: 'normal',
            selectedTemplateId: 'template-color-printing-box',
            dimensions: {
              length: 40,
              width: 30,
              height: 20,
              type: 'outer',
            },
            fluteType: 'B',
            paperConfig: {
              facePaper: 250,
              innerPaper: 250,
              mediumPaper: 150,
            },
            craftConfig: {
              printing: { colors: 4, method: 'offset' },
              special: [],
            },
            quantity: 1000,
            remark: '',
          },
        });
      },

      copyQuotationToDraft: (quotation) => {
        set({
          quotationDraft: {
            customerName: quotation.customerName,
            customerLevel: quotation.customerLevel,
            selectedTemplateId: quotation.templateId,
            dimensions: quotation.dimensions,
            fluteType: quotation.fluteType,
            paperConfig: quotation.paperConfig,
            craftConfig: quotation.craftConfig,
            quantity: quotation.quantity,
            remark: quotation.remark || '',
          },
        });
      },
    }),
    {
      name: 'carton-quotation-storage',
      partialize: (state) => ({
        templates: state.templates,
        quotations: state.quotations,
        customers: state.customers,
        config: state.config,
        quotationDraft: state.quotationDraft,
      }),
    }
  )
);
