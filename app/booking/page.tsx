"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";

type Activity = { id: string; slug: string; name: string };
type AddOn = { id: string; name: string; priceCents: number; perPerson: boolean };

function euros(cents: number) {
  return (cents / 100).toFixed(2);
}

// Animated calendar with enhanced hover/rounded styles
function AnimatedCalendar({ selected, onSelect, minDate }: { selected: string; onSelect: (d: string) => void; minDate: Date }) {
  const initial = selected ? (() => {
    const [yy, mm, dd] = selected.split('-').map(Number);
    return new Date(yy, (mm || 1) - 1, dd || 1);
  })() : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = lastOfMonth.getDate();

  const min = new Date(minDate);
  min.setHours(0, 0, 0, 0);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  const leading = startWeekday;
  const cells: Array<{ key: string; label: string; date?: Date; disabled?: boolean }> = [];
  for (let i = 0; i < leading; i++) cells.push({ key: `b${i}`, label: '' });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d);
    dt.setHours(0, 0, 0, 0);
    const disabled = dt < min;
    cells.push({ key: `d${d}`, label: String(d), date: dt, disabled });
  }

  const selectedYmd = selected;

  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-6 text-white w-[min(95vw,720px)] max-w-none shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <button className="px-2 py-1 rounded-lg hover:bg-white/10 active:scale-95 transition" onClick={() => shiftMonth(-1)} aria-label="Vorige maand">{'<'}</button>
        <div className="font-semibold text-white/90 select-none tracking-wide">{monthLabel}</div>
        <button className="px-2 py-1 rounded-lg hover:bg-white/10 active:scale-95 transition" onClick={() => shiftMonth(1)} aria-label="Volgende maand">{'>'}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm md:text-base text-white/70 mb-2">
        {['Zo','Ma','Di','Wo','Do','Vr','Za'].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => c.date ? (
          <button
            key={c.key}
            disabled={!!c.disabled}
            onClick={() => onSelect(formatYMD(c.date!))}
            className={`h-12 md:h-14 rounded-xl text-sm flex items-center justify-center border transition transform ${
              c.disabled
                ? 'text-white/30 border-white/5 cursor-not-allowed'
                : (formatYMD(c.date!) === selectedYmd)
                  ? 'bg-brand-500 border-brand-500 text-black shadow-md'
                  : 'bg-black/30 hover:bg-black/20 hover:-translate-y-0.5 hover:scale-[1.03] border-white/10'
            }`}
            aria-pressed={formatYMD(c.date!) === selectedYmd}
          >
            {c.label}
          </button>
        ) : (
          <div key={c.key} className="h-12 md:h-14" />
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          className="text-sm px-3 py-1 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition"
          onClick={() => {
            const now = new Date();
            const ymd = formatYMD(now);
            onSelect(ymd);
          }}
        >
          Vandaag
        </button>
      </div>
    </div>
  );
}

