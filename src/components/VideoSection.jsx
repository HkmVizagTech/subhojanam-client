import "../styles/video.css"

function VideoSection() {
  return (
    <section className="video-section">

      <h2>See Annadaan Seva In Action</h2>
      <p>Witness how your donation transforms into warm prasadam.</p>

      <div className="video-box">
        <iframe
         src="https://youtu.be/cJoNqu4YqTk?si=WWjPbn9JF3c7dn7j"        
          title="Subhojanam Video"
          allowFullScreen
        ></iframe>
      </div>

    </section>
  )
}

export default VideoSection
