import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./AppV1";
import StarRating from "./StarRating";

// function Test() {
//   const [movieRating, setMovieRating] = useState(0);
//   return (
//     <div>
//       <StarRating onSetRating={setMovieRating} color="blue" />
//       <p>This movies was rated {movieRating} stars</p>
//     </div>
//   );
// }

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating
      maxRating={5}
      messages={["Terrible", "Bad", "Okay", "Good", "Amazing"]}
    />
    <StarRating maxRating={4} color="red" size={24} />
    <StarRating maxRating={4} color="red" size={24} defaultRating={3} /> */}
    {/* <Test /> */}
  </React.StrictMode>
);
