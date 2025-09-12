"use client";
import { useState, useEffect, Fragment as ReactFragment } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from 'next-intl';

interface Activity {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  resources: Resource[];
}

interface AddOn {
  id: string;
  name: string;
  priceCents: number;
  perPerson: boolean;
}

interface Resource {
  id: string;
  name: string;
  capacity: number;
}

export default function Booking() {
  const t = useTranslations('Booking');
  const searchParams = useSearchParams();
  const initialActivitySlug = searchParams.get('activity') || '';
  
  const [step, setStep] = useState(1);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activity, setActivity] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [resource, setResource] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slot, setSlot] = useState('');
  const [addons, setAddons] = useState<AddOn[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [paymentInfo, setPaymentInfo] = useState({name: '', email: ''});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<any>(null);

  // Fetch activities and addons on component mount
  useEffect(() => {
    console.log('useEffect running');
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch activities
        const activitiesRes = await fetch('/api/activities');
        if (!activitiesRes.ok) {
          throw new Error(`Failed to fetch activities: ${activitiesRes.status}`);
        }
        const activitiesData = await activitiesRes.json();
        setActivities(activitiesData);
        
        // Fetch addons
        const addonsRes = await fetch('/api/addons');
        if (!addonsRes.ok) {
          throw new Error(`Failed to fetch addons: ${addonsRes.status}`);
        }
        const addonsData = await addonsRes.json();
        setAddons(addonsData);
        
        // If activity slug is provided in URL, set it
        if (initialActivitySlug) {
          const foundActivity = activitiesData.find((a: Activity) => a.slug === initialActivitySlug);
          if (foundActivity) {
            setActivity(foundActivity.id);
            // Set resources for this activity
            setResources(foundActivity.resources || []);
          } else {
            setError(`Activiteit ${initialActivitySlug} niet gevonden`);
          }
        }
        
        // Check if activities are loaded and set the first activity as default if none is selected
        if (activities && activities.length > 0 && !activity) {
          const firstActivity = activities[0];
          setActivity(firstActivity.id);
          if (firstActivity.resources && firstActivity.resources.length > 0) {
            setResource(firstActivity.resources[0].id);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Failed to load data: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [initialActivitySlug]);

  // When activity changes, update resources
  useEffect(() => {
    if (activity) {
      const selectedActivity = activities.find(a => a.id === activity);
      if (selectedActivity) {
        setResources(selectedActivity.resources || []);
        // Reset resource selection
        setResource('');
      }
    }
  }, [activity, activities]);

  // When date changes, fetch available slots
  useEffect(() => {
    const fetchAvailability = async () => {
      if (activity && date) {
        try {
          setLoading(true);
          const res = await fetch(`/api/availability?activityId=${activity}&date=${date}`);
          const data = await res.json();
          if (data.slots) {
            setAvailableSlots(data.slots);
          }
          setLoading(false);
        } catch (err) {
          setError('Failed to fetch availability');
          setLoading(false);
        }
      }
    };
    
    fetchAvailability();
  }, [activity, date]);

  const handleActivityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActivity(e.target.value);
    // Reset dependent fields
    setResource('');
    setDate('');
    setSlot('');
  };

  const handleResourceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setResource(e.target.value);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setSlot(''); // Reset slot when date changes
  };

  const handleSlotChange = (slotTime: string) => {
    setSlot(slotTime);
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const calculateTotal = () => {
    // Base price calculation (simplified)
    let total = partySize * 1000; // 10 euros per person in cents
    
    // Add addon prices
    selectedAddons.forEach(addonId => {
      const addon = addons.find(a => a.id === addonId);
      if (addon) {
        if (addon.perPerson) {
          total += addon.priceCents * partySize;
        } else {
          total += addon.priceCents;
        }
      }
    });
    
    return total;
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  const handleSubmitBooking = async () => {
    if (!activity || !resource || !date || !slot || !paymentInfo.email) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Create booking
      const bookingData = {
        email: paymentInfo.email,
        name: paymentInfo.name,
        date: new Date(`${date}T${slot}:00`).toISOString(),
        size: partySize,
        resourceId: resource,
        addOnIds: selectedAddons
      };
      
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setBookingResult(result.booking);
        setStep(5); // Go to confirmation step
      } else {
        setError(result.error || 'Failed to create booking');
      }
      
      setLoading(false);
    } catch (err) {
      setError('Failed to create booking');
      setLoading(false);
    }
  };

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

  if (loading && step !== 1) {
    return (
      <div className="container py-16 text-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

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
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
              {error}
            </div>
          )}
          
          {step === 1 && (
            <div className="space-y-4" role="form" aria-labelledby="step1-heading">
              <h2 id="step1-heading" className="text-2xl font-bold">Stap 1: Kies Activiteit</h2>
              <label className="block text-sm text-white/70">{t('activityLabel')} {initialActivitySlug && `(suggested: ${initialActivitySlug})`}</label>
              <select
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                value={activity}
                onChange={handleActivityChange}
                aria-label={t('activityLabel')}
              >
                <option value="">{t('activityLabel')}</option>
                {activities && activities.length > 0 ? (
                  activities.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))
                ) : (
                  <option value="">Loading...</option>
                )}
              </select>
              
              {activity && resources.length > 0 && (
                <>
                  <label className="block text-sm text-white/70">Selecteer baan/kamer</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                    value={resource}
                    onChange={handleResourceChange}
                    aria-label="Selecteer baan/kamer"
                  >
                    <option value="">Maak een keuze</option>
                    {resources.map(r => (
                      <option key={r.id} value={r.id}>{r.name} (max {r.capacity} personen)</option>
                    ))}
                  </select>
                </>
              )}
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
                onChange={handleDateChange}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white"
                aria-label="Selecteer datum"
                min={new Date().toISOString().split('T')[0]}
              />
              <label className="block text-sm text-white/70">{t('timeLabel')}</label>
              {loading ? (
                <p className="text-white/70">Beschikbare tijden laden...</p>
              ) : availableSlots.length > 0 ? (
                <div className="flex gap-2 flex-wrap">
                  {availableSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => handleSlotChange(time)}
                      className={`btn px-4 py-2 ${slot === time ? 'btn-primary' : 'bg-black/40 border border-white/10 hover:bg-brand-600'}`}
                      aria-pressed={slot === time}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-white/70">Geen beschikbare tijden voor deze datum</p>
              )}
              <div className="flex gap-3">
                <button className="btn py-3" onClick={() => setStep(1)}>Terug</button>
                <button
                  className="flex-1 btn-primary py-3"
                  disabled={!date || !slot}
                  onClick={() => setStep(3)}
                >
                  {t('nextAddons')}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4" role="form" aria-labelledby="step3-heading">
              <h2 id="step3-heading" className="text-2xl font-bold">Stap 3: Add-ons</h2>
              <p className="text-white/80">Selecteer optionele extras voor je boeking.</p>
              <div className="space-y-3">
                {addons.map(addon => (
                  <label key={addon.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedAddons.includes(addon.id)}
                      onChange={() => handleAddonToggle(addon.id)}
                      className="rounded border-white/20 text-brand-500 focus:ring-brand-500"
                    />
                    <span className="text-white">
                      {addon.name} (+€{formatPrice(addon.priceCents)})
                      {addon.perPerson && ' per persoon'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="text-right text-white/80">
                {t('addonsSubtotal')}: €{formatPrice(selectedAddons.reduce((sum, addonId) => {
                  const addon = addons.find(a => a.id === addonId);
                  if (!addon) return sum;
                  return sum + (addon.perPerson ? addon.priceCents * partySize : addon.priceCents);
                }, 0))}
              </div>
              <div className="flex gap-3">
                <button className="btn py-3" onClick={() => setStep(2)}>Terug</button>
                <button className="flex-1 btn-primary py-3" onClick={() => setStep(4)}>
                  {t('nextPayment')}
                </button>
              </div>
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
              <div className="text-right text-white/80 mb-4">
                {t('total')}: €{formatPrice(calculateTotal())}
              </div>
              <div className="flex gap-3">
                <button className="btn py-3" onClick={() => setStep(3)}>Terug</button>
                <button
                  className="flex-1 btn-primary py-3"
                  disabled={!paymentInfo.name || !paymentInfo.email}
                  onClick={handleSubmitBooking}
                >
                  {t('pay')}
                </button>
              </div>
              <p className="text-xs text-white/60">Demo: Geen echte betaling.</p>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 text-center animate-fade-in" role="status" aria-label="Booking confirmation">
              <h2 className="text-2xl font-bold text-brand-500">{t('step5')}</h2>
              {bookingResult ? (
                <ReactFragment>
                  <p className="text-white/80">
                    {t('confirmation', {
                      activity: activities.find(a => a.id === activity)?.name || '',
                      date,
                      slot,
                      partySize
                    })}
                  </p>
                  <ul className="text-white/80 text-left max-w-md mx-auto space-y-2">
                    <li><strong>{t('activity')}:</strong> {activities.find(a => a.id === activity)?.name || ''}</li>
                    <li><strong>{t('dateTime')}:</strong> {date} {slot}</li>
                    <li><strong>{t('number')}:</strong> {partySize}</li>
                    <li><strong>{t('addons')}:</strong> {selectedAddons.length > 0
                      ? selectedAddons.map(id => addons.find(a => a.id === id)?.name).filter(Boolean).join(', ')
                      : 'Geen'}</li>
                    <li><strong>{t('totalCost')}:</strong> €{formatPrice(calculateTotal())}</li>
                    <li><strong>{t('emailConfirmation')}:</strong> {paymentInfo.email}</li>
                  </ul>
                  <div className="space-y-2">
                    <p className="text-white/70">{t('confirmationSent', {email: paymentInfo.email})}</p>
                    <a href="#" className="btn-primary inline-block px-6 py-2" download>
                      {t('downloadIcs')}
                    </a>
                  </div>
                </ReactFragment>
              ) : (
                <p className="text-white/80">Je boeking is bevestigd!</p>
              )}
              <button className="btn text-brand-500" onClick={() => window.location.reload()}>Nieuwe boeking</button>
            </div>
          )}
        </div>
        <p className="text-center text-white/60 text-sm mt-8">{t('prototypeNote')}</p>
      </section>
    </>
  );
}