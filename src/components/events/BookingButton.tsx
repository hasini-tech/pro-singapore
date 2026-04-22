'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from 'rizzui';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/auth-context';
import { routes } from '@/config/routes';
import api from '@/lib/api';

type BookingButtonProps = {
  eventSlug: string;
  eventTitle: string;
  className?: string;
};

export default function BookingButton({
  eventSlug,
  eventTitle,
  className,
}: BookingButtonProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push(
        `${routes.signIn}?callbackUrl=${encodeURIComponent(`/events/${eventSlug}`)}`,
      );
      return;
    }

    setLoading(true);

    try {
      const eventResponse = await api.get(`/events/${eventSlug}`);
      const event = eventResponse.data as {
        id: string;
        is_paid?: boolean;
        ticket_price?: number;
        title?: string;
      };

      const ticketResponse = await api.post('/tickets/book', {
        event_id: event.id,
      });
      const ticket = ticketResponse.data as {
        status?: string;
        ticket_ref?: string;
      };

      if (ticket.status === 'waitlisted') {
        toast.success("You're on the waitlist. We'll let you know if a seat opens up.");
        return;
      }

      if (event.is_paid) {
        const paymentResponse = await api.post('/payments/create-session', {
          event_id: event.id,
          ticket_ref: ticket.ticket_ref,
          amount: event.ticket_price,
          event_title: event.title || eventTitle,
        });

        if (paymentResponse.data?.url) {
          window.location.href = paymentResponse.data.url;
          return;
        }
      }

      toast.success(`Your RSVP for ${event.title || eventTitle} is confirmed.`);
    } catch (requestError: any) {
      toast.error(
        requestError?.response?.data?.detail ||
          requestError?.response?.data?.message ||
          'Failed to reserve your seat.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={isLoading || loading}
      className={className}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <Loader2 className="animate-spin" size={16} />
          Working...
        </span>
      ) : isLoading ? (
        'Loading...'
      ) : isAuthenticated ? (
        'Reserve a seat'
      ) : (
        'Sign in to reserve'
      )}
    </Button>
  );
}
