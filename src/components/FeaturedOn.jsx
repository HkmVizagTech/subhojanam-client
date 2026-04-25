import "../styles/featured.css"

function FeaturedOn() {
  const logos = [
    { src: "/images/timesofindia.webp", alt: "The Times of India", className: "" },
    { src: "/images/thehindu-logo.svg", alt: "The Hindu", className: "" },
    { src: "/images/indian-express.webp", alt: "The Indian Express", className: "indian-express-logo" },
    { src: "/images/eenadu-logo.webp", alt: "Eenadu", className: "" }
  ];

  return (
    <section className="featured-section">

      <h2 className="featured-title">
        Featured On
        <span className="underline"></span>
      </h2>

      <div className="featured-logos-wrapper">
        <div className="featured-logos">
          {logos.map((logo, index) => (
            <img key={index} src={logo.src} alt={logo.alt} className={logo.className} />
          ))}
          {logos.map((logo, index) => (
            <img key={`duplicate-${index}`} src={logo.src} alt={logo.alt} className={logo.className} />
          ))}
        </div>
      </div>

    </section>
  )
}

export default FeaturedOn