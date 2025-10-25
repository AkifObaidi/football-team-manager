import express from "express"
import dotenv from "dotenv"
import routes from "./routes/routes.js"
import "./db.js"
import cors from "cors";

dotenv.config()
const app = express()

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json())
app.use("/api", routes)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`server running on port ${PORT}`))
