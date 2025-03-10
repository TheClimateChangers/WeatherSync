import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Search = () => {
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

export default Search;
