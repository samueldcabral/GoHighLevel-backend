import express from "express";
import { db } from "../config/firebase";
import {
  getObjectFromApiDataWithFormatedDateAndTimezone,
  getSlots,
  getNewTz,
} from "../Utils/Utils";
import moment from "moment-timezone";

const router = express.Router();

// 3. Get Events takes two Params (StartDate, EndDate)
// Returns all the events between given StartDate & EndDate
router.get("/events", async (request, response) => {
  const StartDate = moment(request.query.StartDate);
  const EndDate = moment(request.query.EndDate);
  StartDate.utc();
  EndDate.utc();

  //This below is to make sure the range is from start to end(inclusive)
  EndDate.add(1, "day");
  const snapshot = await db.collection("events").get();
  const docsArr = [];

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDateAndTimezone(
      doc,
      doc.data().Timezone
    );

    if (
      docFormatted.StartHours.isBetween(StartDate, EndDate) ||
      docFormatted.EndHours.isBetween(StartDate, EndDate)
    ) {
      if (doc.data().bookings) {
        docsArr.push({
          id: doc.id,
          bookings: doc.data().bookings,
          Timezone: doc.data().Timezone,
        });
      }
    }
  });
  response.send(docsArr);
});

// 1. Free Slots takes two Params (Date, Timzone)
// Returns all the free slots available for a given date converted to whatever timezone we pass
router.get("/events/slots", async (request, response) => {
  const paramDate = moment(request.query.Date);
  const Timezone = request.query.Timezone;

  // console.log(`Date ==> ${paramDate}`);
  // console.log(`Date ==> ${paramDate.days()}`);
  // console.log(`Timezone ==> ${Timezone}`);

  const snapshot = await db.collection("events").get();
  const docsArr = [];

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDateAndTimezone(
      doc,
      doc.data().Timezone
    );
    const slots = getSlots(docFormatted);
    docFormatted.Slots = slots;

    console.log(`\n********** INICIO **********************\n`);
    console.log(`docFormatted StartHours==> ${docFormatted.StartHours}`);
    console.log(`docFormatted EndHours ==> ${docFormatted.EndHours}`);
    console.log(`docFormatted Slots ==> ${docFormatted.Slots}`);
    console.log(
      `docFormatted bookings ==> ${docFormatted.bookings}\n-------------------\n`
    );
    const docWithNewTZ = getNewTz(docFormatted, "Asia/Calcutta");
    console.log(`docWithNewTZ StartHours==> ${docWithNewTZ.StartHours}`);
    console.log(`docWithNewTZ EndHours ==> ${docWithNewTZ.EndHours}`);
    console.log(`docWithNewTZ Slots ==> ${docWithNewTZ.Slots}`);
    console.log(
      `docWithNewTZ bookings ==> ${docWithNewTZ.bookings}\n**********FIM FIM FIM FIM FIM **********************\n\n`
    );

    docsArr.push(docFormatted);
  });

  response.send(docsArr);
});

router.post("/events", (request, response) => {
  response.send("POST Events (/api/events)");
});

// router.get("/test", async (request, response) => {
//   let startM = "2020-07-20T15:00";
//   let endM = "2020-07-20T12:00";
//   let tz = "UTC";

//   let startMoment = moment.tz(startM, "UTC");
//   let endMoment = moment.tz(endM, "Asia/Calcutta");

//   console.log(`startMoment w ==> ${startMoment}`);
//   console.log(`endMoment  w ==> ${endMoment}`);
//   console.log(`endMoment  w ==> ${endMoment.tz("UTC")}`);
//   // console.log(`startMoment w ==> ${startMoment.tz(tz)}`);
//   // console.log(`endMoment  w ==> ${endMoment.tz(tz)}`);
//   // let firebaseTestId = "qKteRuKGZrrTErmP0A2A";
//   // const snapshot = await db.collection("events").get();
//   // const docsArr = [];

//   // snapshot.forEach((doc) => {
//   //   if (doc.id === firebaseTestId) {
//   //     const { StartHours, EndHours } = doc.data();
//   //     let mStart = moment(StartHours);
//   //     let mEnd = moment(EndHours);

//   //     console.log(
//   //       `mStart ==> ${mStart} - ${mStart.fromNow(true)} ${mStart.day()}`
//   //     );
//   //     console.log(`mEnd ==> ${mEnd}`);
//   //     response.send("Ok");
//   //   }
//   // });
// });

export default router;
