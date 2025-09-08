"use client";
import { useState } from "react";

export default function Booking() {
  const [step, setStep] = useState(1);
  const [activity, setActivity] = useState<string | null>(null);
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState<string>('');
  const [slot, setSlot] = useState<string>('');

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Reserveer</h1>
      <div className="card p-6 space-y-4">
        {step === 1 && (
          <div className="space-y-3">
            <label className="block text-sm text-white/70">Kies activiteit</label>
            <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3"
              value={activity ?? ""} onChange={e => setActivity(e.target.value)}>
              <option value="" disabled>Maak een keuze</option>
              <option value="bowlen">Bowlen</option>
              <option value="karaoke">Karaoke</option>
              <option value="beat-the-matrix">Beat the Matrix</option>
            </select>
            <button className="btn-primary" disabled={!activity} onClick={() => setStep(2)}>Volgende</button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <label className="block text-sm text-white/70">Grootte gezelschap</label>
            <input type="number" min={1} max={24} value={partySize}
              onChange={e => setPartySize(parseInt(e.target.value || '1'))}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3" />
            <label className="block text-sm text-white/70 mt-2">Datum</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl p-3" />
            <button className="btn-primary" disabled={!date} onClick={() => setStep(3)}>Toon tijden</button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <p className="text-white/80">Beschikbare tijden voor <b>{activity}</b> op <b>{date}</b> (demo):</p>
            <div className="flex gap-2 flex-wrap">
              {["15:00","16:00","17:00","18:00"].map(t => (
                <button key={t} onClick={()=>setSlot(t)} className={`btn ${slot===t?'btn-primary':'bg-black/40 border border-white/10'}`}>{t}</button>
              ))}
            </div>
            <button className="btn-primary" disabled={!slot} onClick={() => setStep(4)}>Ga naar bevestiging</button>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Overzicht</h2>
            <ul className="text-white/80">
              <li>Activiteit: {activity}</li>
              <li>Gezelschap: {partySize}</li>
              <li>Datum & tijd: {date} {slot}</li>
            </ul>
            <button className="btn-primary">Betaal (demo)</button>
          </div>
        )}
      </div>
      <p className="text-white/60 text-sm">Dit is een prototype. In de volgende iteratie koppelen we echte beschikbaarheid en betalingen.</p>
    </section>
  );
}
