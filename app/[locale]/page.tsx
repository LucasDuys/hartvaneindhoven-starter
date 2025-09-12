import {useTranslations} from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const t = useTranslations('Home');

  return (
    <>
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden bg-cover bg-center" style={{ backgroundImage: "url('https://source.unsplash.com/random/1920x1080/?bowling,church')" }} aria-label="Hero section with bowling in church">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 text-center animate-fade-in max-w-4xl px-4">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">{t('title')}</h1>
          <p className="text-xl text-white/90 mb-8">{t('description')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/booking" className="btn-primary text-lg px-8 py-3">Reserveer nu</Link>
            <Link href="/activities" className="btn btn-primary text-lg px-8 py-3">Bekijk activiteiten</Link>
          </div>
        </div>
      </section>
      <section className="container py-16 space-y-12">
        <div className="text-center animate-fade-in">
          <h2 className="text-3xl font-bold mb-4">Onze Activiteiten</h2>
          <p className="text-white/70 max-w-2xl mx-auto">Ontdek ons aanbod van leuke en unieke ervaringen.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Bowlen', slug: 'bowlen', desc: 'Geniet van bowling op historische banen.' },
            { name: 'Karaoke', slug: 'karaoke', desc: 'Zing je favoriete hits in privé kamers.' },
            { name: 'Beat the Matrix', slug: 'beat-the-matrix', desc: 'Test je behendigheid in dit interactieve spel.' }
          ].map((activity, i) => (
            <Link key={i} href={`/activities/${activity.slug}`} className="card p-6 hover:scale-[1.01] transition animate-fade-in" style={{ animationDelay: `${i * 0.2}s` }} aria-label={`Bekijk ${activity.name}`}>
              <h3 className="text-xl font-bold mb-2">{activity.name}</h3>
              <p className="text-white/70">{activity.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}