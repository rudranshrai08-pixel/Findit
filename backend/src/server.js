import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const app = express();
const port = process.env.PORT || 5000;
const scrypt = promisify(scryptCallback);
const sevenDays = 7 * 24 * 60 * 60 * 1000;
const twentyMinutes = 20 * 60 * 1000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '8mb' }));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  college: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  collegeId: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true },
  passwordSalt: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  savedListingIds: { type: [String], default: [] },
  resetTokenHash: String,
  resetTokenExpires: Date,
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

const listingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ownerName: { type: String, required: true },
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  title: { type: String, required: true, trim: true, maxlength: 80 },
  category: { type: String, required: true },
  place: { type: String, required: true, trim: true, maxlength: 120 },
  details: { type: String, required: true, maxlength: 500 },
  emoji: { type: String, default: '📦' },
  color: { type: String, default: 'blue' },
  photo: { type: String, default: '' },
  status: { type: String, enum: ['active', 'hidden'], default: 'active' },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
const Listing = mongoose.model('Listing', listingSchema);

function hashToken(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function makePasswordHash(password, salt = randomBytes(16).toString('hex')) {
  const result = await scrypt(password, salt, 64);
  return { salt, hash: result.toString('hex') };
}

async function passwordMatches(password, salt, savedHash) {
  const result = await scrypt(password, salt, 64);
  const saved = Buffer.from(savedHash, 'hex');
  return saved.length === result.length && timingSafeEqual(saved, result);
}

function getCookie(req, name) {
  const cookies = (req.headers.cookie || '').split(';');
  const found = cookies.find((cookie) => cookie.trim().startsWith(`${name}=`));
  return found ? found.trim().slice(name.length + 1) : '';
}

function setSessionCookie(res, token) {
  const secure = process.env.NODE_ENV === 'production' ? ' Secure;' : '';
  res.setHeader('Set-Cookie', `findit_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${sevenDays / 1000};${secure}`);
}

function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'findit_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
}

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    college: user.college,
    collegeId: user.collegeId,
    role: user.role || 'student',
    joinedAt: user.createdAt,
  };
}

function publicListing(listing) {
  const created = new Date(listing.createdAt);
  const minutes = Math.max(1, Math.floor((Date.now() - created.getTime()) / 60000));
  const age = minutes < 60 ? `${minutes} min ago` : minutes < 1440 ? `${Math.floor(minutes / 60)} hr ago` : `${Math.floor(minutes / 1440)} days ago`;
  const initials = listing.ownerName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return {
    id: String(listing._id), type: listing.type, title: listing.title,
    category: listing.category, place: listing.place, details: listing.details,
    emoji: listing.emoji, color: listing.color, photo: listing.photo,
    age, date: created.toLocaleDateString(), initials, reporterName: listing.ownerName,
    status: listing.status,
  };
}

async function signedInUser(req) {
  const token = getCookie(req, 'findit_session');
  if (!token) return null;
  const session = await Session.findOne({ tokenHash: hashToken(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return User.findById(session.userId);
}

function databaseRequired(res) {
  if (mongoose.connection.readyState === 1) return false;
  res.status(503).json({ message: 'FindIt cannot reach MongoDB. Check that MongoDB is running.' });
  return true;
}

async function requireUser(req, res) {
  if (databaseRequired(res)) return null;
  const user = await signedInUser(req);
  if (!user) {
    res.status(401).json({ message: 'Please sign in to continue.' });
    return null;
  }
  return user;
}

async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && user.email === adminEmail && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }
  if (user.role !== 'admin') {
    res.status(403).json({ message: 'Administrator access is required.' });
    return null;
  }
  return user;
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'FindIt API', database: mongoose.connection.readyState === 1 ? 'connected' : 'not connected' });
});

