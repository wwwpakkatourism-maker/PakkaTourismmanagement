/**
 * Database Seed Script — Creates default Admin + Demo Employee
 * Run:  node seed.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const ADMIN = {
  name: 'Bharath Admin',
  email: 'admin@pakkatourism.com',
  password: 'admin123',
  role: 'admin',
  department: 'Management',
  phone: '9876543210',
  isActive: true,
};

const EMPLOYEES = [
  {
    name: 'Priya Sharma',
    email: 'EMP-001',
    password: 'employee123',
    role: 'employee',
    department: 'Sales',
    phone: '9876543001',
    destination: 'Manali, HP',
    faceRegistered: true,
    isActive: true,
    officeLocation: { name: 'Manali Main Office', lat: 32.2396, lng: 77.1887, radius: 500 },
  },
  {
    name: 'Rahul Mehta',
    email: 'EMP-002',
    password: 'employee123',
    role: 'employee',
    department: 'Sales',
    phone: '9876543002',
    destination: 'Shimla, HP',
    faceRegistered: true,
    isActive: true,
    officeLocation: { name: 'Manali Main Office', lat: 32.2396, lng: 77.1887, radius: 500 },
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑  Cleared existing users');

    // Create admin
    const admin = await User.create(ADMIN);
    console.log(`👑 Admin created:  ${admin.email}  /  admin123`);

    // Create employees
    for (const emp of EMPLOYEES) {
      const e = await User.create(emp);
      console.log(`👤 Employee created: ${e.email}  /  employee123`);
    }

    console.log('\n🎉 Seed complete! You can now login with:');
    console.log('   Admin:    admin@pakkatourism.com / admin123');
    console.log('   Employee: EMP-001 / employee123');
    console.log('   Employee: EMP-002 / employee123\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
