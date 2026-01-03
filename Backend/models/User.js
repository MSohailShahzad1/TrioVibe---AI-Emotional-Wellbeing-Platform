
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 30,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ["user", "therapist"],
    default: "user"
  },
  therapistProfile: {
    specialization: { type: String },
    experience: { type: Number }, // years of experience
    bio: { type: String },
  },
  rating: { type: Number, default: 0 },       // avg rating
  totalReviews: { type: Number, default: 0 }, // count

  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // reviewer
      userName: String,
      rating: Number,
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],

  therapistRequest: {
    type: String,
    enum: ["none", "pending", "approved", "rejected"],
    default: "none"
  },
  profile: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    avatar: {
      type: String,
      default: '👤'
    },
    interests: [{
      type: String,
      trim: true
    }],
    age: Number,
    location: String,
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    }
  },
  therapyPreferences: {
    goals: [String],
    preferredTopics: [String],
    supportType: {
      type: String,
      enum: ['peer-support', 'professional', 'both'],
      default: 'peer-support'
    }
  },
  privacySettings: {
    profileVisible: {
      type: Boolean,
      default: true
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    allowCalls: {
      type: Boolean,
      default: true
    },
    showOnlineStatus: {
      type: Boolean,
      default: true
    },
    showLastSeen: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Text index for search functionality
userSchema.index({
  'profile.fullName': 'text',
  name: 'text',
  email: 'text',
  'profile.bio': 'text',
  'profile.interests': 'text'
});

// Compound index for better performance
userSchema.index({
  'privacySettings.profileVisible': 1,
  'profile.fullName': 1
});

export default mongoose.model('User', userSchema);