import express, { request } from "express";
import { db } from "../config/firebase";
import { getStartAndEndHours } from "../Utils/Utils";

const router = express.Router();

router.get("/", (request, response) => {
  response.send("GET Events (/api/events)");
});

router.get("/slots", async (request, response) => {
  const snapshot = await db.collection("events").get();
  const docsArr = [];

  snapshot.forEach((doc) => {
    // console.log(`DocId: ${doc.id}`);
    // console.log("******************************");
    const data = doc.data();
    getStartAndEndHours(doc, data);
    docsArr.push({ id: doc.id, data: doc.data() });
  });
  // response.send(docsArr);
  response.send("GET slots");
});

router.post("/", (request, response) => {
  response.send("POST Events (/api/events)");
});

export default router;

// app.get("/api", async (request, response) => {
//   const result = await db.collection("events").get();
//   result.forEach((doc) => {
//     console.log(`${doc.id} => ${doc.data()}`);
//     response.send(doc.data());
//   });

//   // response.send("Hello World");
// });
