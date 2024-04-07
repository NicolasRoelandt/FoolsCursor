import cursor from "./cursor.svg";
import "./App.css";
import React from "react";
import { useRef, useEffect, useState } from "react";
const data = require("./questions.json");

let SPEED = 10;
let MARGIN = 50;
let HEADER_HEIGHT = 0;
function App() {
  let [questionIndex, setQuestionIndex] = useState(0);
  let current = data[questionIndex];
  let [nearestButtonIndex, setNearestButtonIndex] = useState(0);

  let [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  let [buttonsPositions, setButtonsPositions] = useState(() => randomState());
  let [buttonsStates, setButtonsStates] = useState(
    buttonsPositions.map(() => "none")
  );

  const whileMouseDown = () => {
    let butPos = buttonsPositions[nearestButtonIndex];
    let dy = cursorPos.y - butPos.y;
    let dx = cursorPos.x - butPos.x;
    let angle = Math.atan2(dy, dx);

    if (Math.abs(dx) + Math.abs(dy) < 10) return;
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

  const triggerStateChange = (questionIndex) => {
    setTimeout(() => {
      setButtonsPositions(randomState());
      setButtonsStates(buttonsPositions.map(() => "none"));
      setQuestionIndex(questionIndex);
    }, 1000);
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
    whileMouseDown();
  }, 50);

  const onButtonPress = (index) => {
    if (index !== 0) {
      setButtonsStates(
        buttonsStates.map((state, i) => (i === index ? "wrong" : state))
      );
      triggerStateChange(questionIndex);
    } else {
      setButtonsStates(
        buttonsStates.map((state, i) => (i === index ? "correct" : state))
      );
      if (questionIndex + 1 >= data.length) {
        alert("You finished the quiz! Congrats for making it all the way!");
        return;
      }
      triggerStateChange(questionIndex + 1);
    }
  };

  return (
    <div className="App" onMouseMove={updateMousePosition}>
      <div
        id="cursor"
        style={{
          pointerEvents: "none",
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
      <header>
        Question {questionIndex + 1}: {current.question}
      </header>

      {buttonsPositions.map((pos, index) => (
        <Button
          pos={pos}
          key={index}
          label={current.answers[index]}
          state={buttonsStates[index]}
          onPress={() => onButtonPress(index)}
        />
      ))}
    </div>
  );
}

function randomState() {
  const a = Array.from({ length: 4 }, () => ({
    x: randomBetween(MARGIN, window.innerWidth - MARGIN),
    y: randomBetween(HEADER_HEIGHT + MARGIN, window.innerHeight - MARGIN),
  }));
  return a;
}
function randomBetween(min, max) {
  const a = min + Math.random() * (max - min);
  return a;
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

function Button({ pos, label, onPress, state }) {
  const ref = useRef(null);
  let width = ref.current ? ref.current.offsetWidth : 0;
  let height = ref.current ? ref.current.offsetHeight : 0;

  const color = (() => {
    switch (state) {
      case "correct":
        return "hsl(148, 70%, 31%)";
      case "wrong":
        return "#FFCCCC";
      default:
        return undefined;
    }
  })();

  return (
    <button
      ref={ref}
      className="button"
      style={{
        padding: 8,
        position: "absolute",
        left: pos.x - width / 2,
        top: pos.y - height / 2,
        backgroundColor: color,
        // ...(state != "none" && { transition: "background-color 1s" }),
      }}
      onClick={onPress}
    >
      {label}
    </button>
  );
}

export default App;
