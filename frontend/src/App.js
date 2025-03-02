import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import axios from "axios";
import TripMap from "./components/TripMap";

// Home component
const Home = () => {
  return (
    <div>
      <h1>WeatherSync Team Messages:</h1>
      <nav>
        <ul>
          <li><Link to="/hello">View Hello Message</Link></li>
          <li><Link to="/mark">View Mark's Message</Link></li>
          <li><Link to="/julian">View Julian's Message</Link></li>
          <li><Link to="/michael">View Michael's Message</Link></li>
          <li><Link to="/giselle">View Giselle's Message</Link></li>
          <li><Link to="/nate">View Nate's Message</Link></li>
        </ul>
      </nav>
      <h2>TripSync Map</h2>
      <TripMap />
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

// Julian's Message component
const JulianMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/julian/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching julian's message:", error));
  }, []);

  return (
    <div>
      <h2>Julian's Message</h2>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

// Michael's Message component
const MichaelMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/michael/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching michael's message:", error));
  }, []);

  return (
    <div>
      <h2>Michael's Message</h2>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

// Giselle's Message component
const GiselleMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/giselle/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching giselle's message:", error));
  }, []);

  return (
    <div>
      <h2>Giselle's Message</h2>
      <p>{message}</p>
      <Link to="/">Back to Home</Link>
    </div>
  );
};

// Nate's Message component
const NateMessage = () => {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/nate/")
      .then(response => setMessage(response.data.message))
      .catch(error => console.error("Error fetching nate's message:", error));
  }, []);

  return (
    <div>
      <h2>Nate's Message</h2>
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
        <Route path="/julian" element={<JulianMessage />} />
        <Route path="/michael" element={<MichaelMessage />} />
        <Route path="/giselle" element={<GiselleMessage />} />
        <Route path="/nate" element={<NateMessage />} />
      </Routes>
    </Router>
  );
}

export default App;