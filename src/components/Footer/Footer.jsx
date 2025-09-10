import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Nolare. Todos os direitos reservados.</p>
    </footer>
  );
};

export default Footer;
