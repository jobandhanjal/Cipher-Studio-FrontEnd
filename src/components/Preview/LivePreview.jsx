import React, { useState } from "react";
import { SandpackPreview } from "@codesandbox/sandpack-react";

const LivePreview = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        backgroundColor: "#1e1e1e",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {loading && !error && <p style={{ color: "#fff" }}>Loading preview...</p>}
      {error && (
        <div style={{ color: "#ff4d4f", textAlign: "center" }}>
          <p>Something went wrong with the live preview.</p>
          <p>{error.message || "Unknown error"}</p>
        </div>
      )}
      <SandpackPreview
        showOpenInCodeSandbox={false}
        showRefreshButton={true}
        style={{
          height: "100%",
          width: "100%",
          border: "1px solid #333",
          display: error ? "none" : "block",
        }}
        onLoad={() => setLoading(false)}
        onError={(err) => {
          console.error("LivePreview error:", err);
          setError(err);
        }}
      />
    </div>
  );
};

export default LivePreview;