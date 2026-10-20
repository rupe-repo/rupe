import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { Pricing } from './components/Pricing';
import { Care } from './components/Care';
import { Process } from './components/Process';
import { About } from './components/About';
import { Story } from './components/Story';
import { Values } from './components/Values';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { BlogIndex, BlogPost } from './components/Blog';
import { WhatsAppButton } from './components/WhatsAppButton';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useReveal } from './hooks/useReveal';
import { useContent, usePage } from './i18n/context';
import { useBooted } from './hooks/useBooted';

export default function App() {
  useSmoothScroll();
  useReveal();
  useBooted();
  const t = useContent();
  const page = usePage();

  return (
    <>
      {/* The curtain is the home page's entrance; a blog reader goes straight in. */}
      {page.kind === 'home' ? <Preloader /> : null}
      <a className="skip-link" href="#main">
        {t.skipLink}
      </a>
      <Navbar />
      <main id="main">
        {page.kind === 'home' ? (
          <>
            <div className="hero-stage">
              <Hero />
            </div>
            {/* Alternates dark / light all the way down. */}
            <Portfolio />
            <Services />
            <Process />
            <Pricing />
            <Care />
            <About />
            <Story />
            <Values />
          </>
        ) : page.kind === 'blog' ? (
          <BlogIndex posts={page.posts} />
        ) : (
          <BlogPost post={page.post} />
        )}
        <FinalCTA />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
