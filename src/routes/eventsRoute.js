import express from "express";
import { db } from "../config/firebase";
import {
  getDocumentWithDateAndTimezone,
  getSlots,
  getNewTz,
} from "../Utils/Utils";
import moment from "moment-timezone";
import Timezones from "../Utils/Timezones";

const router = express.Router();

// 1. Free Slots takes two Params (Date, Timzone)
// Returns all the free slots available for a given date converted to whatever timezone we pass
router.get("/events/slots", async (request, response) => {
  let Timezone = null;

  //Check if user set a valid timezone in the request
  if (
    Timezones.findIndex((timezone) => timezone === request.query.Timezone) ===
    -1
  ) {
    response.status(400).send("Invalid Timezone");
  } else {
    Timezone = request.query.Timezone;
  }

  let snapshot = null;

  try {
    snapshot = await db.collection("events").get();
  } catch (error) {
    response.status(500).send("Error fetching data from database");
  }

  let paramDate = null;

  if (request.query.Date === "-1" || request.query.Date === undefined) {
    paramDate = false;
  } else {
    try {
      paramDate = moment(request.query.Date);
    } catch (error) {
      response
        .status(400)
        .send(
          "Please format your params in the specified date format, eg: YYYY-MM-DD."
        );
    }
  }

  let docsArr = [];

  snapshot.forEach((item) => {
    const doc = getDocumentWithDateAndTimezone(item, item.data().Timezone);

    const slots = getSlots(doc);
    doc.Slots = slots;
    const docWithNewTZ = getNewTz(doc, Timezone);

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

    if (paramDate) {
      if (doc.StartHours.isSame(paramDate, "day")) {
        docsArr.push(responseDoc);
      }
    } else {
      docsArr.push(responseDoc);
    }
  });

  response.send(docsArr);
});

