import EmotionNavbar from "./EmotionNavbar";

export default function EmotionHome() {
  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text tracking-tight">
          Emotion Intelligence
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
          Deciphering feelings through advanced multimodal AI analysis.
        </p>
      </div>

      <div className="glass-panel p-8 md:p-12 mb-12">
        <EmotionNavbar />

        {/* Introduction */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-4">Understanding Inner Balance</h2>
            <p className="text-gray-400 leading-relaxed">
              Mental health is the foundation of our daily existence. TrioVibe leverages cutting-edge AI to provide objective insights into your emotional state, helping you navigate stress and find clarity.
            </p>
            <div className="p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
              <p className="text-cyan-400 text-sm font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                Global Impact
              </p>
              <p className="text-gray-300 mt-2 text-sm">
                Studies show over <span className="text-white font-bold">1 in 8 people</span> live with mental health conditions. Technology bridges the gap to accessible emotional awareness.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 text-xl">🎥</span>
                Face Detection
              </h3>
              <p className="text-gray-400 text-sm">Micro-expression analysis for instant emotional feedback.</p>
            </div>
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-xl">🎙</span>
                Tone Analysis
              </h3>
              <p className="text-gray-400 text-sm">Captures emotional nuances in speech intensity and pitch.</p>
            </div>
            <div className="glass-card p-6 border-white/5">
              <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-3">
                <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400 text-xl">📝</span>
                Sentiment Text
              </h3>
              <p className="text-gray-400 text-sm">NLP-powered understanding of written emotional intent.</p>
            </div>
          </div>
        </div>

        {/* Feature List Grid */}
        <div className="mt-16 pt-16 border-t border-white/5">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">Comprehensive Wellness Ecosystem</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "💬", title: "Peer Support", desc: "Secure community for shared therapy." },
              { icon: "📹", title: "Expert Sessions", desc: "Live calls with certified therapists." },
              { icon: "📅", title: "Smart Scheduling", desc: "Seamless appointment management." },
              { icon: "🌬", title: "Breathing Lab", desc: "AI-guided relaxation techniques." },
              { icon: "🤖", title: "AI Text Therapy", desc: "Empathetic conversation & insights." },
              { icon: "🧠", title: "Therapy Pal", desc: "Your 24/7 mental health companion." }
            ].map((f, i) => (
              <div key={i} className="glass-card p-6 hover:bg-white/5 transition-all text-center">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h4 className="text-white font-bold mb-2">{f.title}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
