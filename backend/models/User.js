const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    microsoftId: { type: String, required: true, unique: true },
    displayName: { type: String },
    email: { type: String },
    // Add any other fields you want to store
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

//uncomment below code for custom user collection
// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const userSchema = new mongoose.Schema({
//     name: { type: String, required: true },
//     email: { type: String, unique: true, required: true },
//     userId: { type: String, unique: true, required: true },
//     password: { type: String, required: true }
// });

// // Hash password before saving user
// userSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

// userSchema.methods.matchPassword = async function(enteredPassword) {
//     return await bcrypt.compare(enteredPassword, this.password);
// };

// const User = mongoose.model('User', userSchema);
// module.exports = User;
