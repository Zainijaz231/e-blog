import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../model/user.model.js';
import nodemailer from 'nodemailer';
import { verifyEmail } from '../services/VerifiyEmail.js';

const register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    console.log(req.body);

    if (!name || !username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      username,
      email,
      password: hashedPassword,
      verified: false,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    await verifyEmail(email, token);

    res.cookie('token', token, { httpOnly: true, secure:true, sameSite: 'none'  });


    res.status(201).json({ message: "Registration successful! Please check your email to verify your account." });

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Backend - verifiedEmail function (tumhara already sahi hai)
const verifiedEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification link"
      });
    }

    if (user.verified) {
      // ✅ Already verified to bhi success return karo
      return res.status(200).json({
        success: true,
        message: "Email already verified!"
      });
    }

    user.verified = true;
    await user.save();

    const loginToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("token", loginToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 3600000,
    });

    // ✅ Success response
    res.status(200).json({
      success: true,
      message: "Email verified successfully! Logged in ✅",
      token: loginToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired verification link"
    });
  }
};

const login = async (req, res) => {
  try {
    const { password, email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.verified) {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      await verifyEmail(user.email, token);
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true, // false for dev
      sameSite: "none",
      maxAge: 3600000,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    });

  } catch (error) {

    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });

  }
}

const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }

}

const getUser = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?._id
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ user, token });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const requestReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Create short-lived token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Email_USER,
        pass: process.env.Email_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Support" <${process.env.Email_USER}>`,
      to: user.email,
      subject: "Password Reset",
      html: `
        <p>Click below to reset your password (valid for 15 minutes):</p>
        <a href="${resetLink}">${resetLink}</a>
      `,
    });

    res.json({ success: true, message: "Reset link sent to your email" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};


const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({
      success: true,
      message: "Password reset successful! You can now login with your new password."
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(400).json({
      success: false,
      message: "Invalid or expired reset token"
    });
  }
};

const UpdateProfile = async (req, res) => {
  try {
    const { bio, name, username, } = req.body;
    const userId = req.user._id;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      bio,
      name,
      username,
      avatarUrl: req.file ? req.file.path : undefined,
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user: updatedUser });

  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

const FollowToggle = async (req, res) => {
  try {
    const { username } = req.params;
    const userId = req.user._id;

    // userToFollow = jis user ko follow/unfollow karna hai
    const userToFollow = await User.findOne({ username });
    if (!userToFollow) {
      return res.status(404).json({ message: "User not found" });
    }

    // apna user
    const currentUser = await User.findById(userId);

    const alreadyFollowing = userToFollow.followers.includes(userId);

    if (alreadyFollowing) {
      // 🔹 Unfollow
      userToFollow.followers.pull(userId);
      currentUser.following.pull(userToFollow._id);

      await userToFollow.save();
      await currentUser.save();

      return res.status(200).json({
        message: "User unfollowed",
        Isfollowing: false,
        followersCount: userToFollow.followers.length,
      });
    } else {
      // 🔹 Follow
      userToFollow.followers.push(userId);
      currentUser.following.push(userToFollow._id);

      await userToFollow.save();
      await currentUser.save();

      return res.status(200).json({
        message: "User followed",
        Isfollowing: true,
        followersCount: userToFollow.followers.length,
      });
    }
  } catch (error) {
    console.error("Error toggling follow:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const GetFollowers = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?._id;

    const user = await User.findOne({ username })
      .populate('followers', 'username name avatarUrl')
      .select('followers username name')

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isFollowing = user.followers.some(
      follower => follower._id.toString() === currentUserId?.toString()
    );

    res.status(200).json({
      username: user.username,
      followers: user.followers,
      followersCount: user.followers.length,
      isFollowing
    });

  } catch (error) {
    console.error("Error getting followers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


const GetFollowing = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username })
      .populate('following', 'username name avatarUrl')
      .select('following username name');

    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      username: user.username,
      following: user.following,
      followingCount: user.following.length,
    });
  } catch (error) {
    console.error("Error getting following:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


export { register, login, logout, getUser, requestReset, resetPassword, verifiedEmail, GetProfile, UpdateProfile, FollowToggle, GetFollowers, GetFollowing };