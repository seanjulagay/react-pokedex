import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Directory({
  loading,
  dexOpened,
  pokemon,
  pageNumber,
  offset,
  activeIndex,
  handleTextSizeFunc,
}) {
  useEffect(() => {
    handleTextSizeFunc();
  }, [loading]);

  const formatDirectoryItem = (id, name) => {
    var nameCaps = name[0].toUpperCase() + name.slice(1);

    // if (indexOffset < 10) {
    //   return "#00" + indexOffset + "   " + monCaps;
    // } else if (indexOffset >= 10 || index < 100) {
    //   return "#0" + indexOffset + "   " + monCaps;
    // } else {
    //   return "#" + indexOffset + "   " + monCaps;
    // }

    // console.log(id, name);

    if (id < 10) {
      return "#000" + id + " " + nameCaps;
    } else if (id >= 10 && id < 100) {
      return "#00" + id + " " + nameCaps;
    } else if (id >= 100 && id < 1000) {
      return "#0" + id + " " + nameCaps;
    } else if (id >= 1000 && id < 10000) {
      return "#" + id + " " + nameCaps;
    } else {
      return "formatError";
    }
  };

  const directoryContent = pokemon.map((mon, index) => (
    <div
      key={index}
      className={`directory-content-block ${
        activeIndex === index ? "active-index" : ""
      }`}
    >
      {formatDirectoryItem(mon.id, mon.name)}
    </div>
  ));

  return (
    <div className={`directory ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="directory-container">
        <div className="directory-header-container">
          <h1 className="directory-header">Select Pokemon</h1>
        </div>
        {loading ? (
          <h1>Loading...</h1>
        ) : (
          <div className="directory-content-container">{directoryContent}</div>
        )}
      </div>
    </div>
  );
}
