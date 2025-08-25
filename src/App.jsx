import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./App.css";
import "./utility.css";
import "./New.css";
import axios from "axios";
import getRandomImage from "./RandomImage";

export default function App() {
  const [theme, setTheme] = useState("dark");
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [cards, setCards] = useState([]);

  // 🔹 Utility to make a safe slug from room name
  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

  // Load cards from backend
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/rooms")
      .then((res) => setCards(res.data))
      .catch((err) => console.error("Error fetching rooms:", err));
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const addCard = async () => {
    if (name.trim() === "") return;

    try {
      const res = await axios.post("http://localhost:5000/api/rooms", { name });
      setCards([...cards, res.data]); // append new room from backend
      setName("");
      setShowModal(false);
    } catch (err) {
      console.error("Error creating room:", err);
    }
  };

  return (
    <div className={`app ${theme}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">codeRoom🚀✨</div>
        <input
          type="text"
          placeholder="Search your CodeRoom Here ...."
          className="search-bar"
        />
        <div className="nav-buttons">
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? (
              <span className="icon sun" key="sun">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="5" fill="#FFD600" />
                  <g stroke="#FFD600" strokeWidth="2">
                    <line x1="12" y1="2" x2="12" y2="5" />
                    <line x1="12" y1="19" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="5" y2="12" />
                    <line x1="19" y1="12" x2="22" y2="12" />
                    <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
                    <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
                    <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
                    <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
                  </g>
                </svg>
              </span>
            ) : (
              <span className="icon moon" key="moon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 12.79A9 9 0 0111.21 3a7 7 0 100 14A9 9 0 0021 12.79z"
                    fill="#90caf9"
                  />
                </svg>
              </span>
            )}
          </button>
          <button id="newRoomBtn" onClick={() => setShowModal(true)}>
            New
            <svg id="editBtn" fill="none" viewBox="0 0 20 20">
              <path
                fill="#fff"
                d="M2.5 14.375V17.5h3.125l9.217-9.217-3.125-3.125L2.5 14.375Zm14.758-8.508a.83.83 0 0 0 0-1.175l-1.95-1.95a.83.83 0 0 0-1.175 0l-1.525 1.525 3.125 3.125 1.525-1.525Z"
              ></path>
            </svg>
          </button>
          <button>Home</button>
          <button>About</button>
          <button>Connect</button>
        </div>
      </nav>

      {/* Main content */}
      {cards.map((card, index) => (
        <div className="card" key={index}>
          <Link to={`/room/${card.slug || slugify(card.name)}`}>
            <div className="card-image">
              <img src={getRandomImage()} alt="Room" className="card-image" />
            </div>
            <div className="card-name">{card.name}</div>
          </Link>
        </div>
      ))}

      {/* Modal for Post */}
      {showModal && (
        <div className="modal">
          <div className="modal-content" id="newRoomModal">
            <h2>Create New CodeRoom 🚀✨</h2>

            <input
              type="text"
              placeholder="Think of a codeRoom Name 🧑🏻‍💻 ..."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="modal-actions">
              <button
                onClick={() => {
                  const plane = document.querySelector(".icon-paper-plane");
                  plane.classList.add("fly-path");
                  plane.addEventListener(
                    "animationend",
                    () => {
                      addCard();
                      plane.classList.remove("fly-path");
                    },
                    { once: true }
                  );
                }}
                className="btn-green post"
              >
                Post
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="icon-paper-plane"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="btn-green cancel"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
