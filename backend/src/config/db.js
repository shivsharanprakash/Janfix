const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Use Atlas connection string if MONGO_URI is not set
    const uri = process.env.MONGO_URI || 'mongodb+srv://PrakashShivsharan:Sharan%401383@cluster0.9qulqdc.mongodb.net/janfix?retryWrites=true&w=majority';
    
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
