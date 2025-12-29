import Navigation from "./components/Navigation";
import Hero from "./components/Hero";
import WinterPrograms from "./components/WinterPrograms";
import ProgramCards from "./components/ProgramCards";
import AcademyLocations from "./components/AcademyLocations";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <WinterPrograms />
      <ProgramCards />
      <AcademyLocations />
      <Footer />
    </main>
  );
}
