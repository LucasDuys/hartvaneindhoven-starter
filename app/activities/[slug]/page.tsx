import Link from "next/link";
import { Metadata } from "next";
import ActivityClient from "./ActivityClient";

type Params = { params: { slug: string } };

const copy: Record<string, {
  title: string;
  summary: string;
  duration: string;
  heroImage: string;
  gallery: string[];
  pricing: { time: string; price: string; }[];
  faqs: { q: string; a: string; }[];
}> = {
  "bowlen": {
    title: "Bowlen",
    summary: "Unieke bowlingbanen in een kerk met neon vibe. Capaciteit: 6 p.p. per baan. Perfect voor groepen en families.",
    duration: "60–120 minuten",
    heroImage: "https://source.unsplash.com/random/1920x1080/?bowling",
    gallery: [
      "https://source.unsplash.com/random/400x300/?bowling1",
      "https://source.unsplash.com/random/400x300/?bowling2",
      "https://source.unsplash.com/random/400x300/?bowling3"
    ],
    pricing: [
      { time: "Doordeweeks (off-peak)", price: "€25 per baan/uur" },
      { time: "Weekend (peak)", price: "€35 per baan/uur" }
    ],
    faqs: [
      { q: "Zijn bumpers beschikbaar?", a: "Ja, voor kinderen tot 12 jaar." },
      { q: "Hoe annuleer ik?", a: "Annuleren tot 24 uur voor de boeking is gratis." },
      { q: "Wat is inbegrepen?", a: "Banen, ballen en schoenen. Eten en drinken extra." }
    ]
  },
  "karaoke": {
    title: "Karaoke",
    summary: "Privékamers met top sound. Kies je playlist en zing mee. Van solo tot groep.",
    duration: "60–120 minuten",
    heroImage: "https://source.unsplash.com/random/1920x1080/?karaoke",
    gallery: [
      "https://source.unsplash.com/random/400x300/?karaoke1",
      "https://source.unsplash.com/random/400x300/?karaoke2",
      "https://source.unsplash.com/random/400x300/?karaoke3"
    ],
    pricing: [
      { time: "Doordeweeks", price: "€10 p.p./uur" },
      { time: "Weekend", price: "€15 p.p./uur" }
    ],
    faqs: [
      { q: "Hoeveel mensen per kamer?", a: "Tot 10 personen." },
      { q: "Eigen muziek?", a: "Ja, via USB of streaming." },
      { q: "Minimumleeftijd?", a: "12 jaar, of met ouders." }
    ]
  },
  "beat-the-matrix": {
    title: "Beat the Matrix",
    summary: "Interactieve challenge rooms met puzzels en teamwork. Test je behendigheid.",
    duration: "60 minuten",
    heroImage: "https://source.unsplash.com/random/1920x1080/?game,challenge",
    gallery: [
      "https://source.unsplash.com/random/400x300/?matrix1",
      "https://source.unsplash.com/random/400x300/?matrix2",
      "https://source.unsplash.com/random/400x300/?matrix3"
    ],
    pricing: [
      { time: "Alle dagen", price: "€14 p.p." }
    ],
    faqs: [
      { q: "Hoeveel spelers?", a: "2-6 personen per sessie." },
      { q: "Duur?", a: "Exact 60 minuten." },
      { q: "Boekbaar voor kinderen?", a: "Vanaf 8 jaar." }
    ]
  }
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const data = copy[params.slug] ?? { title: "Activiteit" };
  return {
    title: `${data.title} - Hart van Eindhoven`,
    description: data.summary,
    openGraph: {
      images: [data.heroImage],
    },
  };
}

export default function ActivityPage({ params }: Params) {
  const data = copy[params.slug] ?? { title: "Activiteit", summary: "Details volgen.", duration: "", heroImage: "", gallery: [], pricing: [], faqs: [] };
  return (
    <>
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url('${data.heroImage}')` }} aria-label={`${data.title} hero image`}>
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{data.title}</h1>
          <p className="text-xl text-white/90">{data.summary}</p>
        </div>
      </section>
      <article className="container py-16 space-y-12">
        <section className="animate-fade-in">
          <h2 className="text-2xl font-bold mb-2">Details</h2>
          <p className="text-white/70 mb-4">Duur: {data.duration}</p>
          <Link href={`/booking?activity=${params.slug}`} className="btn-primary inline-block px-8 py-3">Boek nu</Link>
        </section>

        <section className="animate-fade-in" aria-label="Media gallery">
          <h2 className="text-2xl font-bold mb-6">Galerij</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {data.gallery.map((img, i) => (
              <div key={i} className="card overflow-hidden" style={{ animationDelay: `${i * 0.1}s` }}>
                <img src={img} alt={`${data.title} afbeelding ${i+1}`} className="w-full h-48 object-cover" />
              </div>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8 animate-fade-in">
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Prijzen</h2>
            <table className="w-full text-white/80">
              <thead>
                <tr><th className="text-left pb-2">Tijd</th><th className="text-left pb-2">Prijs</th></tr>
              </thead>
              <tbody>
                {data.pricing.map((p, i) => (
                  <tr key={i}><td className="pb-2">{p.time}</td><td className="pb-2">{p.price}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-4">Extra's</h2>
            <p className="text-white/70">Add-ons zoals eten en drinken beschikbaar tijdens boeking.</p>
          </div>
        </section>

        <section className="animate-fade-in" aria-label="Veelgestelde vragen">
          <h2 className="text-2xl font-bold mb-6">Veelgestelde Vragen</h2>
          <div className="space-y-4">
            {data.faqs.map((faq, i) => (
              <details key={i} className="card p-4 [&:open]:bg-accent-500/10">
                <summary className="font-semibold cursor-pointer list-none" aria-expanded="false">{faq.q}</summary>
                <p className="mt-2 text-white/80">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <ActivityClient slug={params.slug} title={data.title} />
      </article>
    </>
  );
}
