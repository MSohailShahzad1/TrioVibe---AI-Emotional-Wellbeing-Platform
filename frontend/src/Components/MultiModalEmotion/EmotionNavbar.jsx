import { NavLink } from "react-router-dom";

export default function EmotionNavbar() {
  const linkClass = ({ isActive }) =>
    `relative px-6 py-2.5 font-bold transition-all duration-300 rounded-xl ${isActive
      ? "bg-white/10 text-cyan-400 shadow-lg shadow-cyan-500/10 border border-white/10"
      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
    }`;

  return (
    <nav className="flex flex-wrap justify-center gap-4 mb-12 p-1.5 glass-panel bg-white/5 border-white/5 w-fit mx-auto">
      {[
        { label: "Overview", path: "/MultiModal" },
        { label: "Face Analysis", path: "/MultiModal/Face" },
        { label: "Voice Tone", path: "/MultiModal/Voice" },
        { label: "Sentiment Text", path: "/MultiModal/Text" },
      ].map(({ label, path }) => (
        <NavLink key={path} to={path} className={linkClass}>
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
