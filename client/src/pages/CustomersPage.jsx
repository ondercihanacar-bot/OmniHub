import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Key, 
  Edit3, 
  Trash2, 
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import CustomerModal from '../components/CustomerModal';

export default function CustomersPage({ onOpenGenerator, onNavigateToLicenses }) {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    try {
      const res = await api.getCustomers(search);
      setCustomers(res.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cust) => {
    setEditingCustomer(cust);
    setIsModalOpen(true);
  };

  const handleDelete = async (cust) => {
    if (!window.confirm(`"${cust.company_name}" müşterisini silmek istediğinize emin misiniz?`)) return;
    try {
      await api.deleteCustomer(cust.id);
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Top Search & Add Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Firma adı, yetkili, şehir veya e-posta ara..."
            className="w-full bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </form>

        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)] flex items-center gap-2 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>YENİ MÜŞTERİ EKLE</span>
        </button>
      </div>

      {/* Customers Grid Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            Müşteri verileri yükleniyor...
          </div>
        ) : customers.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500">
            Kayıtlı müşteri bulunamadı. "Yeni Müşteri Ekle" butonu ile ilk müşterinizi ekleyebilirsiniz.
          </div>
        ) : (
          customers.map((c) => (
            <div
              key={c.id}
              className="cyber-card p-5 rounded-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400 shrink-0 font-bold">
                      {c.company_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate" title={c.company_name}>
                        {c.company_name}
                      </h4>
                      <p className="text-xs text-slate-400">{c.contact_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(c)}
                      title="Müşteriyi Düzenle"
                      className="p-1.5 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c)}
                      title="Müşteriyi Sil"
                      className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Contact details */}
                <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                  {c.phone && (
                    <div className="flex items-center gap-2 text-slate-300 font-mono">
                      <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2 text-slate-300 font-mono truncate">
                      <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.city && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{c.city}</span>
                    </div>
                  )}
                  {c.tax_number && (
                    <div className="flex items-center gap-2 text-slate-500 font-mono text-[11px]">
                      <FileText className="w-3.5 h-3.5 shrink-0" />
                      <span>VKN: {c.tax_number} ({c.tax_office || 'VD'})</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {c.notes && (
                  <p className="mt-3 p-2 bg-slate-950/70 border border-slate-800/80 rounded text-[11px] text-slate-400 italic">
                    "{c.notes}"
                  </p>
                )}
              </div>

              {/* Bottom License Summary & Quick Generate */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <div 
                  onClick={() => onNavigateToLicenses(c.id)}
                  className="cursor-pointer text-xs font-mono flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-cyan-400" />
                  <span>
                    <strong className="text-white">{c.active_licenses || 0}</strong> Aktif / {c.total_licenses || 0} Lisans
                  </span>
                </div>

                <button
                  onClick={() => onOpenGenerator(c.id)}
                  className="px-3 py-1 bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/40 text-cyan-300 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Lisans Ata</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Customer Add/Edit Modal */}
      <CustomerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
        onSaved={loadCustomers}
      />
    </div>
  );
}
