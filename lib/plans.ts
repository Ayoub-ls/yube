export interface PlanConfig {
  id: string;
  label: string;
  priceDA: number;
  maxPages: number | null; // null = unlimited
  // Agency exists on the pricing page as a deliberate anchor to make the
  // other tiers look cheap by comparison — it's not actually sold yet.
  // Keeping it out of self-serve flows (there are none yet; plans are
  // admin-assigned) is enough for now, this flag is just documentation.
  available: boolean;
}

export const PLANS: Record<string, PlanConfig> = {
  trial: { id: 'trial', label: 'تجريبي', priceDA: 0, maxPages: 1, available: true },
  basic: { id: 'basic', label: 'أساسي', priceDA: 3000, maxPages: 5, available: true },
  pro: { id: 'pro', label: 'احترافي', priceDA: 5000, maxPages: null, available: true },
  agency: { id: 'agency', label: 'وكالة', priceDA: 15000, maxPages: null, available: false },
};

export const TRIAL_DAYS = 14;

export function getPlanConfig(planId: string): PlanConfig {
  return PLANS[planId] || PLANS.trial;
}

/**
 * Returns null if the client can create another page, or a
 * user-facing Arabic error string explaining why they can't.
 * Single source of truth for this check — used by createLandingPage,
 * and safe to reuse anywhere else that needs the same logic (e.g. a
 * future "duplicate page" action).
 */
export function checkPlanAllowsNewPage(
  client: { plan: string; plan_expires_at: string | null },
  currentPageCount: number
): string | null {
  const plan = getPlanConfig(client.plan);

  // Applies to every plan, not just trial. Billing is manual right now
  // (client pays via BaridiMob, admin confirms and sets an expiry) — if
  // expiry only gated trial, a basic/pro client would stay on that plan
  // forever even after their paid period lapsed, with no actual
  // enforcement mechanism short of the admin remembering to check dates
  // and downgrade people by hand.
  if (client.plan_expires_at) {
    const expired = new Date(client.plan_expires_at).getTime() < Date.now();
    if (expired) {
      return client.plan === 'trial'
        ? 'انتهت فترتك التجريبية. يرجى ترقية خطتك للمتابعة في إنشاء صفحات جديدة.'
        : `انتهت صلاحية خطة "${plan.label}". يرجى تجديد اشتراكك للمتابعة في إنشاء صفحات جديدة.`;
    }
  }

  if (plan.maxPages !== null && currentPageCount >= plan.maxPages) {
    return `لقد وصلت للحد الأقصى لعدد الصفحات في خطتك الحالية (${plan.maxPages} ${
      plan.maxPages === 1 ? 'صفحة واحدة' : 'صفحات'
    }). يرجى ترقية خطتك لإنشاء المزيد.`;
  }

  return null;
}
