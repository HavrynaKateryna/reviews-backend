import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: "*",
  }),
);

app.use(express.json());

/* =========================
   MONGODB
========================= */

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error,
    );
  });

/* =========================
   ROOT
========================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Tim's Tree Service backend is running",
  });
});

/* =========================
   GOOGLE RATING
========================= */

app.get("/api/reviews", async (req, res) => {
  try {
    const placeId = process.env.GOOGLE_PLACE_ID;
    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY;

    if (!placeId) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_PLACE_ID is missing",
      });
    }

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_MAPS_API_KEY is missing",
      });
    }

    const url = `https://places.googleapis.com/v1/places/${placeId}`;

    const response = await fetch(url, {
      method: "GET",

      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "displayName,rating,userRatingCount,googleMapsUri",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Google Places API error:",
        data,
      );

      return res.status(response.status).json({
        success: false,
        error: "Google Places API error",
        details: data,
      });
    }

    res.json({
      success: true,
      source: "google",

      businessName: data.displayName?.text || "",

      rating: data.rating || 0,

      userRatingCount: data.userRatingCount || 0,

      googleMapsUri: data.googleMapsUri || "",
    });
  } catch (error) {
    console.error("Google rating error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to load Google rating",
    });
  }
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
