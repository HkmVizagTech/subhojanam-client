import { Facebook, Instagram, Twitter, Youtube, MapPin, Mail, Phone } from "lucide-react";
import "../styles/footer.css";

const quickLinks = [
  { label: "About", href: "#about" },
  { label: "Impact", href: "#impact" },
  { label: "Stories", href: "#stories" },
  { label: "Transparency", href: "#transparency" },
  { label: "FAQ", href: "#faq" },
  { label: "Donate", href: "#donate" },
];

const socialLinks = [
  { icon: Facebook, href: "https://www.facebook.com/hkm.vizag", label: "Facebook" },
  { icon: Instagram, href: "https://www.instagram.com/harekrishnavizag", label: "Instagram" },
  // { icon: Twitter, href: "https://twitter.com/iskconvizag", label: "Twitter" },
  { icon: Youtube, href: "https://www.youtube.com/user/harekrishnavizag", label: "YouTube" },
];

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Annadana Seva</h3>
            <p className="footer-subtitle">ISKCON Hospital Feeding Program</p>
            <div className="footer-contact-item">
              <MapPin />
              <span>
                KGH Down Rd, beside orthopedic ward,<br />
                Maharani Peta, Visakhapatnam,<br />
                AP 530002
              </span>
            </div>
            <div className="footer-contact-item">
              <Mail />
              <a href="mailto:mukunda@hkmvizag.org">mukunda@hkmvizag.org</a>
            </div>
            <div className="footer-contact-item">
              <Phone />
              <a href="tel:+918977761187">+91 8977761187</a>
            </div>
          </div>

          <div className="footer-links">
            <h4>Quick Links</h4>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-social">
            <h4>Connect With Us</h4>
            <div className="footer-social-icons">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="footer-social-icon"
                >
                  <social.icon />
                </a>
              ))}
            </div>
            <a href="#donate" className="footer-donate-btn">
              Donate Now
            </a>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Hare Krishna Movement Visakhapatnam — Annadana Seva</p>
          <div className="footer-bottom-links">
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
