import express from "express";
import { db } from "../config/firebase";
import { getObjectFromApiDataWithFormatedDate, getSlots } from "../Utils/Utils";
import moment from "moment-timezone";

const router = express.Router();

router.get("/events", async (request, response) => {
  const startDate = moment(request.query.start);
  const endDate = moment(request.query.end);
  startDate.utc();
  endDate.utc();

  //This below is to make sure the range is from start to end(inclusive)
  endDate.add(1, "day");
  const snapshot = await db.collection("events").get();
  const docsArr = [];

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDate(doc);
    // // const { StartHours, EndHours } = doc.data();
    // // const { seconds: STT } = StartHours;
    // // const { seconds: ETT } = EndHours;

    // // let newSTT = moment(STT * 1000);
    // // let newETT = moment(ETT * 1000);

    // // // console.log(`startDate ${startDate}`);
    // // // console.log(`endDate ${endDate}`);
    // // // console.log(`newSTT ${newSTT}`);
    // // // console.log(`newETT ${newETT}`);

    // console.log(`docFormatted.StartHours ==> ${docFormatted.StartHours}`);
    // console.log(`docFormatted.EndHours ==> ${docFormatted.EndHours}`);
    // console.log(`startDate ==> ${startDate}`);
    // console.log(`endDate ==> ${endDate}`);
    // console.log(
    //   `docFormatted.StartHours.isBetween(startDate, endDate) ==> ${docFormatted.StartHours.isBetween(
    //     startDate,
    //     endDate
    //   )}`
    // );

    if (
      docFormatted.StartHours.isBetween(startDate, endDate) ||
      docFormatted.EndHours.isBetween(startDate, endDate)
    ) {
      if (doc.data().bookings) {
        docsArr.push({ id: doc.id, bookings: doc.data().bookings });
      }
    }
  });
  response.send(docsArr);
});

// TODO params Date and Timezone -> return all available slots for that day
router.get("/events/slots", async (request, response) => {
  const snapshot = await db.collection("events").get();
  const docsArr = [];

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDate(doc);
    const slots = getSlots(docFormatted);
    docFormatted.Slots = slots;
    docsArr.push(docFormatted);
  });

  response.send(docsArr);
});

router.post("/events", (request, response) => {
  response.send("POST Events (/api/events)");
});

// router.get("/test", async (request, response) => {
//   let firebaseTestId = "qKteRuKGZrrTErmP0A2A";
//   const snapshot = await db.collection("events").get();
//   const docsArr = [];

//   snapshot.forEach((doc) => {
//     if (doc.id === firebaseTestId) {
//       const { StartHours, EndHours } = doc.data();
//       let mStart = moment(StartHours);
//       let mEnd = moment(EndHours);

//       console.log(
//         `mStart ==> ${mStart} - ${mStart.fromNow(true)} ${mStart.day()}`
//       );
//       console.log(`mEnd ==> ${mEnd}`);
//       response.send("Ok");
//     }
//   });
// });

export default router;
