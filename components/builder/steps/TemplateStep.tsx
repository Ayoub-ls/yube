'use client';

import { getTemplatesForNiche, NICHES } from '../templateCatalog';
import type { WizardData } from '../types';

export function TemplateStep({ data, update }: { data: WizardData; update: (patch: Partial<WizardData>) => void }) {
  const templates = getTemplatesForNiche(data.niche);
  const nicheLabel = NICHES.find((n) => n.id === data.niche)?.label;

  return (
    <div className="space-y-4 text-center">
      <div>
        <h2 className="text-lg font-black text-slate-900">اختر القالب الأنسب</h2>
        <p className="text-xs text-slate-400 mt-1">
          {nicheLabel
            ? `قوالب مناسبة لـ "${nicheLabel}"`
            : 'اختر من بين قوالبنا المصممة لتناسب أنواع السلع المختلفة'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {templates.map((t) => {
          const Icon = t.icon;
          const selected = data.templateId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => update({ templateId: t.id })}
              className={`text-right p-2 rounded-2xl border-2 transition flex flex-col items-center gap-2 justify-center ${selected ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-100 hover:border-slate-200'
                }`}
            >
              <div className={`w-full  rounded-xl flex items-center justify-center shrink-0 ${selected ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                <img className='object-fill w-full h-full' src={t.image} alt="" />
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-sm font-bold text-slate-800">{t.name}</p>
              </div>
            </button>
          );
        })}
      </div>

      {templates.length === 0 && (
        <p className="text-xs text-slate-400 py-6">لا توجد قوالب لهذا المجال حالياً — يرجى الرجوع واختيار مجال آخر</p>
      )}
    </div>
  );
}
