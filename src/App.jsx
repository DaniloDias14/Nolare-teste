import { useState } from "react";
import Header from "./components/Header/Header";
import Comprar from "./components/Pages/Comprar/Comprar";
import Footer from "./components/Footer/Footer";
import FloatingButton from "./components/AdminPanel/FloatingButton/FloatingButton";
import "./index.css";

function App() {
  const [admLogged, setAdmLogged] = useState(false); // controla ADM

  return (
    <>
      <Header setAdmLogged={setAdmLogged} />{" "}
      {/* Passa setter para Header/LoginModal */}
      <Comprar />
      {admLogged && <FloatingButton />} {/* Só mostra se for admin */}
      <Footer />
    </>
  );
}

export default App;
