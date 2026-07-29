require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');

async function seedAdmin() {
  await connectDB();

  const email = (process.env.ADMIN_EMAIL || 'admin@uregina.ca').toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin12345', 12);
  const admin = await User.create({
    fullName: process.env.ADMIN_FULL_NAME || 'CampusFind Admin',
    email,
    passwordHash,
    phone: process.env.ADMIN_PHONE || '306-585-4407',
    role: 'admin',
    photoIdUrl: null,
    status: 'active'
  });

  console.log('Admin created:');
  console.log({ id: admin._id.toString(), email, password: process.env.ADMIN_PASSWORD || 'Admin12345' });
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
