const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const bcrypt = require('bcryptjs');

const userSchema = new Schema(
  {
    removed: {
      type: Boolean,
      default: false,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    userType: {
      type: String,
      enum: ['admin', 'user', 'guest'],
      default: 'user',
      required: true,
    },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    photo: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isLoggedIn: {
      type: Boolean,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

userSchema.virtual('accessibilityReviews', {
  ref: 'AccessibilityReview',
  localField: '_id',
  foreignField: 'userId',
});

// generating a hash
userSchema.methods.generateHash = function (password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(), null);
};

// checking if password is valid
userSchema.methods.validPassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
