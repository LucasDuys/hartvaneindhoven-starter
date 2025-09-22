import Link from "next/link";

export const metadata = {
  title: "Over ons – Tim & Nathalie | Hart van Eindhoven",
  description:
    "Ontmoet de founders van Hart van Eindhoven. Tim Hoeijmans en Nathalie combineren sport, technologie en gastvrijheid in de Sacramentskerk.",
};

function SocialIcon({ label, href, children }: { label: string; href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-black/30 border border-white/10 hover:bg-brand-500 transition"
    >
      {children}
    </Link>
  );
}

export default function AboutPage() {
  const founders: Array<{
    name: string;
    role: string;
    img: string;
    bullets: string[];
  }> = [
    {
      name: "Tim Hoeijmans",
      role: "Founder & Concept/Tech Lead",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&fit=crop",
      bullets: [
        "Ex‑Olympisch zwemmer; sinds 2016 visie op sport + entertainment.",
        "Zag potentie van de Sacramentskerk en transformeerde deze tot Holy Bowling — bowling op verhoogd platform om monumentstatus te respecteren.",
        "Ontwikkelde Beat the Matrix met eigen softwarebesturing + integratie met bar; introduceerde ‘Heart of Eindhoven’ (voelbare hartslag in de vloer).",
        "Lanceerde interactieve sportzones en plande uitbreiding met interactieve klimwand.",
        "Initiatiefnemer van Secret City, een smartphone‑speurtocht die zelfs locals verrast.",
        "Richt zich op inclusieve, sociale sportbeleving: De Gym met begeleiding, telefoons in kluis, en interactieve games.",
      ],
    },
    {
      name: "Nathalie",
      role: "Co‑Founder & Operations/Hospitality Lead",
      img: "https://images.unsplash.com/photo-1531123414780-f7422d094d83?q=80&w=600&fit=crop",
      bullets: [
        "Stuurt de operatie en hospitality van Hart van Eindhoven.",
        "Zorgt dat horeca en activiteiten elkaar versterken: supporting hospitality (kleine kaart, volle vergunning) + spellen (shuffleboard, interactieve darts, pool).",
        "Verantwoordelijk voor groepsontvangst tot 240 personen en planning over activiteiten.",
        "Waakt over de dagelijkse beleving en gastvrijheid.",
      ],
    },
  ];

  return (
    <>
      <section
        className="relative h-[45vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/hve-horeca1.jpg')" }}
        aria-label="Over ons hero"
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center animate-fade-in max-w-3xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Over Hart van Eindhoven</h1>
          <p className="text-white/90">Bowlen in een kerk, karaoke, fitness en interactieve belevingen — met liefde gemaakt in Eindhoven.</p>
        </div>
      </section>

      <section className="container py-16 space-y-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card p-6 animate-fade-in" aria-label="Onze missie">
            <h2 className="text-xl font-bold mb-2">Onze missie</h2>
            <p className="text-white/80">We brengen mensen bij elkaar met unieke, toegankelijke activiteiten. Van iconische bowlingbanen in een historische setting tot privé‑karaokekamers en interactieve challenges.</p>
          </div>
          <div className="card p-6 animate-fade-in" aria-label="Onze waarden" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-xl font-bold mb-2">Onze waarden</h2>
            <ul className="text-white/80 list-disc pl-5 space-y-1">
              <li>Gastvrij en veilig</li>
              <li>Toegankelijk en inclusief</li>
              <li>Creatief en vooruitstrevend</li>
            </ul>
          </div>
          <div className="card p-6 animate-fade-in" aria-label="Wat we bieden" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-xl font-bold mb-2">Wat we bieden</h2>
            <ul className="text-white/80 list-disc pl-5 space-y-1">
              <li>Bowlen in een kerk</li>
              <li>Privé karaoke</li>
              <li>Beat the Matrix</li>
              <li>De Gym (fitness)</li>
            </ul>
          </div>
        </div>

        <div className="relative rounded-2xl overflow-hidden">
          <img src="/hve-horeca2.jpg" alt="Cateringruimte achtergrond" className="absolute inset-0 w-full h-full object-cover opacity-25 blur-sm" aria-hidden />
          <div className="relative space-y-6 p-4 md:p-6">
            <h2 className="text-2xl font-bold">Onze founders</h2>
            <div className="grid md:grid-cols-2 gap-6">
            {founders.map((f, i) => (
              <div key={f.name} className="card p-6 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-4">
                  <img src={f.img} alt={f.name} className="w-20 h-20 rounded-full object-cover" />
                  <div>
                    <h3 className="text-lg font-bold">{f.name}</h3>
                    <p className="text-white/70 text-sm">{f.role}</p>
                  </div>
                </div>
                <ul className="text-white/80 mt-4 list-disc pl-5 space-y-1">
                  {f.bullets.map((b, idx) => (
                    <li key={idx}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Bezoek ons</h2>
            <p className="text-white/80">Hart van Eindhoven, Ploegstraat 3, 5615 HA Eindhoven</p>
            <div className="flex gap-3" aria-label="Social links">
              <SocialIcon label="Instagram" href="#">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </SocialIcon>
              <SocialIcon label="Facebook" href="#">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2v-3h2v-2.3c0-2 1.2-3.2 3-3.2.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.2V12h2.2l-.4 3h-1.8v7A10 10 0 0 0 22 12z"/></svg>
              </SocialIcon>
              <SocialIcon label="TikTok" href="#">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21 8.5a7.4 7.4 0 0 1-5-1.9v7.2a5.3 5.3 0 1 1-4.6-5.2v2.8a2.5 2.5 0 1 0 2 2.4V2h2a5.4 5.4 0 0 0 5.6 5.3z"/></svg>
              </SocialIcon>
              <SocialIcon label="LinkedIn" href="#">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M6.94 6.5A2.44 2.44 0 1 1 4.5 4.06 2.44 2.44 0 0 1 6.94 6.5zM4.75 9h4.4v11h-4.4zM13.5 9h4.2v1.7h.1A4.6 4.6 0 0 1 22 15.6V20h-4.4v-3.8c0-.9 0-2-1.2-2s-1.4 1-1.4 2V20H10.6V9h2.9z"/></svg>
              </SocialIcon>
            </div>
          </div>
          <div className="card overflow-hidden h-[360px] animate-fade-in" aria-label="Kaart locatie">
            <iframe
              title="Google Maps"
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
