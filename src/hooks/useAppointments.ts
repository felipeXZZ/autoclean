import { useState, useEffect, useCallback } from 'react';
import { getUserAppointments, cancelAppointment } from '../services/appointmentService';
import type { Appointment } from '../types';

export function useAppointments(userId: string | undefined) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await getUserAppointments(userId);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar agendamentos.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  async function cancel(id: string) {
    await cancelAppointment(id);
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
  }

  return { appointments, loading, error, refetch: fetch, cancel };
}
