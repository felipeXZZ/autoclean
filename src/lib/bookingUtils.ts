export function onlyNumbers(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatPhoneBR(value: string): string {
  const d = onlyNumbers(value).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function formatCep(value: string): string {
  const d = onlyNumbers(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function formatPlate(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 7);
}

export function isValidPhoneBR(value: string): boolean {
  return onlyNumbers(value).length === 11;
}

export function isValidPlate(value: string): boolean {
  const clean = value.replace(/[^A-Za-z0-9]/g, '');
  return clean.length === 0 || clean.length === 7;
}

export async function fetchAddressByCep(cep: string): Promise<{
  street: string;
  neighborhood: string;
  city: string;
  state: string;
} | null> {
  const digits = onlyNumbers(cep);
  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) throw new Error('api_error');
  const data = await res.json();
  if (data.erro) return null;
  return {
    street: data.logradouro ?? '',
    neighborhood: data.bairro ?? '',
    city: data.localidade ?? '',
    state: data.uf ?? '',
  };
}
