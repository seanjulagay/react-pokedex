import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Details({ dexOpened, id, offset }) {
  const [currentPokemonMainData, setCurrentPokemonMainData] = useState(null);
  const [currentPokemonSpeciesData, setCurrentPokemonSpeciesData] =
    useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [activePokemonData, setActivePokemonData] = useState({
    name: "Bulbasaur",
  });

  useEffect(() => {
    getPokemonData();
  }, [offset]);

  useEffect(() => {
    if (currentPokemonMainData && currentPokemonSpeciesData && dataLoaded) {
      setActivePokemonData({
        name: currentPokemonMainData[id - offset].name,
        desc: getPokemonDesc(id - offset),
        spriteUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      });
    }
  }, [id, dataLoaded]);

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

  const getPokemonData = async () => {
    setDataLoaded(false);
    const mainPromises = [];
    const speciesPromises = [];

    mainPromises.push({});
    speciesPromises.push({});

    try {
      console.log(offset);
      for (var i = offset + 1; i < offset + 9; i++) {
        mainPromises.push(axios.get(`https://pokeapi.co/api/v2/pokemon/${i}`));
        speciesPromises.push(
          axios.get(`https://pokeapi.co/api/v2/pokemon-species/${i}`)
        );
      }
      const mainResponses = await Promise.all(mainPromises);
      const speciesResponses = await Promise.all(speciesPromises);

      setCurrentPokemonMainData(mainResponses.map((response) => response.data));
      setCurrentPokemonSpeciesData(
        speciesResponses.map((response) => response.data)
      );
      setDataLoaded(true);
    } catch (error) {
      console.error(error);
    }
  };

  const textGrp = (
    <>
      <img src={activePokemonData.spriteUrl} className="pokemon-image"></img>
      <h1 className="details-header">
        {capitalizeText(activePokemonData.name)}
      </h1>
      <p className="details-content">{activePokemonData.desc}</p>
    </>
  );

  return (
    <div className={`details ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="details-container">{textGrp}</div>
    </div>
  );
}