// TODO In case everything goes well, after storing recalculate the slots remaining
// 2. Create Event takes two Params (DateTime, duration)
// Returns all the free slots available for a given date converted to whatever timezone we pass
router.post("/events", async (request, response) => {
  const { DateTime, Duration } = request.body;
  let DateTimeMoment = null;

  try {
    DateTimeMoment = moment(DateTime);
  } catch (error) {
    response
      .status(400)
      .send(
        "Please format your params in the specified date format, eg: YYYY-MM-DD."
      );
  }

  if (Number(Duration) < 0 || Number(Duration) > 60) {
    response.status(400).send("Duration must be between 1 and 60.");
  } else {
    let snapshot = null;

    try {
      snapshot = await db.collection("events").get();
    } catch (error) {
      response.status(500).send("Error fetching data from database");
    }

    snapshot.forEach(async (item) => {
      const doc = getDocumentWithDateAndTimezone(item, item.data().Timezone);
      const slots = getSlots(doc);
      doc.Slots = slots;

      //testing this next part
      DateTimeMoment.tz(item.data().Timezone);

      if (doc.StartHours.date() === DateTimeMoment.date()) {
        let DurationNumber = Number(Duration);
        // let DateTimeMoment = moment(DateTime);
        let DateTimeMomentCopy = moment(DateTimeMoment);
        let DateTimePlusDuration = DateTimeMomentCopy.add(DurationNumber, "m");

        console.log(`item  ==> ${item.id}`);
        console.log(`item data start==> ${item.data().StartHours}`);
        console.log(`doc.StartHours ==> ${doc.StartHours}`);
        console.log(`doc.doc.EndHours ==> ${doc.EndHours}`);
        console.log(`DateTimeMoment ==> ${DateTimeMoment}`);
        if (
          doc.StartHours.isAfter(DateTimeMoment) ||
          doc.EndHours.isBefore(DateTimePlusDuration)
        ) {
          response.status(422).json({ message: "Outside of availability" });
        } else {
          let hasFoundAvailableSlot = false;

          for (let slot of doc.Slots) {
            if (DateTimeMoment.isSame(slot)) {
              hasFoundAvailableSlot = true;
            }
          }

          if (hasFoundAvailableSlot) {
            const books = item.data().bookings ? item.data().bookings : [];
            const newBooking = {
              DateTime: DateTimeMoment.format(),
              Duration: DurationNumber,
            };

            books.push(newBooking);

            try {
              await item.ref.update({ bookings: books });
              response.send("Successfully created!");
            } catch (error) {
              response.send("It failed when trying to add to database");
            }
          } else {
            response.status(422).send("No Slots Available");
          }
        }

        // console.log(`DateTime ==> ${DateTime}`);
        // console.log(`doc ==> ${doc}`);
        // console.log(`DateTimeMoment ==> ${DateTimeMoment}`);
        // console.log(`DateTimePlusDuration ==> ${DateTimePlusDuration}`);
        // console.log(`doc StartHours ==> ${doc.StartHours}`);
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
  }
  // response.send(docsArr);
});

// 3. Get Events takes two Params (StartDate, EndDate)
// Returns all the events between given StartDate & EndDate
router.get("/events", async (request, response) => {
  let startDate = null;
  let endDate = null;

  //Trying to create a moment object
  try {
    startDate = moment(request.query.StartDate);
    endDate = moment(request.query.EndDate);
  } catch (error) {
    response
      .status(400)
      .send(
        "Please format your params in the specified date format, eg: YYYY-MM-DD."
      );
  }

  startDate.utc();
  endDate.utc();

  //This below is to make sure the range is from start to end (inclusive)
  endDate.add(1, "day");

  let snapshot = null;

  try {
    snapshot = await db.collection("events").get();
  } catch (error) {
    response.status(500).send("Error fetching data from database");
  }

  let docsArr = [];

  snapshot.forEach((document) => {
    const documentObject = getDocumentWithDateAndTimezone(
      document,
      document.data().Timezone
    );

    if (
      documentObject.StartHours.isBetween(startDate, endDate) ||
      documentObject.EndHours.isBetween(startDate, endDate)
    ) {
      if (documentObject.bookings) {
        docsArr.push({
          id: documentObject.id,
          bookings: documentObject.bookings,
          Timezone: documentObject.Timezone,
        });
      }
    }
  });
  response.send(docsArr);
});

router.get("/test", async (request, response) => {
  let a = "2020-07-01T12:00";
  let b = moment.tz(a, "Asia/Calcutta");

  response.send(b);
});
//   let a = "America/Los_Angeles";
//   let b = "America/Fortaleza";

//   let c = "2020-04-20";
//   let d = moment.tz(c, b);

//   let res1 = Timezones.findIndex((item) => item === a);
//   let res2 = Timezones.findIndex((item) => item === b);

//   response.json({ res1, res2, d });
// });

// let res = [];

// let myTime = "2020-08-01T10:30-00:00";
// let myTime2 = "2020-08-01T10:30-03:00";
// let myTime3 = "2020-08-01T10:30+05:30";

// res.push({ myTime, myTime2, myTime3 });

// let moment1 = moment(myTime);
// let moment2 = moment(myTime2);
// let moment3 = moment(myTime3);

// console.log(`moment1 ==> ${moment1.utc()}`);
// res.push({ moment1, moment2, moment3 });

// let m1 = moment1.tz("America/Los_Angeles");
// let m2 = moment2.tz("America/Los_Angeles");
// let m3 = moment3.tz("America/Los_Angeles");

// console.log(`m1 ==> ${m1}`);
// // let moment1UTC = moment1.utc();
// // let moment2UTC = moment2.utc();
// // let moment3UTC = moment3.utc();

// res.push({ m1, m2, m3 });

// response.json(res);
// });
//   let a = "samuel";
//   try {
//     let res = moment(a);
//     response.send("IT didnt throw an error");
//   } catch (error) {
//     response.send("ERROR!!! IT DID throw an error");
//   }
// });
// let startM = "2020-07-22T21:30:00+05:30";
// let startM = "2020-07-22T12:00:00Z";
// let endM = "2020-07-22T11:30:00Z";
// let endn = "2020-07-22T12:00:00Z";

// // let day = "2020-07-22";
// // let daytime = "2020-07-22T12:00+05:30";

// const one = moment(startM);
// const two = moment(endM);
// const three = moment(endn);
// console.log(`one ==> ${one}`);
// console.log(
//   `one.isBetween(two, three) ==> ${one.isBetween(
//     two,
//     three,
//     undefined,
//     "[)"
// )}`
// );

// console.log(`one ==> ${one}`);
// console.log(`two ==> ${two}`);
// console.log(`three ==> ${three}`);

// console.log(`one.isSame(three, "day") ==> ${one.isSame(three, "day")}`);
// console.log(`two.isSame(three, "day") ==> ${two.isSame(three, "day")}`);
// console.log(`one.isBefore(three) ==> ${one.isBefore(three)}`);
// console.log(`two.isBefore(three) ==> ${two.isBefore(three)}`);
// console.log(`one.isAfter(three) ==> ${one.isAfter(three)}`);
// console.log(`two.isAfter(three) ==> ${two.isAfter(three)}`);

// let tz = "UTC";

// // let startMoment = moment.tz(startM, "UTC");
// // let endMoment = moment.tz(endM, "Asia/Calcutta");

// let startMoment = moment(startM, "YYYY-MM-DDTHH:mmZ");
// let endMoment = moment(endM);

// let afterStart = startMoment.creationData();
// // console.log(`Object.keys(afterStart); ==> ${Object.keys(afterStart.locale)}`);

// console.log(`startMoment isUTC==> ${startMoment.utcOffset()}`);
// console.log(`startMoment isUTC==> ${startMoment}`);
// console.log(`afterStart locale==> ${afterStart.locale.relativeTime()}`);
// for (let i of afterStart) {
//   console.log(`i ==> ${Object.keys(i)} - ${Object.values(i)}`);
// }

// console.log(`endMoment  w ==> ${endMoment}`);

// console.log(startMoment.isSame("2020-07-20", "day"));
// console.log(`endMoment  w ==> ${endMoment.tz("UTC")}`);
// console.log(`startMoment w ==> ${startMoment.tz(tz)}`);
// console.log(`endMoment  w ==> ${endMoment.tz(tz)}`);
// let firebaseTestId = "qKteRuKGZrrTErmP0A2A";
// const snapshot = await db.collection("events").get();
// const docsArr = [];

// snapshot.forEach((doc) => {
//   if (doc.id === firebaseTestId) {
//     const { StartHours, EndHours } = doc.data();
//     let mStart = moment(StartHours);
//     let mEnd = moment(EndHours);

//     console.log(
//       `mStart ==> ${mStart} - ${mStart.fromNow(true)} ${mStart.day()}`
//     );
//     console.log(`mEnd ==> ${mEnd}`);
//     response.send("Ok");
//   }
// });
// });

export default router;
