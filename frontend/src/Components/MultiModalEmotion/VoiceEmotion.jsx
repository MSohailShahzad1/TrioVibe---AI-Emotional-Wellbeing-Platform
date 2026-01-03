import { useRef, useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition
} from "react-speech-recognition";

import EmotionNavbar from "./EmotionNavbar";

export default function VoiceEmotion() {
  const waveformCanvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);
  const animationRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [voiceEmotion, setVoiceEmotion] = useState(null);
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const getLLMResponse = async (userText, emotion) => {
    try {
      const messages = [
        {
          role: "system",
          content: `You are an empathetic AI mental health companion.
          The user is feeling ${emotion}. Respond with emotional awareness,
          supportive tone, and short practical advice.`
        },
        {
          role: "user",
          content: userText
        }
      ];

      const res = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages,
            temperature: 0.7,
            max_tokens: 150
          })
        }
      );

      if (!res.ok) throw new Error("LLM request failed");

      const data = await res.json();
      return (
        data?.choices?.[0]?.message?.content ||
        "I'm here to listen. Tell me more."
      );
    } catch (err) {
      console.error("LLM Error:", err);
      return "I'm here to support you. Please try again.";
    }
  };

  /* ---------------- AUDIO VISUALIZER ---------------- */
  const startWaveform = async () => {
    try {
      setIsRecording(true);
      setError("");

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current =
        new (window.AudioContext || window.webkitAudioContext)();

      analyserRef.current = audioContextRef.current.createAnalyser();
      sourceRef.current =
        audioContextRef.current.createMediaStreamSource(stream);

      sourceRef.current.connect(analyserRef.current);
      analyserRef.current.fftSize = 2048;

      const bufferLength = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      const drawWaveform = () => {
        animationRef.current = requestAnimationFrame(drawWaveform);
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        const canvas = waveformCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 2;
        ctx.strokeStyle = "#38bdf8";
        ctx.beginPath();

        const sliceWidth = canvas.width / bufferLength;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArrayRef.current[i] / 128.0;
          const y = (v * canvas.height) / 2;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          x += sliceWidth;
        }

        ctx.stroke();
      };

      drawWaveform();
    } catch (err) {
      console.error("Mic Access Error:", err);
      setError("Microphone access denied or not available.");
      setIsRecording(false);
    }
  };

  const stopWaveform = () => {
    setIsRecording(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) audioContextRef.current.close();
  };

  const analyzeVoice = async () => {
    if (!transcript.trim()) {
      setError("No speech detected. Please speak first.");
      return;
    }

    setLoading(true);
    setError("");
    setVoiceEmotion(null);
    setAiReply("");

    try {
      // 1️⃣ Detect Emotion using ML Model
      const res = await fetch(`${import.meta.env.VITE_API_URL}/emotion/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: transcript })
      });

      if (!res.ok) throw new Error("Voice Prediction failed");
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Prediction failed");

      const emotion = {
        label: data.label,
        confidence: data.confidence
      };
      setVoiceEmotion(emotion);

      // 2️⃣ Save Result to DB
      const user = JSON.parse(localStorage.getItem("user"));
      if (user?._id) {
        await fetch(`${import.meta.env.VITE_API_URL}/emotion/saveResult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            emotion: emotion.label,
            probability: emotion.confidence,
            sourceType: "voice",
            extraData: { transcript }
          })
        });
      }

      // 3️⃣ AI Response
      const reply = await getLLMResponse(transcript, emotion.label);
      setAiReply(reply);

      resetTranscript();
    } catch (err) {
      console.error("Voice Analysis Error:", err);
      setError(err.message || "Something went wrong during analysis.");
    } finally {
      setLoading(false);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400">
        <p>Speech recognition not supported in this browser.</p>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Voice Tone Analysis
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Capturing emotional nuances through speech patterns and intensity.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        <EmotionNavbar />
        <p className="text-center text-gray-400 mb-8">
          Analyze spoken emotions using real-time AI
        </p>

        {/* Controls */}
        <div className="flex justify-center flex-wrap gap-6 mb-12">
          <button
            onClick={() => {
              startWaveform();
              SpeechRecognition.startListening({ continuous: true });
            }}
            disabled={isRecording || loading}
            className="auth-btn !w-64"
          >
            {isRecording ? "Recording..." : "Initialize Mic"}
          </button>

          <button
            onClick={() => {
              stopWaveform();
              SpeechRecognition.stopListening();
            }}
            disabled={!isRecording || loading}
            className="px-8 py-4 rounded-xl bg-red-500/10 text-red-500 
                       font-bold border border-red-500/20 hover:bg-red-500/20 transition-all font-bold 
                       disabled:opacity-20"
          >
            End Recording
          </button>

          <button
            onClick={analyzeVoice}
            disabled={loading || isRecording || !transcript.trim()}
            className="px-8 py-4 rounded-xl bg-emerald-500/10 text-emerald-500 
                       font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all font-bold
                       disabled:opacity-20 flex items-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent animate-spin rounded-full" /> : "Run Analysis"}
          </button>
        </div>

        {/* Waveform */}
        <div className="relative mb-6">
          <canvas
            ref={waveformCanvasRef}
            className="w-full h-32 rounded-2xl bg-white/5
                       border border-white/10 glow-cyan"
          />
          {!isRecording && !loading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-gray-500 text-sm">Waveform will appear here when recording</p>
            </div>
          )}
        </div>

        {/* Transcript Area */}
        <div className="mb-12 p-8 rounded-2xl bg-white/[0.02] border border-white/5
                        shadow-inner backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <p className="font-bold text-cyan-400 flex items-center gap-3 uppercase text-xs tracking-widest">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
              Pattern Capture
            </p>
            <button
              onClick={resetTranscript}
              className="text-xs text-gray-500 hover:text-white transition-all font-bold"
            >
              Reset Pattern
            </button>
          </div>
          <p className="text-gray-300 min-h-[100px] leading-relaxed italic text-lg opacity-80">
            {transcript || "The neural engine is listening for emotional markers..."}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Emotion Result */}
          {voiceEmotion && (
            <div className="p-8 rounded-2xl glass-card border-white/10 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-16 -mt-16" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">
                Sentiment Vector
              </h2>

              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-black gradient-text">
                  {voiceEmotion.label.toUpperCase()}
                </span>
                <span className="text-cyan-400 font-mono text-xl">
                  {(voiceEmotion.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r
                             from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]
                             transition-all duration-1000 ease-out"
                  style={{
                    width: `${voiceEmotion.confidence * 100}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Confidence Index</p>
            </div>
          )}

          {/* AI Remarks */}
          {aiReply && (
            <div className="p-8 rounded-2xl glass-card border-cyan-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent">
              <div className="absolute top-0 left-0 w-1 p-8 h-full bg-cyan-500/20" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400/60 mb-6 flex items-center gap-2">
                🤖 Neural Response
              </h2>
              <p className="text-gray-300 leading-relaxed text-sm lg:text-base pl-4 italic">
                "{aiReply}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

