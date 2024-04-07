import cursor from "./cursor.svg";
import "./App.css";
import React from "react";
import { useRef, useEffect, useState } from "react";
function App() {
  let [mouseIsDown, setMouseIsDown] = useState(false);
  let [nearestButtonIndex, setNearestButtonIndex] = useState(0);

  let [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  let [buttonsPositions, setButtonsPositions] = useState([
    { x: 50, y: 50 },
    { x: 50, y: 400 },
    { x: 400, y: 50 },
    { x: 400, y: 400 },
  ]);

  const whileMouseDown = () => {
    let butPos = buttonsPositions[nearestButtonIndex];
    let dy = cursorPos.y - butPos.y;
    let dx = cursorPos.x - butPos.x;
    let angle = Math.atan2(dy, dx);

    if (dx + dy < 4) return;
    let newPos = {
      x: butPos.x + Math.cos(angle),
      y: butPos.y + Math.sin(angle),
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

  useInterval(() => {
    if (mouseIsDown) whileMouseDown();
  }, 10);

  return (
    <div
      className="App"
      onMouseDown={(e) => {
        e.preventDefault();
        setMouseIsDown(true);
      }}
      onMouseUp={() => setMouseIsDown(false)}
      onMouseLeave={() => {
        console.log("mouse out");
        setMouseIsDown(false);
      }}
      onMouseMove={updateMousePosition}
    >
      <div
        id="cursor"
        style={{
          zIndex: 99999,
          height: 28,
          width: 28,
          position: "absolute",
          left: cursorPos.x - 9,
          top: cursorPos.y - 8,
          transform: `rotate(${computeAngle(
            cursorPos,
            buttonsPositions[nearestButtonIndex]
          )}deg)`,
          transformOrigin: "9px 8px",
        }}
      >
        <img alt="Cursor Arrow" src={cursor} />
      </div>
      <header className="App-header">
        {buttonsPositions.map((pos, index) => (
          <Button pos={pos} key={index} />
        ))}
      </header>
    </div>
  );
}

function computeAngle(cursor, but) {
  let radians = Math.atan2(but.x - cursor.x, but.y - cursor.y);
  return radians * (180 / Math.PI) * -1 + 180;
}

function useInterval(callback, delay) {
  const savedCallback = useRef();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

function Button({ pos }) {
  let width = 100;
  let height = 50;
  return (
    <div>
      <button
        style={{
          width: width,
          height: height,
          padding: 4,
          position: "absolute",
          left: pos.x - width / 2,
          top: pos.y - height / 2,
        }}
      >
        Click me
      </button>
    </div>
  );
}

export default App;
