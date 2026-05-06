import "../styles/hero.css"

function Hero() {
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
    />
  );
}

export default Hero
