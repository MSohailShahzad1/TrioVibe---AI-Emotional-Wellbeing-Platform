
import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Link } from 'react-router-dom';

const AIPal = () => {
  const videoRef = useRef();
  const canvasRef = useRef(null);
  const audioRef = useRef(new Audio());
  const recognitionRef = useRef(null);
  const [expression, setExpression] = useState('neutral');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingError, setLoadingError] = useState(null);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isWaitingForManualStart, setIsWaitingForManualStart] = useState(false);
  const silenceTimerRef = useRef(null);
  const SILENCE_TIMEOUT = 10000; // 10 seconds of silence before stopping auto-listen

  const loadModels = async () => {
    try {
      setLoadingError(null);
      const MODEL_URL = import.meta.env.VITE_MODEL_PATH || '/models' || `${process.env.PUBLIC_URL}/models`;

      console.log('Loading models from:', MODEL_URL);

      setLoadingProgress(25);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      setLoadingProgress(50);

      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      setLoadingProgress(75);

      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setLoadingProgress(100);

      setModelsLoaded(true);
      console.log('All models loaded successfully');

    } catch (error) {
      console.error('Error loading models:', error);
      setLoadingError(`Failed to load models: ${error.message}`);
      setModelsLoaded(false);
    }
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(err => {
            console.error('Video play error:', err);
          });
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setLoadingError('Camera access denied. Please check permissions.');
    }
  };

  const detectExpressions = async () => {
    if (!videoRef.current?.srcObject || !modelsLoaded) return;

    try {
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
        setExpression(sorted[0][0]);
      }
    } catch (error) {
      console.error('Face detection error:', error);
    }
  };

  const initializeSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      setLoadingError('Speech recognition not supported in this browser');
      return false;
    }

    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true; // Keep listening continuously
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = 'en-US';
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      console.log('🎤 Speech recognition started');
      setListening(true);
      setIsWaitingForManualStart(false);
      resetSilenceTimer();
    };

    recognitionRef.current.onend = () => {
      console.log('🛑 Speech recognition ended');
      setListening(false);

      // Auto-restart if call is still active, not speaking, AND we are NOT waiting for manual start
      if (callStarted && !speaking && !isWaitingForManualStart) {
        console.log('🔄 Auto-restarting speech recognition...');
        setTimeout(() => {
          // Check states again inside timeout to be safe
          if (callStarted && recognitionRef.current && !isWaitingForManualStart && !speaking) {
            try {
              recognitionRef.current.start();
            } catch (e) {
              console.log("Recognition restart skipped (already running or error)");
            }
          }
        }, 300);
      }
    };

    recognitionRef.current.onerror = (event) => {
      console.error('❌ Speech recognition error:', event.error);
      setListening(false);

      if (callStarted && event.error !== 'not-allowed' && event.error !== 'audio-capture') {
        setTimeout(() => {
          if (callStarted && recognitionRef.current && !isWaitingForManualStart) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };

    recognitionRef.current.onresult = async (event) => {
      const results = event.results;
      const lastResult = results[results.length - 1];
      const voiceText = lastResult[0].transcript;

      console.log('✅ Voice detected:', voiceText);

      // We explicitly don't stop it here, just let it process. 
      // The speak function will handle stopping it if needed.
      resetSilenceTimer();

      const userMessage = { role: 'user', content: voiceText };
      setConversationHistory(prev => [...prev, userMessage]);

      try {
        const reply = await getLLMResponse(voiceText, expression);
        const aiMessage = { role: 'assistant', content: reply };
        setConversationHistory(prev => [...prev, aiMessage]);

        await speak(reply);
      } catch (err) {
        console.error('⚠️ Error processing response:', err);
      }
    };

    return true;
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      if (listening && !speaking) {
        console.log('⏳ Silence timeout reached. Stopping auto-listen.');
        stopListeningManually();
      }
    }, SILENCE_TIMEOUT);
  };

  const startListeningManually = () => {
    setIsWaitingForManualStart(false);
    if (!listening && recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  const stopListeningManually = () => {
    setIsWaitingForManualStart(true);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error("Recognition stop error:", err);
      }
    }
  };

  const getLLMResponse = async (userText, emotion) => {
    try {
      // Build conversation context
      const messages = [
        {
          role: 'system',
          content: `You are an empathetic AI mental health companion. The user is currently feeling ${emotion}. 
                   Have a natural, flowing conversation. Be supportive, ask follow-up questions, and show genuine care.
                   Keep responses conversational and appropriate for a mental health context.`
        },
        ...conversationHistory.slice(-6), // Keep last 3 exchanges for context
        { role: 'user', content: userText }
      ];

      console.log("🔍 Sending to Groq:", messages);

      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: messages,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      console.log("📡 Status:", res.status);

      if (!res.ok) {
        const errBody = await res.text();
        console.error("❌ API Error Body:", errBody);
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();
      return data?.choices?.[0]?.message?.content || 'I understand. Tell me more about how you\'re feeling.';
    } catch (error) {
      console.error('LLM API error:', error);
      return 'I\'m here to listen. Could you tell me more about what\'s on your mind?';
    }
  };

  const speak = async (text) => {
    return new Promise((resolve) => {
      setSpeaking(true);

      // Stop listening while speaking to avoid feedback
      if (listening) {
        try { recognitionRef.current.stop(); } catch (e) { }
      }

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onend = () => {
        console.log('🗣️ Speech ended');
        setSpeaking(false);
        setIsWaitingForManualStart(false); // Reset this to ensure auto-listen triggers
        resolve();
      };

      utterance.onerror = (error) => {
        console.error('Speech synthesis error:', error);
        setSpeaking(false);
        setIsWaitingForManualStart(false);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const startCall = async () => {
    if (!modelsLoaded) {
      setLoadingError('Models not loaded yet. Please wait.');
      return;
    }

    setCallStarted(true);
    setConversationHistory([]); // Reset conversation

    await startVideo();

    // Initialize and start speech recognition
    if (initializeSpeechRecognition()) {
      recognitionRef.current.start();
    }

    // Start with a greeting
    await speak("Hello! I'm your AI Pal. I'm here to listen and support you. How are you feeling today?");
  };

  const endCall = () => {
    console.log('📞 Ending call...');
    setCallStarted(false);

    // Stop speech recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null; // Prevent auto-restart
        recognitionRef.current.stop();
        console.log("🛑 Speech recognition stopped");
      } catch (err) {
        console.error("Error stopping recognition:", err);
      }
    }

    // Stop speech synthesis
    window.speechSynthesis.cancel();

    // Stop audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    // Reset states
    setListening(false);
    setSpeaking(false);

    // Stop video stream
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    let interval;
    if (modelsLoaded && callStarted) {
      interval = setInterval(detectExpressions, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modelsLoaded, callStarted]);

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          AI Therapy Pal
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Your sentient companion for real-time emotional support and conversation.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        {/* Call Container - Video and AI Pal */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-6xl">
          {/* User Video */}
          <div className="flex flex-col items-center group">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-500/5 group-hover:border-emerald-500/30 transition-all duration-500">
              <video
                ref={videoRef}
                className="w-full max-w-[400px] aspect-video object-cover"
                autoPlay
                muted
                playsInline
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
              />
            </div>
            <p className="text-emerald-400 font-semibold mt-3 text-lg">You</p>
          </div>

          {/* AI Pal Container */}
          <div className="flex flex-col items-center group">
            <div className="relative w-full max-w-[400px] aspect-video rounded-2xl border border-white/10 bg-white/5 shadow-2xl shadow-cyan-500/5 group-hover:border-cyan-500/30 transition-all duration-500 overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-50" />
              {speaking ? (
                <div className="relative">
                  <div className="absolute inset-0 w-32 h-32 -m-8 rounded-full border border-cyan-400 animate-ping opacity-20" />
                  <div className="absolute inset-0 w-24 h-24 -m-4 rounded-full border border-cyan-400 animate-ping opacity-40" />
                  <span className="text-6xl animate-bounce">🤖</span>
                </div>
              ) : (
                <span className="text-6xl opacity-20 grayscale">🤖</span>
              )}
            </div>
            <p className="text-cyan-400 font-bold mt-4 uppercase text-xs tracking-widest opacity-60">Neural Engine</p>
          </div>
        </div>

        {/* Loading Overlay */}
        {!modelsLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xl z-50 p-12 text-center">
            <div className="w-20 h-20 mb-8 relative">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-t-cyan-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
              Synchronizing Systems
            </h2>
            <p className="text-gray-400 text-sm mb-8">Loading advanced facial recognition modules...</p>
            <div className="w-full max-w-md h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-all duration-500 ease-out"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>
            <p className="mt-4 text-cyan-400 font-mono text-lg">{loadingProgress}%</p>
          </div>
        )}

        {/* Expression Display */}
        <div className="text-center mb-12 p-8 rounded-2xl bg-white/[0.02] border border-white/5 shadow-inner max-w-lg mx-auto w-full">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 mb-4">
            Live Emotion Status
          </h3>
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl font-black gradient-text mb-2">
              {expression.toUpperCase()}
            </span>
            <div className="flex items-center justify-center gap-3">
              {listening && (
                <span className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  Listening
                </span>
              )}
              {speaking && (
                <span className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                  Speaking
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Conversation History (Optional - for debugging) */}
        {conversationHistory.length > 0 && (
          <div className="max-w-3xl w-full mx-auto mb-12 p-6 rounded-2xl bg-black/20 border border-white/5 shadow-inner max-h-48 overflow-y-auto custom-scrollbar">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-gray-600 mb-4">Neural Log</h4>
            <div className="space-y-3">
              {conversationHistory.slice(-5).map((msg, index) => (
                <div key={index} className={`flex gap-3 text-sm ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-xl border ${msg.role === 'user'
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200 rounded-tr-none'
                    : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-100 rounded-tl-none'
                    }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call Controls */}
        <div className="flex flex-wrap justify-center gap-6">
          {!callStarted ? (
            <button
              onClick={startCall}
              className="auth-btn !w-64"
            >
              <span className="flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Initialize Call
              </span>
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={endCall}
                className="px-8 py-4 rounded-xl bg-red-500/10 text-red-500 font-bold border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-3"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Terminate
              </button>

              {!listening ? (
                <button
                  onClick={startListeningManually}
                  className="px-8 py-4 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  Resume Listening
                </button>
              ) : (
                <button
                  onClick={stopListeningManually}
                  className="px-8 py-4 rounded-xl bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 hover:bg-amber-500/20 transition-all flex items-center gap-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                  Pause Input
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-4 mt-8 pt-8 border-t border-white/5 w-full justify-center">
          <button
            onClick={startVideo}
            className="px-6 py-3 rounded-xl bg-white/5 text-gray-400 font-bold border border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            Sync Sensors
          </button>
          <Link to="/Home">
            <button className="px-6 py-3 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold border border-cyan-500/20 hover:bg-cyan-500/20 transition-all flex items-center gap-2 text-xs uppercase tracking-widest">
              Back to Hub
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AIPal;