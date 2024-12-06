const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbURI = 'mongodb://localhost:27017/timesheet'; 
        await mongoose.connect(dbURI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error('Error connecting to MongoDB:', err.message);
        process.exit(1); 
    }
};

module.exports = connectDB;
