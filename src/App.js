import Cloud from "./components/Cloud";
import Competencies from "./components/Competencies";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import Nav from "./components/Nav";
import Prototypes from "./components/Prototypes";
import Security from "./components/Security";
import classes from "./App.module.css";

function App() {
  return (
    <div className={classes.pagewrap}>
      <nav>
        <Nav />
      </nav>
      <main>
        <Hero />
        <Competencies />
        <Prototypes />
        <Cloud />
        <Security />
      </main>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default App;
