import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus, Edit3, Trash2, Save, X, Loader2, Wrench,
  ToggleLeft, ToggleRight, Star, ImageIcon, Upload,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import {
  getCompanyAllServices, createService, updateService, deleteService,
} from '../services/companyService';
import { supabase } from '../lib/supabase';
import type { Service, ServiceFormData } from '../types';

const CATEGORIES = ['Lavagem', 'Higienização', 'Polimento', 'Proteção', 'Técnico', 'Motor', 'Outro'];

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-white text-sm focus:outline-none transition-colors placeholder-slate-500 focus:border-blue-500';
const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

const EMPTY_FORM: ServiceFormData = {
  name: '', description: '', price: 0, duration_minutes: 60,
  category: 'Lavagem', is_active: true, is_featured: false, image_url: '',
};

export const DashboardServices = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [services, setServices]     = useState<Service[]>([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState<ServiceFormData & { id?: string } | null>(null);
  const [saving, setSaving]         = useState(false);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading]   = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const data = await getCompanyAllServices(company.id);
    setServices(data);
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  function openForm(svc?: Service) {
    if (svc) {
      setForm({ id: svc.id, name: svc.name, description: svc.description, price: svc.price, duration_minutes: svc.duration_minutes, category: svc.category, is_active: svc.is_active, is_featured: svc.is_featured, image_url: svc.image_url ?? '' });
      setImagePreview(svc.image_url ?? '');
    } else {
      setForm({ ...EMPTY_FORM });
      setImagePreview('');
    }
    setImageFile(null);
  }

  function closeForm() {
    setForm(null);
    setImageFile(null);
    setImagePreview('');
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagem muito grande. Máximo 5 MB.'); return; }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadImage(file: File): Promise<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${company.id}/${Date.now()}.${ext}`;
    setUploading(true);
    const { data, error } = await supabase.storage
      .from('service-images')
      .upload(path, file, { upsert: true });
    setUploading(false);
    if (error) throw new Error(`Upload falhou: ${error.message}`);
    return supabase.storage.from('service-images').getPublicUrl(data.path).data.publicUrl;
  }

  async function save() {
    if (!form) return;
    if (!form.name.trim()) { toast.error('Informe o nome do serviço.'); return; }
    setSaving(true);
    try {
      let imageUrl = form.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const payload = { ...form, image_url: imageUrl };
      if (form.id) {
        await updateService(form.id, payload);
        toast.success('Serviço atualizado.');
      } else {
        await createService({ ...payload, company_id: company.id });
        toast.success('Serviço criado.');
      }
      closeForm();
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar serviço.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(svc: Service) {
    try {
      await updateService(svc.id, { is_active: !svc.is_active });
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_active: !s.is_active } : s));
    } catch { toast.error('Erro ao alterar status.'); }
  }

  async function toggleFeatured(svc: Service) {
    try {
      await updateService(svc.id, { is_featured: !svc.is_featured });
      setServices((prev) => prev.map((s) => s.id === svc.id ? { ...s, is_featured: !s.is_featured } : s));
    } catch { toast.error('Erro ao alterar destaque.'); }
  }

  async function del(id: string) {
    if (!confirm('Excluir este serviço?')) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success('Serviço excluído.');
    } catch { toast.error('Erro ao excluir serviço.'); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
          <h1 className="text-2xl font-extrabold text-white">Serviços</h1>
        </div>
        <button
          onClick={() => openForm()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white text-sm"
          style={{ background: '#2563eb' }}>
          <Plus className="w-4 h-4" /> Novo serviço
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {form && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
              className="w-full max-w-md p-6 rounded-3xl overflow-y-auto max-h-[90vh]"
              style={cardStyle}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-extrabold text-white">{form.id ? 'Editar serviço' : 'Novo serviço'}</h3>
                <button onClick={closeForm} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                {/* Image upload */}
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Foto do serviço</label>
                  <input
                    ref={fileInputRef} type="file" accept="image/*"
                    onChange={handleFileChange} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-xl overflow-hidden transition-opacity hover:opacity-80"
                    style={{ border: '1px dashed rgba(255,255,255,0.15)', minHeight: '100px' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-36 object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-24 gap-2">
                        <Upload className="w-6 h-6 text-slate-500" />
                        <span className="text-xs text-slate-500">Clique para adicionar foto</span>
                        <span className="text-xs text-slate-600">JPG, PNG, WEBP · máx 5 MB</span>
                      </div>
                    )}
                  </button>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); setForm((p) => p ? { ...p, image_url: '' } : p); }}
                      className="mt-1 text-xs text-red-400 hover:text-red-300 transition-colors">
                      Remover foto
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Nome *</label>
                  <input type="text" value={form.name}
                    onChange={(e) => setForm((p) => p ? { ...p, name: e.target.value } : p)}
                    className={inputCls} style={inputStyle} placeholder="Ex: Lavagem Completa" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Descrição</label>
                  <textarea rows={3} value={form.description}
                    onChange={(e) => setForm((p) => p ? { ...p, description: e.target.value } : p)}
                    className={`${inputCls} resize-none`} style={inputStyle} placeholder="O que está incluído neste serviço..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Preço (R$)</label>
                    <input type="number" min={0} step={0.01} value={form.price}
                      onChange={(e) => setForm((p) => p ? { ...p, price: Number(e.target.value) } : p)}
                      className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Duração (min)</label>
                    <input type="number" min={15} step={15} value={form.duration_minutes}
                      onChange={(e) => setForm((p) => p ? { ...p, duration_minutes: Number(e.target.value) } : p)}
                      className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Categoria</label>
                  <select value={form.category}
                    onChange={(e) => setForm((p) => p ? { ...p, category: e.target.value } : p)}
                    className={inputCls} style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_active}
                      onChange={(e) => setForm((p) => p ? { ...p, is_active: e.target.checked } : p)}
                      className="w-4 h-4 rounded accent-blue-600" />
                    <span className="text-sm text-slate-300 font-medium">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured}
                      onChange={(e) => setForm((p) => p ? { ...p, is_featured: e.target.checked } : p)}
                      className="w-4 h-4 rounded accent-yellow-500" />
                    <span className="text-sm text-slate-300 font-medium">Destaque</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={closeForm}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-400"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  Cancelar
                </button>
                <button onClick={save} disabled={saving || uploading || !form.name}
                  className="flex-1 py-3 rounded-xl font-black text-white flex items-center justify-center gap-2 disabled:opacity-40"
                  style={{ background: '#2563eb' }}>
                  {saving || uploading
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Save className="w-4 h-4" />}
                  {uploading ? 'Enviando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-white font-bold mb-1">Nenhum serviço cadastrado</p>
          <p className="text-slate-500 text-sm mb-4">Cadastre seu primeiro serviço para começar a receber agendamentos.</p>
          <button onClick={() => openForm()}
            className="px-6 py-3 rounded-xl font-bold text-white text-sm"
            style={{ background: '#2563eb' }}>
            Criar serviço
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map((svc) => (
            <div key={svc.id} className="flex items-center gap-4 p-4 rounded-2xl" style={cardStyle}>
              {/* Service image */}
              {svc.image_url ? (
                <img src={svc.image_url} alt={svc.name} className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <ImageIcon className="w-6 h-6 text-slate-700" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-bold text-white text-sm">{svc.name}</p>
                  {svc.is_featured && <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />}
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    {svc.category}
                  </span>
                  {!svc.is_active && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(100,116,139,0.1)', color: '#64748b' }}>
                      Inativo
                    </span>
                  )}
                </div>
                {svc.description && <p className="text-xs text-slate-500 truncate">{svc.description}</p>}
                <p className="text-xs text-slate-600 mt-0.5">{svc.duration_minutes} min</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <p className="text-base font-black text-white">
                  {Number(svc.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <button onClick={() => toggleFeatured(svc)} title="Destaque"
                  className="p-2 rounded-lg transition-colors hover:bg-yellow-500/10">
                  <Star className={`w-4 h-4 ${svc.is_featured ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                </button>
                <button onClick={() => toggleActive(svc)} title={svc.is_active ? 'Desativar' : 'Ativar'}
                  className="p-1.5 rounded-lg transition-colors hover:bg-white/5">
                  {svc.is_active
                    ? <ToggleRight className="w-5 h-5 text-green-400" />
                    : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                </button>
                <button onClick={() => openForm(svc)}
                  className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => del(svc.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
