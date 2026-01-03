
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Confetti from "react-confetti";
import { Volume2, VolumeX } from "lucide-react";
import "./Sidebar.css"

const BreathingExercise = () => {
  const [rounds, setRounds] = useState(1);
  const [currentRound, setCurrentRound] = useState(0);
  const [timer, setTimer] = useState(5);
  const [isBreathingIn, setIsBreathingIn] = useState(true);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const intervalRef = useRef(null);
  const synth = window.speechSynthesis;
  const audioRef = useRef(null);

  // 🔊 Setup background music
  useEffect(() => {
    audioRef.current = new Audio("/music/ambient.mp3"); // Put file in public/music/
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4; // default volume
    if (soundOn) audioRef.current.play().catch(() => { });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // 🔊 Handle mute/unmute
  useEffect(() => {
    if (audioRef.current) {
      if (soundOn) {
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
    }
  }, [soundOn]);

  // 🎵 Smooth fade helper
  const fadeVolume = (targetVolume, duration = 2000) => {
    if (!audioRef.current) return;
    const steps = 20;
    const stepTime = duration / steps;
    const diff = (targetVolume - audioRef.current.volume) / steps;
    let currentStep = 0;

    const fade = setInterval(() => {
      if (!audioRef.current) return clearInterval(fade);
      audioRef.current.volume = Math.min(
        1,
        Math.max(0, audioRef.current.volume + diff)
      );
      currentStep++;
      if (currentStep >= steps) clearInterval(fade);
    }, stepTime);
  };

  const speak = (text) => {
    if (!soundOn) return;
    if (synth.speaking) synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
  };

  const runTimer = (phase, roundNumber) => {
    let count = 5;
    setTimer(count);

    // 🎵 Fade music with breathing
    if (phase === "in") fadeVolume(0.7, 3000); // louder on inhale
    else fadeVolume(0.3, 3000); // softer on exhale

    intervalRef.current = setInterval(() => {
      count -= 1;
      setTimer(count);

      if (count <= 0) {
        clearInterval(intervalRef.current);

        if (phase === "in") {
          setIsBreathingIn(false);
          speak("Now breathe out...");
          setTimeout(() => runTimer("out", roundNumber), 1200);
        } else {
          const nextRound = roundNumber + 1;
          if (nextRound < rounds) {
            setCurrentRound(nextRound);
            setIsBreathingIn(true);
            speak(`Round ${nextRound + 1}. Breathe in...`);
            setTimeout(() => runTimer("in", nextRound), 1200);
          } else {
            speak("Great job! You’ve completed your breathing exercise!");
            setIsCelebrating(true);
            setIsExerciseActive(false);
            fadeVolume(0.4, 2000); // reset music volume
          }
        }
      }
    }, 1000);
  };

  const startExercise = () => {
    setIsCelebrating(false);
    setCurrentRound(0);
    setIsBreathingIn(true);
    setIsExerciseActive(true);
    speak("Let’s start. Breathe in...");
    setTimeout(() => runTimer("in", 0), 1200);
  };

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Mindful Breathing
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Find your center through guided rhythmic respiration.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-16 mb-12 relative overflow-hidden flex flex-col items-center">
        {/* Sound Toggle */}
        <button
          onClick={() => setSoundOn(!soundOn)}
          className="absolute top-8 right-8 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-400 hover:text-white"
        >
          {soundOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
        {isCelebrating && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} />}

        {!isExerciseActive && (
          <div className="max-w-sm w-full space-y-8 animate-fade-in">
            <div className="space-y-4 text-center">
              <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 block">
                Target Rounds
              </label>
              <input
                type="number"
                value={rounds}
                min={1}
                onChange={(e) =>
                  setRounds(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="w-full h-16 rounded-2xl bg-white/5 border border-white/10 text-center text-3xl font-black text-white focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all shadow-inner"
              />
            </div>

            <button
              onClick={startExercise}
              className="auth-btn !py-5 text-lg"
            >
              Initiate Session
            </button>
            <p className="text-gray-500 text-xs text-center font-medium">Recommended: 10-15 rounds for optimal relaxation.</p>
          </div>
        )}

        {isExerciseActive && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="relative">
              {/* Outer Pulse */}
              <motion.div
                animate={{
                  scale: isBreathingIn ? [1, 1.4, 1.2] : [1.2, 0.9, 1],
                  opacity: isBreathingIn ? [0.1, 0.3, 0.2] : [0.2, 0.1, 0.1]
                }}
                transition={{ duration: 5, ease: "linear", repeat: Infinity }}
                className="absolute inset-x-0 -inset-y-10 w-64 h-64 -m-10 rounded-full bg-cyan-500/20 blur-3xl"
              />

              <motion.div
                animate={{
                  scale: isBreathingIn ? 1.25 : 0.8,
                  boxShadow: isBreathingIn
                    ? "0 0 80px 20px rgba(34,211,238,0.2)"
                    : "0 0 40px 10px rgba(167,139,250,0.1)",
                }}
                transition={{ duration: 5, ease: "easeInOut" }}
                className="w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-br from-cyan-400/80 via-blue-500/80 to-purple-600/80 flex items-center justify-center p-1 shadow-2xl relative z-10"
              >
                <div className="w-full h-full rounded-full bg-[#0B0F19]/90 backdrop-blur-xl flex flex-col items-center justify-center border border-white/10">
                  <span className="text-6xl font-black gradient-text tracking-tighter">
                    {timer}
                  </span>
                  <span className="text-[10px] uppercase font-black tracking-[0.3em] text-gray-500 mt-2">Seconds</span>
                </div>
              </motion.div>
            </div>

            <div className="mt-16 text-center space-y-4">
              <h3 className="text-3xl font-black uppercase tracking-tighter gradient-text animate-pulse">
                {isBreathingIn ? "Breathe In" : "Breathe Out"}
              </h3>
              <div className="flex items-center gap-4 justify-center">
                <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-xs font-bold text-gray-400">
                  Progress: <span className="text-white">{currentRound + 1}</span> / {rounds}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BreathingExercise;




