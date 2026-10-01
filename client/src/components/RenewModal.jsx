import React, { useState } from 'react';
import { X, RefreshCw, Calendar, Check, AlertCircle } from 'lucide-react';
import { api } from '../api';

export default function RenewModal({ isOpen, onClose, license, onRenewed }) {
  const [extensionMonths, setExtensionMonths] = useState(12);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !license) return null;

  const handleRenew = async () => {
    setSubmitting(true);
    try {
      const res = await api.renewLicense(license.id, {
        additional_months: extensionMonths
      });
      alert(res.message);
      if (onRenewed) onRenewed();
      onClose();
    } catch (err) {
      alert(err.message || 'Yenileme işlemi başarısız oldu');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Lisans Yenile / Süre Uzat</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
            <div className="text-slate-400">Lisans: <span className="text-cyan-400 font-bold">{license.license_key}</span></div>
            <div className="text-slate-400">Müşteri: <span className="text-slate-200">{license.company_name}</span></div>
            <div className="text-slate-400">Mevcut Bitiş: <span className="text-amber-400">{license.end_date || 'Süresiz'}</span></div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Uzatılacak Süre Seçimi:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { months: 12, label: '+1 Yıl' },
                { months: 24, label: '+2 Yıl' },
                { months: 36, label: '+3 Yıl' },
                { months: 6, label: '+6 Ay' },
                { months: 3, label: '+3 Ay' },
                { months: 1, label: '+1 Ay' },
              ].map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setExtensionMonths(opt.months)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                    extensionMonths === opt.months
                      ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] text-slate-400">
            * Lisans süresi uzatıldığında durumu otomatik olarak <strong className="text-emerald-400">Aktif</strong> hale getirilecek ve donanım kilidi korunacaktır.
          </p>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
            >
              Vazgeç
            </button>
            <button
              onClick={handleRenew}
              disabled={submitting}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(16,185,129,0.3)] flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Uzatılıyor...' : 'Süreyi Uzat ve Onayla'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
