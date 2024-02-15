import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Directory({ dexOpened, pokemon, activeIndex }) {
  // const handleNextSelection = () => {};

  return (
    <div className={`directory ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="directory-container">
        <div className="directory-header-container">
          <h1 className="directory-header">Select Pokemon</h1>
        </div>
        {/* {console.log(pokemon)}; */}
        <div className="directory-content-container">
          {pokemon.map((mon, index) => {
            return (
              <div
                key={index}
                className={`directory-content-block ${
                  activeIndex === index ? "active-index" : ""
                }`}
              >
                {formatDirectoryItem(index, mon.name)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function formatDirectoryItem(index, mon) {
  var monCaps = mon[0].toUpperCase() + mon.slice(1);

  if (index < 10) {
    return "#00" + index + "   " + monCaps;
  } else if (index >= 10 || index < 100) {
    return "#0" + index + "   " + monCaps;
  } else {
    return "#" + index + "   " + monCaps;
  }
}
