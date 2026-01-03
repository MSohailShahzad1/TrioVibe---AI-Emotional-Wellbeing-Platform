
import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs"
import { sendEmail } from "../lib/sendEmail.js";
import TempUser from "../models/TempUser.js";
import ResetOTP from "../models/ResetOtp.js";






// Direct signup without OTP verification
export const signup = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    email = email?.trim().toLowerCase();
    name = name?.trim();

    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.json({ success: false, message: "Invalid email format" });
    }

    // Check if user already exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ success: false, message: "Account already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username: name.replace(/\s+/g, "").toLowerCase(),
      name,
      email,
      password: hashed,
      profile: {
        fullName: name,
      }
    });

    await newUser.save();

    // Generate token for auto-login
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      userData: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("signup error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const signupRequest = async (req, res) => {
  try {
    let { name, email, password } = req.body;
    // email = email?.trim();
    email = email?.trim().toLowerCase();

    name = name?.trim();

    if (!email || !name || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return res.json({ success: false, message: "Invalid email format" });

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.json({
        success: false,
        message: "Password must include uppercase, lowercase, number, and special character",
      });
    }

    // Already registered?
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: "Account already exists" });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Save to TempUser (overwrite if exists)
    await TempUser.findOneAndUpdate(
      { email },
      { name, email, password: hashed, otp, otpExpires: new Date(Date.now() + 10 * 60 * 1000) }, // expires in 10 mins
      { upsert: true, new: true }
    );

    // Send OTP email
    await sendEmail(email, "Verify your account", `Your OTP is: ${otp}`);

    return res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("signupRequest error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};







export const verifySignupOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    console.log("📩 Incoming signup/verify-otp request:", { email, otp });

    const tempUser = await TempUser.findOne({ email });
    console.log("🔎 Found tempUser:", tempUser);

    if (!tempUser) {
      return res.status(404).json({ success: false, message: "No signup request found for this email" });
    }

    if (tempUser.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (tempUser.otpExpires < new Date()) {
      await TempUser.deleteOne({ email });
      return res.status(400).json({ success: false, message: "OTP expired, please sign up again" });
    }

    // ✅ Create permanent User
    const newUser = new User({
      username: tempUser.name.replace(/\s+/g, "").toLowerCase(), // generate username automatically
      name: tempUser.name,
      email: tempUser.email,
      password: tempUser.password,
      profile: {
        fullName: tempUser.name,
      },
    });

    await newUser.save();

    // Delete temp user record
    await TempUser.deleteOne({ email });

    return res.status(201).json({ success: true, message: "Signup verified successfully!" });
  } catch (err) {
    console.error("❌ verifySignupOtp error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};




export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const tempUser = await TempUser.findOne({ email });
    if (!tempUser) return res.json({ success: false, message: "No signup request found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    tempUser.otp = otp;
    tempUser.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await tempUser.save();

    await sendEmail(email, "Resend OTP", `Your new OTP is: ${otp}`);

    return res.json({ success: true, message: "OTP resent to email" });
  } catch (err) {
    console.error("resendOtp error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // const token = generateToken(user._id);
    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: "Logged in",
      token,
      userData: { _id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("login error:", err.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Forgot Password Request (Generate OTP)
export const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2️⃣ Remove old OTPs for this email
    await ResetOTP.deleteMany({ email });

    // 3️⃣ Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 4️⃣ Save new OTP
    const resetOtp = new ResetOTP({
      email,
      otp,
      createdAt: new Date(),
    });

    await resetOtp.save();

    // 5️⃣ Send OTP email
    await sendEmail(
      email,
      "Password Reset OTP",
      `Your OTP for resetting your password is: ${otp}. It will expire in 10 minutes.`
    );

    return res.json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    console.error("forgotPasswordRequest error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error, please try again later",
    });
  }
};


export const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = await ResetOTP.findOne({ email, otp });

    if (!record) {
      return res.json({ success: false, message: "Invalid or expired OTP" });
    }

    // ✅ mark OTP as verified instead of deleting
    record.verified = true;
    await record.save();

    return res.json({ success: true, message: "OTP verified successfully" });
  } catch (err) {
    console.error("verifyResetOtp error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};




export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const otpRecord = await ResetOTP.findOne({ email, verified: true });

    if (!otpRecord) {
      return res.json({ success: false, message: "No reset request found" });
    }

    // ✅ hash password and update
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);
    await User.findOneAndUpdate({ email }, { password: hashed });

    // ✅ delete OTP after successful reset
    await ResetOTP.deleteMany({ email });

    return res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    console.error("resetPassword error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



export const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
}

export const updateProfile = async (req, res) => {
  try {
    const { name, email, password, bio } = req.body;

    // Find user by ID from the authenticated request
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }


    if (bio) user.bio = bio;

    if (name) user.name = name;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        bio: user.bio,
        avatar: user.avatar // Include avatar if you have it
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // req.user is already populated by protectRoute middleware
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user error:", error.message);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// api for deleting product
export const removeAcc = async (req, res) => {
  await User.findOneAndDelete({ email: req.body.email });
  console.log("Removed");
  res.json({
    success: true,
    name: req.body.name
  })
}

//for chat
// controllers/userController.js



// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('username email profile therapyPreferences privacySettings createdAt')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't show online status if user has disabled it
    if (!user.privacySettings?.showOnlineStatus) {
      user.profile.isOnline = undefined;
      user.profile.lastSeen = undefined;
    }

    // Don't show email if not needed for public profile
    delete user.email;

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// // Get suggested users (for discover page)
// export const getSuggestedUsers = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     // Get users who are not the current user and have visible profiles
//     const suggestedUsers = await User.find({
//       _id: { $ne: userId },
//       'privacySettings.profileVisible': true
//     })
//     .select('name profile  avatar isOnline lastSeen email')
//     .limit(12)
//     .sort({ 
//       'profile.isOnline': -1, 
//       'createdAt': -1 
//     });

//     // Format response without email for privacy
//     const users = suggestedUsers.map(user => ({
//       _id: user._id,
//       name: user.name,
//       profile: {

//         avatar: user.profile.avatar,
//         bio: user.profile.bio,
//         interests: user.profile.interests,
//         isOnline: user.profile.isOnline,
//         lastSeen: user.profile.lastSeen
//       }
//     }));

//     res.json({
//       success: true,
//       users,
//       count: users.length
//     });

//   } catch (error) {
//     console.error('❌ Get suggested users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to fetch suggested users'
//     });
//   }
// };

// // Search users by name, username, or email
// export const searchUsers = async (req, res) => {
//   try {
//     const { query } = req.query;
//     const userId = req.user.id;

//     if (!query || query.trim().length < 2) {
//       return res.json({
//         success: true,
//         users: [],
//         message: 'Please enter at least 2 characters to search'
//       });
//     }

//     const searchQuery = query.trim().toLowerCase();

//     // Search using multiple fields with case-insensitive regex
//     const users = await User.find({
//       _id: { $ne: userId },
//       'privacySettings.profileVisible': true,
//       $or: [
//         { 'profile.fullName': { $regex: searchQuery, $options: 'i' } },
//         { name: { $regex: searchQuery, $options: 'i' } },
//         { email: { $regex: searchQuery, $options: 'i' } }
//       ]
//     })
//     .select('username profile fullName avatar isOnline lastSeen email')
//     .limit(20)
//     .sort({ 
//       'profile.isOnline': -1,
//       'profile.fullName': 1 
//     });

//     // Format response
//     const formattedUsers = users.map(user => ({
//       _id: user._id,
//       name: user.name,
//       profile: {

//         avatar: user.profile.avatar,
//         bio: user.profile.bio,
//         interests: user.profile.interests,
//         isOnline: user.profile.isOnline,
//         lastSeen: user.profile.lastSeen
//       }
//     }));

//     res.json({
//       success: true,
//       users: formattedUsers,
//       count: formattedUsers.length,
//       searchQuery: searchQuery
//     });

//   } catch (error) {
//     console.error('❌ Search users error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Search failed. Please try again.'
//     });
//   }
// };

// // Advanced search with filters
// export const advancedSearch = async (req, res) => {
//   try {
//     const { query, interests, supportType, isOnline } = req.query;
//     const userId = req.user.id;

//     let searchCriteria = {
//       _id: { $ne: userId },
//       'privacySettings.profileVisible': true
//     };

//     // Text search
//     if (query && query.length >= 2) {
//       searchCriteria.$or = [
//         { 'profile.fullName': { $regex: query, $options: 'i' } },
//         { name: { $regex: query, $options: 'i' } },
//         { email: { $regex: query, $options: 'i' } },
//         { 'profile.bio': { $regex: query, $options: 'i' } }
//       ];
//     }

//     // Interest filter
//     if (interests) {
//       const interestArray = Array.isArray(interests) ? interests : [interests];
//       searchCriteria['profile.interests'] = { 
//         $in: interestArray.map(interest => new RegExp(interest, 'i'))
//       };
//     }

//     // Support type filter
//     if (supportType) {
//       searchCriteria['therapyPreferences.supportType'] = supportType;
//     }

//     // Online status filter
//     if (isOnline !== undefined) {
//       searchCriteria['profile.isOnline'] = isOnline === 'true';
//     }

//     const users = await User.find(searchCriteria)
//       .select('username profile therapyPreferences')
//       .limit(25)
//       .sort({ 'profile.isOnline': -1, 'createdAt': -1 });

//     res.json({
//       success: true,
//       users: users.map(user => ({
//         _id: user._id,
//         username: user.username,
//         profile: user.profile,
//         therapyPreferences: user.therapyPreferences
//       })),
//       count: users.length
//     });

//   } catch (error) {
//     console.error('❌ Advanced search error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Advanced search failed'
//     });
//   }
// };

// ✅ Get suggested users (discover page)
export const getSuggestedUsers = async (req, res) => {
  try {
    const userId = req.user.id;


    const suggestedUsers = await User.find({ _id: { $ne: userId } })
      .select("username name email profile therapyPreferences")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users: suggestedUsers,
      count: suggestedUsers.length,
    });


  } catch (error) {
    console.error("❌ Get suggested users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch suggested users",
    });
  }
};

// ✅ Search users by name, username, or email
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user.id;


    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        users: [],
        message: "Please enter at least 2 characters to search",
      });
    }

    const searchQuery = query.trim();

    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { username: { $regex: searchQuery, $options: "i" } },
        { name: { $regex: searchQuery, $options: "i" } },
        { email: { $regex: searchQuery, $options: "i" } },
      ],
    })
      .select("username name email profile therapyPreferences")
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      count: users.length,
      searchQuery,
    });
    ````

  } catch (error) {
    console.error("❌ Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Search failed. Please try again.",
    });
  }
};

