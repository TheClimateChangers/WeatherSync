import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Plan = () => {
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

export default Plan;