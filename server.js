const express = require('express');
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();
const Review = require('./models/Review');
const User = require('./models/User'); // Import User model

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3005; // Use environment variable for PORT

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((error) => console.error('MongoDB connection error:', error));
    // Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use another service if you like
  auth: {
    user: process.env.EMAIL_USER || 'navizit27@gmail.com', // Use environment variables for email
    pass: process.env.EMAIL_PASSWORD || 'bhdi qsla ukfr mexx', // Replace with your email password or app password
  },
});

let otpStore = {}; // Temporary storage for OTPs

// Endpoint to fetch reviews


// Endpoint for user signup
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
  otpStore[email] = otp; // Store OTP temporarily

  const mailOptions = {
    from: process.env.EMAIL_USER || 'navizit27@gmail.com',
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send("OTP sent to your email.");
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).send("Error sending OTP");
  }
});

// Endpoint for verifying OTP and signing up user
app.post("/api/verify-otp", (req, res) => {
  const { email, otp, username, password } = req.body;

  if (otpStore[email] === otp) {
    db.query(
      "INSERT INTO user (username, email, password) VALUES (?, ?, ?)",
      [username, email, password],
      (error) => {
        if (error) {
          console.log("Error signing up user:", error);
          return res.status(500).send("Error signing up user");
        }
        delete otpStore[email]; // Clear the OTP
        res.status(201).send("User signed up successfully");
      }
    );
  } else {
    res.status(400).send("Invalid OTP");
  }
});

// Endpoint for user login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query(
    "SELECT * FROM user WHERE email = ? AND password = ?",
    [email, password],
    (error, results) => {
      if (error) {
        console.log("Error logging in user:", error);
        return res.status(500).send("Error logging in user");
      }
      if (results.length > 0) {
        res.status(200).json({ user: results[0] });
      } else {
        res.status(400).send("Invalid email or password");
      }
    }
  );
});


// Fetch reviews by location and populate user data
app.get('/test/reviews/:location', async (req, res) => {
    const { location } = req.params; // Get the location from the request params
    try {
        const reviews = await Review.find({ touristLocation: location })
            .populate('user', 'username') // Populate the username field from User
            .exec();
        res.status(200).json(reviews); // Send the retrieved reviews as JSON
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving reviews', error });
    }
});

// Handle review submission
app.post('/test/reviews', async (req, res) => {
    const { rating, comment, touristLocation, user,initial } = req.body;

    // Check if all fields are present
    if (!rating || !comment || !touristLocation || !user) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Create a new review object
        const newReview = new Review({
            rating,
            comment,
            touristLocation,
            user,
            initial // Associate the review with the user
        });

        // Save the review to the database
        await newReview.save();

        // Respond with the saved review
        res.status(201).json(newReview);
    } catch (error) {
        res.status(500).json({ message: 'Error saving review', error });
    }
});

// Define a simple error handler for undefined routes
app.use((req, res, next) => {
    res.status(404).send('404 Not Found');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
