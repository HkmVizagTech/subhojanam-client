import { Heart, Award } from "lucide-react"
import "../styles/navbar.css"

function Navbar() {
  const scrollToDonation = () => {
    const donationSection = document.querySelector('.main-section')
    if (donationSection) {
      donationSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
     <header className="navbar">
      <div className="navbar__container">

        <div className="navbar__logo">
          <img src={"https://storage.googleapis.com/subhojanam/logo.png"} alt="Hare Krishna Logo" />
        </div>

        <div className="navbar__buttons">
             <button className="donate-btn navbar-donate-btn" onClick={scrollToDonation}>
            <Heart className="donate-btn-icon" />
            Donate Now
          </button>

          <button className="exempt-btn" onClick={scrollToDonation}>
            <Award className="exempt-btn-icon" />
            80G Exempt
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar
