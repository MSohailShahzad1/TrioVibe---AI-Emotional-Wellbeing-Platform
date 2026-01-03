import React from 'react'
import './Main.css'
import { assets } from '../../assets/assets'
import { useState, useContext } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router';

import { useUser } from '../../Context/UserContext';






const Main = () => {
  //  const { user } = useContext(UserContext);
  const messages = [
    "How are you feeling today?",
    "Tell us how you're feeling!",
    "Your emotions matter.",
    "We're here to listen.",
    "Ready to begin your emotional check-in?"
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const { user, isAuthenticated, logout } = useUser();

  useEffect(() => {
    // Typing effect
    if (charIndex < messages[currentMessageIndex].length) {
      const typingTimer = setTimeout(() => {
        setDisplayedText((prev) => prev + messages[currentMessageIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 60); // typing speed (ms)

      return () => clearTimeout(typingTimer);
    } else {
      // Wait before moving to the next message
      const messageTimer = setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
        setDisplayedText("");
        setCharIndex(0);
      }, 2000); // delay after full message is typed

      return () => clearTimeout(messageTimer);
    }
  }, [charIndex, currentMessageIndex, messages]);
  return (
    <div className='main animate-fade-in-up'>
      <div className="nav">
        <p className="title gradient-text">Trio-Vibe</p>
        <Link to="/Profile" className="profile-link">
          <img src={user?.avatar || assets.user_icon} alt="profile" />
        </Link>
      </div>

      <div className="main-container">
        <div className="greet">
          <p>Hello, <span>{isAuthenticated ? user.name : 'User'}</span></p>
          <p className="typing">{displayedText}<span className="cursor">|</span></p>
        </div>

        <div className="cards">
          <Link to="/MultiModal" className="card glass-card group">
            <div className="card-content">
              <h3>Insight Hub</h3>
              <p>Analyze emotions through facial expressions, voice tone, and sentiment analysis.</p>
            </div>
            <img src={assets.compass_icon} alt="Analysis" />
          </Link>

          <Link to="/AI-Pal" className="card glass-card group">
            <div className="card-content">
              <h3>Therapy Pal</h3>
              <p>Engage with your AI companion for real-time emotional support and guidance.</p>
            </div>
            <img src={assets.bulb_icon} alt="AI Pal" />
          </Link>

          <Link to="/therapist" className="card glass-card group">
            <div className="card-content">
              <h3>Expert Connect</h3>
              <p>Schedule and manage professional consultations with certified therapists.</p>
            </div>
            <img src={assets.message_icon} alt="Consultations" />
          </Link>
        </div>
      </div>
    </div>
  )

}

export default Main
