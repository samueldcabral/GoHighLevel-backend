import moment from "moment-timezone";
import Timezones from "./Timezones";
moment().format();

export function getDocumentWithDateAndTimezone(doc, tz) {
  const {
    StartHours: start,
    EndHours: end,
    Duration,
    Timezone,
    bookings: bookingsObject,
  } = doc.data();

  const StartHours = moment.tz(start, tz);
  const EndHours = moment.tz(end, tz);
  let bookings = bookingsObject ? Array.from(bookingsObject) : [];

  let bookingArr = [];
  for (let booking of bookings) {
    bookingArr.push({
      Duration: booking.Duration,
      DateTime: moment.tz(booking.DateTime, tz),
    });
  }

  return {
    id: doc.id,
    StartHours,
    EndHours,
    Timezone,
    Duration,
    bookings: bookingArr,
  };
}

export function getSlots(doc) {
  const {
    StartHours: start,
    EndHours: end,
    Duration,
    Timezone,
    bookings,
  } = doc;

  const slots = [];
  let tempStart = moment(start);

  while (tempStart.isSame(end) === false) {
    let isSlotAvailable = true;
    let myTime = moment(tempStart, Timezone);

    if (Array.from(bookings).length < 1) {
      slots.push(myTime);
    } else {
      for (let book of bookings) {
        let startTimeRange = moment(book.DateTime);
        let tempStartTime = moment(startTimeRange);
        let endTimeRange = tempStartTime.add(book.Duration, "m");

        if (myTime.isBetween(startTimeRange, endTimeRange, undefined, "[)")) {
          isSlotAvailable = false;
        }
      }

      if (isSlotAvailable) {
        slots.push(myTime);
      }
    }
    tempStart.add(Duration, "m");
  }

  return slots;
}

export function getNewTz(doc, tz) {
  const { StartHours, EndHours, Slots, bookings } = doc;
  let slotsArr = [];

  StartHours.tz(tz);
  EndHours.tz(tz);

  for (let slot of Slots) {
    slot.tz(tz).format();
  }

  for (let booking of bookings) {
    booking.DateTime.tz(tz);
  }

  return doc;
}
