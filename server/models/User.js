const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['user', 'guardian', 'responder', 'admin'],
    default: 'user'
  },
  phone: {
    type: String,
    required: true
  },
  emergencyContacts: [{
    name: String,
    phone: String,
    relationship: String
  }],
  autoCall: {
    type: Boolean,
    default: false
  },
  autoMessage: {
    type: Boolean,
    default: false
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      console.log('Password hashed successfully for user:', this.email);
    } catch (error) {
      console.error('Error hashing password:', error);
    }
  }
  next();
});

// Generate auth token with better error handling and field consistency
userSchema.methods.generateAuthToken = async function() {
  try {
    // Use a consistent field name for user ID in JWT payload
    const secret = process.env.JWT_SECRET || 'fallback-secret-key';
    // Include both _id and id fields for maximum compatibility with auth middleware
    const token = jwt.sign({ 
      _id: this._id.toString(),
      id: this._id.toString()
    }, secret, { expiresIn: '7d' }); // Increase token lifetime to 7 days for better UX
    
    // Initialize tokens array if it doesn't exist
    if (!this.tokens) {
      this.tokens = [];
    }
    
    // Add token to user's tokens array
    this.tokens.push({ token });
    
    try {
      await this.save();
      console.log(`Token generated and saved for user: ${this.name}`);
    } catch (saveError) {
      console.error('Error saving token to user document:', saveError);
      // Return token anyway so user can still log in
    }
    
    return token;
  } catch (error) {
    console.error('Error generating auth token:', error);
    throw new Error('Could not generate authentication token');
  }
};

// Compare password method with improved error handling
userSchema.methods.comparePassword = async function(password) {
  try {
    const isMatch = await bcrypt.compare(password, this.password);
    console.log(`Password comparison for ${this.email}: ${isMatch ? 'match' : 'no match'}`);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  // Don't delete tokens as they're needed for authentication
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User; 