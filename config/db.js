const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI,{});
           console.log("MongoDB connected");
        } catch (err) {
            console.log("Error connecting to MongoDB", err);
            process.exit(1); // Exit process with failure
        }
        };

module.exports = connectDB;
// This code connects to a MongoDB database using Mongoose. It exports the connectDB function, which attempts to connect to the database using the URI stored in the environment variable MONGO_URI. If the connection is successful, it logs "MongoDB connected" to the console; if it fails, it logs an error message and exits the process with a failure status.