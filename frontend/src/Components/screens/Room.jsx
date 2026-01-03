


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useSocket } from "../../Context/SocketProvider";
// import peerService from "../../services/peerService";
// import * as faceapi from "face-api.js";

// const Roompage = () => {
//   const { socket, emit, on, off } = useSocket();

//   const [remoteSocketId, setRemoteSocketId] = useState(null);
//   const [localStream, setLocalStream] = useState(null);
//   const [remoteStream, setRemoteStream] = useState(null);

//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(0);

//   const localVideoRef = useRef(null);
//   const remoteVideoRef = useRef(null);
//   const overlayCanvasRef = useRef(null);
//   const detectionIntervalRef = useRef(null);

//   console.log("🧠 Room component rendered");

//   // 🎥 Initialize local media stream
//   useEffect(() => {
//     const initLocalStream = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: true,
//           audio: true,
//         });
//         setLocalStream(stream);
//         if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//         peerService.addLocalTracks(stream);
//         console.log("🎥 Local stream initialized");
//       } catch (err) {
//         console.error("❌ Failed to get user media:", err);
//       }
//     };

//     initLocalStream();
//   }, []);

//   // 👋 Handle new user joining
//   const handleUserJoined = useCallback(({ email, id }) => {
//     console.log("👋 New user joined:", email, id);
//     setRemoteSocketId(id);
//   }, []);

//   // 📞 Auto call when both local stream & remote socket are ready
//   useEffect(() => {
//     if (remoteSocketId && localStream) {
//       console.log("📞 Auto-calling user:", remoteSocketId);
//       handleCallUser(remoteSocketId);
//     }
//   }, [remoteSocketId, localStream]);

//   // ☎️ Call handler
//   const handleCallUser = useCallback(
//     async (id) => {
//       if (!localStream) return console.warn("⚠️ No local stream available");
//       const offer = await peerService.getOffer();
//       emit("user:call", { to: id, offer });
//     },
//     [emit, localStream]
//   );

//   // 📞 Incoming call handler
//   const handleIncomingCall = useCallback(
//     async ({ from, offer }) => {
//       console.log("📞 Incoming call from:", from);
//       setRemoteSocketId(from);
//       const ans = await peerService.getAnswer(offer);
//       emit("call:accepted", { to: from, ans });
//     },
//     [emit]
//   );

//   // ✅ When call accepted
//   const handleCallAccepted = useCallback(async ({ from, ans }) => {
//     console.log("✅ Call accepted by:", from);
//     await peerService.setLocalDescription(ans);
//   }, []);

//   // 🎬 Handle remote stream
//   useEffect(() => {
//     peerService.onTrack((event) => {
//       console.log("📡 Remote stream received:", event.streams);
//       setRemoteStream(event.streams[0]);
//     });
//   }, []);

//   useEffect(() => {
//     if (remoteVideoRef.current && remoteStream) {
//       remoteVideoRef.current.srcObject = remoteStream;
//     }
//   }, [remoteStream]);

//   // 📡 Handle ICE candidates
//   const handleIncomingICE = useCallback(async ({ from, candidate }) => {
//     await peerService.addIceCandidate(candidate);
//   }, []);

//   // 🔌 Socket listener setup & cleanup
//   useEffect(() => {
//     on("user:joined", handleUserJoined);
//     on("incoming:call", handleIncomingCall);
//     on("call:accepted", handleCallAccepted);
//     on("peer:ice", handleIncomingICE);

//     return () => {
//       off("user:joined", handleUserJoined);
//       off("incoming:call", handleIncomingCall);
//       off("call:accepted", handleCallAccepted);
//       off("peer:ice", handleIncomingICE);
//     };
//   }, [on, off, handleUserJoined, handleIncomingCall, handleCallAccepted, handleIncomingICE]);

//   // 🧊 ICE candidate emitter
//   useEffect(() => {
//     if (!peerService.peer) return;
//     peerService.peer.onicecandidate = (event) => {
//       if (event.candidate && remoteSocketId) {
//         emit("peer:ice", { to: remoteSocketId, candidate: event.candidate });
//       }
//     };
//   }, [emit, remoteSocketId]);

