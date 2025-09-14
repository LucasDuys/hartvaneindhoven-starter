"use client";

export default function ActivityClient({ slug, title }: { slug: string; title: string }) {
  return (
    <section className="animate-fade-in" aria-label="Inline booking widget">
      <h2 className="text-2xl font-bold mb-6">Snelle Boeking</h2>
      <div className="card p-6 max-w-md mx-auto">
        <form className="space-y-4">
          <label className="block">
            <span className="text-white/80">Activiteit</span>
            <input type="text" value={title} readOnly className="mt-1 block w-full rounded-lg bg-black/25 border border-white/10 p-2 text-white" />
          </label>
          <label className="block">
            <span className="text-white/80">Datum & Tijd</span>
            <input type="datetime-local" className="mt-1 block w-full rounded-lg bg-black/25 border border-white/10 p-2 text-white" aria-label="Selecteer datum en tijd" />
          </label>
          <label className="block">
            <span className="text-white/80">Aantal personen</span>
            <select className="mt-1 block w-full rounded-lg bg-black/25 border border-white/10 p-2 text-white" aria-label="Selecteer aantal personen">
              <option>2</option><option>4</option><option>6</option><option>8+</option>
            </select>
          </label>
          <button type="button" className="w-full btn-primary py-2" onClick={() => window.location.href = `/booking?activity=${slug}`}>Ga naar volledige boeking</button>
        </form>
      </div>
    </section>
  );
}

