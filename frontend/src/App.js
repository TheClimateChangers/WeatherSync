import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";

// Home component
const Home = () => {
  return (
    <div>
      <h1>WeatherSync Team Messages:</h1>
      <nav>
        <ul>
          <li><Link to="/hello">View Hello Message</Link></li>
          <li><Link to="/mark">View Mark's Message</Link></li>
        </ul>
      </nav>
    </div>
  );
};

// Hello Message component
const HelloMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/hello/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching hello message:", error));
  }, []);

  return (
    <div>
      <h2>Hello Message</h2>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

// Mark's Message component
const MarksMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/mark/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching marks message:", error));
  }, []);

  return (
    <div>
      <h2>Mark's Message</h2>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hello" element={<HelloMessage />} />
        <Route path="/mark" element={<MarksMessage />} />
      </Routes>
    </Router>
  );
}

export default App;