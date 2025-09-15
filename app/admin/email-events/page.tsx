import React from 'react';

type Search = { searchParams?: { token?: string } };

export default async function EmailEventsPage({ searchParams }: Search) {
  const token = searchParams?.token;
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/admin/email-events`, {
    // When rendering on the server, absolute URL is preferable; fallback works for dev
    headers: token ? { 'x-admin-token': token } as any : undefined,
    cache: 'no-store',
  } as any);
  const data = await res.json();
  const events = data.events || [];

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Email Events</h1>
      <p className="text-white/70 mb-4">Pass ?token=YOUR_ADMIN_TOKEN to authorize if required.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left">
              <th className="p-2">Time</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Recipient</th>
              <th className="p-2">Booking</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e: any) => (
              <tr key={e.id} className="border-t border-white/10">
                <td className="p-2">{new Date(e.createdAt).toLocaleString()}</td>
                <td className="p-2">{e.type}</td>
                <td className="p-2">{e.status || '-'}</td>
                <td className="p-2">{e.recipient || '-'}</td>
                <td className="p-2">{e.bookingId || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

