
import { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";
import EmotionNavbar from "./EmotionNavbar";

export default function FaceEmotion() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [emotion, setEmotion] = useState("neutral");
  const [cameraOn, setCameraOn] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  /* ------------------ LOAD MODELS ------------------ */
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";

        setLoadingProgress(30);
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

        setLoadingProgress(65);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);

        setLoadingProgress(90);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

        setLoadingProgress(100);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Model loading error:", err);
      }
    };

    loadModels();
    return () => clearInterval(intervalRef.current);
  }, []);

  /* ------------------ FACE DETECTION LOOP ------------------ */
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
          setEmotion(top[0]);
        }
      }
    }, 1000);
  };

  const stopCamera = () => {
    setCameraOn(false);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Face Analysis
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Real-time facial expression tracking for emotional insight.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        <EmotionNavbar />

        {/* Webcam Section */}
        <div className="relative flex justify-center mb-6">
          {cameraOn ? (
            <>
              <Webcam
                ref={webcamRef}
                onPlay={handleVideoPlay}
                mirrored
                audio={false}
                width={640}
                height={480}
                className="rounded-2xl border border-white/10 shadow-2xl shadow-cyan-500/5 glow"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
            </>
          ) : (
            <div className="w-[640px] h-[480px] flex flex-col items-center justify-center 
                            rounded-2xl border border-dashed border-white/10 
                            bg-white/5 text-gray-500">
              <span className="text-5xl mb-4 opacity-20">📷</span>
              <p className="font-bold">Camera is Off</p>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex justify-center gap-6 mb-12">
          {!cameraOn ? (
            <button
              onClick={() => setCameraOn(true)}
              className="auth-btn !w-64"
            >
              Initialize Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-8 py-4 rounded-xl bg-red-500/10 text-red-500 
                         font-bold border border-red-500/20 hover:bg-red-500/20 transition-all"
            >
              Terminate Session
            </button>
          )}
        </div>

        {/* Emotion Display */}
        <div className="flex flex-col items-center p-8 rounded-2xl bg-white/5 border border-white/5 max-w-sm mx-auto shadow-inner">
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">
            Analysis Result
          </h3>
          <div className="flex flex-col items-center gap-2">
            <span className="text-4xl font-black gradient-text">
              {emotion.toUpperCase()}
            </span>
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {!modelsLoaded && (
          <div className="absolute inset-0 flex flex-col items-center 
                          justify-center bg-black/60 backdrop-blur-2xl 
                          rounded-2xl z-50 p-12 text-center">
            <div className="w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
              AI Models Loading
            </h2>
            <p className="text-gray-400 text-sm mb-8">Synchronizing facial recognition patterns...</p>

            <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)]
                           transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-4 text-cyan-400 font-mono text-lg">
              {loadingProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
