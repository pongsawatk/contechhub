export const FEATURES = {
  pricing: true,
  calculator: true,
  kpi: true,
  revenue: true,
  chatbot: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;