app.post('/api/auth/register', async (req, res) => {
  if (databaseRequired(res)) return;
  const { name, college, email, collegeId, password } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!name || !college || !collegeId || !/^\S+@\S+\.\S+$/.test(cleanEmail) || !password) {
    return res.status(400).json({ message: 'Enter your name, college, college ID, a valid email, and password.' });
  }
  if (String(password).length < 8) return res.status(400).json({ message: 'Use a password with at least 8 characters.' });
  if (await User.findOne({ email: cleanEmail })) {
    return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
  }
  const { salt, hash } = await makePasswordHash(String(password));
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  try {
    const user = await User.create({
      name: String(name).trim(), college: String(college).trim(), email: cleanEmail,
      collegeId: String(collegeId).trim(), passwordHash: hash, passwordSalt: salt,
      role: cleanEmail === adminEmail && adminEmail ? 'admin' : 'student',
    });
    return res.status(201).json({ message: 'Account created. Sign in with your new account.', user: publicUser(user) });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'An account with this email already exists. Sign in instead.' });
    throw error;
  }
});

app.post('/api/auth/login', async (req, res) => {
  if (databaseRequired(res)) return;
  const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const user = await User.findOne({ email: cleanEmail });
  if (!user) return res.status(404).json({ message: 'Account does not exist. Create an account first.' });
  if (!(await passwordMatches(password, user.passwordSalt, user.passwordHash))) {
    return res.status(401).json({ message: 'Incorrect password. Please try again.' });
  }
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (adminEmail && user.email === adminEmail && user.role !== 'admin') {
    user.role = 'admin';
    await user.save();
  }
  const token = randomBytes(32).toString('hex');
  await Session.create({ userId: user._id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + sevenDays) });
  setSessionCookie(res, token);
  return res.json({ message: 'Signed in.', user: publicUser(user) });
});

app.get('/api/auth/me', async (req, res) => {
  const user = await requireUser(req, res);
  if (user) return res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', async (req, res) => {
  const token = getCookie(req, 'findit_session');
  if (token && mongoose.connection.readyState === 1) await Session.deleteOne({ tokenHash: hashToken(token) });
  clearSessionCookie(res);
  return res.json({ message: 'Signed out.' });
});

app.patch('/api/auth/profile', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const { name, college, collegeId } = req.body || {};
  if (!name?.trim() || !college?.trim() || !collegeId?.trim()) {
    return res.status(400).json({ message: 'Name, college, and college ID are required.' });
  }
  user.name = name.trim();
  user.college = college.trim();
  user.collegeId = collegeId.trim();
  await user.save();
  return res.json({ message: 'Profile saved.', user: publicUser(user) });
});

app.patch('/api/auth/password', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const { currentPassword, newPassword } = req.body || {};
  if (!(await passwordMatches(String(currentPassword || ''), user.passwordSalt, user.passwordHash))) {
    return res.status(401).json({ message: 'Your current password is incorrect.' });
  }
  if (String(newPassword || '').length < 8) return res.status(400).json({ message: 'Use a new password with at least 8 characters.' });
  const { salt, hash } = await makePasswordHash(String(newPassword));
  user.passwordSalt = salt;
  user.passwordHash = hash;
  await user.save();
  return res.json({ message: 'Password changed successfully.' });
});

app.get('/api/auth/my-listings', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const listings = await Listing.find({ userId: user._id }).sort({ createdAt: -1 });
  return res.json({ listings: listings.map(publicListing) });
});

app.get('/api/auth/saved', async (req, res) => {
  const user = await requireUser(req, res);
  if (user) return res.json({ listingIds: user.savedListingIds || [] });
});

app.put('/api/auth/saved', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const ids = Array.isArray(req.body?.listingIds) ? req.body.listingIds : [];
  user.savedListingIds = [...new Set(ids.map((id) => String(id)).filter(Boolean))].slice(0, 500);
  await user.save();
  return res.json({ listingIds: user.savedListingIds });
});
app.post('/api/auth/forgot-password', async (req, res) => {
  if (databaseRequired(res)) return;
  const cleanEmail = String(req.body?.email || '').trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });
  if (!user) return res.status(404).json({ message: 'No account exists with this email. Check the address or create an account.' });
  if (process.env.NODE_ENV === 'production') {
    return res.status(503).json({ message: 'Password reset email delivery has not been configured yet.' });
  }
  const token = randomBytes(32).toString('hex');
  user.resetTokenHash = hashToken(token);
  user.resetTokenExpires = new Date(Date.now() + twentyMinutes);
  await user.save();
  return res.json({ message: 'Your local reset link is ready. It works for 20 minutes on this computer.', resetToken: token, email: user.email });
});