function formatHumanDate(ymd: string): string {
  if (!ymd) return '';
  const [y, m, d] = ymd.split('-').map(Number);
  const date = new Date(y, (m || 1) - 1, d || 1);
  try {
    return date.toLocaleDateString('nl-NL', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return ymd;
  }
}

function DatePickerPopover({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  // Lock body scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  function BodyPortal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [el] = useState(() => (typeof document !== 'undefined' ? document.createElement('div') : null));
    useEffect(() => {
      if (!el) return;
      document.body.appendChild(el);
      setMounted(true);
      return () => { document.body.removeChild(el); };
    }, [el]);
    if (!el || !mounted) return null;
    return createPortal(children as any, el);
  }
  return (
    <>
      <button
        type="button"
        className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-left text-white hover:bg-black/30 transition shadow hover:shadow-lg"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {value ? formatHumanDate(value) : 'Selecteer datum'}
      </button>
      <AnimatePresence>
        {open && (
          <BodyPortal>
            <motion.div
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            >
              <motion.div
                className="fixed z-[110] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(95vw,760px)]"
                role="dialog"
                aria-label="Kies datum"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <AnimatedCalendar
                  selected={value}
                  onSelect={(ymd) => {
                    onChange(ymd);
                    setOpen(false);
                  }}
                  minDate={new Date()}
                />
              </motion.div>
            </motion.div>
          </BodyPortal>
        )}
      </AnimatePresence>
    </>
  );
}
// Helpers for date formatting (YYYY-MM-DD)
function formatYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Simple month calendar with navigation and minDate enforcement
function Calendar({ selected, onSelect, minDate }: { selected: string; onSelect: (d: string) => void; minDate: Date }) {
  const initial = selected ? (() => {
    const [yy, mm, dd] = selected.split('-').map(Number);
    return new Date(yy, (mm || 1) - 1, dd || 1);
  })() : new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth()); // 0-11

  function shiftMonth(delta: number) {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const lastOfMonth = new Date(viewYear, viewMonth + 1, 0);
  const startWeekday = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = lastOfMonth.getDate();

  const min = new Date(minDate);
  min.setHours(0, 0, 0, 0);

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('nl-NL', {
    month: 'long',
    year: 'numeric',
  });

  // Build cells: leading blanks + month days
  const leading = startWeekday; // blanks before day 1
  const cells: Array<{ key: string; label: string; date?: Date; disabled?: boolean }> = [];
  for (let i = 0; i < leading; i++) cells.push({ key: `b${i}`, label: '' });
  for (let d = 1; d <= daysInMonth; d++) {
    const dt = new Date(viewYear, viewMonth, d);
    dt.setHours(0, 0, 0, 0);
    const disabled = dt < min;
    cells.push({ key: `d${d}`, label: String(d), date: dt, disabled });
  }

  const selectedYmd = selected;

  return (
    <div className="bg-black/60 border border-white/10 rounded-2xl p-4 text-white w-full max-w-sm shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl">
      <div className="flex items-center justify-between mb-3">
        <button className="px-2 py-1 rounded hover:bg-white/10" onClick={() => shiftMonth(-1)} aria-label="Vorige maand">←</button>
        <div className="font-semibold text-white/90 select-none">{monthLabel}</div>
        <button className="px-2 py-1 rounded hover:bg-white/10" onClick={() => shiftMonth(1)} aria-label="Volgende maand">→</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs text-white/70 mb-1">
        {['Zo','Ma','Di','Wo','Do','Vr','Za'].map((d) => (
          <div key={d} className="text-center">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c) => c.date ? (
          <button
            key={c.key}
            disabled={!!c.disabled}
            onClick={() => onSelect(formatYMD(c.date!))}
            className={`h-10 rounded text-sm flex items-center justify-center border ${
              c.disabled ? 'text-white/30 border-white/5'
              : (formatYMD(c.date!) === selectedYmd ? 'bg-brand-500 border-brand-500 text-black' : 'bg-black/30 hover:bg-black/20 border-white/10')
            }`}
            aria-pressed={formatYMD(c.date!) === selectedYmd}
          >
            {c.label}
          </button>
        ) : (
          <div key={c.key} className="h-10" />
        ))}
      </div>
      <div className="mt-3 flex justify-end">
        <button
          className="text-sm px-3 py-1 rounded border border-white/10 hover:bg-white/10"
          onClick={() => {
            const now = new Date();
            const ymd = formatYMD(now);
            onSelect(ymd);
            setViewYear(now.getFullYear());
            setViewMonth(now.getMonth());
          }}
        >
          Vandaag
        </button>
      </div>
    </div>
  );
}

function PricePreview({ activityId, date, slot, size, addOnIds }: { activityId: string; date: string; slot: string; size: number; addOnIds: string[]; }) {
  const [quote, setQuote] = useState<{ totalCents: number; items: { label: string; cents: number }[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ready = activityId && date && slot && size > 0;
    if (!ready) return;
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [y, m, d] = date.split("-").map(Number);
        const [hh, mm] = slot.split(":").map(Number);
        const iso = new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)).toISOString();
        const res = await fetch('/api/booking/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activityId, date: iso, size, durationMinutes: 60, addOnIds }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Kon prijs niet ophalen');
        if (!aborted) setQuote(json.pricing);
      } catch (e: any) {
        if (!aborted) setError(e.message || 'Fout bij prijsberekening');
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [activityId, date, slot, size, addOnIds.join(',')]);

  return (
    <div className="bg-black/20 rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-white/80">Totaal</span>
        {loading ? (
          <span className="text-white/60">Berekenen…</span>
        ) : error ? (
          <span className="text-red-400">{error}</span>
        ) : quote ? (
          <span className="font-semibold">€{euros(quote.totalCents)}</span>
        ) : (
          <span className="text-white/60">—</span>
        )}
      </div>
      {quote && (
        <ul className="mt-2 text-sm text-white/70 list-disc pl-5 space-y-1">
          {quote.items.map((i, idx) => (
            <li key={idx} className="flex justify-between">
              <span>{i.label}</span>
              <span>€{euros(i.cents)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BookingInner() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("activity") || "";

  const [step, setStep] = useState(1);

  // Data
  const [activities, setActivities] = useState<Activity[]>([]);
  const [addonsList, setAddonsList] = useState<AddOn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selections
  const [activityId, setActivityId] = useState<string>("");
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(""); // YYYY-MM-DD
  const [slot, setSlot] = useState(""); // HH:mm
  type SlotItem = { time: string; remaining: number };
  const [availableSlots, setAvailableSlots] = useState<SlotItem[]>([]);
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({ name: "", email: "" });
  const [bookingResult, setBookingResult] = useState<any>(null);

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id === activityId) || null,
    [activities, activityId]
  );

  // Load activities and add-ons
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [aRes, addRes] = await Promise.all([
          fetch("/api/activities", { cache: 'no-store' }),
          fetch("/api/addons", { cache: 'no-store' }),
        ]);
        const aJson = await aRes.json();
        const addJson = await addRes.json();
        if (!cancelled) {
          const aList = Array.isArray(aJson) ? aJson : [];
          const adList = Array.isArray(addJson) ? addJson : [];
          setActivities(aList);
          setAddonsList(adList);
          if ((!Array.isArray(aJson) || !Array.isArray(addJson)) && !error) {
            setError("Kon data laden. Controleer databaseverbinding / prisma generate.");
          }
        }
      } catch (e) {
        if (!cancelled) setError("Kon activiteiten/add-ons niet laden.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Map initial slug to activity ID once activities load
  useEffect(() => {
    if (!initialSlug || activities.length === 0) return;
    const match = activities.find((a) => a.slug === initialSlug);
    if (match) setActivityId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug, activities.length]);

  // Fetch availability when inputs are ready
  useEffect(() => {
    const canCheck = activityId && date;
    if (!canCheck) return;
    let aborted = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          activityId,
          date,
          duration: String(60),
          size: String(partySize),
        });
        const res = await fetch(`/api/availability?${params.toString()}`, { cache: 'no-store' });
        const json = await res.json();
        if (!aborted) setAvailableSlots(json.slots || []);
      } catch (e) {
        if (!aborted) setError("Kon beschikbaarheid niet ophalen.");
      } finally {
        if (!aborted) setLoading(false);
      }
    })();
    return () => {
      aborted = true;
    };
  }, [activityId, date, partySize]);

  // Pricing: sum add-ons (per person/group). Base price TBD in future.
  const addonsTotalCents = selectedAddOnIds.reduce((sum, id) => {
    const add = addonsList.find((a) => a.id === id);
    if (!add) return sum;
    const multiplier = add.perPerson ? partySize : 1;
    return sum + add.priceCents * multiplier;
  }, 0);

  const Stepper = () => (
    <div
      className="flex justify-between mb-8 animate-fade-in"
      role="progressbar"
      aria-valuenow={step}
      aria-valuemin={1}
      aria-valuemax={5}
      aria-label="Booking progress"
    >
      {[1, 2, 3, 4, 5].map((s) => (
        <div
          key={s}
          className={`w-1/5 text-center ${s <= step ? "text-brand-500" : "text-white/50"}`}
        >
          <div className={`w-8 h-8 mx-auto rounded-full ${s <= step ? "bg-brand-500" : "bg-black/40"}`}>{s}</div>
          <span className="text-xs mt-1 block">Stap {s}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <section
        className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?booking')" }}
        aria-label="Booking hero"
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Reserveer je Ervaring</h1>
          <p className="text-xl text-white/90">Voltooi de stappen om je boeking te bevestigen.</p>
        </div>
      </section>
      <section className="container py-16">
        <Stepper />
        <div className="card p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
          {error && <div className="text-red-400">{error}</div>}

          {step === 1 && (
            <div className="space-y-4" role="form" aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-2xl font-bold">
                Stap 1: Kies Activiteit
              </h2>
              <label className="block text-sm text-white/70">Activiteit</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                value={activityId}
                onChange={(e) => setActivityId(e.target.value)}
                aria-label="Selecteer activiteit"
              >
                <option value="">Maak een keuze</option>
                {activities.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
              <button
                className="w-full btn-primary py-3"
                disabled={!activityId}
                onClick={() => setStep(2)}
              >
                Volgende
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4" role="form" aria-labelledby="step2-heading">
              <h2 id="step2-heading" className="text-2xl font-bold">
                Stap 2: Datum, Tijd & Grootte
              </h2>
              <label className="block text-sm text-white/70">Aantal personen</label>
              <input
                type="number"
                min="1"
                max="24"
                value={partySize}
                onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Aantal personen"
              />
              <label className="block text-sm text-white/70">Datum</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="hidden w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Selecteer datum"
              />
              <div className="relative mt-2">
                <DatePickerPopover
                  value={date}
                  onChange={(ymd) => {
                    setDate(ymd);
                    setSlot("");
                  }}
                />
              </div>
              <label className="block text-sm text-white/70">Beschikbare tijden</label>
              <div className="flex gap-2 flex-wrap">
                {loading && <span className="text-white/70">Laden…</span>}
                {!loading && availableSlots.length === 0 && date && (
                  <span className="text-white/60">Geen tijden beschikbaar.</span>
                )}
                {!loading &&
                  availableSlots.map((s) => (
                    <button
                      key={s.time}
                      onClick={() => setSlot(s.time)}
                      className={`btn px-4 py-2 ${
                        slot === s.time
                          ? "btn-primary"
                          : "bg-black/40 border border-white/10 hover:bg-brand-600"
                      }`}
                      aria-pressed={slot === s.time}
                      disabled={s.remaining === 0}
                    >
                      {s.time} ({s.remaining} over)
                    </button>
                  ))}
              </div>
              <button
                className="w-full btn-primary py-3"
                disabled={!date || !slot}
                onClick={() => setStep(addonsList.length > 0 ? 3 : 4)}
              >
                {addonsList.length > 0 ? 'Volgende: Add-ons' : 'Volgende: Gegevens'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" role="form" aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-2xl font-bold">Stap 3: Add-ons (optioneel)</h2>
              <p className="text-white/80">Selecteer optionele extras voor je boeking.</p>
              <div className="space-y-3">
                {addonsList.map((addon) => (
                  <label key={addon.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAddOnIds.includes(addon.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAddOnIds([...selectedAddOnIds, addon.id]);
                        } else {
                          setSelectedAddOnIds(
                            selectedAddOnIds.filter((id) => id !== addon.id)
                          );
                        }
                      }}
                      className="rounded border-white/20 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-white">
                      {addon.name} (+€{euros(addon.priceCents)}{addon.perPerson ? ` p.p.` : ` per groep`})
                    </span>
                  </label>
                ))}
              </div>
              <div className="text-right text-white/80">
                Subtotaal add-ons: €{euros(addonsTotalCents)}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 btn py-3 border border-white/10" onClick={() => setStep(4)}>
                  Overslaan
                </button>
                <button className="flex-1 btn-primary py-3" onClick={() => setStep(4)}>
                  Volgende: Gegevens
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4" role="form" aria-labelledby="step4-heading">
              <h2 id="step4-heading" className="text-2xl font-bold">Stap 4: Gegevens & Bevestigen</h2>
              <p className="text-white/80">Voer je gegevens in om te boeken.</p>
              <label className="block text-sm text-white/70">Naam</label>
              <input
                type="text"
                value={paymentInfo.name}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, name: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Volledige naam"
                aria-label="Naam voor boeking"
              />
              <label className="block text-sm text-white/70">Email</label>
              <input
                type="email"
                value={paymentInfo.email}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, email: e.target.value })}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Email adres"
                aria-label="Email voor bevestiging"
              />
              <PricePreview
                activityId={activityId}
                date={date}
                slot={slot}
                size={partySize}
                addOnIds={selectedAddOnIds}
              />
              <button
                className="w-full btn-primary py-3"
                disabled={!paymentInfo.name || !paymentInfo.email || !activityId || !date || !slot}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    // Build UTC timestamp from local YYYY-MM-DD and HH:mm so DB shows the same wall time
                    const [y, m, d] = date.split("-").map(Number);
                    const [hh, mm] = slot.split(":").map(Number);
                    const iso = new Date(Date.UTC(y, (m || 1) - 1, d || 1, hh || 0, mm || 0)).toISOString();
                    const res = await fetch("/api/booking", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        email: paymentInfo.email,
                        name: paymentInfo.name,
                        date: iso,
                        size: partySize,
                        activityId,
                        addOnIds: selectedAddOnIds,
                        durationMinutes: 60,
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok) throw new Error(json.error || "Boeking mislukt");
                    setBookingResult(json);
                    setStep(5);
                  } catch (e: any) {
                    setError(e.message || "Onbekende fout bij boeken");
                  } finally {
                    setLoading(false);
                  }
                }}
              >
                Bevestig boeking
              </button>
              <p className="text-xs text-white/60">Betaling volgt in de volgende fase.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center animate-fade-in" role="status" aria-label="Booking confirmation">
              <h2 className="text-2xl font-bold text-brand-500">Bevestiging!</h2>
              <p className="text-white/80">
                Je boeking voor {selectedActivity?.name || "activiteit"} op {date} om {slot} voor {partySize} personen is aangemaakt.
              </p>
              <ul className="text-white/80 text-left max-w-md mx-auto">
                <li>Activiteit: {selectedActivity?.name}</li>
                <li>Datum & tijd: {date} {slot}</li>
                <li>Aantal: {partySize}</li>
                <li>Add-ons: {selectedAddOnIds.map((id) => addonsList.find(a => a.id === id)?.name).filter(Boolean).join(', ') || 'Geen'}</li>
                {bookingResult?.pricing && (
                  <li>Totaal: €{euros(bookingResult.pricing.totalCents)}</li>
                )}
                <li>Email: {paymentInfo.email}</li>
                {bookingResult?.id && <li>Boeking ID: {bookingResult.id}</li>}
              </ul>
              <div className="space-y-2">
                <p className="text-white/70">Een bevestiging per e-mail volgt in de volgende fase.</p>
                <a href="#" className="btn-primary inline-block px-6 py-2" onClick={(e) => e.preventDefault()} aria-disabled>
                  Download .ics (binnenkort)
                </a>
              </div>
              <button className="btn text-brand-500" onClick={() => (window.location.href = "/booking")}>Nieuwe boeking</button>
            </div>
          )}
        </div>
        <p className="text-center text-white/60 text-sm mt-8">Backend-integratie actief: beschikbaarheid en boeking werken. Betaling volgt.</p>
      </section>
    </>
  );
}

export default function Booking() {
  return (
    <Suspense fallback={null}>
      <BookingInner />
    </Suspense>
  );
}
