import ActivitiesExpand from "@/components/ActivitiesExpand";

const activities = [
  {
    slug: "bowlen",
    title: "Bowlen",
    desc: "Geniet van bowling op historische banen in een unieke kerksetting.",
    hero: "https://source.unsplash.com/random/800x600/?bowling",
  },
  {
    slug: "karaoke",
    title: "Karaoke",
    desc: "Zing je favoriete hits in privé kamers met professionele apparatuur.",
    hero: "https://source.unsplash.com/random/800x600/?karaoke",
  },
  {
    slug: "beat-the-matrix",
    title: "Beat the Matrix",
    desc: "Test je behendigheid in dit spannende interactieve spel.",
    hero: "https://source.unsplash.com/random/800x600/?laser,game",
  },
];

export default function Activities() {
  return (
    <>
      <section
        className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?activities')" }}
        aria-label="Activities overview"
      >
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Onze Activiteiten</h1>
          <p className="text-xl text-white/90">Ontdek ons unieke aanbod van entertainment in het hart van Eindhoven.</p>
        </div>
      </section>
      <section className="container py-16 space-y-12">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Kies je Avontuur</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Van bowling tot karaoke, vind de perfecte activiteit voor jou en je groep.</p>
        </div>
        <ActivitiesExpand activities={activities} />
      </section>
    </>
  );
}

