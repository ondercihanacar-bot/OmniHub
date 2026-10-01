import React, { useState, useEffect } from 'react';
import { Layers, Activity, Wifi, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { api } from '../api';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await api.getProducts();
      setProducts(res.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          OmniHub Ürün & Modül Matrisi
        </h2>
        <p className="text-xs text-slate-400">
          Önder Cihan ACAR tarafından geliştirilen kurumsal yazılımların yetkilendirme katalogu
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {products.map((p) => {
          const isOmniFlow = p.id === 'omniflow';
          const Icon = isOmniFlow ? Activity : Wifi;

          return (
            <div key={p.id} className="cyber-card p-6 rounded-2xl flex flex-col justify-between space-y-5">
              <div>
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl border ${
                      isOmniFlow
                        ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                        : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        {p.name}
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                          {p.code}
                        </span>
                      </h3>
                      <p className="text-xs text-slate-400">Güncel Sürüm: v{p.version}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-500 text-emerald-400">
                    Aktif Ürün
                  </span>
                </div>

                {/* Description */}
                <p className="mt-4 text-xs text-slate-300 leading-relaxed">
                  {p.description}
                </p>

                {/* Module Checklist */}
                <div className="mt-5 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                    Desteklenen Lisanslanabilir Modüller ({p.available_modules?.length || 0})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {(p.available_modules || []).map((mod) => (
                      <div
                        key={mod}
                        className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-medium"
                      >
                        <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate">{mod}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Security info */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Anahtar Ön Eki: <strong className="text-cyan-400">OMNI-{p.code}-*</strong></span>
                <span>HWID Koruma: <strong className="text-emerald-400">Açık</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
