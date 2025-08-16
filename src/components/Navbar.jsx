import React from "react";

export default function Navbar({ onAdd }) {
  return (
    <nav className="navbar">
      <div className="nav-left">
        <h1 className="logo">codeRoom🚀✨</h1>
        <input
          type="text"
          className="search-bar"
          placeholder="Search your CodeRoom Here...."
        />
      </div>
      <button className="add-btn" onClick={onAdd}>+</button>
    </nav>
  );
}
