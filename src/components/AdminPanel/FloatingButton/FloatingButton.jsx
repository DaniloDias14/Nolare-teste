import React, { useState } from "react";
import "./FloatingButton.css";
import Config from "../Config/Config";

const FloatingButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className="floating-btn" onClick={() => setOpen(!open)}>
        ⚙️
      </button>
      {open && <Config onClose={() => setOpen(false)} />}
    </>
  );
};

export default FloatingButton;
