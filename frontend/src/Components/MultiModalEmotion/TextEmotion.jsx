
import { useState } from "react";
import EmotionNavbar from "./EmotionNavbar";

export default function TextEmotion() {
  const [text, setText] = useState("");
  const [emotionResult, setEmotionResult] = useState(null);
  const [aiReply, setAiReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  const handleAnalyze = async () => {
    if (!text.trim()) {
      setError("Please enter some text.");
      return;
    }

    setError("");
    setLoading(true);
    setEmotionResult(null);
    setAiReply("");

    try {
      // 1️⃣ Detect Emotion using ML Model
      const res = await fetch(`${import.meta.env.VITE_API_URL}/emotion/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (!res.ok) throw new Error("ML Prediction failed");
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Prediction failed");

      const emotion = {
        label: data.label,
        confidence: data.confidence
      };
      setEmotionResult(emotion);

      // 2️⃣ Save Result to DB (Optional, but aligned with existing API)
      const user = JSON.parse(localStorage.getItem("user")); // Assuming user is in localStorage
      if (user?._id) {
        await fetch(`${import.meta.env.VITE_API_URL}/emotion/saveResult`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user._id,
            emotion: emotion.label,
            probability: emotion.confidence,
            sourceType: "text",
            extraData: { text }
          })
        });
      }

      // 3️⃣ AI Response based on ML label
      const reply = await getLLMResponse(text, emotion.label);
      setAiReply(reply);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Sentiment Analysis
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          NLP-powered understanding of written emotional intent.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12 relative overflow-hidden">
        <EmotionNavbar />

        {/* Text Input */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <textarea
            rows={6}
            className="relative w-full p-8 rounded-2xl bg-white/5
                       border border-white/10
                       placeholder-gray-500 text-auto
                       focus:outline-none focus:border-cyan-500/50 
                       transition-all resize-none text-lg shadow-inner"
            placeholder="Type how you are feeling right now..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Error */}
        {error && (
          <p className="mt-3 text-red-400 font-medium">{error}</p>
        )}

        {/* Analyze Button */}
        <div className="flex justify-center mt-12 mb-12">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="auth-btn !w-80"
          >
            {loading ? <div className="flex items-center gap-3 justify-center"><div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />Processing...</div> : "Initialize Neural Analysis"}
          </button>
        </div>

        {/* Emotion Result */}
        {emotionResult && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 animate-fade-in-up">
            <div className="p-8 rounded-2xl glass-card border-white/10 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl -mr-16 -mt-16" />
              <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 font-bold">
                Detected State
              </h2>

              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-black gradient-text">
                  {emotionResult.label.toUpperCase()}
                </span>
                <span className="text-cyan-400 font-mono text-xl">
                  {(emotionResult.confidence * 100).toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r
                              from-cyan-400 to-blue-600 shadow-[0_0_10px_rgba(34,211,238,0.5)]
                              transition-all duration-1000 ease-out"
                  style={{
                    width: `${emotionResult.confidence * 100}%`
                  }}
                />
              </div>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Sentiment Confidence</p>
            </div>

            {aiReply && (
              <div className="p-8 rounded-2xl glass-card border-cyan-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-br from-cyan-500/5 to-transparent">
                <div className="absolute top-0 left-0 w-1 p-8 h-full bg-cyan-500/20" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400/60 mb-6 flex items-center gap-2">
                  🤖 Neural Remark
                </h2>
                <p className="text-gray-300 leading-relaxed text-sm lg:text-base pl-4 italic">
                  "{aiReply}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