// ✅ Advanced search (filters + name/email/username)
export const advancedSearch = async (req, res) => {
  try {
    const { query, interests, supportType } = req.query;
    const userId = req.user.id;

    let searchCriteria = { _id: { $ne: userId } };

    // Text search on name/email/username
    if (query && query.length >= 2) {
      searchCriteria.$or = [
        { username: { $regex: query, $options: "i" } },
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ];
    }

    // Interest filter
    if (interests) {
      const interestArray = Array.isArray(interests) ? interests : [interests];
      searchCriteria["profile.interests"] = {
        $in: interestArray.map((i) => new RegExp(i, "i")),
      };
    }

    // Support type filter
    if (supportType) {
      searchCriteria["therapyPreferences.supportType"] = supportType;
    }

    const users = await User.find(searchCriteria)
      .select("username name email profile therapyPreferences")
      .limit(25)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users,
      count: users.length,
    }); `
```

  } catch (error) {
    console.error("❌ Advanced search error:", error);
    res.status(500).json({
      success: false,
      message: "Advanced search failed",
    });
  }
};


// Update user profile
export const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile, therapyPreferences, privacySettings } = req.body;

    const updateData = {};
    if (profile) updateData.profile = { ...req.user.profile, ...profile };
    if (therapyPreferences) updateData.therapyPreferences = therapyPreferences;
    if (privacySettings) updateData.privacySettings = privacySettings;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).select('username profile therapyPreferences privacySettings');

    res.json({
      success: true,
      user,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Update user online status
export const updateOnlineStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { isOnline } = req.body;

    const updateData = {
      'profile.isOnline': isOnline,
      'profile.lastSeen': new Date()
    };

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      {
        new: true,
        runValidators: true
      }
    ).select('username profile isOnline lastSeen');

    res.json({
      success: true,
      message: `User is now ${isOnline ? 'online' : 'offline'}`,
      user: {
        id: user._id,
        isOnline: user.profile.isOnline,
        lastSeen: user.profile.lastSeen
      }
    });

  } catch (error) {
    console.error('❌ Update online status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update online status'
    });
  }
};