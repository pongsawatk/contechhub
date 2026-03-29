export const FEATURES = {
  pricing: true,
  calculator: true,
  kpi: true,
  revenue: true,
  pipeline: true,
  chatbot: true,
  playbook: true,
} as const;

export type FeatureKey = keyof typeof FEATURES;
