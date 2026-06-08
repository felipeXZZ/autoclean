import { useState, useEffect } from 'react';
import { getCompanyBySlug, getCompanyServices, getCompanyReviews, getCompanyBusinessHours } from '../services/companyService';
import type { Company, Service, Review, BusinessHours } from '../types';

export function usePublicCompany(slug: string) {
  const [company, setCompany] = useState<Company | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    setCompany(null);

    getCompanyBySlug(slug).then(async (c) => {
      if (!c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCompany(c);
      const [svcs, revs, hrs] = await Promise.all([
        getCompanyServices(c.id),
        getCompanyReviews(c.id),
        getCompanyBusinessHours(c.id),
      ]);
      setServices(svcs);
      setReviews(revs);
      setHours(hrs);
      setLoading(false);
    });
  }, [slug]);

  return { company, services, reviews, hours, loading, notFound };
}
