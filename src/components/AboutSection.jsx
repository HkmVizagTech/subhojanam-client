import "../styles/about.css"

function AboutSection() {
  return (
    <>
      <section className="about-quote">
        <h2>
          "अन्नदानं परं दानम् — The gift of food is the greatest gift"
        </h2>
        <p>
          SERVING FOOD IS THE GREATEST CHARITY, THE HOLIEST FORM OF SEVA.
        </p>
      </section>

      <section className="about-section">

        <h2 className="about-title">About Annadana Seva</h2>

        <div className="about-content">

          <div className="left">
            <h3>Our Mission</h3>

            <p>
              Annadana Seva is ISKCON's initiative to serve nutritious,
              sacred meals to caregivers and their families at government hospitals.
              We bring the Lord's prasadam to those going through their hardest days.
            </p>

            <p>
              Every day, our dedicated team of volunteers distributes freshly prepared
              prasadam at multiple hospitals, ensuring no caregiver goes hungry while
              looking after their loved ones.
            </p>
          </div>

          <div className="right">
            <h3>What We Serve</h3>

            <ul>
              <li>Steamed rice, served hot & fresh to every individual</li>
              <li>Sambar with fresh vegetables, cooked in the temple kitchen</li>
              <li>Hygienic & nutritionally balanced meals</li>
              <li>FSSAI-certified temple kitchens</li>
            </ul>
          </div>

        </div>

      </section>
    </>
  )
}

export default AboutSection
