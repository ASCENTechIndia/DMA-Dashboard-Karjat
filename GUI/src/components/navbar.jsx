import React from "react";
// import logo from "../assets/logo.png"; // your static logo

export default function Navbar() {
  return (
    <>
      <style>{`
        .navbar-root {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          box-shadow: 0 4px 20px rgba(0,0,0,0.18);
        }
        .navbar-inner {
          width: 100%;
          display: flex;
          height: 94px;
        }
        .navbar-logo-panel {
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #054b65;
          background: white;
          min-width: 80px;
          width: 10%;
          flex-shrink: 0;
        }
        .navbar-logo-img {
          height: 64px;
          width: auto;
          object-fit: contain;
        }
        .navbar-title-panel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #054b65;
          padding: 0 12px;
          min-width: 0;
        }
        .navbar-title {
          color: white;
          font-weight: 700;
          text-align: center;
          font-size: clamp(1rem, 3vw, 1.8rem);
          line-height: 1.2;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        @media (max-width: 640px) {
          .navbar-inner {
            height: 60px;
          }
          .navbar-logo-panel {
            display: none;
          }
          .navbar-title {
            font-size: clamp(0.9rem, 5vw, 1.3rem);
            white-space: normal;
            line-height: 1.25;
          }
        }
        @media (max-width: 400px) {
          .navbar-inner {
            height: 56px;
          }
        }
      `}</style>

      <nav className="navbar-root">
        <div className="navbar-inner">

          {/* LEFT LOGO */}
          <div className="navbar-logo-panel">
            <img
              // src={logo}
              alt="Logo"
              className="navbar-logo-img"
            />
          </div>

          {/* CENTER TITLE */}
          <div className="navbar-title-panel">
            <h1 className="navbar-title">
              DMA Dashboard
            </h1>
          </div>

          {/* RIGHT SECTION */}
          <div className="navbar-logo-panel">
            {/* Right logo or content */}
          </div>

        </div>
      </nav>
    </>
  );
}