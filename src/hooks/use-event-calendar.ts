import { useCallback, useEffect, useState } from 'react';
import type { CalendarEvent } from '../types';
import api from '@/lib/api';
import {
  mapApiEventToCalendarEvent,
  mapCalendarEventToApiPayload,
  normalizeApiEventList,
} from '@/components/events/event-api';

export default function useEventCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshEvents = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/events/my-events');
      setEvents(normalizeApiEventList(response.data));
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.detail ||
          requestError?.message ||
          'Could not load your events.',
      );
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshEvents();
  }, [refreshEvents]);

  const createEvent = useCallback(async (event: CalendarEvent) => {
    const response = await api.post('/events/', mapCalendarEventToApiPayload(event));
    const createdEvent = mapApiEventToCalendarEvent(response.data);

    if (createdEvent) {
      setEvents((current) => [...current, createdEvent]);
    } else {
      await refreshEvents();
    }

    return createdEvent;
  }, [refreshEvents]);

  const updateEvent = useCallback(async (updatedEvent: CalendarEvent) => {
    const eventId = String(updatedEvent.id || '').trim();
    if (!eventId) {
      throw new Error('Missing event id.');
    }

    const response = await api.put(
      `/events/${encodeURIComponent(eventId)}`,
      mapCalendarEventToApiPayload(updatedEvent, { includeDefaults: false }),
    );
    const persistedEvent = mapApiEventToCalendarEvent(response.data);

    if (persistedEvent) {
      setEvents((current) =>
        current.map((event) => (String(event.id) === persistedEvent.id ? persistedEvent : event)),
      );
    } else {
      await refreshEvents();
    }

    return persistedEvent;
  }, [refreshEvents]);

  const deleteEvent = useCallback(async (eventID: string) => {
    const targetId = String(eventID || '').trim();
    if (!targetId) {
      throw new Error('Missing event id.');
    }

    await api.delete(`/events/${encodeURIComponent(targetId)}`);
    setEvents((current) => current.filter((event) => String(event.id) !== targetId));
  }, []);

  return {
    events,
    loading,
    error,
    setEvents,
    refreshEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
