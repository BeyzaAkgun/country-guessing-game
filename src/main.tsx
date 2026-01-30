
  // import { createRoot } from "react-dom/client";
  // import App from "./app/App.tsx";
  // import "./styles/index.css";

  // createRoot(document.getElementById("root")!).render(<App />);
  

import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import "@/styles/index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "@/app/App";
// import "@/styles/index.css";


// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <h1>APP IS RENDERING</h1>
// );


