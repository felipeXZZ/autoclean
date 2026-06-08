import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'motion/react';
import { Save, Loader2, Plus, Trash2, CalendarOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import type { DashboardContext } from '../components/dashboard/DashboardLayout';
import { getCompanyBusinessHours, upsertBusinessHours } from '../services/companyService';
import type { BusinessHours, BlockedSlot } from '../types';

const WEEKDAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const inputStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' };
const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };
const inputCls = 'px-3 py-1.5 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500 transition-colors';

export const DashboardSchedule = () => {
  const { company } = useOutletContext<DashboardContext>();
  const [hours, setHours]           = useState<BusinessHours[]>([]);
  const [blocked, setBlocked]       = useState<BlockedSlot[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [newBlock, setNewBlock]     = useState({ date: '', time: '', reason: '' });
  const [addingBlock, setAddingBlock] = useState(false);

  const load = useCallback(async () => {
    const [bh, bs] = await Promise.all([
      getCompanyBusinessHours(company.id),
      supabase.from('blocked_slots').select('*').eq('company_id', company.id).order('blocked_date').then(({ data }) => (data as BlockedSlot[]) ?? []),
    ]);
    setHours(bh);
    setBlocked(bs);
    setLoading(false);
  }, [company.id]);

  useEffect(() => { load(); }, [load]);

  function setHourField(weekday: number, field: keyof BusinessHours, value: string | boolean | number) {
    setHours((prev) => {
      const exists = prev.find((h) => h.weekday === weekday);
      if (exists) return prev.map((h) => h.weekday === weekday ? { ...h, [field]: value } : h);
      return [...prev, {
        id: '',
        company_id: company.id,
        weekday,
        start_time: '08:00',
        end_time: '18:00',
        slot_interval_minutes: 60,
        is_active: false,
        [field]: value,
      }];
    });
  }

  async function saveHours() {
    setSaving(true);
    try {
      await upsertBusinessHours(hours.map(({ id: _id, ...h }) => h));
      toast.success('Horários salvos.');
      await load();
    } catch { toast.error('Erro ao salvar horários.'); }
    finally { setSaving(false); }
  }

  async function addBlockedSlot() {
    if (!newBlock.date) { toast.error('Informe a data.'); return; }
    setAddingBlock(true);
    try {
      const { error } = await supabase.from('blocked_slots').insert({
        company_id: company.id,
        blocked_date: newBlock.date,
        blocked_time: newBlock.time || null,
        reason: newBlock.reason || null,
      });
      if (error) throw error;
      toast.success('Data bloqueada.');
      setNewBlock({ date: '', time: '', reason: '' });
      await load();
    } catch { toast.error('Erro ao bloquear data.'); }
    finally { setAddingBlock(false); }
  }

  async function removeBlock(id: string) {
    await supabase.from('blocked_slots').delete().eq('id', id);
    setBlocked((prev) => prev.filter((b) => b.id !== id));
    toast.success('Bloqueio removido.');
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Painel</p>
        <h1 className="text-2xl font-extrabold text-white">Horários</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />)}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>

          {/* Business hours */}
          <div className="p-5 rounded-2xl mb-6" style={cardStyle}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-white">Funcionamento semanal</h2>
              <button
                onClick={saveHours} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-white text-sm disabled:opacity-50"
                style={{ background: '#2563eb' }}>
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Salvar
              </button>
            </div>

            <div className="space-y-2">
              {WEEKDAY_NAMES.map((name, weekday) => {
                const h = hours.find((x) => x.weekday === weekday);
                const active = h?.is_active ?? false;
                return (
                  <div key={weekday} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    {/* Toggle */}
                    <button
                      onClick={() => setHourField(weekday, 'is_active', !active)}
                      className={`flex-shrink-0 w-10 h-5 rounded-full transition-all relative ${active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-5' : 'left-0.5'}`} />
                    </button>

                    <p className="w-20 font-bold text-white text-sm flex-shrink-0">{name}</p>

                    {active ? (
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <input type="time" value={h?.start_time?.slice(0, 5) ?? '08:00'}
                          onChange={(e) => setHourField(weekday, 'start_time', e.target.value)}
                          className={inputCls} style={inputStyle} />
                        <span className="text-slate-500 text-xs">até</span>
                        <input type="time" value={h?.end_time?.slice(0, 5) ?? '18:00'}
                          onChange={(e) => setHourField(weekday, 'end_time', e.target.value)}
                          className={inputCls} style={inputStyle} />
                        <select value={h?.slot_interval_minutes ?? 60}
                          onChange={(e) => setHourField(weekday, 'slot_interval_minutes', Number(e.target.value))}
                          className={inputCls} style={inputStyle}>
                          {[30, 45, 60, 90, 120].map((v) => <option key={v} value={v}>{v} min</option>)}
                        </select>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-500">Máx/slot:</span>
                          <input type="number" min={1} max={10} value={h?.max_appointments_per_slot ?? 1}
                            onChange={(e) => setHourField(weekday, 'max_appointments_per_slot', Number(e.target.value))}
                            className={`${inputCls} w-16`} style={inputStyle} />
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-500 text-sm">Fechado</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Blocked slots */}
          <div className="p-5 rounded-2xl" style={cardStyle}>
            <h2 className="font-extrabold text-white mb-4">Datas e horários bloqueados</h2>

            {/* Add new block */}
            <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <input type="date" value={newBlock.date}
                onChange={(e) => setNewBlock((p) => ({ ...p, date: e.target.value }))}
                className={`${inputCls} flex-1 min-w-32`} style={inputStyle} />
              <input type="time" value={newBlock.time}
                onChange={(e) => setNewBlock((p) => ({ ...p, time: e.target.value }))}
                className={inputCls} style={inputStyle}
                placeholder="Horário (opcional)" />
              <input type="text" value={newBlock.reason}
                onChange={(e) => setNewBlock((p) => ({ ...p, reason: e.target.value }))}
                placeholder="Motivo (opcional)"
                className={`${inputCls} flex-1 min-w-32`} style={inputStyle} />
              <button
                onClick={addBlockedSlot} disabled={addingBlock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-white text-sm disabled:opacity-50"
                style={{ background: 'rgba(37,99,235,0.3)', border: '1px solid rgba(37,99,235,0.4)' }}>
                {addingBlock ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                Bloquear
              </button>
            </div>

            {blocked.length === 0 ? (
              <div className="text-center py-6">
                <CalendarOff className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-500 text-sm">Nenhuma data bloqueada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {blocked.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <div>
                      <p className="text-white font-bold text-sm">
                        {new Date(b.blocked_date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                        {b.blocked_time && ` · ${b.blocked_time.slice(0, 5)}`}
                      </p>
                      {b.reason && <p className="text-xs text-slate-500">{b.reason}</p>}
                    </div>
                    <button onClick={() => removeBlock(b.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
