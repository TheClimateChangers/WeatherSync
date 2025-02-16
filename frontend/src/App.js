import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [helloMessage, setHelloMessage] = useState("");
  const [marksMessage, setMarksMessage] = useState("");

  useEffect(() => {
    // Fetch the Hello World message
    axios.get("http://127.0.0.1:8000/api/hello/")
      .then(response => setHelloMessage(response.data.message))
      .catch(error => console.error("Error fetching hello message:", error));

    // Fetch Mark's message
    axios.get("http://127.0.0.1:8000/api/mark/")
      .then(response => setMarksMessage(response.data.message))
      .catch(error => console.error("Error fetching marks message:", error));
  }, []);

  return (
    <div>
      <h1>Backend Responses:</h1>
      <p>{helloMessage}</p>  {/* Display Hello World message */}
      <p>{marksMessage}</p>  {/* Display Mark's message */}
    </div>
  );
}

export default App;
