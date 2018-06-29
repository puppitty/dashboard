import React from "react";
import { NavLink } from "react-router-dom";
// import Hero from "../components/Hero";

// <Hero backgroundImage="./assets/images/SunsetRidge.jpg">
// </Hero>

const Navbar = () => (
  <nav className="navbar navbar-expand-lg navbar-light bg-light">
    <NavLink className="navbar-brand" to="/">Home</NavLink>

    <div className="collapse navbar-collapse" id="navbarNav">
      <ul className="navbar-nav">
        <li className="nav-item">
          <NavLink className="nav-link" to="/">News </NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/board">Community Board</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/calendar">Calendar</NavLink>
        </li>
        <li className="nav-item">
          <NavLink className="nav-link" to="/weather">Weather</NavLink>
        </li>
      </ul>
    </div>
  </nav>
)

export default Navbar;