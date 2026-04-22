import type { Metadata } from 'next';
import { metaObject } from '@/config/site.config';
import EventCalendarView from '@/app/shared/event-calendar';
import EventPageHeader from '@/app/shared/event-calendar/event-page-header';

export const metadata = {
  ...metaObject('Event Calendar'),
} satisfies Metadata;

export default function EventCalendarPage() {
  return (
    <>
      <EventPageHeader />
      <EventCalendarView />
    </>
  );
}
