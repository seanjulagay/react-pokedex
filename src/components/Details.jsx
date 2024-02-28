import React, { useState, useEffect } from "react";
import axios from "axios";

export default function Details({ dexOpened, url }) {
  const [id, setId] = useState(1);
  const [speciesUrl, setSpeciesUrl] = useState(
    "https://pokeapi.co/api/v2/pokemon-species/1"
  );
  const [name, setName] = useState("Bulbasaur");
  const [desc, setDesc] = useState("Blah");
  const [spriteUrl, setSpriteUrl] = useState(
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  );

  useEffect(() => {
    setId(url.split("/")[6]);
  }, [url]);

  useEffect(() => {
    console.log("DIRECTORY ACTIVE URL", url, "ID", id);
    setSpeciesUrl(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    setSpriteUrl(
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
    );
  }, [id]);

  useEffect(() => {
    fetchPokemonData();
  }, [speciesUrl]);

  const fetchPokemonData = () => {
    axios.get(url).then((response) => {
      setName(response.data.name);
      console.log(name);
    });
    axios.get(speciesUrl).then((response) => {
      setDesc(response.data.flavor_text_entries[0].flavor_text);
      console.log("species url", speciesUrl);
    });
  };

  const textGrp = (
    <>
      <h1 className="details-header">{name}</h1>
      <p className="details-content">{desc}</p>
      <img src={spriteUrl} className="pokemon-image"></img>
    </>
  );

  return (
    <div className={`details ${dexOpened ? "dex-opened" : "dex-closed"}`}>
      <div className="details-container">{textGrp}</div>
    </div>
  );
}