app.post('/api/auth/reset-password', async (req, res) => {
  if (databaseRequired(res)) return;
  const { token, email, password } = req.body || {};
  if (!token || !email || String(password || '').length < 8) {
    return res.status(400).json({ message: 'Enter a valid reset link and a password with at least 8 characters.' });
  }
  const user = await User.findOne({
    email: String(email).trim().toLowerCase(), resetTokenHash: hashToken(String(token)),
    resetTokenExpires: { $gt: new Date() },
  });
  if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
  const { salt, hash } = await makePasswordHash(String(password));
  user.passwordSalt = salt;
  user.passwordHash = hash;
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
  await Session.deleteMany({ userId: user._id });
  return res.json({ message: 'Password updated. Sign in with your new password.' });
});

app.get('/api/listings', async (_req, res) => {
  if (databaseRequired(res)) return;
  const listings = await Listing.find({ status: 'active' }).sort({ createdAt: -1 });
  return res.json({ listings: listings.map(publicListing) });
});

app.get('/api/listings/:id/contact', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: 'This is a sample listing and has no student contact account.' });
  const listing = await Listing.findById(req.params.id);
  if (!listing || listing.status !== 'active') return res.status(404).json({ message: 'This listing is no longer available.' });
  if (String(listing.userId) === String(user._id)) return res.status(400).json({ message: 'This is your own listing.' });
  const poster = await User.findById(listing.userId);
  if (!poster) return res.status(404).json({ message: 'The poster account could not be found.' });
  return res.json({ name: poster.name, email: poster.email, title: listing.title });
});
app.post('/api/listings', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;
  const { type, title, category, place, details, emoji, color, photo } = req.body || {};
  if (!['Lost', 'Found'].includes(type) || !title?.trim() || !category || !place?.trim() || !details?.trim()) {
    return res.status(400).json({ message: 'Complete all required listing details.' });
  }
  if (photo && String(photo).length > 7 * 1024 * 1024) return res.status(400).json({ message: 'Choose a photo smaller than 5 MB.' });
  const listing = await Listing.create({
    userId: user._id, ownerName: user.name, type, title: title.trim(), category,
    place: place.trim(), details: details.trim(), emoji: emoji || '📦', color: color || 'blue', photo: photo || '',
  });
  return res.status(201).json({ listing: publicListing(listing) });
});

app.get('/api/admin/dashboard', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const [totalUsers, totalListings, activeListings, hiddenListings, users, listings] = await Promise.all([
    User.countDocuments(), Listing.countDocuments(), Listing.countDocuments({ status: 'active' }),
    Listing.countDocuments({ status: 'hidden' }), User.find().sort({ createdAt: -1 }).limit(100),
    Listing.find().sort({ createdAt: -1 }).limit(100),
  ]);
  return res.json({
    stats: { totalUsers, totalListings, activeListings, hiddenListings },
    users: users.map(publicUser),
    listings: listings.map(publicListing),
  });
});

app.patch('/api/admin/users/:id/role', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { role } = req.body || {};
  if (!['student', 'admin'].includes(role)) return res.status(400).json({ message: 'Choose a valid account role.' });
  if (String(admin._id) === req.params.id) return res.status(400).json({ message: 'You cannot change your own administrator role.' });
  const target = await User.findById(req.params.id);
  if (!target) return res.status(404).json({ message: 'Account not found.' });
  const adminEmail = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  if (target.email === adminEmail && role !== 'admin') return res.status(400).json({ message: 'The primary administrator cannot be removed.' });
  target.role = role;
  await target.save();
  return res.json({ user: publicUser(target) });
});

app.patch('/api/admin/listings/:id/status', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const { status } = req.body || {};
  if (!['active', 'hidden'].includes(status)) return res.status(400).json({ message: 'Choose active or hidden.' });
  const listing = await Listing.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  return res.json({ listing: publicListing(listing) });
});

app.delete('/api/admin/listings/:id', async (req, res) => {
  const admin = await requireAdmin(req, res);
  if (!admin) return;
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) return res.status(404).json({ message: 'Listing not found.' });
  return res.json({ message: 'Listing removed.' });
});

async function start() {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('MongoDB connection failed:', error.message);
    }
  } else {
    console.log('MONGODB_URI is not set; account and admin features require MongoDB.');
  }
  app.listen(port, '127.0.0.1', () => console.log(`FindIt API listening on http://localhost:${port}`));
}

start();



