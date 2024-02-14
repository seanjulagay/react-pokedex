import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Directory({ dexOpened }) {
  const [pokemon, setPokemon] = useState(["bulbasaur", "ivysaur"]);

  useEffect(() => {
    axios
      .get("https://pokeapi.co/api/v2/pokemon?offset=8&limit=8")
      .then((res) => {
        setPokemon(res.data.results.map((mon) => mon.name));
      });
    console.log(pokemon);
  }, []);

  useEffect(() => {
    if (dexOpened) {
      handleTextSize();
    }
  }, [dexOpened]);

  return (
    <div className={`directory ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="directory-container">
        <div className="directory-header-container">
          <h1 className="directory-header">Select Pokemon</h1>
        </div>
        <div className="directory-content-container">
          <div className="directory-content-block">Item 1</div>
          <div className="directory-content-block">Item 2</div>
          <div className="directory-content-block">Item 3</div>
          <div className="directory-content-block">Item 4</div>
          <div className="directory-content-block">Item 5</div>
          <div className="directory-content-block">Item 6</div>
          <div className="directory-content-block">Item 7</div>
          <div className="directory-content-block">Item 8</div>
        </div>
      </div>
    </div>
  );
}

function handleTextSize() {
  const changeTextSize = () => {
    const directoryHeader = document.querySelector(".directory-header");
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;

    directoryHeader.style.fontSize = parseFloat(dexImgWidth) * 0.02 + "px";
  };

  changeTextSize();

  window.addEventListener("resize", handleTextSize);

  return () => {
    window.removeEventListener("resize", handleTextSize);
  };
}
