import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* =========================
   MONGO CONNECT
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) =>
    console.log("Mongo error:", err),
  );

/* =========================
   LEAD MODEL
========================= */

const leadSchema = new mongoose.Schema({
  name: String,

  email: String,

  phone: String,

  message: String,

  service: String,

  status: {
    type: String,
    default: "new",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.model("Lead", leadSchema);

/* =========================
   CREATE LEAD
========================= */

app.post("/api/lead", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      message,
      service,
    } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        error: "Phone is required",
      });
    }

    const lead = new Lead({
      name,

      email,

      phone,

      message,

      service,
    });

    await lead.save();

    res.json({
      success: true,

      data: lead,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      success: false,

      error: "Server error",
    });
  }
});

/* =========================
   GET ALL LEADS
========================= */

app.get("/api/lead", async (req, res) => {
  try {
    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,

      data: leads,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: "Server error",
    });
  }
});

/* =========================
   UPDATE LEAD STATUS
========================= */

app.patch("/api/lead/:id", async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    res.json({
      success: true,

      data: lead,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: "Update failed",
    });
  }
});

/* =========================
   DELETE LEAD
========================= */

app.delete("/api/lead/:id", async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
    });
  } catch (err) {
    res.status(500).json({
      success: false,

      error: "Delete failed",
    });
  }
});

/* =========================
   REVIEWS
   DEMO NOW
   GOOGLE API LATER
========================= */

app.get("/api/reviews", async (req, res) => {
  const reviews = [
    {
      author_name: "Michael Johnson",

      rating: 5,

      text: "Excellent tree removal service! The team arrived on time, worked professionally, and left everything spotless.",

      relative_time_description: "2 weeks ago",
    },

    {
      author_name: "Sarah Williams",

      rating: 5,

      text: "Very satisfied with the quality of work. Communication was great throughout the entire process.",

      relative_time_description: "1 month ago",
    },

    {
      author_name: "David Brown",

      rating: 4,

      text: "Good experience overall. The project was completed on schedule and met my expectations.",

      relative_time_description: "2 months ago",
    },

    {
      author_name: "Jessica Miller",

      rating: 5,

      text: "Outstanding customer service and attention to detail.",

      relative_time_description: "3 months ago",
    },
  ];

  res.json({
    success: true,

    source: "demo",

    rating: 4.9,

    reviews,
  });
});

/* =========================
   HEALTH CHECK
========================= */

app.get("/", (req, res) => {
  res.json({
    status: "OK",

    message: "Tree service backend is running",
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
