import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import axios from "axios";

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
  .catch((err) => console.log("Mongo error:", err));

/* =========================
   LEAD MODEL (заявки)
========================= */
const leadSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
  service: String,
  status: {
    type: String,
    default: "new", // new / in_progress / done
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Lead = mongoose.model("Lead", leadSchema);

/* =========================
   CREATE LEAD (с формы)
========================= */
app.post("/api/lead", async (req, res) => {
  try {
    const { name, email, phone, message, service } = req.body;

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
   GET ALL LEADS (АДМИН)
========================= */
app.get("/api/lead", async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });

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
      { new: true }
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
   GOOGLE REVIEWS (Places API)
========================= */
app.get("/api/reviews", async (req, res) => {
  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json`;

    const response = await axios.get(url, {
      params: {
        place_id: process.env.GOOGLE_PLACE_ID,
        fields: "name,rating,reviews",
        key: process.env.GOOGLE_API_KEY,
      },
    });

    const data = response.data.result;

    res.json({
      success: true,
      data: {
        name: data.name,
        rating: data.rating,
        reviews: data.reviews?.map((r) => ({
          author: r.author_name,
          rating: r.rating,
          text: r.text,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Google API failed",
    });
  }
});

/* =========================
   START SERVER
========================= */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});