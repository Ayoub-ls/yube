'use server';

import { createClient } from '../../lib/supabase/server';
import { redirect } from 'next/navigation';
import { checkIsAdmin } from '../../lib/data';
import { revalidatePath } from 'next/cache';
import { PLANS } from '../../lib/plans';

/**
 * Every action in this file re-checks is_admin() itself, server-side,
 * rather than trusting that the caller already passed through the admin
 * page's own check. RLS also enforces this at the database layer via the
 * "admin update all pages" / "admin update all clients" policies — this
 * is a defense-in-depth check, not the only line of defense.
 */
async function requireAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const isAdmin = await checkIsAdmin(supabase, user.id);
  if (!isAdmin) redirect('/dashboard');

  return supabase;
}

export async function approvePage(pageId: string) {
  const supabase = await requireAdmin();

  const { error } = await supabase
    .from('landing_pages')
    .update({
      status: 'live',
      published_at: new Date().toISOString(),
      rejection_reason: null,
    })
    .eq('id', pageId);

  if (error) console.error('Error approving page:', error);
  revalidatePath('/admin');
}

export async function rejectPage(prevState: any, formData: FormData) {
  const supabase = await requireAdmin();

  const pageId = formData.get('page_id') as string;
  const reason = (formData.get('reason') as string || '').trim();

  if (!pageId || !reason) {
    return { error: 'يرجى كتابة سبب الرفض' };
  }

  const { error } = await supabase
    .from('landing_pages')
    .update({
      status: 'rejected',
      rejection_reason: reason,
    })
    .eq('id', pageId);

  if (error) {
    console.error('Error rejecting page:', error);
    return { error: 'فشل تسجيل الرفض: ' + error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function updateClientPlan(prevState: any, formData: FormData) {
  const supabase = await requireAdmin();

  const clientId = formData.get('client_id') as string;
  const plan = formData.get('plan') as string;
  const extendDaysRaw = formData.get('extend_days') as string;
  const extendDays = extendDaysRaw ? parseInt(extendDaysRaw, 10) : 0;

  if (!clientId || !plan) {
    return { error: 'بيانات غير صحيحة' };
  }

  if (!PLANS[plan] || !PLANS[plan].available) {
    return { error: 'خطة غير صالحة' };
  }

  const update: Record<string, any> = { plan };

  if (extendDays > 0) {
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + extendDays);
    update.plan_expires_at = newExpiry.toISOString();
  }

  const { error } = await supabase
    .from('clients')
    .update(update)
    .eq('id', clientId);

  if (error) {
    console.error('Error updating client plan:', error);
    return { error: 'فشل تحديث الخطة: ' + error.message };
  }

  revalidatePath('/admin');
  return { success: true };
}

export async function toggleClientStatus(clientId: string, newStatus: 'active' | 'suspended') {
  const supabase = await requireAdmin();

  await supabase
    .from('clients')
    .update({ status: newStatus })
    .eq('id', clientId);

  revalidatePath('/admin');
}
