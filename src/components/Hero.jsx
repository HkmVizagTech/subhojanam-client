import { useEffect, useRef } from "react";
import "../styles/hero.css"

function Hero() {
  const urgencyRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (urgencyRef.current) {
        urgencyRef.current.style.opacity = '0';
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    const donationSection = document.getElementById("donate") || document.getElementById("donation-section") || document.querySelector('.main-section');
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: "smooth", block: 'start' });
    }
  };

  return (
    <section
      className="hero"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label="Scroll to donation section"
    >
      <div className="hero__urgency" ref={urgencyRef}>
        🍱 Meals served daily — your support keeps it going
      </div>
    </section>
  );
}

export default Hero
