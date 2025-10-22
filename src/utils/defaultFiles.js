// src/utils/defaultFiles.js
// Minimal React app seed files for Sandpack

const defaultFiles = {
  '/App.js': `import React from "react";

export default function App() {
  return <h1>Hello from CipherStudio!</h1>;
}
`,
  '/index.js': `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
`,
};

export default defaultFiles;
