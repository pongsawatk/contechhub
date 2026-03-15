export const FEATURES = {
  pricing: true,
  calculator: true,
  kpi: false,
  revenue: false,
  chatbot: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;
