import React, { useState, useEffect, useRef } from "react";
import Directory from "./Directory";
import Details from "./Details";
import axios from "axios";

export default function Dex() {
  const detailsRef = useRef(null);

  const [dexOpened, setDexOpened] = useState(false);
  const [dexDeviceSrc, setDexDeviceSrc] = useState(
    "/images/dex/dex-closed.png"
  );
  const [pokemon, setPokemon] = useState([
    { name: "Placeholder", id: 0, url: "placeholder.com" },
  ]);
  const [preloadedPokemon, setPreloadedPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pokemonCount, setPokemonCount] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeId, setActiveId] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [offset, setOffset] = useState(0);
  const [nextPageUrl, setNextPageUrl] = useState(null);
  const [previousPageUrl, setPreviousPageUrl] = useState(null);
  const [pageButtonCooldownActive, setPageButtonCooldownActive] =
    useState(false);

  useEffect(() => {
    preloadOpenedDexImg();
    fetchPokemon();
    fetchPreloadedPokemon();
    fetchPokemonCount();
  }, []);

  useEffect(() => {
    if (dexOpened) {
      setDexDeviceSrc("/images/dex/dex-opened.png");
    } else {
      setDexDeviceSrc("/images/dex/dex-closed.png");
    }
  }, [dexOpened]);

  useEffect(() => {
    // console.log("Updated Pokemon");
  }, [pokemon]);

  useEffect(() => {
    console.log("Preload", preloadedPokemon);
  }, [preloadedPokemon]);

  useEffect(() => {
    updateActiveId();
  }, [activeIndex]);

  useEffect(() => {
    preloadPokemonSprites();
    fetchPokemon();
    fetchPreloadedPokemon();
    updateActiveId();
  }, [pageNumber]);

  useEffect(() => {
    if (dexOpened) {
      handleLeftScreenPos();
      handleRightScreenPos();
      handleTextSize();
    }
    handleButtonsPos();
  }, [dexOpened]);

  var dexPowerSwitchSrc = "/images/dex/dex-power-switch.png";
  var dexSearchBtnSrc = "/images/dex/dex-search-btn.png";
  var dexDpadSrc = "/images/dex/dex-dpad.png";

  const activateButtonCooldown = () => {
    setPageButtonCooldownActive(true);
    setTimeout(() => {
      setPageButtonCooldownActive(false);
    }, 1000);
  };

  const fetchPreloadedPokemon = async () => {
    let prevOffset = offset - 8;
    let nextOffset = offset + 8;
    let prevOffsetPromises = [];
    let nextOffsetPromises = [];
    let prevData = [];
    let nextData = [];
    setPreloadedPokemon(null);
    if (offset >= 8) {
      console.log("first cond");
      prevOffsetPromises.push(
        axios.get(
          `https://pokeapi.co/api/v2/pokemon?offset=${prevOffset}&limit=8`
        )
      );
    }
    if (offset <= pokemonCount - 8) {
      console.log("second cond");
      nextOffsetPromises.push(
        axios.get(
          `https://pokeapi.co/api/v2/pokemon?offset=${nextOffset}&limit=8`
        )
      );
    }
    console.log("promises", prevOffsetPromises, nextOffsetPromises);
    console.log(
      "promise",
      axios.get(
        `https://pokeapi.co/api/v2/pokemon?offset=${prevOffset}&limit=8`
      )
    );
    const prevResponses = await Promise.all(prevOffsetPromises);
    const nextResponses = await Promise.all(nextOffsetPromises);
    if (prevResponses.length > 0) {
      prevData = prevResponses.map((response) => response.data.results);
      console.log("loading prevs", prevData.results);
    }
    if (nextResponses.length > 0) {
      nextData = nextResponses.map((response) => response.data.results);
      console.log("loading nexts", nextData.results);
    }
    setPreloadedPokemon([...prevData, ...nextData]);
  };

  const fetchPokemon = async () => {
    setLoading(true);
    axios
      .get(`https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=8`)
      .then((res) => {
        setLoading(false);
        setPokemon(
          res.data.results.map((mon) => ({
            name: mon.name,
            id: mon.url.split("/")[6],
            url: mon.url,
          }))
        );
      });
  };

  const preloadOpenedDexImg = () => {
    const imageSources = ["/images/dex/dex-opened.png"];
    imageSources.forEach((imgSrc) => {
      new Image().src = imgSrc;
    });
  };

  const preloadPokemonSprites = () => {
    const imageSources = [];
    for (var i = offset; i < offset + 8; i++) {
      imageSources.push(
        `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${i}.png`
      );
    }
    imageSources.forEach((imgSrc) => {
      new Image().src = imgSrc;
    });
  };

  const updateActiveId = () => {
    setActiveId(activeIndex + offset + 1);
  };

  const fetchPokemonCount = () => {
    axios.get(pokemonCountSrc).then((res) => {
      setPokemonCount(res.data.pokemon_entries.length);
    });
  };

  const handleDexOpenState = () => {
    setDexOpened(!dexOpened);
  };

  const handleDpadBehavior = (direction) => {
    if (direction == "up") {
      if (activeIndex > 0) {
        setActiveIndex(activeIndex - 1);
        handleDexScrollReset();
      } else {
        if (pageNumber <= 1) {
          setPreviousPageUrl(null);
        } else {
          setPreviousPageUrl(
            `https://pokeapi.co/api/v2/pokemon?offset${offset}&limit=8`
          );
          setOffset(offset - 8);
          setPageNumber(pageNumber - 1);
          setActiveIndex(0);
          activateButtonCooldown();
        }
      }
    } else if (direction == "down") {
      if (activeIndex < 7) {
        setActiveIndex(activeIndex + 1);
        handleDexScrollReset();
      } else {
        if (pageNumber >= Math.ceil(pokemonCount / 8)) {
          setNextPageUrl(null);
        } else {
          setNextPageUrl(
            `https://pokeapi.co/api/v2/pokemon?offset${offset}&limit=8`
          );
          setOffset(offset + 8);
          setPageNumber(pageNumber + 1);
          setActiveIndex(0);
          activateButtonCooldown();
        }
      }
    }

    if (!loading && !pageButtonCooldownActive) {
      if (direction == "right") {
        if (pageNumber >= Math.ceil(pokemonCount / 8)) {
          setNextPageUrl(null);
        } else {
          setNextPageUrl(
            `https://pokeapi.co/api/v2/pokemon?offset${offset}&limit=8`
          );
          setOffset(offset + 8);
          setPageNumber(pageNumber + 1);
          setActiveIndex(0);
          activateButtonCooldown();
        }
      } else if (direction == "left") {
        if (pageNumber <= 1) {
          setPreviousPageUrl(null);
        } else {
          setPreviousPageUrl(
            `https://pokeapi.co/api/v2/pokemon?offset${offset}&limit=8`
          );
          setOffset(offset - 8);
          setPageNumber(pageNumber - 1);
          setActiveIndex(0);
          activateButtonCooldown();
        }
      }
    }
  };

  const handleDexScrollDown = () => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop += 100;
    }
  };

  const handleDexScrollUp = () => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop -= 100;
    }
  };

  const handleDexScrollReset = () => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
  };

  const pokemonCountSrc = "https://pokeapi.co/api/v2/pokedex/national";

  return (
    <div className="dex">
      <div className="dex-container">
        <div
          className={`dex-device ${dexOpened ? "dex-opened" : "dex-closed"}`}
        >
          <div
            style={{ backgroundImage: `url(${dexPowerSwitchSrc})` }}
            onClick={handleDexOpenState}
            className="dex-power-switch dex-interactable"
          ></div>
          <img
            draggable="false"
            src={dexDeviceSrc}
            alt=""
            className="dex-device-img"
            onLoad={handlePowerSwitchPos}
          />
          <div
            className={`dex-left-screen ${
              dexOpened ? "dex-opened" : "dex-closed"
            }`}
          >
            <Directory
              loading={loading}
              dexOpened={dexOpened}
              pokemon={pokemon}
              activeIndex={activeIndex}
              handleTextSizeFunc={handleTextSize}
            />
          </div>
          <div
            className={`dex-right-screen ${
              dexOpened ? "dex-opened" : "dex-closed"
            }`}
          >
            <Details
              innerRef={detailsRef}
              dexOpened={dexOpened}
              id={activeId}
              offset={offset}
              totalPokemon={pokemonCount}
            />
          </div>
          <div
            style={{ backgroundImage: `url(${dexSearchBtnSrc})` }}
            className={`dex-search-button dex-interactable ${
              dexOpened ? "dex-opened" : "dex-closed"
            }`}
          ></div>
          <div
            style={{ backgroundImage: `url(${dexDpadSrc})` }}
            className={`dex-dpad-buttons dex-interactable ${
              dexOpened ? "dex-opened" : "dex-closed"
            }`}
          >
            <div className="dpad-row row-one">
              <div
                onClick={() => handleDpadBehavior("up")}
                className={`dex-dpad dpad-up ${
                  dexOpened ? "dex-opened" : "dex-closed"
                }`}
              ></div>
            </div>
            <div className="dpad-row row-two">
              <div
                onClick={() => handleDpadBehavior("left")}
                className={`dex-dpad dpad-left ${
                  dexOpened ? "dex-opened" : "dex-closed"
                }`}
              ></div>
              <div
                onClick={() => handleDpadBehavior("right")}
                className={`dex-dpad dpad-right ${
                  dexOpened ? "dex-opened" : "dex-closed"
                }`}
              ></div>
            </div>
            <div className="dpad-row row-three">
              <div
                onClick={() => handleDpadBehavior("down")}
                className={`dex-dpad dpad-down ${
                  dexOpened ? "dex-opened" : "dex-closed"
                }`}
              ></div>
            </div>
          </div>
          <div
            className={`dex-scroll-buttons ${
              dexOpened ? "dex-opened" : "dex-closed"
            }`}
          >
            <div
              onClick={handleDexScrollUp}
              className={`dex-scroll scroll-up ${
                dexOpened ? "dex-opened" : "dex-closed"
              }`}
            >
              <div className="dex-scroll-overlay scroll-up-overlay"></div>
            </div>
            <div
              onClick={handleDexScrollDown}
              className={`dex-scroll scroll-down ${
                dexOpened ? "dex-opened" : "dex-closed"
              }`}
            >
              <div className="dex-scroll-overlay scroll-down-overlay"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function handleTextSize() {
  const changeTextSize = () => {
    const directoryHeader = document.querySelector(".directory-header");
    const directoryContentBlock = document.querySelectorAll(
      ".directory-content-block"
    );
    const detailsHeader = document.querySelectorAll(".details-header");
    const detailsSubheader2 = document.querySelectorAll(".details-subheader2");
    const detailsContent = document.querySelectorAll(".details-content");
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;

    directoryHeader.style.fontSize = parseFloat(dexImgWidth) * 0.02 + "px";
    directoryContentBlock.forEach((element) => {
      element.style.fontSize = parseFloat(dexImgWidth) * 0.016 + "px";
    });

    detailsHeader.forEach((element) => {
      element.style.fontSize = parseFloat(dexImgWidth) * 0.02 + "px";
    });
    detailsSubheader2.forEach((element) => {
      element.style.fontSize = parseFloat(dexImgWidth) * 0.018 + "px";
    });
    detailsContent.forEach((element) => {
      element.style.fontSize = parseFloat(dexImgWidth) * 0.016 + "px";
    });
  };

  changeTextSize();

  window.addEventListener("resize", handleTextSize);

  return () => {
    window.removeEventListener("resize", handleTextSize);
  };
}

function handleButtonsPos() {
  const setButtonsStyles = () => {
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;

    const searchButton = document.querySelector(".dex-search-button");

    searchButton.style.height = parseFloat(dexImgWidth) * 0.05 + "px";
    searchButton.style.width = parseFloat(dexImgWidth) * 0.05 + "px";
    searchButton.style.top = parseFloat(dexImgWidth) * 0.51 + "px";
    searchButton.style.left = parseFloat(dexImgWidth) * 0.032 + "px";

    const dpadButtons = document.querySelector(".dex-dpad-buttons");
    const dpadClass = document.querySelector(".dex-dpad");
    const dpadUpButton = document.querySelector(".dpad-up");
    const dpadRightButton = document.querySelector(".dpad-right");
    const dpadDownButton = document.querySelector(".dpad-down");
    const dpadLeftButton = document.querySelector(".dpad-left");

    dpadButtons.style.height = parseFloat(dexImgWidth) * 0.13 + "px";
    dpadButtons.style.width = parseFloat(dexImgWidth) * 0.1325 + "px";
    dpadButtons.style.top = parseFloat(dexImgWidth) * 0.5035 + "px";
    dpadButtons.style.left = parseFloat(dexImgWidth) * 0.2805 + "px";

    dpadUpButton.style.backgroundImage = "url('/images/dex/dex-dpad-up.png')";
    dpadRightButton.style.backgroundImage =
      "url('/images/dex/dex-dpad-right.png')";
    dpadDownButton.style.backgroundImage =
      "url('/images/dex/dex-dpad-down.png')";
    dpadLeftButton.style.backgroundImage =
      "url('/images/dex/dex-dpad-left.png')";

    const scrollButtons = document.querySelector(".dex-scroll-buttons");
    const scrollDownButton = document.querySelector(".scroll-down");
    const scrollUpButton = document.querySelector(".scroll-up");
    const scrollDownOverlay = document.querySelector(".scroll-down-overlay");
    const scrollUpOverlay = document.querySelector(".scroll-up-overlay");

    scrollButtons.style.height = parseFloat(dexImgWidth) * 0.04 + "px";
    scrollButtons.style.width = parseFloat(dexImgWidth) * 0.135 + "px";
    scrollButtons.style.top = parseFloat(dexImgWidth) * 0.575 + "px";
    scrollButtons.style.left = parseFloat(dexImgWidth) * 0.584 + "px";

    scrollUpButton.style.backgroundImage =
      "url('/images/dex/dex-left-scroll.png')";
    scrollDownButton.style.backgroundImage =
      "url('/images/dex/dex-right-scroll.png')";
    scrollUpOverlay.style.backgroundImage =
      "url('/images/dex/dex-scroll-up.png')";
    scrollDownOverlay.style.backgroundImage =
      "url('/images/dex/dex-scroll-down.png')";
  };
  setButtonsStyles();

  window.addEventListener("resize", setButtonsStyles);

  return () => {
    window.removeEventListener("resize", setButtonsStyles);
  };
}

function handleLeftScreenPos() {
  const setScreenStyles = () => {
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;
    const dexImgHeight = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).height;
    const screen = document.querySelector(".dex-left-screen");

    screen.style.height = parseFloat(dexImgHeight) * 0.295 + "px";
    screen.style.width = parseFloat(dexImgWidth) * 0.3425 + "px";
    screen.style.top = parseFloat(dexImgHeight) * 0.2857 + "px";
    screen.style.left = parseFloat(dexImgWidth) * 0.059 + "px";
  };
  setScreenStyles();

  window.addEventListener("resize", setScreenStyles);

  return () => {
    window.removeEventListener("resize", setScreenStyles);
  };
}

