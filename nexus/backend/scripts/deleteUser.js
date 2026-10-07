require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Session = require('../models/Session');
const OtpVerification = require('../models/OtpVerification');

const TARGET = process.argv[2];

(async () => {
  if (!TARGET) {
    console.error('Usage: node scripts/deleteUser.js <email-or-username>');
    process.exit(1);
  }
  await mongoose.connect(process.env.DATABASE_URL);

  const user = await User.findOne({
    $or: [{ email: TARGET.toLowerCase() }, { username: TARGET.toLowerCase() }],
  });

  if (!user) {
    console.log('No user found for:', TARGET);
    await mongoose.disconnect();
    return;
  }

  await Session.deleteMany({ userId: user._id });
  await OtpVerification.deleteMany({ email: user.email });
  await User.deleteOne({ _id: user._id });

  console.log(`✅ Deleted user ${user.email} (${user.username}) + sessions + OTPs`);
  await mongoose.disconnect();
})();