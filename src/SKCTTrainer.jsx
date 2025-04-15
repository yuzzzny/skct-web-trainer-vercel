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
  const drawingRef = useRef(false);

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

  const getCursorPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCursorPosition(e);
    drawingRef.current = true;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleMouseMove = (e) => {
    if (!drawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCursorPosition(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const handleMouseUp = () => {
    drawingRef.current = false;
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
    <div className="fixed inset-0 bg-white shadow-lg flex flex-col">
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
            width={800}
            height={500}
            className="w-full h-full border cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
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
