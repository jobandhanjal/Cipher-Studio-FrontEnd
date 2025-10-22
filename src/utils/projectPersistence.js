// src/utils/projectPersistence.js
// Utilities for exporting and importing project state as JSON

export function exportProject(files, activeFile) {
  const data = JSON.stringify({ files, activeFile }, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cipherstudio-project.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function importProject(file, onLoad) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (Array.isArray(data.files) && typeof data.activeFile === "string") {
        onLoad(data);
      } else {
        alert("Invalid project file format.");
      }
    } catch (err) {
      alert("Failed to parse project file.");
    }
  };
  reader.readAsText(file);
}
