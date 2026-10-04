import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    }
}, {
    timestamps: true
});

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase() });
};

// Static method to validate password
userSchema.statics.validatePassword = async function(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

// Custom create wrapper to ensure password hashing
userSchema.statics.create = async function(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new this({
        name: userData.name,
        email: userData.email,
        password: hashedPassword
    });
    return await user.save();
};

// Static method to get all users
userSchema.statics.getAll = function() {
    return this.find({});
};

const User = mongoose.model('User', userSchema);
export default User;
