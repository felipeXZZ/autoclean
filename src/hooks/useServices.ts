import { useState, useEffect } from 'react';
import { getActiveServices } from '../services/serviceService';
import type { Service } from '../types';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveServices()
      .then(setServices)
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao buscar serviços.'))
      .finally(() => setLoading(false));
  }, []);

  return { services, loading, error };
}
