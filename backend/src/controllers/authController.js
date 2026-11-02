const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Volunteer = require('../models/Volunteer');

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_disaster_management_2026_secure',
    { expiresIn: '7d' }
  );
};

// @desc Register user
// @route POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, address, coordinates, skills, bloodGroup } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const userRole = role && ['citizen', 'volunteer', 'administrator'].includes(role) ? role : 'citizen';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: userRole,
      phone: phone || '',
      address: address || '',
      location: {
        coordinates: coordinates && coordinates.length === 2 ? coordinates : [77.2090, 28.6139],
        address: address || ''
      }
    });

    // If registered as volunteer, create volunteer record
    if (userRole === 'volunteer') {
      await Volunteer.create({
        user: user._id,
        skills: Array.isArray(skills) && skills.length > 0 ? skills : ['First Aid', 'Emergency Evacuation'],
        bloodGroup: bloodGroup || 'O+',
        contactNumber: phone || '',
        address: address || '',
        location: {
          coordinates: coordinates && coordinates.length === 2 ? coordinates : [77.2090, 28.6139],
          address: address || ''
        }
      });
    }

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Login user
// @route POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password credentials.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.'
      });
    }

    const token = signToken(user._id);

    // If volunteer, get volunteer profile info
    let volunteerProfile = null;
    if (user.role === 'volunteer') {
      volunteerProfile = await Volunteer.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        avatar: user.avatar,
        volunteerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get current logged in user
// @route GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    let volunteerProfile = null;

    if (user.role === 'volunteer') {
      volunteerProfile = await Volunteer.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        avatar: user.avatar,
        volunteerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user profile
// @route PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address, coordinates, avatar, skills, bloodGroup, availabilityStatus } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    if (avatar !== undefined) user.avatar = avatar;
    if (coordinates && coordinates.length === 2) {
      user.location.coordinates = coordinates;
      user.location.address = address || user.location.address;
    }

    await user.save();

    let volunteerProfile = null;
    if (user.role === 'volunteer') {
      volunteerProfile = await Volunteer.findOne({ user: user._id });
      if (volunteerProfile) {
        if (skills) volunteerProfile.skills = skills;
        if (bloodGroup) volunteerProfile.bloodGroup = bloodGroup;
        if (availabilityStatus) volunteerProfile.availabilityStatus = availabilityStatus;
        if (phone) volunteerProfile.contactNumber = phone;
        if (address) volunteerProfile.address = address;
        if (coordinates && coordinates.length === 2) {
          volunteerProfile.location.coordinates = coordinates;
          volunteerProfile.location.address = address || volunteerProfile.location.address;
        }
        await volunteerProfile.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        location: user.location,
        avatar: user.avatar,
        volunteerProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all users (Admin only)
// @route GET /api/auth/users
exports.getAllUsers = async (req, res, next) => {
  try {
    const { role, search, status } = req.query;
    let query = {};

    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc Update user status / role (Admin only)
// @route PATCH /api/auth/users/:id
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { status, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (status) user.status = status;
    if (role && ['citizen', 'volunteer', 'administrator'].includes(role)) {
      user.role = role;
      if (role === 'volunteer') {
        const existingVol = await Volunteer.findOne({ user: user._id });
        if (!existingVol) {
          await Volunteer.create({
            user: user._id,
            contactNumber: user.phone || '',
            address: user.address || ''
          });
        }
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    next(error);
  }
};
