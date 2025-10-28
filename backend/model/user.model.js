import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    bio: {
        type: String,
        default: '',
    },
    avatarUrl: {
        type: String,
        default: '',
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    verified: {
        type: Boolean,
        default: false,
    },

}, { timestamps: true });

userSchema.virtual('followersCount').get(function () {
    return this.followers ? this.followers.length : 0;
});

userSchema.virtual('followingCount').get(function () {
    return this.following ? this.following.length : 0;
});
userSchema.set('toJSON', { virtuals: true });
export const User = mongoose.model('User', userSchema);