function handleRightScreenPos() {
  const setScreenStyles = () => {
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;
    const dexImgHeight = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).height;
    const screen = document.querySelector(".dex-right-screen");

    screen.style.height = parseFloat(dexImgHeight) * 0.56 + "px";
    screen.style.width = parseFloat(dexImgWidth) * 0.3675 + "px";
    screen.style.top = parseFloat(dexImgHeight) * 0.25 + "px";
    screen.style.left = parseFloat(dexImgWidth) * 0.585 + "px";
  };
  setScreenStyles();

  window.addEventListener("resize", setScreenStyles);

  return () => {
    window.removeEventListener("resize", setScreenStyles);
  };
}

function handlePowerSwitchPos() {
  const setPowerSwitchStyles = () => {
    const dexImgWidth = window.getComputedStyle(
      document.querySelector(".dex-device-img")
    ).width;
    const powerSwitch = document.querySelector(".dex-power-switch");

    // powerSwitch.style.margin = parseFloat(dexImgWidth) * 0.015 + "px";
    powerSwitch.style.top = parseFloat(dexImgWidth) * 0.015 + "px";
    powerSwitch.style.left = parseFloat(dexImgWidth) * 0.015 + "px";
    powerSwitch.style.height = parseFloat(dexImgWidth) * 0.072 + "px";
    powerSwitch.style.width = parseFloat(dexImgWidth) * 0.072 + "px";
  };

  setPowerSwitchStyles();

  window.addEventListener("resize", setPowerSwitchStyles);

  return () => {
    window.removeEventListener("resize", setPowerSwitchStyles);
  };
}
