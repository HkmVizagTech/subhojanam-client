import "../styles/video.css"

function VideoSection() {
  return (
    <section className="video-section">

      <h2>See Annadaan Seva In Action</h2>
      <p>Witness how your donation transforms into warm prasadam.</p>

      <div className="video-box">
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/cJoNqu4YqTk?si=ujuCjEL7uGwHgj_s"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        ></iframe>
      </div>

    </section>
  )
}

export default VideoSection
