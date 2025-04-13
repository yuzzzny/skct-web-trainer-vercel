
import { useState, useEffect, useRef } from "react";

export default function SKCTTrainer() {
  const [activeTab, setActiveTab] = useState("notepad");
  const [note, setNote] = useState("");
  const [drawing, setDrawing] = useState(false);
  const [calcInput, setCalcInput] = useState("");
  const [calcHistory, setCalcHistory] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const canvasRef = useRef(null);

  useEffect(() => {
    let timer;
    if (timerRunning) {
      timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timerRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleDraw = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (drawing) {
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "black";
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const evaluateCalc = () => {
    try {
      const result = eval(calcInput);
      setCalcHistory(result);
      setCalcInput(result.toString());
    } catch {
      setCalcInput("Error");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      evaluateCalc();
    }
  };

  const handleCalcButton = (val) => {
    if (val === "C") {
      setCalcInput("");
      setCalcHistory(0);
    } else if (val === "CE") {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === "√") {
      try {
        const result = Math.sqrt(eval(calcInput));
        setCalcInput(result.toString());
        setCalcHistory(result);
      } catch {
        setCalcInput("Error");
      }
    } else if (val === "←") {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === "=") {
      evaluateCalc();
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  const clearNote = () => setNote("");
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed right-0 top-0 h-full w-1/4 bg-white shadow-lg flex flex-col">
      <div className="flex justify-between items-center p-2 border-b">
        <div className="flex space-x-2">
          <button onClick={() => setActiveTab("notepad")} className={activeTab === "notepad" ? "font-bold" : ""}>메모장</button>
          <button onClick={() => setActiveTab("paint")} className={activeTab === "paint" ? "font-bold" : ""}>그림판</button>
          {activeTab === "notepad" && <button onClick={clearNote} className="text-sm text-red-500 ml-2">🗑 메모장 지우기</button>}
          {activeTab === "paint" && <button onClick={clearCanvas} className="text-sm text-red-500 ml-2">🗑 그림판 지우기</button>}
        </div>
        <div className="text-red-600 font-mono text-sm flex items-center gap-1">
          ⏱ {formatTime(timeLeft)}
          <button onClick={() => setTimerRunning(true)} className="ml-1">▶️</button>
          <button onClick={() => setTimerRunning(false)}>⏸</button>
          <button onClick={() => setTimeLeft(15 * 60)}>🔄</button>
        </div>
      </div>

      <div className="flex-[5] overflow-hidden">
        {activeTab === "notepad" && (
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full h-full p-2 resize-none"
          />
        )}
        {activeTab === "paint" && (
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="w-full h-full border"
            onMouseDown={() => setDrawing(true)}
            onMouseUp={() => setDrawing(false)}
            onMouseMove={handleDraw}
          />
        )}
      </div>

      <div className="flex-[4] border-t p-2">
        <input
          type="text"
          value={calcInput}
          onChange={(e) => setCalcInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full p-1 border mb-1"
        />
        <div className="grid grid-cols-4 gap-1 mb-1">
          {["C","CE","←","√"].map((val) => (
            <button key={val} onClick={() => handleCalcButton(val)} className="p-2 border">{val}</button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {["7","8","9","/","4","5","6","*","1","2","3","-","0",".","=","+"].map((val) => (
            <button key={val} onClick={() => handleCalcButton(val)} className="p-2 border">{val}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