//   // 🧩 Load face-api models
//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         const MODEL_URL = "/models";
//         setLoadingProgress(30);
//         await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//         setLoadingProgress(60);
//         await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
//         setLoadingProgress(90);
//         await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
//         setLoadingProgress(100);
//         setModelsLoaded(true);
//       } catch (err) {
//         console.error("Error loading face-api models:", err);
//       }
//     };
//     loadModels();
//   }, []);

//   // 🖼️ Face detection & overlay for remote video
//   useEffect(() => {
//     if (!modelsLoaded || !remoteStream) return;

//     const videoEl = remoteVideoRef.current;
//     const canvas = overlayCanvasRef.current;

//     if (!videoEl || !canvas) return;

//     const handleLoadedMetadata = () => {
//       const displaySize = { width: videoEl.videoWidth, height: videoEl.videoHeight };
//       canvas.width = displaySize.width;
//       canvas.height = displaySize.height;
//       faceapi.matchDimensions(canvas, displaySize);

//       detectionIntervalRef.current = setInterval(async () => {
//         if (!videoEl || videoEl.paused || videoEl.ended) return;

//         const detections = await faceapi
//           .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
//           .withFaceLandmarks()
//           .withFaceExpressions();

//         const resized = faceapi.resizeResults(detections, displaySize);

//         const ctx = canvas.getContext("2d");
//         ctx.clearRect(0, 0, canvas.width, canvas.height);

//         faceapi.draw.drawDetections(canvas, resized);
//         faceapi.draw.drawFaceLandmarks(canvas, resized);
//         faceapi.draw.drawFaceExpressions(canvas, resized);
//       }, 100);
//     };

//     videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);

//     return () => {
//       clearInterval(detectionIntervalRef.current);
//       videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
//     };
//   }, [modelsLoaded, remoteStream]);

//   // 🖼️ UI
//   return (
//     <div className="flex flex-col items-center w-600 justify-center h-screen bg-gray-900 text-white">
//       <h2 className="text-2xl font-bold mb-4">🎥 WebRTC Room</h2>
//       <div className="relative flex gap-4">
//         <video
//           ref={localVideoRef}
//           autoPlay
//           muted
//           playsInline
//           className="w-50 h-50 bg-black rounded-lg border border-gray-700"
//         />
//         <div className="relative">
//           <video
//             ref={remoteVideoRef}
//             autoPlay
//             playsInline
//             className="w-200 h-200 bg-black rounded-lg border border-gray-700"
//           />
//           <canvas
//             ref={overlayCanvasRef}
//             className="absolute top-0 left-0 rounded-lg"
//             style={{ pointerEvents: "none" }}
//           />
//         </div>
//       </div>
//       <div className="mt-6 text-sm opacity-80">
//         {remoteSocketId ? <p>Connected to: {remoteSocketId}</p> : <p>Waiting for someone to join...</p>}
//       </div>
//       {!modelsLoaded && <p className="mt-2 text-sm text-gray-300">Loading face models... {loadingProgress}%</p>}
//     </div>
//   );
// };

// // export default Roompage;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSocket } from "../../Context/SocketProvider";
import { useLocation, useNavigate } from "react-router-dom";
import peerService from "../../services/peerService";
import * as faceapi from "face-api.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  PhoneOff,
} from "lucide-react";
const user = JSON.parse(localStorage.getItem("user"));


