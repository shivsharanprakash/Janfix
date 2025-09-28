// Run with: node scripts/seed-admin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../src/models/Admin');
const Department = require('../src/models/Department');
const RoutingRule = require('../src/models/RoutingRule');
const Worker = require('../src/models/Worker');

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to Mongo for seeding');

    const adminUser = 'admin';
    const adminPass = 'admin123'; // CHANGE in production

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(adminPass, salt);

    const existing = await Admin.findOne({ username: adminUser });
    if (!existing) {
      await Admin.create({ username: adminUser, passwordHash: hash, name: 'JanFix Admin' });
      console.log('Admin user created:', adminUser, adminPass);
    } else {
      console.log('Admin user already exists');
    }

    // Departments
    const roadDept = await Department.findOneAndUpdate(
      { name: 'Roads' },
      { name: 'Roads', contact: 'roads@municipal', slaHours: 72 },
      { upsert: true, new: true }
    );
    const sanitationDept = await Department.findOneAndUpdate(
      { name: 'Sanitation' },
      { name: 'Sanitation', contact: 'sanitation@municipal', slaHours: 48 },
      { upsert: true, new: true }
    );

    // Routing sample: pothole -> Roads in ward-1
    await RoutingRule.findOneAndUpdate(
      { category: 'pothole', wardId: 'ward-1' },
      { category: 'pothole', wardId: 'ward-1', departmentId: roadDept._id, priority: 1 },
      { upsert: true }
    );

    await RoutingRule.findOneAndUpdate(
      { category: 'garbage', wardId: 'ward-1' },
      { category: 'garbage', wardId: 'ward-1', departmentId: sanitationDept._id, priority: 1 },
      { upsert: true }
    );

    // Seed a default worker
    const workerUser = 'worker1';
    const workerPass = 'worker123';
    const wSalt = await bcrypt.genSalt(10);
    const wHash = await bcrypt.hash(workerPass, wSalt);
    const existingWorker = await Worker.findOne({ username: workerUser });
    if (!existingWorker) {
      await Worker.create({ username: workerUser, passwordHash: wHash, name: 'Worker One', departmentId: roadDept._id });
      console.log('Worker created:', workerUser, workerPass);
    } else {
      console.log('Worker already exists');
    }

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
