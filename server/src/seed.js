import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import { User } from './models/user.model.js';
import { Issue } from './models/issue.model.js';
import { Comment } from './models/comment.model.js';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    console.log('Clearing existing test data...');
    await Promise.all([
      User.deleteMany({}),
      Issue.deleteMany({}),
      Comment.deleteMany({})
    ]);

    console.log('Creating sample user accounts...');
    
    // Create Student Account
    const student = new User({
      name: 'Alex Student',
      email: 'student@campus.edu',
      password: 'password123',
      role: 'student',
      hostelBlock: 'Block A, Room 204'
    });
    await student.save();

    // Create Staff Account
    const staff = new User({
      name: 'Sarah Maintenance',
      email: 'staff@campus.edu',
      password: 'password123',
      role: 'staff',
      hostelBlock: 'Facility Ops'
    });
    await staff.save();

    // Create Admin Account
    const admin = new User({
      name: 'Chief Admin',
      email: 'admin@campus.edu',
      password: 'password123',
      role: 'admin',
      hostelBlock: 'Main Office'
    });
    await admin.save();

    console.log('Creating sample campus issues...');

    const issue1 = new Issue({
      title: 'Wi-Fi Router Disconnected in Room 204',
      description: 'The Wi-Fi access point in Block A 2nd floor has been offline since morning. No signal detected.',
      category: 'wifi',
      location: 'Hostel Block A, Floor 2',
      priority: 'high',
      status: 'open',
      reportedBy: student._id,
      upvotes: [staff._id]
    });
    await issue1.save();

    const issue2 = new Issue({
      title: 'Water Leakage in Main Washroom',
      description: 'Pipe leaking under the sink in the 2nd floor west washroom creating floor puddles.',
      category: 'water',
      location: 'Hostel Block B, West Wing',
      priority: 'high',
      status: 'in_progress',
      reportedBy: student._id,
      assignedTo: staff._id,
      upvotes: [student._id, admin._id]
    });
    await issue2.save();

    const issue3 = new Issue({
      title: 'Broken Desk in Library Study Hall',
      description: 'Desk #12 has a broken leg and wobbles when writing.',
      category: 'furniture',
      location: 'Central Library, 1st Floor',
      priority: 'low',
      status: 'resolved',
      reportedBy: student._id,
      assignedTo: staff._id,
      resolutionNote: 'Maintenance team replaced the desk leg and secured bolts.',
      resolvedAt: new Date()
    });
    await issue3.save();

    const issue4 = new Issue({
      title: 'Flickering Light Near Mess Entrance',
      description: 'The overhead tube light outside the main dining hall blinks continuously at night.',
      category: 'electricity',
      location: 'Campus Mess Hall Pathway',
      priority: 'medium',
      status: 'open',
      reportedBy: student._id
    });
    await issue4.save();

    console.log('Creating sample comments...');

    const comment1 = new Comment({
      issue: issue1._id,
      author: staff._id,
      text: 'IT department has logged a router reboot request. Will check by 4 PM.'
    });
    await comment1.save();

    const comment2 = new Comment({
      issue: issue2._id,
      author: student._id,
      text: 'Plumber visited and turned off the main valve. Awaiting replacement pipe.'
    });
    await comment2.save();

    console.log('\n==================================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('\n🔑 SAMPLE TEST CREDENTIALS:');
    console.log('--------------------------------------------------');
    console.log('1. STUDENT ACCOUNT (Report & Upvote Issues):');
    console.log('   Email:    student@campus.edu');
    console.log('   Password: password123');
    console.log('   Role:     Student');
    console.log('--------------------------------------------------');
    console.log('2. STAFF ACCOUNT (Manage Status & Moderation):');
    console.log('   Email:    staff@campus.edu');
    console.log('   Password: password123');
    console.log('   Role:     Staff');
    console.log('--------------------------------------------------');
    console.log('3. ADMIN ACCOUNT (Full Control & Dashboard):');
    console.log('   Email:    admin@campus.edu');
    console.log('   Password: password123');
    console.log('   Role:     Admin');
    console.log('==================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
