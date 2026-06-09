import { supabase } from '../lib/supabase';

const BUCKET = 'company-assets';
const MAX_LOGO_BYTES = 2 * 1024 * 1024;
const MAX_COVER_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function validate(file: File, maxBytes: number): void {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Envie apenas imagens nos formatos JPG, PNG ou WEBP.');
  }
  if (file.size > maxBytes) {
    if (maxBytes === MAX_LOGO_BYTES) throw new Error('A imagem de perfil deve ter no máximo 2MB.');
    throw new Error('O banner deve ter no máximo 5MB.');
  }
}

async function uploadToStorage(companyId: string, file: File, type: 'logo' | 'cover'): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `companies/${companyId}/${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function uploadCompanyLogo(companyId: string, file: File): Promise<string> {
  validate(file, MAX_LOGO_BYTES);
  const url = await uploadToStorage(companyId, file, 'logo');
  const { error } = await supabase.from('companies').update({ logo_url: url }).eq('id', companyId);
  if (error) throw error;
  return url;
}

export async function uploadCompanyCover(companyId: string, file: File): Promise<string> {
  validate(file, MAX_COVER_BYTES);
  const url = await uploadToStorage(companyId, file, 'cover');
  const { error } = await supabase.from('companies').update({ cover_url: url }).eq('id', companyId);
  if (error) throw error;
  return url;
}
