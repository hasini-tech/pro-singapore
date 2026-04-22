'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import api from '@/lib/api';
import { routes } from '@/config/routes';
import { DEFAULT_EVENT_COVER } from '@/lib/defaults';
import type { ApiEventRecord } from '@/components/events/event-api';

type EventFilter = 'upcoming' | 'past';

type LumaEvent = {
  id: string;
  slug: string;
  title: string;
  dateLabel: string;
  timeLabel: string;
  locationLabel: string;
  statusLabel: string;
  guestsLabel: string;
  cover: string;
  isPast: boolean;
};

function toDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeEvent(event: Partial<ApiEventRecord>): LumaEvent | null {
  if (!event.id || !event.slug || !event.title) {
    return null;
  }

  const parsedDate = toDate(event.date);
  const isPast = parsedDate ? parsedDate.getTime() < Date.now() : false;
  const guestCount = Number(event.confirmed_count || event.attendee_count || 0);

  return {
    id: String(event.id),
    slug: String(event.slug),
    title: String(event.title),
    dateLabel: parsedDate
      ? parsedDate.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })
      : 'Date TBA',
    timeLabel: typeof event.time === 'string' && event.time ? event.time : 'Time TBA',
    locationLabel: event.location || 'Location Missing',
    statusLabel: event.status?.toUpperCase() || (isPast ? 'PAST' : 'LIVE'),
    guestsLabel: guestCount > 0 ? `${guestCount} guest${guestCount === 1 ? '' : 's'}` : 'No guests yet',
    cover: event.cover_image || DEFAULT_EVENT_COVER,
    isPast,
  };
}

export default function LumaEventsPage() {
  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [events, setEvents] = useState<LumaEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    async function loadEvents() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/events');
        if (!mounted) return;

        const normalized = Array.isArray(response.data)
          ? response.data.map((event) => normalizeEvent(event as Partial<ApiEventRecord>)).filter(
              (event): event is LumaEvent => event !== null,
            )
          : [];

        setEvents(normalized);
      } catch (requestError: any) {
        if (!mounted) return;
        setError(
          requestError?.response?.data?.detail ||
            'Could not load the live event feed right now.',
        );
        setEvents([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleEvents = useMemo(
    () => events.filter((event) => (filter === 'upcoming' ? !event.isPast : event.isPast)),
    [events, filter],
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f6f9ff 0%, #f9fafb 40%, #ffffff 100%)',
        color: '#0f172a',
      }}
    >
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 26px',
          color: '#475569',
          fontWeight: 700,
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href={routes.luma.events} style={topNavLinkStyle}>
            <CalendarDays size={16} />
            Events
          </Link>
          <Link href={routes.eventCalendar} style={topNavLinkStyle}>
            Calendars
          </Link>
          <Link href={routes.discover} style={topNavLinkStyle}>
            Discover
          </Link>
        </div>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px' }}>
            {new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
          <Link
            href={routes.luma.createEvent}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              fontWeight: 700,
              color: '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              textDecoration: 'none',
            }}
          >
            Create Event
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      <section style={{ maxWidth: '1180px', margin: '0 auto', padding: '8px 20px 90px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '18px' }}>
          <div
            style={{
              display: 'inline-flex',
              background: '#f1f5f9',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            {(['upcoming', 'past'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: filter === key ? '#fff' : 'transparent',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: filter === key ? '0 10px 18px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {key === 'upcoming' ? 'Upcoming' : 'Past'}
              </button>
            ))}
          </div>
        </div>

        <h1 style={{ fontSize: '2rem', marginBottom: '18px' }}>Events</h1>

        {loading ? (
          <div style={{ minHeight: '45vh', display: 'grid', placeItems: 'center' }}>
            <Loader2 className="animate-spin" size={36} />
          </div>
        ) : error ? (
          <div
            style={{
              padding: '14px 16px',
              borderRadius: '14px',
              background: '#fff1f2',
              border: '1px solid #fecdd3',
              color: '#be123c',
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '22px' }}>
            {visibleEvents.length === 0 ? (
              <div
                style={{
                  padding: '28px',
                  borderRadius: '16px',
                  border: '1px dashed #cbd5e1',
                  background: '#fff',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                No {filter === 'upcoming' ? 'upcoming' : 'past'} events yet.
              </div>
            ) : (
              visibleEvents.map((event) => (
                <div
                  key={event.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '14px',
                    alignItems: 'stretch',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#fff',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.06)',
                    border: '1px solid #e2e8f0',
                  }}
                >
                  <div style={{ display: 'grid', gap: '10px' }}>
                    <div
                      style={{
                        display: 'flex',
                        gap: '10px',
                        alignItems: 'center',
                        color: event.isPast ? '#64748b' : '#0f172a',
                        fontWeight: 800,
                        flexWrap: 'wrap',
                      }}
                    >
                      <span>{event.statusLabel}</span>
                      <Clock3 size={16} />
                      <span style={{ color: '#475569', fontWeight: 700 }}>
                        {event.dateLabel} · {event.timeLabel}
                      </span>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{event.title}</div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        color: event.locationLabel === 'Location Missing' ? '#f59e0b' : '#0f172a',
                        fontWeight: 700,
                        alignItems: 'center',
                      }}
                    >
                      <MapPin size={16} />
                      {event.locationLabel}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        color: '#94a3b8',
                        fontWeight: 700,
                        alignItems: 'center',
                      }}
                    >
                      <Users size={16} />
                      {event.guestsLabel}
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link
                        href={`/manage/${event.slug}`}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: '#111827',
                          color: '#fff',
                          border: 'none',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                      >
                        Check In
                      </Link>
                      <Link
                        href={`${routes.events}/${event.slug}`}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: '#f1f5f9',
                          color: '#111827',
                          border: '1px solid #e2e8f0',
                          fontWeight: 800,
                          cursor: 'pointer',
                          textDecoration: 'none',
                        }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: '14px',
                      background: '#0f172a',
                      backgroundImage: `url(${event.cover})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}

const topNavLinkStyle: React.CSSProperties = {
  display: 'flex',
  gap: '6px',
  alignItems: 'center',
  color: '#475569',
  textDecoration: 'none',
};
