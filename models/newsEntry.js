import mongoose from "mongoose";

const newsSchema = new mongoose.Schema({
  title: String,
  author: { type: String, default: null },
  description: { type: String, default: null },
  date: { type: String, default: (new Date()).toISOString() },
  url: String,
  image_url: { type: String, default: null },
  publication: { type: String, default: null },
  positivity_score: Number,
});

const NewsEntry = mongoose.model("NewsEntry", newsSchema);

export default NewsEntry;
