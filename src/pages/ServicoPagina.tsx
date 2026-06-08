import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Building2, Loader2, Wrench } from 'lucide-react';
import { getCompaniesByService, getCompaniesWithMinPrice } from '../services/companySearchService';
import { CompanyCard } from '../components/marketplace/CompanyCard';
import type { Company } from '../types';

function unslugify(s: string) {
  return s.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export const ServicoPagina = () => {
  const { service } = useParams<{ service: string }>();
  const serviceName = unslugify(service ?? '');
  const [companies, setCompanies] = useState<(Company & { minPrice: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!service) return;
    setLoading(true);
    getCompaniesByService(serviceName).then(async (data) => {
      const withPrices = await getCompaniesWithMinPrice(data);
      setCompanies(withPrices);
      setLoading(false);
    });
  }, [service, serviceName]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-20 pb-16"
      style={{ background: '#040c1a' }}
    >
      <div className="py-12 px-4 sm:px-6" style={{ background: 'linear-gradient(160deg, #040c1a 0%, #071628 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <Link to="/buscar" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Voltar para busca
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Wrench className="w-6 h-6 text-blue-400" />
            <h1 className="text-3xl font-black text-white">
              {serviceName} automotivo perto de você
            </h1>
          </div>
          <p className="text-slate-400">
            Estéticas que oferecem serviços de {serviceName.toLowerCase()} na sua região.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {loading ? (
          <div className="flex items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Buscando estéticas com {serviceName.toLowerCase()}...</span>
          </div>
        ) : companies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <Building2 className="w-14 h-14 text-slate-700" />
            <div>
              <p className="text-white font-black text-lg mb-1">Nenhuma estética encontrada</p>
              <p className="text-slate-500 text-sm">Não encontramos estéticas com {serviceName.toLowerCase()}.</p>
            </div>
            <div className="flex gap-3 mt-2">
              <Link to="/buscar" className="px-5 py-2.5 rounded-xl font-bold text-sm text-slate-300 transition-all" style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                Ver todas as estéticas
              </Link>
              <Link to="/para-empresas" className="px-5 py-2.5 rounded-xl font-bold text-sm text-white" style={{ background: '#2563eb' }}>
                Cadastrar estética
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-6">
              {companies.length} {companies.length === 1 ? 'estética oferece' : 'estéticas oferecem'} {serviceName.toLowerCase()}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
