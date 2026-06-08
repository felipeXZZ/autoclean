import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, Truck, Store, CheckCircle } from 'lucide-react';
import type { Company } from '../../types';

interface Props {
  company: Company & { minPrice?: number };
}

const TYPE_LABEL: Record<string, string> = {
  delivery: 'Delivery',
  local: 'Local',
  both: 'Delivery + Local',
};

const cardBg = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };

export function CompanyCard({ company }: Props) {
  const rating = Number(company.rating_avg ?? 0);
  const reviews = Number(company.reviews_count ?? 0);

  return (
    <Link
      to={`/empresa/${company.slug}`}
      className="group flex flex-col rounded-2xl overflow-hidden hover:-translate-y-0.5 transition-all duration-200"
      style={cardBg}
    >
      {/* Cover */}
      <div
        className="relative h-32 flex items-center justify-center flex-shrink-0"
        style={{
          background: company.cover_url
            ? `url(${company.cover_url}) center/cover no-repeat`
            : 'linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(79,70,229,0.12) 100%)',
        }}
      >
        {!company.cover_url && (
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white"
            style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }}
          >
            {company.name[0]?.toUpperCase()}
          </div>
        )}
        {company.logo_url && (
          <img
            src={company.logo_url}
            alt={company.name}
            className="w-14 h-14 rounded-2xl object-cover border-2"
            style={{ borderColor: 'rgba(255,255,255,0.15)' }}
          />
        )}
        {company.is_featured && (
          <span className="absolute top-2 right-2 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            Destaque
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col gap-2 p-4">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-extrabold text-white text-sm leading-snug group-hover:text-blue-400 transition-colors line-clamp-1">
              {company.name}
            </h3>
            {company.is_verified && (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" aria-label="Verificado" />
            )}
          </div>
          {(company.city || company.state) && (
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {[company.city, company.state].filter(Boolean).join(', ')}
            </p>
          )}
        </div>

        {reviews > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className="w-3 h-3"
                  style={{ fill: i <= Math.round(rating) ? '#fbbf24' : 'transparent', color: '#fbbf24' }}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-yellow-400">{rating.toFixed(1)}</span>
            <span className="text-xs text-slate-500">({reviews})</span>
          </div>
        )}

        <div className="flex items-center gap-1.5 flex-wrap">
          {company.category && (
            <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {company.category}
            </span>
          )}
          {company.service_type && (
            <span className="text-[10px] font-bold text-blue-400 px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(37,99,235,0.12)' }}>
              {company.service_type === 'local' ? <Store className="w-2.5 h-2.5" /> : <Truck className="w-2.5 h-2.5" />}
              {TYPE_LABEL[company.service_type] ?? company.service_type}
            </span>
          )}
        </div>

        {typeof company.minPrice === 'number' && company.minPrice > 0 && (
          <p className="text-xs text-slate-500 mt-auto">
            A partir de{' '}
            <span className="text-emerald-400 font-black">
              R$ {company.minPrice.toFixed(0)}
            </span>
          </p>
        )}
      </div>

      <div className="px-4 pb-4">
        <div
          className="w-full text-center py-2 rounded-xl text-xs font-bold text-blue-400 transition-colors group-hover:bg-blue-500/10"
          style={{ border: '1px solid rgba(59,130,246,0.2)' }}
        >
          Ver horários →
        </div>
      </div>
    </Link>
  );
}
