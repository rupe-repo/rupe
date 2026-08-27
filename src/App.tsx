import { Navbar } from './components/Navbar';
import { RupeStage } from './components/RupeStage';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { About } from './components/About';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useReveal } from './hooks/useReveal';

export default function App() {
  useSmoothScroll();
  useReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Navbar />
      {/* One canvas, one mark, for the entire page. */}
      <RupeStage />
      <main id="main">
        <div className="hero-stage">
          <Hero />
        </div>
        <Portfolio />
        <Services />
        <Process />
        <About />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
