import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";
import InstallPrompt from "../components/InstallPrompt";
import "./Landing.css";

const API_BASE = import.meta.env.MODE === "development" ? "http://localhost:5000/api" : "/api";

const Landing = () => {
  const { isAuthenticated, user } = useAuthStore();
  const primaryCta = isAuthenticated
    ? user?.role === "admin"
      ? "/admin/dashboard"
      : user?.role === "shelter"
        ? "/shelter/dashboard"
        : "/dashboard"
    : "/signup";
  const secondaryCta = isAuthenticated ? "/pets" : "/login";
  const [stats, setStats] = useState({
    availablePets: 0,
    adoptedLastYear: 0,
    totalRescued: 0
  });

  useEffect(() => {
    const fetchPublicStats = async () => {
      try {
        const response = await axios.get(`${API_BASE}/pets/stats`);
        setStats({
          availablePets: response.data.stats.totalAvailable || 0,
          adoptedLastYear: response.data.stats.totalAdopted || 0,
          totalRescued: response.data.stats.totalRescued || 0
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchPublicStats();
  }, []);

  return (
    <div className="landing" id="home">
      <div className="landing-paws" aria-hidden />
      <header className="landing-nav">
        <div className="nav-left">
          <Link className="nav-brand" to="/">
            FurAdopt
          </Link>
          <nav className="nav-links">
            <a href="#impact">Sponsor</a>
            <a href="#process">Adopt</a>
            <a href="#stories">Stories</a>
            <a href="#contact">Contact</a>
          </nav>
        </div>
        <div className="nav-right">
          {isAuthenticated ? (
            <>
              <span className="nav-user">{user?.name || user?.shelterName || user?.email}</span>
              <Link className="nav-cta" to={primaryCta}>
                Go to dashboard
              </Link>
            </>
          ) : (
            <>
              <Link className="nav-ghost" to="/login">
                Log in
              </Link>
              <Link className="nav-cta" to={primaryCta}>
                Get started
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="landing-main">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Adopt. Sponsor. Rescue.</p>
            <h1>
              Get your family <span>a new member.</span>
            </h1>
            <p className="lede">
              Open your doors and your heart to pets in need of a home. We match you with
              loving companions and guide you through every step, from first hello to first hug.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-primary" to={primaryCta}>
                Explore pets
              </Link>
              <Link className="btn btn-secondary" to={secondaryCta}>
                Meet our shelters
              </Link>
            </div>
            <div className="hero-trust">
              <div className="trust-badge">Safe + vetted process</div>
              <p>Free orientation call, home-ready checklist, and post-adoption support.</p>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-photo" role="presentation" />
            <div className="stats-card" aria-label="Adoption impact stats">
              <div className="stat">
                <strong>{stats.availablePets}</strong>
                <span>Waiting for home</span>
              </div>
              <div className="stat">
                <strong>{stats.adoptedLastYear}</strong>
                <span>Adopted last year</span>
              </div>
              <div className="stat">
                <strong>{stats.totalRescued}</strong>
                <span>Rescued</span>
              </div>
            </div>
          </div>
        </section>

			<InstallPrompt className="install-landing" />

        <section className="pillars" id="impact">
          <div className="section-head">
            <p className="eyebrow">What we do</p>
            <h2>Every pet deserves a soft landing.</h2>
            <p className="section-lede">
              Whether you adopt, foster, or sponsor, you are building a bridge from rescue to
              forever. We partner with vetted shelters to keep pets healthy, socialized, and ready
              for your home.
            </p>
          </div>
          <div className="pillar-grid">
            <div className="pillar-card">
              <span className="icon">AD</span>
              <h3>Adopt with confidence</h3>
              <p>Health checks, behavior notes, and meet-and-greets tailored to your lifestyle.</p>
            </div>
            <div className="pillar-card">
              <span className="icon">SP</span>
              <h3>Sponsor a match</h3>
              <p>Cover food, meds, or transport for pets still waiting. See real-time updates.</p>
            </div>
            <div className="pillar-card">
              <span className="icon">RS</span>
              <h3>Faster rescues</h3>
              <p>Rapid response teams move pets from crisis to care within 48 hours.</p>
            </div>
          </div>
        </section>

        <section className="process" id="process">
          <div className="process-head">
            <p className="eyebrow">How it works</p>
            <h2>We guide you end-to-end.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <div className="step-num">01</div>
              <div>
                <h3>Tell us about your home</h3>
                <p>Share your routine, space, and preferences so we can curate the right companions.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">02</div>
              <div>
                <h3>Meet your shortlist</h3>
                <p>Book meetups in person or virtual. We provide behavior notes and foster feedback.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">03</div>
              <div>
                <h3>Adopt with support</h3>
                <p>We handle paperwork, vaccinations, and a two-week follow-up to settle everyone in.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="stories" id="stories">
          <div className="story-card">
            <div className="story-copy">
              <p className="eyebrow">Featured rescue</p>
              <h2>Milo found his running buddy.</h2>
              <p>
                Milo was shy after a long shelter stay. His foster family shared daily notes that helped
                match him with Ana, who jogs the city parks every morning. Two weeks in, Milo now waits
                by the door for their sunrise loop.
              </p>
              <div className="chips">
                <span className="chip">Vet cleared</span>
                <span className="chip">House trained</span>
                <span className="chip">High-energy</span>
              </div>
            </div>
            <div className="story-photo" role="presentation" />
          </div>
        </section>

        <section className="cta-band" id="contact">
          <div>
            <h2>Ready to welcome a new friend?</h2>
            <p>Start with a quick profile and we will pair you with pets that fit your rhythm.</p>
          </div>
          <div className="cta-actions">
            <Link className="btn btn-primary" to={primaryCta}>
              Start adoption
            </Link>
            <Link className="btn btn-secondary" to={secondaryCta}>
              Chat with us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
