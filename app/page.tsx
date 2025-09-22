import Link from "next/link";
import Image from "next/image";
import FaqAccordion from "@/components/FaqAccordion";

export default function Home() {
  return (
    <>
      <section
        className="relative flex items-center justify-center overflow-hidden bg-black min-h-[60vh]"
        aria-label="Hero section with bowling in church"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-full max-w-[1600px] aspect-video max-h-[80vh]">
            <Image
              src="/bowling-alley.jpeg"
              alt="Bowling alley inside a church"
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        </div>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Bowlen in een kerk</h1>
          <p className="text-xl text-white/90 mb-8">
            Ervaar unieke bowlingbanen, karaoke kamers en interactieve games in het hart van Eindhoven.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary text-lg px-8 py-3">
              Reserveer nu
            </Link>
            <Link href="/activities" className="btn bg-white text-brand-600 hover:bg-gray-100 text-lg px-8 py-3">
              Bekijk activiteiten
            </Link>
          </div>
        </div>
      </section>

      <section className="container py-16 space-y-12">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Onze Activiteiten</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Ontdek ons aanbod van leuke en unieke ervaringen.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Bowlen", slug: "bowlen", desc: "Bowlen in een unieke kerksetting.", hero: "/hve-holy-bowling.jpg" },
            { name: "Karaoke", slug: "karaoke", desc: "Privé‑karaokekamers met top sound.", hero: "/hve-karaoke.jpg" },
            { name: "Beat the Matrix", slug: "beat-the-matrix", desc: "Interactieve challenge voor teams.", hero: "/hve-beat-the-matrix2.jpg" },
            { name: "Fitness", slug: "fitness", desc: "Small group of individueel trainen.", hero: "/hve-fitness.jpg" },
          ].map(({ name, slug, desc, hero }, i) => (
            <Link
              key={slug}
              href={`/activities/${slug}`}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 hover:bg-black/30 transition animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s` }}
              aria-label={`Bekijk ${name}`}
            >
              <div className="relative aspect-video">
                <Image src={hero} alt={name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              </div>
              <div className="absolute inset-0 flex items-end">
                <div className="p-4">
                  <h3 className="text-xl font-bold text-white drop-shadow">{name}</h3>
                  <p className="text-white/80 text-sm">{desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Homepage footer section */}
      <section className="container pb-24">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="space-y-6">
            <div className="card p-6" aria-label="Contact informatie">
              <h2 className="text-2xl font-bold mb-3">Contact</h2>
              <p className="text-white/80">Hart van Eindhoven</p>
              <p className="text-white/70">Ploegstraat 3, 5615 HA Eindhoven</p>
              <div className="mt-3 space-y-1 text-white/80">
                <p>
                  Telefoon: <span className="text-white/90">+31 (0)40 123 4567</span>
                </p>
                <p>
                  Email: {" "}
                  <a className="underline hover:text-brand-400" href="mailto:info@hartvaneindhoven.nl">
                    info@hartvaneindhoven.nl
                  </a>
                </p>
                <p>
                  Openingstijden: <span className="text-white/90">Ma??"Zo 10:00??"23:00</span>
                </p>
              </div>
              <div className="mt-4 flex gap-3" aria-label="Social links">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 border border-white/10 hover:bg-brand-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                    <rect x="2" y="2" width="20" height="20" rx="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <circle cx="17.5" cy="6.5" r="1.5" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="Facebook"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 border border-white/10 hover:bg-brand-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="TikTok"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 border border-white/10 hover:bg-brand-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M21 8.5a7.4 7.4 0 0 1-5-1.9v7.2a5.3 5.3 0 1 1-4.6-5.2v2.8a2.5 2.5 0 1 0 2 2.4V2h2a5.4 5.4 0 0 0 5.6 5.3z" />
                  </svg>
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 border border-white/10 hover:bg-brand-500 transition"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M6.94 6.5A2.44 2.44 0 1 1 4.5 4.06 2.44 2.44 0 0 1 6.94 6.5zM4.75 9h4.4v11h-4.4zM13.5 9h4.2v1.7h.1A4.6 4.6 0 0 1 22 15.6V20h-4.4v-3.8c0-.9 0-2-1.2-2s-1.4 1-1.4 2V20H10.6V9h2.9z" />
                  </svg>
                </a>
              </div>
            </div>
            <div className="card p-6" aria-label="FAQ">
              <h2 className="text-2xl font-bold mb-3">FAQ</h2>
              <FaqAccordion
                items={[
                  { q: 'Kan ik annuleren of wijzigen?', a: 'Ja, tot 24 uur vooraf kun je kosteloos annuleren of wijzigen. Daarna neem je best even contact op.' },
                  { q: 'Wat is de maximale groepsgrootte?', a: 'Per bowlingbaan adviseren we max. 6 personen. Karaoke kamers zijn geschikt tot 10 personen.' },
                  { q: 'Zijn bumpers beschikbaar voor kinderen?', a: 'Ja, bumpers zijn beschikbaar op aanvraag voor kinderen tot 12 jaar.' },
                  { q: 'Hoe werkt betalen en bevestigen?', a: 'Na het boeken ontvang je per e-mail een bevestiging met kalenderbijlage. Betaling volgt in de kassa of na online betaalstap (binnenkort).' },
                ]}
              />
            </div>
          </div>
          <div className="card overflow-hidden h-[380px]" aria-label="Kaart locatie (footer)">
            <iframe
              title="Google Maps Lokatie"
              src="https://www.google.com/maps?q=Ploegstraat%203%205615%20HA%20Eindhoven&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}

