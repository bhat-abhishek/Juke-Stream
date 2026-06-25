import React, { useEffect, useRef, useContext, useState } from "react";
import { SongContext } from "../Context/SongContext";

// Module-level singletons: an audio element can only have one MediaElementSourceNode
let _audioCtx = null;
let _analyser = null;
let _source = null;

const AudioVisualizer = () => {
  const { audio } = useContext(SongContext);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const syncWidth = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth;
    };
    syncWidth();
    window.addEventListener("resize", syncWidth);

    const ctx = canvas.getContext("2d");

    const initAudio = () => {
      if (_audioCtx) return;
      _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      _analyser = _audioCtx.createAnalyser();
      _analyser.fftSize = 256;
      _source = _audioCtx.createMediaElementSource(audio);
      _source.connect(_analyser);
      _analyser.connect(_audioCtx.destination);
    };

    const drawFrame = () => {
      if (!_analyser) return;
      animFrameRef.current = requestAnimationFrame(drawFrame);

      const bufferLength = _analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      _analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const barWidth = Math.max(1, Math.floor(width / bufferLength) - 1);

      for (let i = 0; i < bufferLength; i++) {
        const amplitude = dataArray[i] / 255;
        const barHeight = Math.round(amplitude * height);
        // Gradient: cyan (190) → purple (290) across the frequency spectrum
        const hue = Math.round(190 + (i / bufferLength) * 100);
        const lightness = Math.round(45 + amplitude * 20);
        ctx.fillStyle = `hsl(${hue}, 90%, ${lightness}%)`;
        ctx.fillRect(i * (barWidth + 1), height - barHeight, barWidth, barHeight);
      }
    };

    const handlePlay = () => {
      initAudio();
      if (_audioCtx?.state === "suspended") _audioCtx.resume();
      setVisible(true);
      cancelAnimationFrame(animFrameRef.current);
      drawFrame();
    };

    const handlePause = () => {
      cancelAnimationFrame(animFrameRef.current);
    };

    const handleEnded = () => {
      cancelAnimationFrame(animFrameRef.current);
      setVisible(false);
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", syncWidth);
    };
  }, [audio]);

  return (
    <canvas
      ref={canvasRef}
      height={56}
      style={{
        width: "100%",
        display: "block",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        background: "transparent",
      }}
    />
  );
};

export default AudioVisualizer;
