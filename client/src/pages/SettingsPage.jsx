import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Lock, 
  ShieldCheck, 
  Database, 
  Save, 
  Key, 
  MessageSquare, 
  Mail, 
  Check, 
  Server 
} from 'lucide-react';
import { api } from '../api';

export default function SettingsPage() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    try {
      const res = await api.getSettings();
      setSettings(res.settings || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Ayarlar kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifreler birbiriyle eşleşmiyor!' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }

    try {
      const res = await api.changePassword({ currentPassword, newPassword });
      setPasswordMsg({ type: 'success', text: res.message || 'Şifre güncellendi' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordMsg(null), 3000);
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Sliders className="w-5 h-5 text-cyan-400" />
          Sistem, Güvenlik ve Mesajlaşma Ayarları
        </h2>
        <p className="text-xs text-slate-400">
          OmniHub dağıtıcı merkezi güvenlik parametreleri ve bildirim şablonları
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Settings & Templates */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* General & Security Information */}
            <div className="cyber-card p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Güvenlik ve Dağıtıcı Kimliği
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Dağıtıcı Firma Ünvanı
                  </label>
                  <input
                    type="text"
                    value={settings.company_name || ''}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Geliştirici İmzası & Telif Hakkı (Sabit)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={settings.developer_signature || 'Designed & Developed by Önder Cihan ACAR © 2026. All Rights Reserved.'}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Heartbeat Yoklama Sıklığı (Saat)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={settings.heartbeat_interval_hours || 24}
                    onChange={(e) => setSettings({ ...settings, heartbeat_interval_hours: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Yenileme Alarmı Eşikleri (Günler)
                  </label>
                  <input
                    type="text"
                    value={settings.renewal_alert_days || '30,15,7'}
                    onChange={(e) => setSettings({ ...settings, renewal_alert_days: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* Notification Templates */}
            <div className="cyber-card p-5 rounded-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                Otomatik Lisans Yenileme Teklif Şablonları
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>WhatsApp Bildirim Şablonu</span>
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Değişkenler: {'{contact_name}'}, {'{company_name}'}, {'{product_name}'}, {'{end_date}'}, {'{days_left}'}
                    </span>
                  </label>
                  <textarea
                    rows={4}
                    value={settings.whatsapp_template || ''}
                    onChange={(e) => setSettings({ ...settings, whatsapp_template: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-Posta Teklif Konusu
                  </label>
                  <input
                    type="text"
                    value={settings.email_template_subject || ''}
                    onChange={(e) => setSettings({ ...settings, email_template_subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    E-Posta Teklif Gövdesi
                  </label>
                  <textarea
                    rows={4}
                    value={settings.email_template_body || ''}
                    onChange={(e) => setSettings({ ...settings, email_template_body: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 font-sans focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                  <Check className="w-4 h-4" /> Ayarlar kaydedildi!
                </span>
              )}
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Kaydediliyor...' : 'Tüm Ayarları Kaydet'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right 1 Col: Password Change & System Health */}
        <div className="space-y-6">
          {/* Admin Password Change */}
          <div className="cyber-card p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              Yönetici Şifre Güncelleme
            </h3>

            {passwordMsg && (
              <div className={`p-2.5 rounded-lg text-xs font-medium ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-600/40'
                  : 'bg-rose-950/80 text-rose-300 border border-rose-600/40'
              }`}>
                {passwordMsg.text}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Mevcut Şifre</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Yeni Şifre</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors mt-2"
              >
                Şifreyi Değiştir
              </button>
            </form>
          </div>

          {/* Engine Status Card */}
          <div className="cyber-card p-5 rounded-xl space-y-3 text-xs">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
              <Server className="w-4 h-4 text-emerald-400" />
              Altyapı & Kriptografi Durumu
            </h3>

            <div className="space-y-2 font-mono text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Veritabanı:</span>
                <span className="text-emerald-400">node:sqlite (WAL Mode)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">DB Konumu:</span>
                <span className="text-slate-300">data/omnihub.db</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Kripto Şifreleme:</span>
                <span className="text-cyan-400">AES-256-GCM / HMAC</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Heartbeat Port:</span>
                <span className="text-white">5200</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Yazılım Mimarı:</span>
                <span className="text-cyan-400 font-sans font-semibold">Önder Cihan ACAR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
