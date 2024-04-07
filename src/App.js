import "./App.css";
import Game from "./Game";
import Button from "./Button";
import useInterval from "./useInterval";
import Pointer from "./Pointer";
import React from "react";
import { randomPositions } from "./utils";
import { useRef, useState, useEffect } from "react";
const data = require("./questions.json");
let SPEED = 10;

const initialPos = randomPositions(Object.keys(data).length, 200, 100);
function App() {
  let [category, setCategory] = useState("");
  if (category === "") {
    return <ChoseCategory setCategory={setCategory} />;
  } else {
    return <Game data={data[category]} />;
  }
}

function ChoseCategory({ setCategory }) {
  let [nearestButtonIndex, setNearestButtonIndex] = useState(0);
  let [buttonsPositions, setButtonsPositions] = useState(initialPos);
  let [cursorType, setCursorType] = useState("pointer");
  let onMouseEnter = () => setCursorType("mouse");
  let onMouseLeave = () => setCursorType("pointer");
  let [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const whileMouseDown = () => {
    let butPos = buttonsPositions[nearestButtonIndex];
    let dy = cursorPos.y - butPos.y;
    let dx = cursorPos.x - butPos.x;
    let angle = Math.atan2(dy, dx);

    if (Math.abs(dx) + Math.abs(dy) < 20) return;
    let newPos = {
      x: butPos.x + SPEED * Math.cos(angle),
      y: butPos.y + SPEED * Math.sin(angle),
    };

    let newPositions = buttonsPositions.map((pos, index) => {
      if (index === nearestButtonIndex) {
        return newPos;
      }
      return pos;
    });

    setButtonsPositions(newPositions);
  };

  const updateMousePosition = (ev) => {
    setCursorPos({ x: ev.clientX, y: ev.clientY });
  };

  useInterval(whileMouseDown, 50);

  useEffect(() => {
    let minIndex = -1;
    let min = Number.MAX_VALUE;
    buttonsPositions.forEach((button, index) => {
      let distance = Math.sqrt(
        Math.pow(button.x - cursorPos.x, 2) +
          Math.pow(button.y - cursorPos.y, 2)
      );
      if (distance < min) {
        min = distance;
        minIndex = index;
      }
    });
    setNearestButtonIndex(minIndex);
  }, [buttonsPositions, setNearestButtonIndex, cursorPos]);

  return (
    <div className="App" onMouseMove={updateMousePosition}>
      <Pointer
        cursorPos={cursorPos}
        nearestButton={buttonsPositions[nearestButtonIndex]}
        cursorType={cursorType}
      />
      <header>Welcome! Please chose one of the categories below</header>
      <div className="categories">
        {Object.keys(data).map((key, index) => (
          <Button
            label={key}
            onPress={() => setCategory(key)}
            pos={buttonsPositions[index]}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
