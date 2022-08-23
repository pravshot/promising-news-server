import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import newsRoutes from "./routes/news.js";

const app = express();
dotenv.config();

app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/news", newsRoutes);

// default welcome page
app.get("/", (req, res) => {
  res.send("Welcome to the Promising News API");
});

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error}, did not connect`));

