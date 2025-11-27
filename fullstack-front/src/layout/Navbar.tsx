import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d)', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/home" style={{ letterSpacing: '0.5px' }}>
          <i className="bi bi-mortarboard-fill me-2"></i>
          Student Admission Portal
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button
                className="btn btn-outline-light btn-sm rounded-pill px-4"
                onClick={async () => {
                  const email = localStorage.getItem('userEmail');
                  if (email) {
                    try {
                      await axios.post('http://localhost:8080/api/auth/logout', { email });
                    } catch (error) {
                      console.error('Logout failed', error);
                    }
                    localStorage.removeItem('userEmail');
                  }
                  window.location.href = '/';
                }}
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
