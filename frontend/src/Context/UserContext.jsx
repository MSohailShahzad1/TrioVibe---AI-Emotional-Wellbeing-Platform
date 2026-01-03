


import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import UserIcon from "../assets/user_icon.png";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Enhanced user data fetch with error handling
  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:5000/api/user/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const data = await res.json();
        
        const formattedUser = {
          _id: data.user._id,
          name: data.user.name || data.user.username || "",
          email: data.user.email || "",
          username: data.user.username || "",
          role: data.user.role || "user", // Store user role
          joined: data.user.createdAt || new Date().toISOString(),
          bio: data.user.bio || data.user.profile?.bio || "Passionate about emotional AI and frontend development.",
          image: data.user.avatar || data.user.profile?.avatar || UserIcon,
          // Include additional profile data for chat features
          profile: {
            fullName: data.user.profile?.fullName || data.user.name || "",
            avatar: data.user.profile?.avatar || data.user.avatar || UserIcon,
            bio: data.user.profile?.bio || data.user.bio || "Passionate about emotional AI and frontend development.",
            isOnline: data.user.profile?.isOnline || false,
            lastSeen: data.user.profile?.lastSeen || new Date().toISOString(),
            interests: data.user.profile?.interests || [],
          },
          therapyPreferences: data.user.therapyPreferences || {},
          privacySettings: data.user.privacySettings || {},
        };

        setUser(formattedUser);
        localStorage.setItem("userProfile", JSON.stringify(formattedUser));
        localStorage.setItem("userRole", formattedUser.role); // Store role separately for easy access
        setIsAuthenticated(true);
        
        // Update online status via socket if available
        updateOnlineStatus(true);
        
      } else {
        // Token is invalid or expired
        if (res.status === 401) {
          toast.error("Session expired. Please login again.", { theme: "colored" });
        }
        handleLogout();
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      toast.error("❌ Failed to fetch user data", { theme: "colored" });
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update user online status (for real-time features)
  const updateOnlineStatus = async (isOnline) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await fetch("http://localhost:5000/api/user/online-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isOnline }),
      });
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  // ✅ Load user from localStorage and validate with backend
  useEffect(() => {
    const initializeUser = async () => {
      const storedUser = localStorage.getItem("userProfile");
      const storedToken = localStorage.getItem("token");
      const storedRole = localStorage.getItem("userRole");

      if (storedUser && storedToken) {
        // Set initial state from localStorage for immediate UI update
        const parsedUser = JSON.parse(storedUser);
        // Ensure role is set from localStorage if not in userProfile
        if (!parsedUser.role && storedRole) {
          parsedUser.role = storedRole;
        }
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Then fetch fresh data from backend
        await fetchUserData();
      } else {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // ✅ Enhanced login helper
  const login = async (userData, token) => {
    try {
      localStorage.setItem("token", token);

      const formattedUser = {
        _id: userData._id,
        name: userData.name || userData.username || "",
        email: userData.email || "",
        username: userData.username || "",
        role: userData.role ?? "user", // Store user role (will be updated by fetchUserData if not present)
        joined: userData.createdAt || new Date().toISOString(),
        bio: userData.bio || userData.profile?.bio || "Passionate about emotional AI and frontend development.",
        image: userData.avatar || userData.profile?.avatar || UserIcon,
        profile: {
          fullName: userData.profile?.fullName || userData.name || "",
          avatar: userData.profile?.avatar || userData.avatar || UserIcon,
          bio: userData.profile?.bio || userData.bio || "Passionate about emotional AI and frontend development.",
          isOnline: true, // User is online when they login
          lastSeen: new Date().toISOString(),
          interests: userData.profile?.interests || [],
        },
        therapyPreferences: userData.therapyPreferences || {},
        privacySettings: userData.privacySettings || {},
      };

      localStorage.setItem("userProfile", JSON.stringify(formattedUser));
      if (!userData.role) {
  console.warn("⚠️ Role missing from login response");
}

      if (formattedUser.role) {
        localStorage.setItem("userRole", formattedUser.role);
      }
      setUser(formattedUser);
      setIsAuthenticated(true);

      // Update online status
      await updateOnlineStatus(true);

      toast.success("✅ Login successful!", { theme: "colored" });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("❌ Login failed", { theme: "colored" });
    }
  };

  // ✅ Enhanced logout helper
  const logout = async () => {
    try {
      // Update online status before logging out
      await updateOnlineStatus(false);
    } catch (error) {
      console.error("Error updating offline status:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("userRole");
      setUser(null);
      setIsAuthenticated(false);
      toast.success("✅ Logged out successfully", { theme: "colored" });
    }
  };

  // ✅ Helper for clean logout without toast
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("userRole");
    setUser(null);
    setIsAuthenticated(false);
  };

  // ✅ Update user profile (for when user edits their profile)
  const updateUserProfile = (updatedData) => {
    const updatedUser = {
      ...user,
      ...updatedData,
      profile: {
        ...user?.profile,
        ...updatedData.profile
      }
    };
    
    // Update role in localStorage if it changed
    if (updatedData.role) {
      localStorage.setItem("userRole", updatedData.role);
    }
    
    setUser(updatedUser);
    localStorage.setItem("userProfile", JSON.stringify(updatedUser));
  };

  // ✅ Refresh user data (manual trigger)
  const refreshUserData = async () => {
    setLoading(true);
    await fetchUserData();
    setLoading(false);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        fetchUserData,
        updateUserProfile,
        refreshUserData,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

