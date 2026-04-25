import "../styles/whySwasthya.css"
import kitchenImg from "../assets/cooking.png"   
import { FaCheck } from "react-icons/fa"

function WhySwasthya() {
  return (
    <section className="why-section">

      <div className="why-container">

      
        <div className="why-left">

          <h2 className="why-title">
            Why Subhojanam?
            <span className="underline"></span>
          </h2>

          <p className="why-desc">
            With Subhojanam, we're driven by a profound mission:
            <strong> to elevate healthcare quality by harnessing the transformative power of nutritious meals.</strong>
          </p>

          <p className="why-desc">
            For many in marginalized communities, accessing adequate healthcare is a daily struggle exacerbated by socioeconomic challenges. Consider these harsh realities:
          </p>

      
          <div className="why-item">
            <div className="icon-circle">
              <FaCheck />
            </div>
            <div>
              <h4>Financial Constraints</h4>
              <p>
                Lower-income families (₹7,000 to ₹25,000 monthly, SEC-D & E) lack medical insurance or savings,
                making them vulnerable to unexpected medical expenses.
              </p>
            </div>
          </div>

       
          <div className="why-item">
            <div className="icon-circle">
              <FaCheck />
            </div>
            <div>
              <h4>Daily Wage Dilemma</h4>
              <p>
                Most rely on unstable daily wages. When health crises arise, they must choose between medical care and survival,
                often losing crucial income.
              </p>
            </div>
          </div>

        </div>

      
        <div className="why-right">
          <img src={"/images/img1.webp"} loading="lazy" alt="Subhojanam Kitchen" />
        </div>

      </div>

    </section>
  )
}

export default WhySwasthya