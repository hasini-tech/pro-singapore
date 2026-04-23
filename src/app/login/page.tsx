import { redirect } from 'next/navigation';

type LoginPageSearchParams = Promise<{
  callbackUrl?: string | string[];
  redirect?: string | string[];
}>;

function firstValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: LoginPageSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectPath = firstValue(resolvedSearchParams?.redirect);
  const callbackUrl = firstValue(resolvedSearchParams?.callbackUrl);
  const query = new URLSearchParams();

  if (redirectPath) {
    query.set('redirect', redirectPath);
  }

  if (callbackUrl) {
    query.set('callbackUrl', callbackUrl);
  }

  redirect(query.size ? `/signin?${query.toString()}` : '/signin');
}
