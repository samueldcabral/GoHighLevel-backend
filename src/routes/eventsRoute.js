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
      }
    });
  }
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

export default router;
