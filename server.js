import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", userRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
