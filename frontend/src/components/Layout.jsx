// Layout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import SideBar from "./SideBar";
import "../styles/Layout.css"; // Make sure this file exists

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
    </div>
  );
};

export default Layout;
