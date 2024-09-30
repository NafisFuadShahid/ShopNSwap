import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
<nav class="navbar navbar-expand-md bg-light navbar-light sticky-top shadow-sm">
  <div class="container-fluid">
    <Link class="navbar-brand" to="/">ShopNSwap</Link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <Link class="nav-link" to="/auth/register">Register</Link>
        </li>
        <li class="nav-item">
        <Link class="nav-link" to="/auth/Login">Login</Link>
        </li>
      </ul>
    </div>
  </div>
</nav>
  );
};

export default Navbar
