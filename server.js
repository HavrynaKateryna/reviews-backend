import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

/* 🔥 TEST DATA (отзывы) */
const reviewsData = {
  name: "Test Business",
  rating: 4.8,
  reviews: [
    {
      author_name: "John Smith",
      rating: 5,
      text: "Amazing service! Everything was fast and professional.",
      relative_time_description: "1 week ago",
    },
    {
      author_name: "Anna Brown",
      rating: 4,
      text: "Very good experience, I am satisfied.",
      relative_time_description: "2 weeks ago",
    },
    {
      author_name: "Michael Lee",
      rating: 5,
      text: "Perfect! Highly recommend this company.",
      relative_time_description: "1 month ago",
    },
    {
      author_name: "Kate Wilson",
      rating: 4,
      text: "Good service and friendly staff.",
      relative_time_description: "2 months ago",
    },
  ],
};

/* 🔥 API: GET REVIEWS */
app.get("/api/reviews", (req, res) => {
  res.json(reviewsData);
});

/* 🔥 API: TEST FORM (optional) */
app.post("/api/lead", (req, res) => {
  console.log("NEW LEAD:", req.body);
  res.json({ success: true });
});

/* START SERVER */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});