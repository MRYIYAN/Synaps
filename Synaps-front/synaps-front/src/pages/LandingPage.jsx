import React from "react";
import AuthButtons from "../components/AuthButtons";
import NavbarLanding from "../components/NavbarLanding"; 

const LandingPage = function() {
  return (
    <>
      <NavbarLanding />
      <div style={{ marginTop: "70px" }}>
        <h1>LandingPage</h1>
        <AuthButtons />
      </div>
    </>
  );
};

export default LandingPage;
