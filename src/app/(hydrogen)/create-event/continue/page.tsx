import type { Metadata } from 'next';
import EmailOtpGate from '@/components/events/EmailOtpGate';

export const metadata: Metadata = {
  title: 'Continue | GrowthLab',
  description: 'Continue to the event builder after sign in.',
};

export const dynamic = 'force-dynamic';

type ContinuePageSearchParams = Promise<{
  redirect?: string | string[];
}>;

export default async function CreateEventContinuePage({
  searchParams,
}: {
  searchParams?: ContinuePageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectValue = resolvedSearchParams?.redirect;
  const redirectPath = Array.isArray(redirectValue)
    ? redirectValue[0] || '/create-event/form'
    : redirectValue || '/create-event/form';

  return <EmailOtpGate redirectPath={redirectPath} />;
}
