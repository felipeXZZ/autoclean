import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Filter, X, SlidersHorizontal, Building2, Loader2 } from 'lucide-react';
import { searchCompanies, getCompaniesWithMinPrice } from '../services/companySearchService';
import { CompanyCard } from '../components/marketplace/CompanyCard';
import type { Company } from '../types';

const CATEGORIES = ['Todos', 'Lavagem', 'Higienização', 'Polimento', 'Vitrificação', 'Motor', 'Detailing', 'Proteção'];
const SERVICE_TYPES = [
  { value: 'todos', label: 'Todos' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'local', label: 'Local' },
  { value: 'both', label: 'Delivery + Local' },
];

const inputStyle = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
};

export const BuscarPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState(searchParams.get('cidade') ?? '');
  const [category, setCategory] = useState('Todos');
  const [serviceType, setServiceType] = useState('todos');
  const [minRating, setMinRating] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<(Company & { minPrice: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (q: string, c: string, cat: string, st: string, mr: number) => {
    setLoading(true);
    setSearched(true);
    const filters = {
      query: q || undefined,
      city: c || undefined,
      category: cat !== 'Todos' ? cat : undefined,
      serviceType: st !== 'todos' ? st : undefined,
      minRating: mr > 0 ? mr : undefined,
    };
    const companies = await searchCompanies(filters);
    const withPrices = await getCompaniesWithMinPrice(companies);
    setResults(withPrices);
    setLoading(false);
  }, []);

  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const c = searchParams.get('cidade') ?? '';
    setQuery(q);
    setCity(c);
    runSearch(q, c, 'Todos', 'todos', 0);
  }, [searchParams, runSearch]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city.trim()) params.set('cidade', city.trim());
    setSearchParams(params);
    runSearch(query, city, category, serviceType, minRating);
  }

  function handleFilterChange() {
    runSearch(query, city, category, serviceType, minRating);
  }

  function clearFilters() {
    setCategory('Todos');
    setServiceType('todos');
    setMinRating(0);
    runSearch(query, city, 'Todos', 'todos', 0);
  }

  const hasActiveFilters = category !== 'Todos' || serviceType !== 'todos' || minRating > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-16"
      style={{ background: '#040c1a' }}
    >
      {/* Search bar */}
      <div className="sticky top-16 z-30 py-4 px-4 sm:px-6" style={{ background: 'rgba(4,12,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Serviço ou estética..."
              className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
          <div className="relative sm:w-44">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Cidade"
              className="w-full pl-11 pr-4 py-3 rounded-xl text-white text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              style={inputStyle}
            />
          </div>
          <button
            type="submit"
            className="py-3 px-6 rounded-xl font-black text-white text-sm flex-shrink-0"
            style={{ background: '#2563eb' }}
          >
            Buscar
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="py-3 px-4 rounded-xl font-bold text-sm flex-shrink-0 flex items-center gap-2 transition-all"
            style={{
              background: showFilters ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${showFilters ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.1)'}`,
              color: showFilters ? '#60a5fa' : '#94a3b8',
            }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
          </button>
        </form>

        {/* Filters panel */}
        {showFilters && (
          <div className="max-w-4xl mx-auto mt-4 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Categoria</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCategory(c); handleFilterChange(); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: category === c ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${category === c ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: category === c ? '#60a5fa' : '#94a3b8',
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">Atendimento</label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => { setServiceType(value); handleFilterChange(); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: serviceType === value ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${serviceType === value ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: serviceType === value ? '#60a5fa' : '#94a3b8',
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Nota mínima: {minRating > 0 ? `${minRating}+` : 'Todas'}
                </label>
                <div className="flex gap-2">
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      onClick={() => { setMinRating(r); handleFilterChange(); }}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        background: minRating === r ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${minRating === r ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        color: minRating === r ? '#60a5fa' : '#94a3b8',
                      }}
                    >
                      {r === 0 ? 'Todas' : `${r}+★`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors">
                <X className="w-3.5 h-3.5" /> Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            {searched && !loading && (
              <p className="text-sm text-slate-400">
                {results.length === 0
                  ? 'Nenhuma estética encontrada'
                  : `${results.length} ${results.length === 1 ? 'estética encontrada' : 'estéticas encontradas'}`}
                {(query || city) && (
                  <span className="text-slate-500">
                    {query && ` para "${query}"`}{city && ` em ${city}`}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span className="font-medium">Buscando estéticas...</span>
          </div>
        ) : results.length === 0 && searched ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Building2 className="w-14 h-14 text-slate-700" />
            <div>
              <p className="text-white font-black text-lg mb-1">Nenhuma estética encontrada</p>
              <p className="text-slate-500 text-sm">Tente buscar em outra cidade ou por outro serviço.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <button
                onClick={() => { setQuery(''); setCity(''); runSearch('', '', 'Todos', 'todos', 0); }}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 hover:text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
              >
                Ver todas as estéticas
              </button>
              <Link
                to="/para-empresas"
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-white"
                style={{ background: '#2563eb' }}
              >
                Cadastrar minha estética
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {results.map((c) => <CompanyCard key={c.id} company={c} />)}
          </div>
        )}

        {!searched && !loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Search className="w-14 h-14 text-slate-700" />
            <p className="text-slate-400 font-medium">Use a busca acima para encontrar estéticas na sua cidade.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
