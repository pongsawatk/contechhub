export const FEATURES = {
  pricing: true,
  calculator: true,
  kpi: true,
  revenue: true,
  pipeline: true,
  chatbot: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;
