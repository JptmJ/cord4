import mongoose from '@/lib/mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['OPS', 'FINANCE'], required: true },
  name: { type: String, required: true },
}, { timestamps: true });

UserSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

UserSchema.methods.comparePassword = function (plain) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plain, this.password, (err, isMatch) => {
      if (err) return reject(err);
      resolve(isMatch);
    });
  });
};

export default mongoose.models.User || mongoose.model('User', UserSchema);
