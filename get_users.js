const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, 'backend', '.env') });

const User = require('./backend/models/User');

const dumpUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const users = await User.find().select('name email role isActive');
    console.log('TOTAL_USERS:', users.length);
    console.log(JSON.stringify(users, null, 2));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

dumpUsers();
