import React, { useRef, useState } from 'react';
import { Camera, Loader2, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadCompanyLogo, uploadCompanyCover } from '../../services/companyImageService';
import type { Company } from '../../types';

interface Props {
  company: Company;
  onUpdate: () => Promise<void>;
}

export function CompanyImageUploader({ company, onUpdate }: Props) {
  const logoRef  = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo,  setUploadingLogo]  = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      await uploadCompanyLogo(company.id, file);
      await onUpdate();
      toast.success('Logo atualizada com sucesso.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar a imagem. Tente novamente.');
    } finally {
      setUploadingLogo(false);
      if (logoRef.current) logoRef.current.value = '';
    }
  }

  async function handleCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      await uploadCompanyCover(company.id, file);
      await onUpdate();
      toast.success('Banner atualizado com sucesso.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Não foi possível atualizar a imagem. Tente novamente.');
    } finally {
      setUploadingCover(false);
      if (coverRef.current) coverRef.current.value = '';
    }
  }

  const initial = company.name?.[0]?.toUpperCase() ?? '?';
  const cardStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' };

  return (
    <div className="p-6 rounded-2xl space-y-6" style={cardStyle}>
      <input ref={logoRef}  type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogo}  aria-label="Selecionar logo" />
      <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCover} aria-label="Selecionar banner" />

      {/* Cover / Banner */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Banner / capa</label>
        <div
          className="relative w-full rounded-2xl overflow-hidden"
          style={{
            height: 160,
            background: company.cover_url
              ? `url(${company.cover_url}) center/cover no-repeat`
              : 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(79,70,229,0.12) 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {!company.cover_url && (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-700" />
            </div>
          )}
          <button
            onClick={() => coverRef.current?.click()}
            disabled={uploadingCover}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white disabled:opacity-60 transition-all hover:scale-105"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
          >
            {uploadingCover
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Camera className="w-3.5 h-3.5" />}
            {uploadingCover ? 'Enviando...' : 'Alterar banner'}
          </button>
        </div>
        <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">
          Use uma imagem horizontal mostrando sua estética, equipe ou serviço. Proporção 16:9 ou 3:1. Máx 5MB.
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Logo / foto de perfil</label>
        <div className="flex items-center gap-4">
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
            style={{
              background: company.logo_url
                ? 'transparent'
                : 'linear-gradient(135deg, #2563eb, #4f46e5)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {company.logo_url
              ? <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover" />
              : <span className="text-2xl font-black text-white">{initial}</span>
            }
            {uploadingLogo && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <Camera className="w-4 h-4" />
              {uploadingLogo ? 'Enviando...' : 'Alterar logo'}
            </button>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Use uma imagem quadrada com o logo da sua estética. JPG, PNG ou WEBP. Máx 2MB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
