

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { sidebarItems } from "./SidebarConfig";
import { useUser } from "../../Context/UserContext";
import ThemeToggle from "../common/ThemeToggle";
import BecomeTherapist from "../Profile/BecomeTherapist";

const Sidebar = () => {
  const [extended, setExtended] = useState(
    () => window.innerWidth > 900
  );

  // Get user role from context
  const { user } = useUser();
  const userRole = user?.role || localStorage.getItem("userRole") || "user"; // "therapist" | "admin" | "user"

  // 🔹 Auto collapse on resize
  useEffect(() => {
    const handleResize = () => {
      setExtended(window.innerWidth > 900);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`sidebar ${extended ? "extended" : ""}`}>
      {/* ---------- TOP ---------- */}
      <div className="sidebar-top">
        {/* Menu Toggle */}
        <img
          src={assets.menu_icon}
          alt="menu"
          className="menu-icon"
          onClick={() => setExtended((prev) => !prev)}
        />

        {/* Menu Items */}
        {sidebarItems
          .filter((item) => item.roles.includes(userRole))
          .map((item, index) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `new-chat ${isActive ? "active" : ""}`
                }
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                {item.icon === "plus" ? (
                  <img src={assets.plus_icon} alt="plus" />
                ) : (
                  <Icon className="text-xl" />
                )}

                {extended && <p>{item.label}</p>}
              </NavLink>
            );
          })}

      </div>

      {/* ---------- BOTTOM ---------- */}
      <div className="sidebar-bottom p-4 flex flex-col items-stretch gap-4 border-t border-white/5">
        {userRole === "user" && (
          <NavLink
            to="/upgrade"
            className={({ isActive }) =>
              `upgrade-btn flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-widest border border-cyan-500/20 hover:bg-cyan-500/10 ${isActive ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' : 'text-dim hover:text-cyan-400'}`
            }
          >
            <div className="w-5 h-5 flex items-center justify-center">
              👤
            </div>
            {extended && <span>Upgrade Account</span>}
          </NavLink>
        )}
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
