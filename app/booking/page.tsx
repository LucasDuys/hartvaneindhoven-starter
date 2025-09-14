"use client";
import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type Activity = { id: string; slug: string; name: string };
type AddOn = { id: string; name: string; priceCents: number; perPerson: boolean };

function euros(cents: number) {
  return (cents / 100).toFixed(2);
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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
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
          fetch("/api/activities"),
          fetch("/api/addons"),
        ]);
        const aJson = await aRes.json();
        const addJson = await addRes.json();
        if (!cancelled) {
          setActivities(aJson || []);
          setAddonsList(addJson || []);
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
        const res = await fetch(`/api/availability?${params.toString()}`);
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
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Selecteer datum"
              />
              <label className="block text-sm text-white/70">Beschikbare tijden</label>
              <div className="flex gap-2 flex-wrap">
                {loading && <span className="text-white/70">Laden…</span>}
                {!loading && availableSlots.length === 0 && date && (
                  <span className="text-white/60">Geen tijden beschikbaar.</span>
                )}
                {!loading &&
                  availableSlots.map((t) => (
                    <button
                      key={t}
                      onClick={() => setSlot(t)}
                      className={`btn px-4 py-2 ${
                        slot === t
                          ? "btn-primary"
                          : "bg-black/40 border border-white/10 hover:bg-brand-600"
                      }`}
                      aria-pressed={slot === t}
                    >
                      {t}
                    </button>
                  ))}
              </div>
              <button
                className="w-full btn-primary py-3"
                disabled={!date || !slot}
                onClick={() => setStep(3)}
              >
                Volgende: Add-ons
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" role="form" aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-2xl font-bold">Stap 3: Add-ons</h2>
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
              <button className="w-full btn-primary py-3" onClick={() => setStep(4)}>
                Volgende: Gegevens
              </button>
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
              <div className="text-right text-white/80 mb-4">
                Totaal (alleen add-ons): €{euros(addonsTotalCents)}
              </div>
              <button
                className="w-full btn-primary py-3"
                disabled={!paymentInfo.name || !paymentInfo.email || !activityId || !date || !slot}
                onClick={async () => {
                  try {
                    setLoading(true);
                    setError(null);
                    const iso = new Date(`${date}T${slot}:00`).toISOString();
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
                    setBookingResult(json.booking);
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
                <li>Totaal add-ons: €{euros(addonsTotalCents)}</li>
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
