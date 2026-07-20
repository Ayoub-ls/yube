'use client';

import { NICHES } from '../templateCatalog';
import type { WizardData } from '../types';

export function NicheStep({ data, update }: { data: WizardData; update: (patch: Partial<WizardData>) => void }) {
  return (
    <div className="space-y-4 text-center">
      <div>
        <h2 className="text-lg font-black text-slate-900">ما هو مجال متجرك؟</h2>
        <p className="text-xs text-slate-400 mt-1">سنعرض لك القوالب الأنسب لنوع منتجك</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {NICHES.map((n) => {
          const selected = data.niche === n.id;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => {
                // Changing niche can make the currently-selected template
                // no longer applicable (e.g. switching from "kids" to
                // "gadget" while "pairdz" is selected) — reset templateId
                // so step 2 can't silently keep an invisible/irrelevant
                // selection.
                update({ niche: n.id, templateId: '' });
              }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition ${
                selected ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <span className="text-2xl">{n.emoji}</span>
              <span className="text-sm font-bold text-slate-800">{n.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
