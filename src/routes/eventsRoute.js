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

// TODO account so that the slots only count if there is no booking for the time
// 1. Free Slots takes two Params (Date, Timzone)
// Returns all the free slots available for a given date converted to whatever timezone we pass
router.get("/events/slots", async (request, response) => {
  const paramDate = moment(request.query.Date);
  const Timezone = request.query.Timezone;
  const snapshot = await db.collection("events").get();
  const docsArr = [];
  let test = "samuel";

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDateAndTimezone(
      doc,
      doc.data().Timezone
    );

    // console.log(`docFormatted.bookings ==> ${docFormatted.bookings}`);
    // for (let book of docFormatted.bookings) {
    //   console.log(`book ==> ${book.DateTime}`);
    // }
    // console.log(
    //   `docFormatted.bookings.DateTime ==> ${docFormatted.bookings.DateTime}`
    // );

    const slots = getSlots(docFormatted);
    docFormatted.Slots = slots;
    const docWithNewTZ = getNewTz(docFormatted, Timezone);

    let slotsAsStringsArr = [];
    for (let slot of docWithNewTZ.Slots) {
      slotsAsStringsArr.push(slot.format());
    }

    let responseDoc = {
      id: docWithNewTZ.id,
      StartHours: docWithNewTZ.StartHours.format(), //.format() is to make sure the backend sends the ISO information
      EndHours: docWithNewTZ.EndHours.format(), // without it, it would convert.
      Timezone: docWithNewTZ.Timezone,
      Duration: docWithNewTZ.Duration,
      bookings: docWithNewTZ.bookings,
      Slots: slotsAsStringsArr,
    };

    docsArr.push(responseDoc);
    // if (docFormatted.StartHours.isSame(paramDate, "day")) {
    // }
  });

  response.send(docsArr);
});

// TODO In case everything goes well, after storing recalculate the slots remaining
// 2. Create Event takes two Params (DateTime, duration)
// Returns all the free slots available for a given date converted to whatever timezone we pass
router.post("/events", async (request, response) => {
  const { DateTime, Duration } = request.body;
  const snapshot = await db.collection("events").get();

  snapshot.forEach((doc) => {
    const docFormatted = getObjectFromApiDataWithFormatedDateAndTimezone(
      doc,
      doc.data().Timezone
    );

    if (docFormatted.StartHours.isSame(DateTime, "day")) {
      let DurationNumber = Number(Duration);
      let DateTimeMoment = moment(DateTime);
      let DateTimeMomentCopy = moment(DateTimeMoment);
      let DateTimePlusDuration = DateTimeMomentCopy.add(DurationNumber, "m");

      if (
        docFormatted.StartHours.isAfter(DateTimeMoment) ||
        docFormatted.EndHours.isBefore(DateTimePlusDuration)
      ) {
        response.status(422).json({ message: "Outside of availability" });
      } else {
        response.send("OK");
      }

      // console.log(`DateTime ==> ${DateTime}`);
      // console.log(`docFormatted ==> ${docFormatted}`);
      // console.log(`DateTimeMoment ==> ${DateTimeMoment}`);
      // console.log(`DateTimePlusDuration ==> ${DateTimePlusDuration}`);
      // console.log(`docFormatted StartHours ==> ${docFormatted.StartHours}`);
      // console.log(
      //   `docFormatted StartHours .isBefore(DateTime) ==> ${docFormatted.StartHours.isBefore(
      //     DateTime
      //   )}`
      // );
      // console.log(
      //   `docFormatted StartHours .isAfter(DateTimeMoment) ==> ${docFormatted.StartHours.isAfter(
      //     DateTimeMoment
      //   )}`
      // );
      // console.log(`docFormatted EndHours ==> ${docFormatted.EndHours}`);
      // console.log(
      //   `docFormatted EndHours .isBefore(DateTime) ==> ${docFormatted.EndHours.isBefore(
      //     DateTimePlusDuration
      //   )}`
      // );
      // console.log(
      //   `docFormatted EndHours .isAfter(DateTime) ==> ${docFormatted.EndHours.isAfter(
      //     DateTime
      //   )}`
      // );

      // const slots = getSlots(docFormatted);
      // docFormatted.Slots = slots;
      // const docWithNewTZ = getNewTz(docFormatted, Timezone);

      // let slotsAsStringsArr = [];
      // for (let slot of docWithNewTZ.Slots) {
      //   slotsAsStringsArr.push(slot.format());
      // }

      // let responseDoc = {
      //   id: docWithNewTZ.id,
      //   StartHours: docWithNewTZ.StartHours.format(), //.format() is to make sure the backend sends the ISO information
      //   EndHours: docWithNewTZ.EndHours.format(), // without it, it would convert.
      //   Timezone: docWithNewTZ.Timezone,
      //   Duration: docWithNewTZ.Duration,
      //   bookings: docWithNewTZ.bookings,
      //   Slots: slotsAsStringsArr,
      // };

      // docsArr.push(responseDoc);
    }
  });

  // response.send(docsArr);
});

//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
//*
// router.get("/test", async (request, response) => {
//   // let startM = "2020-07-22T21:30:00+05:30";
//   let startM = "2020-07-22T11:30:00Z";
//   let endM = "2020-07-22T16:00:00Z";
//   let day = "2020-07-22";
//   let daytime = "2020-07-22T12:00+05:30";

//   const one = moment(startM);
//   const two = moment(endM);
//   const three = moment(daytime);

//   console.log(`one ==> ${one}`);
//   console.log(`two ==> ${two}`);
//   console.log(`three ==> ${three}`);

//   console.log(`one.isSame(three, "day") ==> ${one.isSame(three, "day")}`);
//   console.log(`two.isSame(three, "day") ==> ${two.isSame(three, "day")}`);
//   console.log(`one.isBefore(three) ==> ${one.isBefore(three)}`);
//   console.log(`two.isBefore(three) ==> ${two.isBefore(three)}`);
//   console.log(`one.isAfter(three) ==> ${one.isAfter(three)}`);
//   console.log(`two.isAfter(three) ==> ${two.isAfter(three)}`);

//   // let tz = "UTC";

//   // // let startMoment = moment.tz(startM, "UTC");
//   // // let endMoment = moment.tz(endM, "Asia/Calcutta");

//   // let startMoment = moment(startM, "YYYY-MM-DDTHH:mmZ");
//   // let endMoment = moment(endM);

//   // let afterStart = startMoment.creationData();
//   // // console.log(`Object.keys(afterStart); ==> ${Object.keys(afterStart.locale)}`);

//   // console.log(`startMoment isUTC==> ${startMoment.utcOffset()}`);
//   // console.log(`startMoment isUTC==> ${startMoment}`);
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
