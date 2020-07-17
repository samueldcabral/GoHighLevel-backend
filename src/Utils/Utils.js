import moment from "moment-timezone";
import Timezones from "./Timezones";
moment().format();

export function getObjectFromApiDataWithFormatedDateAndTimezone(doc, tz) {
  const {
    StartHours: start,
    EndHours: end,
    Duration,
    Timezone,
    bookings: bookingsObject,
  } = doc.data();

  let bookings = bookingsObject ? Array.from(bookingsObject) : [];

  // console.log(`tz ==> ${tz}`);
  // console.log(`start ==> ${start}`);
  // console.log(`end ==> ${end}`);
  // console.log(`typeof start ==> ${typeof start}`);
  // console.log(`typeof end ==> ${typeof end}`);
  const StartHours = moment.tz(start, tz);
  const EndHours = moment.tz(end, tz);

  let bookingArr = [];
  for (let booking of bookings) {
    bookingArr.push(moment.tz(booking, tz));
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
  const { StartHours: start, EndHours: end, Duration, Timezone } = doc;
  const slots = [];
  let tempStart = moment(start);

  while (tempStart.isSame(end) === false) {
    let myTime = moment(tempStart, Timezone);
    slots.push(myTime);
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
    // slotsArr.push(slot.tz(tz));
    slot.tz(tz).format();
  }

  for (let booking of bookings) {
    booking.tz(tz).format();
  }

  // console.log("This is the AFTER *****************************");
  // console.log(`doc id ==> ${doc.id}`);
  // console.log(`StartHours ==> ${StartHours}`);
  // console.log(`EndHours ==> ${EndHours}`);
  // console.log(`slotsArr ==> ${slotsArr}\n`);

  return doc;
}

// export function getStartAndEndHours(doc, data) {
//   const { id } = doc;
//   const { StartHours, EndHours, Duration, Timezone } = data;

//   const { seconds: startSeconds, nanoseconds: startNanoSeconds } = StartHours;
//   const { seconds: endSeconds, nanoseconds: endNanoSeconds } = EndHours;

//   const momentStart = moment(startSeconds * TO_MILLISECONDS);
//   const momentEnd = moment(endSeconds * TO_MILLISECONDS);

//   // momentStart.utc();
//   // momentEnd.utc();
//   momentStart.tz(Timezone);
//   let myStart = moment(momentStart);
//   momentEnd.tz(Timezone);

//   return {
//     start: myStart,
//     end: momentEnd,
//     slots: getSlots(momentStart, momentEnd, Duration, Timezone),
//   };

// }
