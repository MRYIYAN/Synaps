import React from "react";
import AuthButtons from "../components/AuthButtons";
import Navbar_landing from "../components/Navbar_landing"; 

const LandingPage = function() {
  return (
    <>
      <Navbar_landing />
      <div style={{ padding: "2rem", marginTop: "70px" }}>
        <h1>LandingPage</h1>
        <AuthButtons />
      </div>
    </>
  );
};

export default LandingPage;
