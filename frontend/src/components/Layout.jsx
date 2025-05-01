// Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import SideBar from "./SideBar";
import Footer from "./Footer"
import "../styles/Layout.css";

const Layout = () => {
  return (
    <div className="layout-container">
      <NavBar />
      <div className="layout-body">
        <SideBar />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
      <Footer />

    </div>
  );
};

export default Layout;
