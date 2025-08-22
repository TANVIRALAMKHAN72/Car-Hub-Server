import express from "express";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// ✅ CORS fix
app.use(cors({ origin: "https://carhub-client.vercel.app" }));
app.use(express.json());

const client = new MongoClient(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}/?retryWrites=true&w=majority`
);

async function connectDB() {
  try {
    await client.connect(); // uncomment this line
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
  }
}
connectDB();

const db = client.db(process.env.DB_NAME);
const carsCollection = db.collection("cars");

// GET all cars
app.get("/cars", async (req, res) => {
  try {
    const cars = await carsCollection.find({}).toArray();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET car by id
app.get("/cars/:id", async (req, res) => {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  try {
    const car = await carsCollection.findOne({ _id: new ObjectId(id) });
    if (!car) return res.status(404).json({ error: "Car not found" });

    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

// POST add new car
app.post("/cars", async (req, res) => {
  try {
    const newCar = req.body;

    if (!newCar.name || !newCar.brand || !newCar.price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await carsCollection.insertOne(newCar);
    res.status(201).json({
      message: "Car added successfully",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to add car" });
  }
});

app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

app.listen(port, () => console.log(`✅ Server running on port ${port}`));
