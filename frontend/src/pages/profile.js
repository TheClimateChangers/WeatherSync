import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Profile = () => {
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

export default Profile;
