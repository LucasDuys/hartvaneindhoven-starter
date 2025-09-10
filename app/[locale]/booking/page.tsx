"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';

export default function Booking() {
  const t = useTranslations('Booking');
  const searchParams = useSearchParams();
  const initialActivity = searchParams.get('activity') || '';
  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState(initialActivity);
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState('');
  const [addons, setAddons] = useState<{name: string, price: number}[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({name: '', email: ''});

  const addonsList = [
    { name: "Eten & Drinken", price: 15 },
    { name: "Bumpers (kinderen)", price: 5 },
    { name: "Extra tijd", price: 10 }
  ];

  const total = addons.reduce((sum, a) => sum + a.price, 0) + (partySize * 10); // Mock calculation

  const Stepper = () => (
    <div className="flex justify-between mb-8 animate-fade-in" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={5} aria-label="Booking progress">
      {[1,2,3,4,5].map(s => (
        <div key={s} className={`w-1/5 text-center ${s <= step ? 'text-brand-500' : 'text-white/50'}`}>
          <div className={`w-8 h-8 mx-auto rounded-full ${s <= step ? 'bg-brand-500' : 'bg-black/40'}`}>{s}</div>
          <span className="text-xs mt-1 block">Stap {s}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?booking')" }} aria-label="Booking hero">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90">{t('description')}</p>
        </div>
      </section>
      <section className="container py-16">
        <Stepper />
        <div className="card p-8 max-w-2xl mx-auto space-y-6 animate-fade-in">
          {step === 1 && (
            <div className="space-y-4" role="form" aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-2xl font-bold">Stap 1: Kies Activiteit</h2>
              <label className="block text-sm text-white/70">Activiteit {initialActivity && `(voorgesteld: ${initialActivity})`}</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                value={activity}
                onChange={e => setActivity(e.target.value)}
                aria-label="Selecteer activiteit"
              >
                <option value="">Maak een keuze</option>
                <option value="bowlen">Bowlen</option>
                <option value="karaoke">Karaoke</option>
                <option value="beat-the-matrix">Beat the Matrix</option>
              </select>
              <button className="w-full btn-primary py-3" disabled={!activity} onClick={() => setStep(2)}>Volgende</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4" role="form" aria-labelledby="step2-heading">
              <h2 id="step2-heading" className="text-2xl font-bold">Stap 2: Datum, Tijd & Grootte</h2>
              <label className="block text-sm text-white/70">Aantal personen</label>
              <input
                type="number"
                min="1"
                max="24"
                value={partySize}
                onChange={e => setPartySize(parseInt(e.target.value) || 1)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Aantal personen"
              />
              <label className="block text-sm text-white/70">Datum</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Selecteer datum"
              />
              <label className="block text-sm text-white/70">Beschikbare tijden (demo)</label>
              <div className="flex gap-2 flex-wrap">
                {["15:00", "16:00", "17:00", "18:00"].map(t => (
                  <button
                    key={t}
                    onClick={() => setSlot(t)}
                    className={`btn px-4 py-2 ${slot === t ? 'btn-primary' : 'bg-black/40 border border-white/10 hover:bg-brand-600'}`}
                    aria-pressed={slot === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <button className="w-full btn-primary py-3" disabled={!date || !slot} onClick={() => setStep(3)}>Volgende: Add-ons</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" role="form" aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-2xl font-bold">Stap 3: Add-ons</h2>
              <p className="text-white/80">Selecteer optionele extras voor je boeking.</p>
              <div className="space-y-3">
                {addonsList.map(addon => (
                  <label key={addon.name} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={addons.some(a => a.name === addon.name)}
                      onChange={e => {
                        if (e.target.checked) {
                          setAddons([...addons, addon]);
                        } else {
                          setAddons(addons.filter(a => a.name !== addon.name));
                        }
                      }}
                      className="rounded border-white/20 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-white">{addon.name} (+€{addon.price})</span>
                  </label>
                ))}
              </div>
              <div className="text-right text-white/80">Subtotaal add-ons: €{addons.reduce((sum, a) => sum + a.price, 0)}</div>
              <button className="w-full btn-primary py-3" onClick={() => setStep(4)}>Volgende: Betaling</button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4" role="form" aria-labelledby="step4-heading">
              <h2 id="step4-heading" className="text-2xl font-bold">Stap 4: Betaling</h2>
              <p className="text-white/80">Voer je betalingsgegevens in (demo met Stripe).</p>
              <label className="block text-sm text-white/70">Naam</label>
              <input
                type="text"
                value={paymentInfo.name}
                onChange={e => setPaymentInfo({...paymentInfo, name: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Volledige naam"
                aria-label="Naam voor betaling"
              />
              <label className="block text-sm text-white/70">Email</label>
              <input
                type="email"
                value={paymentInfo.email}
                onChange={e => setPaymentInfo({...paymentInfo, email: e.target.value})}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                placeholder="Email adres"
                aria-label="Email voor bevestiging"
              />
              <div className="text-right text-white/80 mb-4">Totaal: €{total}</div>
              <button className="w-full btn-primary py-3" disabled={!paymentInfo.name || !paymentInfo.email} onClick={() => setStep(5)}>Betaal veilig met Stripe</button>
              <p className="text-xs text-white/60">Demo: Geen echte betaling.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center animate-fade-in" role="status" aria-label="Booking confirmation">
              <h2 className="text-2xl font-bold text-brand-500">Bevestiging!</h2>
              <p className="text-white/80">Je boeking voor {activity} op {date} om {slot} voor {partySize} personen is bevestigd.</p>
              <ul className="text-white/80 text-left max-w-md mx-auto">
                <li>Activiteit: {activity}</li>
                <li>Datum & tijd: {date} {slot}</li>
                <li>Aantal: {partySize}</li>
                <li>Add-ons: {addons.map(a => a.name).join(', ') || 'Geen'}</li>
                <li>Totaal: €{total}</li>
                <li>Email: {paymentInfo.email}</li>
              </ul>
              <div className="space-y-2">
                <p className="text-white/70">Bevestiging is verstuurd naar {paymentInfo.email}.</p>
                <a href="#" className="btn-primary inline-block px-6 py-2" download>Download .ics kalender</a>
              </div>
              <button className="btn text-brand-500" onClick={() => window.location.reload()}>Nieuwe boeking</button>
            </div>
          )}
        </div>
        <p className="text-center text-white/60 text-sm mt-8">Dit is een static prototype. Geen backend integratie.</p>
      </section>
    </>
  );
}