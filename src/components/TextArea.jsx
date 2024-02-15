import React from "react";

export default function TextArea({ dexOpened }) {
  const textGrp = (
    <>
      <h1 className="text-area-header">Header</h1>
      <p className="text-area-content">
        The quick brown fox jumped over the lazy dog.
      </p>
    </>
  );

  return (
    <div className={`text-area ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="text-area-container">{textGrp}</div>
    </div>
  );
}
