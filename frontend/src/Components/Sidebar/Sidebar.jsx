

import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import { assets } from "../../assets/assets";
import { sidebarItems } from "./SidebarConfig";
import { useUser } from "../../Context/UserContext";
import ThemeToggle from "../common/ThemeToggle";

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
      <div className="sidebar-bottom p-2 flex flex-col items-center gap-4">
        <ThemeToggle />
      </div>
    </div>
  );
};

export default Sidebar;
