const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("passport");
const session = require("express-session");
const fileRoutes = require('./routes/fileRoutes');
const jobRoutes = require("./routes/jobRoutes");
const proposalRoutes = require("./routes/proposalRoutes");
const taskRoutes = require('./routes/taskRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');
const http = require('http');
const cvParseRoutes = require('./routes/cvParseRoutes');
const { parseCV } = require("./services/cvParserService");
const axios = require('axios'); // <-- Make sure to import axios!
const cvRouter = require('./routes/cv');
const profileRoutes = require("./routes/profileRoutes");
// Load .env file
dotenv.config({ path: "./.env" });
require("./middlewares/passport");

// Debug logs
console.log('OpenAI API Key exists:', !!process.env.OPENAI_API_KEY);
console.log('EDEN_AI_API_KEY exists:', !!process.env.EDEN_AI_API_KEY);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET);

// Initialize express app
const app = express();
const server = http.createServer(app); // Create HTTP server

// Initialize Socket.IO
const io = require('socket.io')(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// CORS & Body Parser
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------
// KHALTI SANDBOX INTEGRATION (KPG‑2)
// -------------------------
const KHALTI_BASE_URL = 'https://dev.khalti.com/api/v2';  // Sandbox endpoint
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '48466893ef8d46d6ae0b7ccb7ff0d23d';

// (A) INITIATE PAYMENT
app.post('/api/khalti/initiate-payment', async (req, res) => {
  try {
    const {
      amount,             // in paisa, e.g. 1000 = Rs 10
      purchaseOrderId,    // unique order ID
      purchaseOrderName,  // e.g. "My Test Order"
    } = req.body;

    // Prepare the payload for Khalti
    const payload = {
      return_url: 'http://localhost:3000/payment/success', // Where user is redirected after payment
      website_url: 'http://localhost:3000',                // Your site URL
      amount,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
    };

    // Make POST request to Khalti sandbox
    const response = await axios.post(`${KHALTI_BASE_URL}/epayment/initiate/`, payload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    // Khalti returns pidx & payment_url
    // e.g. { pidx: "...", payment_url: "https://test-pay.khalti.com/?pidx=...", ... }
    res.json(response.data);
  } catch (error) {
    console.error('Error initiating payment:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: 'Could not initiate payment',
      error: error.response?.data || error.message,
    });
  }
});

// (B) LOOKUP PAYMENT (optional)
app.post('/api/khalti/lookup-payment', async (req, res) => {
  try {
    const { pidx } = req.body; // Payment ID from the initiate response or callback
    const response = await axios.post(`${KHALTI_BASE_URL}/epayment/lookup/`, { pidx }, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    // Returns status, transaction_id, etc.
    res.json(response.data);
  } catch (error) {
    console.error('Error looking up payment:', error.response?.data || error.message);
    res.status(400).json({
      success: false,
      message: 'Could not lookup payment status',
      error: error.response?.data || error.message,
    });
  }
});

// -------------------------
// SOCKET.IO EVENTS
// -------------------------
io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('join_chat', (proposalId) => {
    socket.join(proposalId);
    console.log(`User joined chat: ${proposalId}`);
  });

  socket.on('send_message', async (messageData) => {
    try {
      const { proposalId, jobId, senderId, receiverId, content } = messageData;
      console.log('Received message data:', messageData);

      const newMessage = new Message({
        proposalId,
        jobId,
        senderId,
        receiverId,
        content
      });

      const savedMessage = await newMessage.save();
      console.log('Saved message:', savedMessage);
      io.to(proposalId).emit('receive_message', savedMessage);
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.proposalId).emit('user_typing', {
      userId: data.userId,
      userName: data.userName
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// -------------------------
// SESSION & PASSPORT
// -------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

// -------------------------
// MONGODB CONNECTION
// -------------------------
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });

// -------------------------
// OTHER ROUTES
// -------------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
app.use("/api", jobRoutes);
app.use("/api/proposals", proposalRoutes);
app.use('/api', fileRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/messages', messageRoutes);

app.use('/api/cv', cvRouter);
app.use("/api/profile", profileRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// -------------------------
// START SERVER
// -------------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
