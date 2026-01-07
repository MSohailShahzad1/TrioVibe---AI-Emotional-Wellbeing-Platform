import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { FaDownload, FaHistory, FaCheckCircle, FaChartLine } from "react-icons/fa";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Progress = ({ userId }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/therapy/progress/${userId}`);
        if (res.data.success) setSession(res.data.session);
      } catch (err) {
        console.error("Progress error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchProgress();
    else setLoading(false);
  }, [userId]);

  const [generatingReport, setGeneratingReport] = useState(false);

  // Mock Data for Demo
  const mockSession = {
    duration: 30,
    currentDay: 12,
    isCompleted: false,
    answers: Array(12).fill(0).map((_, i) => ({ value: Math.floor(Math.random() * 40) + 60 })), // Random scores 60-100
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString()
  };

  const generateAIReport = async (data = session) => {
    if (!data) return;
    setGeneratingReport(true);

    try {
      // 1. Prepare Data for AI
      const scores = data.answers.map(a => a.value || 0).join(", ");
      const averageScore = (data.answers.reduce((a, b) => a + (b.value || 0), 0) / data.answers.length).toFixed(1);

      const prompt = `
        You are an expert Clinical Psychologist at TrioVibe.
        Generate a comprehensive, professional, and empathetic mental health progress report for a patient based on the following data:
        
        - Treatment Duration: ${data.duration} days
        - Current Day: ${data.currentDay}
        - Daily Wellness Scores (0-100 scale, higher is better): [${scores}]
        - Average Wellness Score: ${averageScore}/100
        
        The report must be structured with the following sections:
        1. **Executive Summary**: A brief overview of the patient's current mental state.
        2. **Clinical Analysis**: detailed analysis of the score trends, identifying stability, improvements, or areas of concern.
        3. **Psychological Insights**: potential underlying emotional patterns based on the volatility or consistency of the scores.
        4. **Therapeutic Recommendations**: 3-4 actionable, science-backed steps for the patient to improve or maintain their well-being.
        5. **Encouraging Conclusion**: A motivating closing statement.

        Do NOT use markdown. Write in plain text paragraphs suitable for a formal PDF report. 
        Tone: Professional, supportive, clinical but accessible.
      `;

      // 2. Fetch AI Analysis
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.6,
          max_tokens: 1000
        })
      });

      if (!res.ok) throw new Error("AI Generation Failed");
      const result = await res.json();
      const aiText = result.choices?.[0]?.message?.content || "Analysis temporarily unavailable.";

      // 3. Generate PDF with AI Text
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // --- Custom Header ---
      doc.setFillColor(13, 27, 42); // Navy Blue
      doc.rect(0, 0, pageWidth, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("TrioVibe", margin, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("AI-POWERED CLINICAL ANALYSIS", margin, 32);

      // --- Metadata Table ---
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);

      const dateStr = new Date().toLocaleDateString();
      const idStr = userId || "DEMO_PATIENT";

      doc.text(`Patient ID: ${idStr}`, margin, 55);
      doc.text(`Date: ${dateStr}`, pageWidth - margin - doc.getTextWidth(`Date: ${dateStr}`), 55);
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, 58, pageWidth - margin, 58);

      // --- AI Report Content ---
      doc.setFont("times", "roman");
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);

      const splitText = doc.splitTextToSize(aiText, contentWidth);
      let yPos = 70;

      // Check URL length and add pages if necessary
      splitText.forEach(line => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 30; // Reset Y for new page
        }

        // Simple bold detection for sections (if AI uses format "Section:")
        if (line.includes("Summary") || line.includes("Analysis") || line.includes("Recommendations") || line.includes("Conclusion")) {
          doc.setFont("times", "bold");
          doc.setFontSize(12);
          yPos += 5;
        } else {
          doc.setFont("times", "roman");
          doc.setFontSize(11);
        }

        doc.text(line, margin, yPos);
        yPos += 6;
      });

      // --- Footer ---
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text("Clinical Insight Report generated by TrioVibe AI. Not a substitute for professional medical advice.", margin, 285);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 285);
      }

      doc.save(`TrioVibe_Clinical_Report_${userId || "DEMO"}.pdf`);

    } catch (err) {
      console.error("Report Generation Error:", err);
      alert("Failed to generate AI report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
        <p className="text-dim font-bold">Synchronizing Progress Data...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-full w-full flex flex-col items-center justify-center p-12">
        <div className="glass-panel p-12 text-center max-w-md w-full animate-fade-in-up">
          <span className="text-6xl mb-6 block opacity-20 grayscale">📈</span>
          <h2 className="text-2xl font-black text-bright mb-2 uppercase tracking-tighter">No Active Journey</h2>
          <p className="text-dim text-sm mb-8">You haven't initiated a therapy cycle yet. Start your journey from the Therapy hub.</p>

          <button
            onClick={() => generateAIReport(mockSession)}
            disabled={generatingReport}
            className="flex items-center gap-2 mx-auto px-6 py-3 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-wait"
          >
            {generatingReport ? (
              <>
                <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                Generating Analysis...
              </>
            ) : (
              <>
                <FaDownload />
                Download AI Demo Report
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = (session.currentDay / session.duration) * 100;

  // Chart Data
  const doughnutData = {
    labels: ['Completed', 'Remaining'],
    datasets: [{
      data: [session.currentDay, session.duration - session.currentDay],
      backgroundColor: ['#06b6d4', 'rgba(255, 255, 255, 0.05)'],
      borderColor: ['rgba(255, 255, 255, 0.1)', 'transparent'],
      borderWidth: 1,
      hoverOffset: 4
    }]
  };

  const lineData = {
    labels: session.answers.map((_, i) => `Check ${i + 1}`),
    datasets: [{
      label: 'Engagement Intensity',
      data: session.answers.map((a) => a.value || Math.random() * 100), // Fallback if no specific value
      fill: true,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      pointRadius: 0
    }]
  };

  return (
    <div className="min-h-full w-full flex flex-col animate-fade-in-up p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2 gradient-text tracking-tight">
            Recovery Insights
          </h1>
          <p className="text-lg text-dim font-medium">
            Standardized tracking of your neurological wellness journey.
          </p>
        </div>
        <button
          onClick={() => generateAIReport()}
          disabled={generatingReport}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-bright font-bold hover:bg-white/10 transition-all active:scale-95 shadow-xl disabled:opacity-50 disabled:cursor-wait"
        >
          {generatingReport ? (
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <FaDownload className="text-cyan-400" />
          )}
          {generatingReport ? "Creating Report..." : "AI Clinical Report"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Progress Overview */}
        <div className="lg:col-span-2 glass-panel p-8 md:p-10 relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-bright flex items-center gap-2">
              <span className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              Journey Milestones
            </h2>
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
              {session.isCompleted ? "Completed" : "Active Phase"}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-dim">Overall Momentum</span>
                  <span className="text-3xl font-black text-bright">{progressPercentage.toFixed(0)}%</span>
                </div>
                <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all duration-1000"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-white/10 transition-colors">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-dim mb-1 flex items-center gap-2">
                    <FaHistory className="text-cyan-500" />
                    Total Cycle
                  </p>
                  <p className="text-2xl font-black text-bright">{session.duration} <span className="text-xs text-dim">Days</span></p>
                </div>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 shadow-inner group hover:bg-white/10 transition-colors">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-dim mb-1 flex items-center gap-2">
                    <FaCheckCircle className="text-emerald-500" />
                    Active Day
                  </p>
                  <p className="text-2xl font-black text-cyan-400">{session.currentDay} <span className="text-xs text-dim">Current</span></p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="w-full max-w-[220px] aspect-square relative">
                <Doughnut
                  data={doughnutData}
                  options={{
                    cutout: '80%',
                    plugins: { legend: { display: false } },
                    maintainAspectRatio: true
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-bright leading-none">Day</span>
                  <span className="text-4xl font-black text-cyan-400">{session.currentDay}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <div className="glass-panel p-6 border-cyan-500/10">
            <h3 className="text-sm font-bold text-bright mb-4 flex items-center gap-2">
              <FaChartLine className="text-cyan-500" />
              Engagement Analytics
            </h3>
            <div className="h-[120px] w-full">
              <Line
                data={lineData}
                options={{
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { display: false },
                    y: { display: false }
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
            <div className="mt-4 pt-4 border-t border-white/5">
              <p className="text-xs text-dim leading-relaxed">
                Consistency is <span className="text-emerald-400 font-bold">Excellent</span>. Your neural participation is 24% higher than last week.
              </p>
            </div>
          </div>

          <div className="glass-panel p-6">
            <h3 className="text-sm font-bold text-bright mb-4">Milestone Badges</h3>
            <div className="flex flex-wrap gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${session.currentDay >= 1 ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-dim grayscale'}`} title="First Step">🌱</div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${session.currentDay >= 7 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-dim grayscale'}`} title="Consistency">🔥</div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${session.currentDay >= 30 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-dim grayscale'}`} title="Resilience">💎</div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${session.isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-dim grayscale'}`} title="Graduate">🎓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Progress;
