import "./Footer.css";
import { FaFacebook, FaInstagram, FaLinkedin, FaTwitter } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Nolare</h3>
          <p>Encontre o imóvel dos seus sonhos com a gente.</p>
        </div>

        <div className="footer-section">
          <h4>Contato</h4>
          <div className="footer-contact">
            <div className="contact-item">
              <MdPhone size={18} />
              <span>(11) 1234-5678</span>
            </div>
            <div className="contact-item">
              <MdEmail size={18} />
              <span>contato@nolare.com.br</span>
            </div>
            <div className="contact-item">
              <MdLocationOn size={18} />
              <span>São Paulo, SP</span>
            </div>
          </div>
        </div>

        <div className="footer-section">
          <h4>Redes Sociais</h4>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <FaFacebook size={24} />
            </a>
            <a href="#" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
            <a href="#" aria-label="LinkedIn">
              <FaLinkedin size={24} />
            </a>
            <a href="#" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Nolare. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
