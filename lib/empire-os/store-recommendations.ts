import { empireOsAdmin } from './supabase-admin';

export type StoreRecommendationInput = {
  businessId: string;
  skillId: number;
  title: string;
  description: string;
  action?: string | null;
  estimatedImpact: 'high' | 'medium' | 'low';
  metadata?: Record<string, unknown>;
};

export async function storeEmpireOsRecommendation(input: StoreRecommendationInput): Promise<boolean> {
  const supabase = empireOsAdmin();
  if (!supabase) return false;
  if (input.skillId < 1 || input.skillId > 33) return false;

  const { error } = await (supabase as any).from('empire_os_recommendations').insert({
    business_id: input.businessId,
    skill_id: input.skillId,
    title: input.title,
    description: input.description,
    action: input.action ?? null,
    estimated_impact: input.estimatedImpact,
    metadata: input.metadata ?? {},
    status: 'pending',
  });

  if (error) {
    console.warn('[empire-os] store recommendation', error.message);
    return false;
  }
  return true;
}
