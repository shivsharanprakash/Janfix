// backend/scripts/seedDepartments.js
const mongoose = require('mongoose');
const Department = require('../src/models/Department'); // correct path to model under src

const MONGO_URI = 'mongodb://127.0.0.1:27017/janfix'; // change DB name if needed

async function seed() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const departments = [
      { code: 'P101', name: 'Potholes/Road' },
      { code: 'SV202', name: 'Sewage' },
      { code: 'S303', name: 'Street' },
      { code: 'G404', name: 'Garbage/Sanitation' },
      { code: 'W505', name: 'Water' }
    ];

    for (let dept of departments) {
      await Department.updateOne({ code: dept.code }, dept, { upsert: true });
    }

    console.log('✅ Departments seeded successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding departments:', err);
    process.exit(1);
  }
}

seed();
