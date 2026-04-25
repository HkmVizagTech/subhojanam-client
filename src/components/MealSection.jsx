import "../styles/Meal.css"
import mealImg from "../assets/meal.png"

function MealSection() {
  const scrollToDonation = () => {
    const donationSection = document.querySelector('.main-section')
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <section className="meal-section">

      <h2>This Is The Meal Your Donation Serves</h2>
      <p>Freshly prepared prasadam served daily with love</p>

      <div className="meal-box">

        <img src={"/images/meal.webp"} loading="lazy" alt="Meal Plate" className="meal-img" />

        <div className="meal-items">

          <div className="meal-card">
            <div className="emoji">🍚</div>
            <h4>Steaming Rice</h4>
            <span>Freshly cooked</span>
          </div>

          <div className="meal-card">
            <div className="emoji">🍲</div>
            <h4>Dal/Sambar</h4>
            <span>Rich in protein</span>
          </div>

          <div className="meal-card">
            <div className="emoji">🥘</div>
            <h4>Seasonal Sabji</h4>
            <span>Fresh vegetables</span>
          </div>

          <div className="meal-card">
            <div className="emoji">🥛</div>
            <h4>Buttermilk</h4>
            <span>Cooling & healthy</span>
          </div>

           </div>
        <p className="kitchen-text">
          Prepared in FSSAI-certified ISKCON temple kitchens with the highest
          standards of <br />cleanliness and devotion
        </p>

        <p className="price-text">
          ₹25 feeds one caregiver. Your kindness becomes nourishment.
        </p>

        <button className="meal-btn" onClick={scrollToDonation}>
          Feed Someone Today ❤️
        </button>


      </div>

    </section>
  )
}

export default MealSection
