'use client';

import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { updateClientPlan } from '../../admin/actions';
import { PLANS } from '../../../lib/plans';

const initialState = { error: undefined as string | undefined, success: undefined as boolean | undefined };

// Only plans actually offered right now — Agency exists on the pricing
// page purely as an anchor to make the other tiers look cheap, it's not
// a real assignable tier yet (see lib/plans.ts).
const ASSIGNABLE_PLANS = Object.values(PLANS).filter((p) => p.available);

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition"
    >
      {pending ? '...' : 'حفظ'}
    </button>
  );
}

export function PlanEditor({ clientId, currentPlan }: { clientId: string; currentPlan: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useFormState(updateClientPlan, initialState);

  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
      >
        تعديل الخطة
      </button>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-1.5 items-end">
      <input type="hidden" name="client_id" value={clientId} />
      <div className="flex items-center gap-1.5">
        <select
          name="plan"
          defaultValue={currentPlan}
          className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          {ASSIGNABLE_PLANS.map((plan) => (
            <option key={plan.id} value={plan.id}>
              {plan.label} {plan.priceDA > 0 ? `— ${plan.priceDA.toLocaleString('ar-DZ')} دج` : '(مجاني)'}
              {' '}({plan.maxPages === null ? 'غير محدود' : `${plan.maxPages} صفحات`})
            </option>
          ))}
        </select>
        <select
          name="extend_days"
          defaultValue="30"
          className="text-[11px] border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
        >
          <option value="0">بدون تمديد</option>
          <option value="7">+7 أيام</option>
          <option value="30">+30 يوم (شهر)</option>
          <option value="365">+سنة</option>
        </select>
        <SaveButton />
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-slate-400 hover:text-slate-600 px-1"
        >
          ✕
        </button>
      </div>
      {state.error && (
        <span className="text-[10px] text-red-500 font-bold">{state.error}</span>
      )}
      <p className="text-[10px] text-slate-400">
        ⚠️ خطة بدون تمديد للتاريخ الحالي ستبقي تاريخ الانتهاء كما هو — قد يمنع هذا العميل من إنشاء صفحات إذا كان التاريخ منتهياً بالفعل.
      </p>
    </form>
  );
}
