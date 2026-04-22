'use client';

import { useMemo } from 'react';
import ExportButton from '@/app/shared/export-button';
import ModalButton from '@/app/shared/modal-button';
import PageHeader from '@/app/shared/page-header';
import { routes } from '@/config/routes';
import EventForm from '@/app/shared/event-calendar/event-form';
import useEventCalendar from '@/hooks/use-event-calendar';
import { mapApiEventToExportRow } from '@/components/events/event-api';

const pageHeader = {
  title: 'Event Calendar',
  breadcrumb: [
    {
      href: routes.file.dashboard,
      name: 'Home',
    },
    {
      href: routes.eventCalendar,
      name: 'Event Calendar',
    },
  ],
};

function EventPageHeader() {
  const { events } = useEventCalendar();

  const exportData = useMemo(
    () => events.map((event) => mapApiEventToExportRow(event)),
    [events],
  );

  return (
    <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
      <div className="mt-4 flex items-center gap-3 @lg:mt-0">
        <ExportButton
          data={exportData}
          fileName="event_data"
          header="ID,Title,Description,Location,Start,end"
        />
        <ModalButton
          label="Create Event"
          view={<EventForm />}
          customSize={900}
          className="mt-0 w-full @lg:w-auto"
        />
      </div>
    </PageHeader>
  );
}

export default EventPageHeader;
