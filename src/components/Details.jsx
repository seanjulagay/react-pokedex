import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Details({
  innerRef,
  dexOpened,
  id,
  offset,
  totalPokemon,
}) {
  const [currentPokemonMainData, setCurrentPokemonMainData] = useState(null);
  const [currentPokemonSpeciesData, setCurrentPokemonSpeciesData] =
    useState(null);
  const [currentPokemonSprites, setCurrentPokemonSprites] = useState(null);
  const [preloadedSprites, setPreloadedSprites] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activePokemonData, setActivePokemonData] = useState({
    name: "Placeholder",
    id: 0,
    desc: "",
    spriteUrl: "",
    height: 0,
    weight: 0,
    types: "",
    base_stats: {
      hp: 0,
      atk: 0,
      def: 0,
      spd: 0,
      sp_atk: 0,
      sp_def: 0,
    },
  });

  useEffect(() => {
    getPokemonData();
    preloadSurroundingSprites();
  }, [offset]);

  useEffect(() => {
    if (dataLoaded) {
      setActivePokemonData({
        name: currentPokemonMainData[id - offset].name,
        id: currentPokemonMainData[id - offset].id,
        desc: getPokemonDesc(id - offset),
        spriteUrl: currentPokemonSprites[id - offset],
        height: currentPokemonMainData[id - offset].height / 10,
        weight: currentPokemonMainData[id - offset].weight / 10,
        types: formatTypes(getActivePokemonTypes(id)),
        base_stats: {
          hp: currentPokemonMainData[id - offset].stats[0].base_stat,
          atk: currentPokemonMainData[id - offset].stats[1].base_stat,
          def: currentPokemonMainData[id - offset].stats[2].base_stat,
          spd: currentPokemonMainData[id - offset].stats[5].base_stat,
          sp_atk: currentPokemonMainData[id - offset].stats[3].base_stat,
          sp_def: currentPokemonMainData[id - offset].stats[4].base_stat,
        },
      });
    }
  }, [id, dataLoaded]);

  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
    };

    const handleDrag = (e) => {
      if (e.target.tag === "DIV") {
        e.preventDefault();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousedown", handleDrag);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousedown", handleDrag);
    };
  }, []);

  const cleanupText = (text) => {
    return text
      .replace(/\f/g, "\n")
      .replace(/\u00ad\n/g, "")
      .replace(/\u00ad/g, "")
      .replace(/ -\n/g, " - ")
      .replace(/-\n/g, "-")
      .replace(/\n/g, " ");
  };

  const capitalizeText = (text) => {
    return text.slice(0, 1).toUpperCase() + text.slice(1);
  };

  const getPokemonDesc = (id) => {
    const flavorTexts = [];

    currentPokemonSpeciesData[id].flavor_text_entries.forEach((element) => {
      if (element.language.name == "en") {
        flavorTexts.push(cleanupText(element.flavor_text));
      }
    });

    return flavorTexts.slice(0, 2).join(" ");
  };

  const preloadSurroundingSprites = async () => {
    const spritePromises = [];

    try {
      if (offset >= 8 && offset <= totalPokemon - 8) {
        for (let i = offset - 8; i < offset; i++) {
          const img = new Image();
          img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`;

          const spritePromise = new Promise((resolve) => {
            img.onload = () =>
              resolve(
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
              );
          });
          spritePromises.push(spritePromise);
        }

        for (let i = offset + 8; i < offset + 16; i++) {
          const img = new Image();
          img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`;

          const spritePromise = new Promise((resolve) => {
            img.onload = () =>
              resolve(
                `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
              );
          });
          spritePromises.push(spritePromise);
        }
        const spriteUrls = await Promise.all(spritePromises);

        setPreloadedSprites(spriteUrls);
      }
    } catch (error) {
      console.error("Error in preloading surrounding sprites.", error);
    }
  };

  const getPokemonData = async () => {
    setDataLoaded(false);
    const mainPromises = [];
    const speciesPromises = [];
    const spritesPromises = [];

    mainPromises.push({});
    speciesPromises.push({});
    spritesPromises.push(null);

    try {
      for (let i = offset + 1; i < offset + 9; i++) {
        mainPromises.push(axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`));
        speciesPromises.push(
          axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)
        );

        // image preloading
        const img = new Image();
        img.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`;

        const spritePromise = new Promise((resolve) => {
          img.onload = () =>
            resolve(
              `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
            );
        });
        spritesPromises.push(spritePromise);
      }

      const mainResponses = await Promise.all(mainPromises);
      const speciesResponses = await Promise.all(speciesPromises);
      const spriteUrls = await Promise.all(spritesPromises);

      setCurrentPokemonMainData(mainResponses.map((response) => response.data));
      setCurrentPokemonSpeciesData(
        speciesResponses.map((response) => response.data)
      );
      setCurrentPokemonSprites(spriteUrls);
      setDataLoaded(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getActivePokemonTypes = (id) => {
    const typesArr = currentPokemonMainData[id - offset].types;
    const types = [];
    for (let i = 0; i < typesArr.length; i++) {
      types.push(typesArr[i].type.name);
    }
    return types;
  };

  const formatId = (id) => {
    if (id < 10) {
      return "#000" + id;
    } else if (id >= 10 && id < 100) {
      return "#00" + id;
    } else if (id >= 100 && id < 1000) {
      return "#0" + id;
    } else if (id >= 1000 && id < 10000) {
      return "#" + id;
    } else {
      return "formatError";
    }
  };

  const formatTypes = (arr) => {
    const outputArr = [];
    arr.forEach((element) => {
      outputArr.push(
        element.substring(0, 1).toUpperCase() + element.substring(1)
      );
    });
    return outputArr.join(", ");
  };

  const textGrp = (
    <>
      {/* FIRST SECTION */}
      <img src={activePokemonData.spriteUrl} className="pokemon-image"></img>
      <div className="details-firstline">
        <h1 className="details-header">
          {capitalizeText(activePokemonData.name)}
          {" - "}
          {formatId(activePokemonData.id)}
        </h1>
      </div>
      <h2 className="details-subheader2 subheader-split">
        <div className="subheader-section">
          <strong>Height: </strong>
          <span>{activePokemonData.height}m</span>
        </div>
        <div className="subheader-section">
          <strong>Weight: </strong>
          <span>{activePokemonData.weight}kg</span>
        </div>
      </h2>
      <h2 className="details-subheader2">
        <div className="subheader-section">
          <strong>Type(s): </strong>
          <span>{activePokemonData.types}</span>
        </div>
      </h2>
      <p className="details-content">{activePokemonData.desc}</p>
      <span className="details-header center">-</span>
      {/* SECOND SECTION */}
      <h1 className="details-header">Base Stats</h1>
      <h2 className="details-subheader2 subheader-split">
        <div className="subheader-section">
          <strong>HP: </strong>
          <span>{activePokemonData.base_stats.hp}</span>
        </div>
        <div className="subheader-section">
          <strong>Atk: </strong>
          <span>{activePokemonData.base_stats.atk}m</span>
        </div>
      </h2>
      <h2 className="details-subheader2 subheader-split">
        <div className="subheader-section">
          <strong>Def: </strong>
          <span>{activePokemonData.base_stats.def}</span>
        </div>
        <div className="subheader-section">
          <strong>Spd: </strong>
          <span>{activePokemonData.base_stats.spd}</span>
        </div>
      </h2>
      <h2 className="details-subheader2 subheader-split">
        <div className="subheader-section">
          <strong>Special Atk: </strong>
          <span>{activePokemonData.base_stats.sp_atk}</span>
        </div>
        <div className="subheader-section">
          <strong>Special Def: </strong>
          <span>{activePokemonData.base_stats.sp_def}</span>
        </div>
      </h2>
    </>
  );

  return (
    <div
      ref={innerRef}
      className={`details ${dexOpened ? "dex-opened" : "dex-closed"}`}
    >
      <div className="details-container">{textGrp}</div>
    </div>
  );
}
