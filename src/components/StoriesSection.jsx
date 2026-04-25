import "../styles/stories.css"
import savitriAmmaImg from "../assets/savitriamma.png"
import rajeshImg from "../assets/rajesh.png"
import gouriImg from "../assets/gouri.png"

function StoriesSection() {
  return (
    <section className="stories">

      <h2>Hope Arrives on a Plate</h2>
      <p className="stories-sub">
        For a caregiver, a meal isn't just food. It's the strength to keep fighting.
      </p>

      <div className="stories-cards">

        <div className="story-card">
          <div className="quote">❝</div>

          <p className="hospital-name">King George Hospital</p>

          <p className="main-quote">
            "I used to choose between my hunger and his medicine. Today,
            because of you, I didn't have to choose."
          </p>

          <p className="story-text">
            Standing in the pharmacy line, Savitri Amma realized she had to skip lunch
            to afford her husband's pills. Then the Subhojanam van arrived. The hot meal
            gave her strength, and the money she saved bought the medicine.
          </p>

          <div className="story-user">
            <div className="avatar">
              <img src={"/images/savitriamma.webp"} loading="lazy" alt="Savitri Amma" />
            </div>
            <div>
              <strong>Savitri Amma</strong>
              {/* <p>Caregiver, Victoria Hospital</p> */}
            </div>
          </div>
        </div>

        <div className="story-card">
          <div className="quote">❝</div>

          <p className="hospital-name">Tata Memorial Cancer Hospital</p>

          <p className="main-quote">
            "My legs were trembling from hunger. I thought I would collapse
            before my son woke up."
          </p>

          <p className="story-text">
            Rajesh hadn't eaten in 3 days while waiting outside the ICU.
            "This meal gave me the strength to stand by his side for another night.
            It felt like God himself sent this plate."
          </p>

          <div className="story-user">
            <div className="avatar">
              <img src={"/images/rajesh.webp"} loading="lazy" alt="Rajesh" />
            </div>
            <div>
              <strong>Rajesh</strong>
              {/* <p>Father, Indira Gandhi Child Health</p> */}
            </div>
          </div>
        </div>

        <div className="story-card">
          <div className="quote">❝</div>

          <p className="hospital-name">Government General Hospital</p>

          <p className="main-quote">
            "In this big city of strangers, I felt invisible.
            When the volunteer served me, I felt seen."
          </p>

          <p className="story-text">
            Gouri traveled from a remote village with no one to help.
            "This prasadam wasn't just food; it was a message from Krishna
            that we haven't been forgotten."
          </p>

          <div className="story-user">
            <div className="avatar">
              <img src={"/images/gouri.webp"} loading="lazy" alt="Gouri" />
            </div>
            <div>
              <strong>Gouri</strong>
              {/* <p>Caregiver, Bowring Hospital</p> */}
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}

export default StoriesSection
