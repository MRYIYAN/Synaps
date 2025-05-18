import React, { useEffect, useState } from "react";
import SidebarPanel from "../components/SidebarPanel";
// ------------------------------------------------------------
// Componentes React
// ------------------------------------------------------------

/*
import Button     from "../components/Button";
import Card       from "../components/Card";
import LoginForm  from "../components/LoginForm";
import Modal      from "../components/Modal";
*/


// ------------------------------------------------------------//
//                              APP
// ------------------------------------------------------------//

const Home = function() {

  useEffect(() => {
    const token = localStorage.getItem("access_token"); 
    if (token) {
      console.log("Access Token JWT:", token); 
    } else {
      console.warn("No token found in localStorage.");
    }
  }, []);

  useEffect(() => {
    console.log("All localStorage keys:", Object.keys(localStorage)); // Muestra todas las claves de localStorage
  }, []);

  return (
    <div>
      <SidebarPanel />
    </div>
  );
}

export default Home;
