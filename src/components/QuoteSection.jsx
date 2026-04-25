import "../styles/Quote.css"
import prabhu from "../assets/prabhu.jpg"

function QuoteSection() {
  return (
    <section className="quote-section">

      <div className="quote-box">

        <div className="left">
          <img src={"https://storage.googleapis.com/subhojanam/prabhu.jpg"} loading="lazy" alt="Srila Prabhupada" />
        </div>

        <div className="right">
         <div className="quote-mark">“</div>

          <p className="quote-text">
            No one within a ten-mile radius of our center should go hungry
          </p>

          <div className="author-section">
            <h3>— Srila Prabhupada</h3>
            <span className="author-title">
              Founder-Acharya of Worldwide Hare Krishna Movement
            </span>
          </div>
        </div>

      </div>

    </section>
  )
}

export default QuoteSection
