import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  AlertTriangle, 
  MessageSquare, 
  Mail, 
  RefreshCw, 
  ExternalLink, 
  Check, 
  Send,
  Building,
  Key
} from 'lucide-react';
import { api } from '../api';

export default function RenewalRadarPage({ onOpenRenew }) {
  const [renewals, setRenewals] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUrgency, setFilterUrgency] = useState('all'); // 'all', 'critical', 'warning', 'normal'
  const [copiedText, setCopiedText] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [dRes, sRes] = await Promise.all([
        api.getDashboardStats(),
        api.getSettings()
      ]);
      setRenewals(dRes.stats?.upcomingRenewals || []);
      setSettings(sRes.settings || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Template interpolation helper
  function buildMessage(template, item) {
    if (!template) return '';
    return template
      .replace(/{contact_name}/g, item.contact_name || 'Yetkili')
      .replace(/{company_name}/g, item.company_name || 'Firma')
      .replace(/{product_name}/g, item.product_name || 'Yazılım')
      .replace(/{end_date}/g, item.end_date || '')
      .replace(/{days_left}/g, item.days_left || '0')
      .replace(/{license_key}/g, item.license_key || '');
  }

  const handleWhatsApp = (item) => {
    const rawTemplate = settings?.whatsapp_template || 
      'Sayın {contact_name} ({company_name}), {product_name} lisansınızın süresi {end_date} tarihinde sona erecektir ({days_left} gün kaldı). Yenileme için bilgi rica ederiz.';
    const text = buildMessage(rawTemplate, item);
    const cleanPhone = (item.customer_phone || '').replace(/[^0-9]/g, '');
    const waUrl = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleEmail = (item) => {
    const rawSubject = settings?.email_template_subject || '{product_name} Lisans Yenileme Hatırlatması - {company_name}';
    const rawBody = settings?.email_template_body || 'Sayın {contact_name},\n\n{company_name} bünyesinde kullanılmakta olan {product_name} lisansınızın süresi {end_date} tarihinde dolacaktır ({days_left} gün kaldı).';
    
    const subject = buildMessage(rawSubject, item);
    const body = buildMessage(rawBody, item);
    const mailtoUrl = `mailto:${item.customer_email || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const copyTemplate = (item) => {
    const rawTemplate = settings?.whatsapp_template || '';
    const text = buildMessage(rawTemplate, item);
    navigator.clipboard.writeText(text);
    setCopiedText(item.id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filtered = renewals.filter((r) => {
    if (filterUrgency === 'critical') return r.urgency === 'critical';
    if (filterUrgency === 'warning') return r.urgency === 'warning';
    if (filterUrgency === 'normal') return r.urgency === 'normal';
    return true;
  });

  const criticalCount = renewals.filter(r => r.urgency === 'critical').length;
  const warningCount = renewals.filter(r => r.urgency === 'warning').length;
  const normalCount = renewals.filter(r => r.urgency === 'normal').length;

  return (
    <div className="p-6 space-y-6">
      {/* Top Urgency Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setFilterUrgency('all')}
          className={`cyber-card p-4 rounded-xl text-left transition-all ${
            filterUrgency === 'all' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase">Tüm Radar</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white">{renewals.length}</div>
          <span className="text-[11px] text-slate-500">Önümüzdeki 30 gün</span>
        </button>

        <button
          onClick={() => setFilterUrgency('critical')}
          className={`cyber-card p-4 rounded-xl text-left transition-all ${
            filterUrgency === 'critical' ? 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-xs font-semibold uppercase">Acil Durum (≤ 7 Gün)</span>
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">{criticalCount}</div>
          <span className="text-[11px] text-rose-400/80">Kapanma riski yüksek</span>
        </button>

        <button
          onClick={() => setFilterUrgency('warning')}
          className={`cyber-card p-4 rounded-xl text-left transition-all ${
            filterUrgency === 'warning' ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase">Yaklaşan (8-15 Gün)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">{warningCount}</div>
          <span className="text-[11px] text-amber-400/80">Teklif gönderilmelidir</span>
        </button>

        <button
          onClick={() => setFilterUrgency('normal')}
          className={`cyber-card p-4 rounded-xl text-left transition-all ${
            filterUrgency === 'normal' ? 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]' : ''
          }`}
        >
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-xs font-semibold uppercase">Ön Bildirim (16-30 Gün)</span>
            <Send className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">{normalCount}</div>
          <span className="text-[11px] text-blue-400/80">Erken planlama</span>
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-3">
        {loading ? (
          <div className="cyber-card p-12 text-center text-slate-400 rounded-xl">
            Yenileme radarı yükleniyor...
          </div>
        ) : filtered.length === 0 ? (
          <div className="cyber-card p-12 text-center text-slate-500 rounded-xl">
            Bu kategoride bekleyen lisans yenilemesi bulunmuyor.
          </div>
        ) : (
          filtered.map((item) => {
            const isCritical = item.urgency === 'critical';
            const isWarning = item.urgency === 'warning';
            return (
              <div
                key={item.id}
                className={`cyber-card p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isCritical
                    ? 'border-rose-900/60 bg-rose-950/20'
                    : isWarning
                    ? 'border-amber-900/60 bg-amber-950/20'
                    : 'border-slate-800'
                }`}
              >
                {/* Left Info */}
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-bold text-white">
                      {item.company_name}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400 text-xs font-mono font-bold">
                      {item.product_name}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold border ${
                      isCritical
                        ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse'
                        : isWarning
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-blue-950 border-blue-500 text-blue-300'
                    }`}>
                      {item.days_left === 0 ? 'Bugün Bitiyor!' : `${item.days_left} Gün Kaldı`}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3 font-mono">
                    <span className="text-cyan-300">{item.license_key}</span>
                    <span>•</span>
                    <span className="text-slate-300">Bitiş: {item.end_date}</span>
                    <span>•</span>
                    <span>Yetkili: {item.contact_name}</span>
                    {item.customer_phone && (
                      <>
                        <span>•</span>
                        <span>{item.customer_phone}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-center shrink-0">
                  {/* WhatsApp Quick Message */}
                  <button
                    onClick={() => handleWhatsApp(item)}
                    className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/60 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                    <span>WhatsApp Mesajı</span>
                  </button>

                  {/* Email Quick Message */}
                  <button
                    onClick={() => handleEmail(item)}
                    className="px-3 py-1.5 bg-blue-950/80 hover:bg-blue-900 border border-blue-500/60 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    <span>E-Posta Teklifi</span>
                  </button>

                  {/* Copy Template */}
                  <button
                    onClick={() => copyTemplate(item)}
                    title="Yenileme Teklif Metnini Kopyala"
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
                  >
                    {copiedText === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Quick Renew */}
                  <button
                    onClick={() => onOpenRenew(item)}
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)] flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Süreyi Uzat</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
