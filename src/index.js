import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import cors from "cors";
import EventsRoute from "./routes/eventsRoute";
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/api/", EventsRoute);

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`);
});
