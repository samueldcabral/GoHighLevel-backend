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

    if (docFormatted.StartHours.isSame(paramDate, "day")) {
      const slots = getSlots(docFormatted);
      docFormatted.Slots = slots;
      const docWithNewTZ = getNewTz(docFormatted, Timezone);
      console.log(`docWithNewTZ StartHours==> ${docWithNewTZ.StartHours}`);
      console.log(`docWithNewTZ EndHours ==> ${docWithNewTZ.EndHours}`);
      console.log(`docWithNewTZ Slots ==> ${docWithNewTZ.Slots}`);

      let arr = [];

      for (let slot of docWithNewTZ.Slots) {
        arr.push(slot.format());
      }

      let responseDoc = {
        id: docWithNewTZ.id,
        StartHours: docWithNewTZ.StartHours.format(),
        EndHours: docWithNewTZ.EndHours.format(),
        Timezone: docWithNewTZ.Timezone,
        Duration: docWithNewTZ.Duration,
        bookings: docWithNewTZ.bookings,
        Slots: arr,
      };

      docsArr.push(responseDoc);
    }

    // console.log(`\n********** INICIO **********************\n`);
    // console.log(`docFormatted StartHours==> ${docFormatted.StartHours}`);
    // console.log(`docFormatted EndHours ==> ${docFormatted.EndHours}`);
    // console.log(`docFormatted Slots ==> ${docFormatted.Slots}`);
    // console.log(
    //   `docFormatted bookings ==> ${docFormatted.bookings}\n-------------------\n`
    // );
    // console.log(
    //   `docWithNewTZ bookings ==> ${docWithNewTZ.bookings}\n**********FIM FIM FIM FIM FIM **********************\n\n`
    // );
  });

  response.send(docsArr);
});

router.post("/events", (request, response) => {
  response.send("POST Events (/api/events)");
});

// router.get("/test", async (request, response) => {
//   let startM = "2020-07-22T21:30:00+05:30";
//   let endM = "2020-07-22T16:00:00Z";
//   let tz = "UTC";

//   // let startMoment = moment.tz(startM, "UTC");
//   // let endMoment = moment.tz(endM, "Asia/Calcutta");

//   let startMoment = moment(startM, "YYYY-MM-DDTHH:mmZ");
//   let endMoment = moment(endM);

//   let afterStart = startMoment.creationData();
//   // console.log(`Object.keys(afterStart); ==> ${Object.keys(afterStart.locale)}`);

//   console.log(`startMoment isUTC==> ${startMoment.utcOffset()}`);
//   console.log(`startMoment isUTC==> ${startMoment}`);
//   // console.log(`afterStart locale==> ${afterStart.locale.relativeTime()}`);
//   // for (let i of afterStart) {
//   //   console.log(`i ==> ${Object.keys(i)} - ${Object.values(i)}`);
//   // }

//   // console.log(`endMoment  w ==> ${endMoment}`);

//   // console.log(startMoment.isSame("2020-07-20", "day"));
//   // console.log(`endMoment  w ==> ${endMoment.tz("UTC")}`);
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
