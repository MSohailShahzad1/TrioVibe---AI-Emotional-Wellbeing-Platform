  import React, { useEffect, useRef, useState } from "react";
  import Webcam from "react-webcam";
  import * as faceapi from "face-api.js";
  import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
  import "./MultiModalEmotion.css"

  import { Link } from "react-router-dom";

  import InteractiveBlueFlowBackground from "../ShootingStar/InteractiveBlueFlow";

  // 🎯 Emotion detection using extended keyword matching
  const detectTextEmotion = (text) => {
    const normalized = text.toLowerCase();

    if (/(sad|depressed|unhappy|down|gloomy|miserable|blue|heartbroken|tearful)/.test(normalized))
      return "sad";
    if (/(happy|excited|joyful|pleased|cheerful|delighted|content|grateful|elated|satisfied)/.test(normalized))
      return "happy";
    if (/(angry|mad|furious|annoyed|irritated|enraged|frustrated|bitter|agitated)/.test(normalized))
      return "angry";
    if (/(scared|afraid|fear|terrified|nervous|anxious|worried|panicked|hesitant)/.test(normalized))
      return "fearful";
    if (/(surprised|amazed|shocked|stunned|speechless|startled|awe)/.test(normalized))
      return "surprised";
    if (/(disgusted|grossed out|nauseated|repulsed|sickened|revolted)/.test(normalized))
      return "disgusted";
    if (/(confused|uncertain|lost|perplexed|unsure|disoriented|baffled)/.test(normalized))
      return "confused";

    return "neutral";
  };

  const MultiModalEmotion = () => {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const intervalRef = useRef(null);
    const waveformCanvasRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const dataArrayRef = useRef(null);
    const sourceRef = useRef(null);
    const animationRef = useRef(null);
     const [loadingProgress, setLoadingProgress] = useState(0);  // ✅ define it
  const [modelsLoaded, setModelsLoaded] = useState(false);
const [cameraOn, setCameraOn] = useState(false);


    const [webcamEmotion, setWebcamEmotion] = useState("");
    const [textInput, setTextInput] = useState("");
    const [textEmotion, setTextEmotion] = useState("");
    const [loading, setLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);

    const {
      transcript,
      resetTranscript,
      browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    const videoConstraints = {
      width: 640,
      height: 480,
      facingMode: "user"
    };

useEffect(() => {
  const loadModels = async () => {
    try {
      const MODEL_URL = '/models'; // should be inside /public/models

      setLoadingProgress(30);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

      setLoadingProgress(60);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

      setLoadingProgress(90);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

      setModelsLoaded(true);
      setLoadingProgress(100);
      setLoading(false); // ✅ stop showing "Loading..."
    } catch (error) {
      console.error("Error loading models:", error);
      setLoading(false);
    }
  };

  loadModels();

  return () => clearInterval(intervalRef.current);
}, []);



    const handleVideoPlay = () => {
      if (intervalRef.current) return;

      intervalRef.current = setInterval(async () => {
        if (webcamRef.current?.video.readyState === 4) {
          const video = webcamRef.current.video;
          const canvas = canvasRef.current;
          const displaySize = {
            width: video.videoWidth,
            height: video.videoHeight
          };

          faceapi.matchDimensions(canvas, displaySize);

          const detections = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();

          const resized = faceapi.resizeResults(detections, displaySize);
          const ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          faceapi.draw.drawDetections(canvas, resized);
          faceapi.draw.drawFaceExpressions(canvas, resized);

          if (detections[0]) {
            const expr = detections[0].expressions;
            const top = Object.entries(expr).sort((a, b) => b[1] - a[1])[0];
            setWebcamEmotion(top[0]);
          }
        }
      }, 1000);
    };

    const handleTextSubmit = () => {
      const emotion = detectTextEmotion(textInput);
      setTextEmotion(emotion);
    };

    const handleVoiceAnalysis = () => {
      const emotion = detectTextEmotion(transcript);
      setTextEmotion(emotion);
      stopWaveform();
      resetTranscript();
    };

    const startWaveform = async () => {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

    const drawWaveform = () => {
    animationRef.current = requestAnimationFrame(drawWaveform);
    analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, "#00bfff");   // Light blue
    gradient.addColorStop(0.5, "#007bff"); // Medium blue
    gradient.addColorStop(1, "#1e3a8a");   // Darker blue

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = gradient;
    ctx.beginPath();

    const buffer = dataArrayRef.current;
    const sliceWidth = canvas.width / buffer.length;
    let x = 0;

    for (let i = 0; i < buffer.length; i++) {
      const v = buffer[i] / 128.0;
      const y = (v * canvas.height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        const cpX = x - sliceWidth / 2;
        const cpY = (buffer[i - 1] / 128.0) * canvas.height / 2;
        ctx.quadraticCurveTo(cpX, cpY, x, y); // ✨ Smoother edges
      }

      x += sliceWidth;
    }

    ctx.stroke();
  };



      drawWaveform();
    };

    const stopWaveform = () => {
      setIsRecording(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };

    if (!browserSupportsSpeechRecognition) {
      return <p>❌ Speech Recognition not supported in this browser.</p>;
    }

    const summary = {
      webcam: webcamEmotion,
      voice: transcript ? detectTextEmotion(transcript) : "none",
      text: textInput ? textEmotion : "none"
    };
  
  return (
    <div className=" w-600 px-10 flex items-center overflow-y-auto justify-center relative ">
  
      <InteractiveBlueFlowBackground/>

     

      <div className="relative min-h-full w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8 text-gray-300 my-6">
       <h2 className="text-3xl  pad px-10 font-bold mb-6 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-500">
          Multi-Modal Emotion Detection
        </h2>


<div className="relative flex justify-center mb-6">
  {cameraOn ? (
    <>
      <Webcam
        ref={webcamRef}
        onPlay={handleVideoPlay}
        mirrored
        audio={false}
        height={400}
        width={600}
        className="rounded-xl border border-white/20 shadow-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
    </>
  ) : (
    <div className="w-[600px] h-[400px] flex items-center justify-center rounded-xl border border-dashed border-gray-400/40 text-gray-400">
      Camera is Off
    </div>
  )}
</div>
<div className="flex justify-center gap-4 mb-6">
  {!cameraOn ? (
    <button
      onClick={() => setCameraOn(true)}
      className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 
                 font-semibold text-white text-center hover:from-green-600 hover:to-emerald-700 
                 hover:shadow-xl transition-all duration-200 ease-in-out
                 border border-green-400/20 hover:border-green-300/30
                 shadow-lg shadow-green-500/20 hover:shadow-green-600/30
                 transform hover:scale-[1.02] active:scale-[0.98]
                 min-w-[120px]"
    >
      Start Camera
    </button>
  ) : (
    <button
      onClick={() => {
        setCameraOn(false);
        clearInterval(intervalRef.current); // stop detection loop
        intervalRef.current = null;
      }}
      className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 
                 font-semibold text-white text-center hover:from-red-600 hover:to-rose-700 
                 hover:shadow-xl transition-all duration-200 ease-in-out
                 border border-red-400/20 hover:border-red-300/30
                 shadow-lg shadow-red-500/20 hover:shadow-red-600/30
                 transform hover:scale-[1.02] active:scale-[0.98]
                 min-w-[120px]"
    >
      Stop Camera
    </button>
  )}
</div>




        {/* Webcam Emotion */}
        <p className="text-lg text-center mb-6">
          <strong className="text-sky-400">Webcam Emotion:</strong> {webcamEmotion}
        </p>

        {/* Text Emotion Input */}
        <div className="space-y-4 mb-8 pad">
          <textarea
            rows="2"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text to detect emotion..."
            className="w-full  text-center rounded-xl bg-white/20 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-sky-400 focus:outline-none"
          />
          

        
         
<button
  onClick={handleTextSubmit}
  className="px-8 py-3.5 analyze rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 
            font-semibold text-white text-center hover:from-blue-700 hover:to-indigo-800 
            hover:shadow-2xl transition-all duration-200 ease-in-out
            border border-blue-400/20 hover:border-blue-300/30
            shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30
            transform hover:scale-[1.02] active:scale-[0.98]"
>
  <span className="flex items-center justify-center gap-2">
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
    Analyze Text
  </span>
</button>


        </div>

        {/* Text Emotion */}
        <p className="text-lg text-center mb-6">
          <strong className="text-sky-400">Text Emotion:</strong> {textEmotion}
        </p>

        {/* Voice Section */}
        <div className="text-center mb-8">
          <div className="flex gap-4 justify-center mb-4">
        <button
  onClick={() => {
    startWaveform();
    SpeechRecognition.startListening();
  }}
  className="px-6 py-3.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 
            font-semibold text-white text-center hover:from-blue-700 hover:to-indigo-800 
            hover:shadow-2xl transition-all duration-200 ease-in-out
            border border-blue-400/20 hover:border-blue-300/30
            shadow-lg shadow-blue-500/20 hover:shadow-blue-600/30
            transform hover:scale-[1.02] active:scale-[0.98]
            min-w-[140px] mx-2 my-1"  
>
  <span className="flex items-center justify-center gap-2 px-2">  
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
    Start Speaking
  </span>
</button>

<button
  onClick={() => {
    stopWaveform();
    SpeechRecognition.stopListening();
  }}
  className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-red-600 to-pink-700 
            font-semibold text-white text-center hover:from-red-700 hover:to-pink-800 
            hover:shadow-2xl transition-all duration-200 ease-in-out
            border border-red-400/20 hover:border-red-300/30
            shadow-lg shadow-red-500/20 hover:shadow-red-600/30
            transform hover:scale-[1.02] active:scale-[0.98]
            min-w-[100px] mx-2 my-1"  //
>
  <span className="flex items-center justify-center gap-2 px-2">  
    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
    Stop
  </span>
</button>

<Link to="/Home">
  <button className="px-8 py-3.5 rounded-lg bg-gradient-to-r from-indigo-700 to-blue-900 
            font-semibold text-white text-center hover:from-indigo-800 hover:to-blue-950 
            hover:shadow-2xl transition-all duration-200 ease-in-out
            border border-indigo-400/20 hover:border-indigo-300/30
            shadow-lg shadow-indigo-500/20 hover:shadow-indigo-600/30
            transform hover:scale-[1.02] active:scale-[0.98]
            min-w-[100px] mx-2 my-1">  
    <span className="flex items-center justify-center gap-2 px-2">  
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
      Home
    </span>
  </button>
</Link>
          </div>
          <p className="mb-2 text-sky-300 font-medium">🎧 Audio Input Visualizer</p>
          <canvas
            ref={waveformCanvasRef}
            className="w-full pad h-22  pad rounded-lg bg-black/30 border border-white/10"
          />
          <p className="mt-4">
            <strong className="text-sky-400">Transcript:</strong> {transcript}
          </p>
        </div>

        {/* Summary Section */}
        <div className="bg-white/10 pad summary rounded-xl p-6 shadow-inner border border-white/20">
          <h3 className="text-xl font-bold pad mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-sky-500">
            🧠 Emotion Summary
          </h3>
          <p>Webcam: {summary.webcam}</p>
          <p>Voice Emotion: {summary.voice}</p>
          <p>Transcript: {transcript}</p>
          <p>Text Emotion: {summary.text}</p>
          
        </div>
        
      </div>
     
    </div>
  );




  };

  export default MultiModalEmotion;

