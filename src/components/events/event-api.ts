import { DEFAULT_EVENT_COVER } from '@/lib/defaults';
import type { CalendarEvent } from '@/types';

export type ApiEventRecord = {
  id: string | number;
  slug?: string;
  title?: string;
  description?: string;
  date?: string;
  time?: string;
  end_date?: string;
  end_time?: string;
  location?: string;
  is_online?: boolean;
  cover_image?: string;
  host_id?: string;
  host_name?: string;
  host_image?: string;
  host_bio?: string;
  is_paid?: boolean;
  ticket_price?: number;
  max_seats?: number;
  seats_left?: number;
  attendee_count?: number;
  confirmed_count?: number;
  waitlisted_count?: number;
  checked_in_count?: number;
  community_enabled?: boolean;
  status?: string;
  calendar_id?: string;
  calendar_name?: string;
  calendar_slug?: string;
  calendar_tint_color?: string;
  share_url?: string;
  created_at?: string;
};

function parseDateLike(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function buildDateTime(
  dateValue?: string | null,
  timeValue?: string | null,
  defaultValue = new Date(),
) {
  if (!dateValue && !timeValue) {
    return defaultValue;
  }

  const hasFullDateTime = Boolean(dateValue && dateValue.includes('T'));
  const combinedValue =
    dateValue && timeValue && !hasFullDateTime ? `${dateValue}T${timeValue}` : dateValue || '';

  const combinedDate = parseDateLike(combinedValue);
  if (combinedDate) {
    return combinedDate;
  }

  const dateOnly = parseDateLike(dateValue || '');
  if (dateOnly) {
    return dateOnly;
  }

  return defaultValue;
}

function formatTimeValue(date: Date) {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function mapApiEventToCalendarEvent(
  event: Partial<ApiEventRecord> | null | undefined,
): CalendarEvent | null {
  if (!event?.id || !event.title) {
    return null;
  }

  const start = buildDateTime(event.date, event.time);
  const endFromApi = buildDateTime(
    event.end_date,
    event.end_time,
    new Date(start.getTime() + 60 * 60 * 1000),
  );
  const end = endFromApi.getTime() > start.getTime() ? endFromApi : new Date(start.getTime() + 60 * 60 * 1000);

  return {
    id: String(event.id),
    title: String(event.title),
    description: typeof event.description === 'string' ? event.description : undefined,
    location: typeof event.location === 'string' ? event.location : undefined,
    start,
    end,
    allDay: false,
  };
}

export function mapCalendarEventToApiPayload(
  event: CalendarEvent,
  options?: { includeDefaults?: boolean },
) {
  const start = event.start instanceof Date ? event.start : new Date(event.start);
  const end = event.end instanceof Date ? event.end : new Date(event.end);

  const payload = {
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    date: start.toISOString(),
    time: formatTimeValue(start),
    end_date: end.toISOString(),
    end_time: formatTimeValue(end),
  };

  if (options?.includeDefaults === false) {
    return payload;
  }

  return {
    ...payload,
    cover_image: DEFAULT_EVENT_COVER,
    is_online: false,
    is_paid: false,
    ticket_price: 0,
    max_seats: 0,
    status: 'published',
    community_enabled: true,
  };
}

export function mapApiEventToExportRow(event: CalendarEvent) {
  return {
    id: String(event.id || ''),
    title: event.title,
    description: event.description || '',
    location: event.location || '',
    start: event.start.toISOString(),
    end: event.end.toISOString(),
  };
}

export function normalizeApiEventList(payload: unknown) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => mapApiEventToCalendarEvent(item as Partial<ApiEventRecord>))
    .filter((item): item is CalendarEvent => item !== null);
}