const RoomPage = () => {
  const { socket, emit, on, off } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const otherUser = location.state?.otherUser || {};

  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [callStartTime, setCallStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState("00:00");
  const [emotionNotes, setEmotionNotes] = useState([]);
  const [notepadOpen, setNotepadOpen] = useState(false);

  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // 🎥 Initialize local media
  useEffect(() => {
    const initLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        peerService.addLocalTracks(stream);
        console.log("🎥 Local stream initialized");
      } catch (err) {
        console.error("❌ Error initializing local stream:", err);
      }
    };
    initLocalStream();
  }, []);

  // 👋 Handle user joined
  const handleUserJoined = useCallback(({ email, id }) => {
    console.log("👋 New user joined:", email, id);
    setRemoteSocketId(id);
  }, []);

  // 📞 Auto call when both users are ready
  useEffect(() => {
    if (remoteSocketId && localStream) {
      console.log("📞 Auto-calling user:", remoteSocketId);
      handleCallUser(remoteSocketId);
      setCallStartTime(Date.now()); // Start timer
    }
  }, [remoteSocketId, localStream]);

  // ⏱️ Timer for call duration
  useEffect(() => {
    if (!callStartTime) return;
    timerIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - callStartTime;
      const minutes = Math.floor(elapsed / 60000)
        .toString()
        .padStart(2, "0");
      const seconds = Math.floor((elapsed % 60000) / 1000)
        .toString()
        .padStart(2, "0");
      setElapsedTime(`${minutes}:${seconds}`);
    }, 1000);
    return () => clearInterval(timerIntervalRef.current);
  }, [callStartTime]);

  // ☎️ Call logic
  const handleCallUser = useCallback(
    async (id) => {
      const offer = await peerService.getOffer();
      emit("user:call", { to: id, offer });
    },
    [emit]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const ans = await peerService.getAnswer(offer);
      emit("call:accepted", { to: from, ans });
      setCallStartTime(Date.now());
    },
    [emit]
  );

  const handleCallAccepted = useCallback(async ({ from, ans }) => {
    await peerService.setLocalDescription(ans);
  }, []);

  const handleIncomingICE = useCallback(async ({ from, candidate }) => {
    await peerService.addIceCandidate(candidate);
  }, []);

  // 🔌 Socket setup
  useEffect(() => {
    on("user:joined", handleUserJoined);
    on("incoming:call", handleIncomingCall);
    on("call:accepted", handleCallAccepted);
    on("peer:ice", handleIncomingICE);
    return () => {
      off("user:joined", handleUserJoined);
      off("incoming:call", handleIncomingCall);
      off("call:accepted", handleCallAccepted);
      off("peer:ice", handleIncomingICE);
    };
  }, [on, off, handleUserJoined, handleIncomingCall, handleCallAccepted, handleIncomingICE]);

  // 🎬 Remote stream handling
  useEffect(() => {
    peerService.onTrack((event) => setRemoteStream(event.streams[0]));
  }, []);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // 🧩 Load face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = "/models";
        setLoadingProgress(30);
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        setLoadingProgress(60);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setLoadingProgress(90);
        await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
        setLoadingProgress(100);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Error loading face-api models:", err);
      }
    };
    loadModels();
  }, []);

  // 🧠 Detect emotions (remote user)
  useEffect(() => {
    if (!modelsLoaded || !remoteStream) return;

    const videoEl = remoteVideoRef.current;
    const canvas = overlayCanvasRef.current;

    const handleLoadedMetadata = () => {
      const displaySize = { width: videoEl.videoWidth, height: videoEl.videoHeight };
      canvas.width = displaySize.width;
      canvas.height = displaySize.height;
      faceapi.matchDimensions(canvas, displaySize);

      detectionIntervalRef.current = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(videoEl, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resized = faceapi.resizeResults(detections, displaySize);
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resized);
        faceapi.draw.drawFaceLandmarks(canvas, resized);
        faceapi.draw.drawFaceExpressions(canvas, resized);

        if (detections.length > 0) {
          const topEmotion = Object.entries(detections[0].expressions).reduce((a, b) =>
            a[1] > b[1] ? a : b
          )[0];
          const timestamp = new Date().toLocaleTimeString();
          setEmotionNotes((prev) => [...prev, { time: timestamp, emotion: topEmotion }]);
        }
      }, 2000);
    };

    videoEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    return () => {
      clearInterval(detectionIntervalRef.current);
      videoEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
    };
  }, [modelsLoaded, remoteStream]);

  // 🎛️ Controls
  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => (track.enabled = !micOn));
      setMicOn(!micOn);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => (track.enabled = !videoOn));
      setVideoOn(!videoOn);
    }
  };

  const toggleSpeaker = () => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = speakerOn;
      setSpeakerOn(!speakerOn);
    }
  };

  const endCall = () => {
    try {
      // Stop all tracks
      localStream?.getTracks().forEach((track) => track.stop());
      remoteStream?.getTracks().forEach((track) => track.stop());

      // Cleanup peer connection
      peerService.closeConnection?.();

      // Clear timers
      clearInterval(timerIntervalRef.current);
      clearInterval(detectionIntervalRef.current);

      // Navigate home
      navigate("/Home");
    } catch (err) {
      console.error("Error ending call:", err);
    }
  };

  // 🖼️ UI
  return (
    <div className="flex flex-col w-full items-center justify-center min-h-full bg-gray-900 text-white relative py-6">
      <h2 className="text-2xl font-bold mb-4">🎥 Emotional Therapy Call</h2>

      <div className="relative flex gap-6">
        {/* Local video */}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-56 h-56 bg-black rounded-xl border border-gray-700"
        />

        {/* Remote video with overlay */}
        <div className="relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-[640px] h-[480px] bg-black rounded-xl border border-gray-700"
          />
          <canvas
            ref={overlayCanvasRef}
            className="absolute top-0 left-0 rounded-xl pointer-events-none"
          />
        </div>
      </div>

      {/* Name & Timer */}
      <div className="mt-6 text-sm opacity-90 flex flex-col items-center">
        {remoteSocketId ? (
          <>
            <p>
              Connected with{" "}
              <span className="font-semibold text-blue-400">
                {otherUser?.profile?.fullName || otherUser?.name || "User"}
              </span>
            </p>
            <p className="text-gray-400 mt-1">Call Duration: {elapsedTime}</p>
          </>
        ) : (
          <p>Waiting for someone to join...</p>
        )}
      </div>

      {/* 🎚️ Control Buttons */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={toggleMic}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full"
        >
          {micOn ? <Mic size={22} /> : <MicOff size={22} className="text-red-500" />}
        </button>
        <button
          onClick={toggleVideo}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full"
        >
          {videoOn ? <Video size={22} /> : <VideoOff size={22} className="text-red-500" />}
        </button>
        <button
          onClick={toggleSpeaker}
          className="bg-gray-700 hover:bg-gray-600 p-3 rounded-full"
        >
          {speakerOn ? (
            <Volume2 size={22} />
          ) : (
            <VolumeX size={22} className="text-red-500" />
          )}
        </button>
        <button
          onClick={endCall}
          className="bg-red-600 hover:bg-red-700 p-3 rounded-full"
        >
          <PhoneOff size={22} />
        </button>
      </div>

      {/* 📝 Floating Emotion Notepad */}
      <div className="absolute bottom-6 right-6">
        <button
          onClick={() => setNotepadOpen(!notepadOpen)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg"
        >
          {notepadOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          Emotions
        </button>

        <AnimatePresence>
          {notepadOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3 }}
              className="mt-3 w-64 bg-gray-800 border border-gray-700 rounded-xl p-3 shadow-2xl max-h-60 overflow-y-auto"
            >
              <h3 className="font-semibold text-gray-200 mb-2 text-center">
                Emotion Log
              </h3>
              {emotionNotes.length === 0 ? (
                <p className="text-gray-400 text-sm text-center">
                  No emotions detected yet
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {emotionNotes.map((note, index) => (
                    <li
                      key={index}
                      className="flex justify-between border-b border-gray-700 pb-1"
                    >
                      <span className="text-gray-300">{note.emotion}</span>
                      <span className="text-gray-500">{note.time}</span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!modelsLoaded && (
        <p className="mt-2 text-sm text-gray-400">
          Loading face models... {loadingProgress}%
        </p>
      )}
    </div>
  );
};

export default RoomPage;



