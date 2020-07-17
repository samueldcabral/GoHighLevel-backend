import moment from "moment-timezone";
import Timezones from "./Timezones";
moment().format();

export function getObjectFromApiDataWithFormatedDate(doc) {
  const {
    StartHours: start,
    EndHours: end,
    Duration,
    Timezone,
    bookings: bookingsObject,
  } = doc.data();

  let bookings = bookingsObject ? Array.from(bookingsObject) : [];

  const StartHours = moment(start);
  const EndHours = moment(end);

  return {
    id: doc.id,
    StartHours,
    EndHours,
    Timezone,
    Duration,
    bookings,
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

// export function getStartAndEndHours(doc, data) {
//   const { id } = doc;
//   const { StartHours, EndHours, Duration, Timezone } = data;

//   const { seconds: startSeconds, nanoseconds: startNanoSeconds } = StartHours;
//   const { seconds: endSeconds, nanoseconds: endNanoSeconds } = EndHours;

//   const momentStart = moment(startSeconds * TO_MILLISECONDS);
//   const momentEnd = moment(endSeconds * TO_MILLISECONDS);

//   // console.log(`id ==> ${id}`);
//   // console.log(`Timezone ==> ${Timezone}`);
//   // console.log(`Duration ==> ${Duration}`);
//   // console.log(`StartHours ==> ${StartHours}`);
//   // console.log(`startSeconds ==> ${startSeconds}`);
//   // console.log(`startNanoSeconds ==> ${startNanoSeconds}`);
//   // console.log(`EndHours ==> ${EndHours}`);
//   // console.log(`endSeconds ==> ${endSeconds}`);
//   // console.log(`endNanoSeconds ==> ${endNanoSeconds}`);

//   // console.log(`momentStart ==> ${momentStart.hour()}`);
//   // console.log(`momentEnd ==> ${momentEnd.hour()}`);
//   // console.log(`-----`);
//   // momentStart.utc();
//   // momentEnd.utc();
//   // console.log(`momentStart ==> ${momentStart}`);
//   // console.log(`momentEnd ==> ${momentEnd}`);
//   // console.log(`-----`);
//   momentStart.tz(Timezone);
//   let myStart = moment(momentStart);
//   momentEnd.tz(Timezone);
//   // console.log(`momentStart ==> ${momentStart}`);
//   // console.log(`momentEnd ==> ${momentEnd}`);

//   return {
//     start: myStart,
//     end: momentEnd,
//     slots: getSlots(momentStart, momentEnd, Duration, Timezone),
//   };

//   // console.log(`-----`);
//   // console.log(`*****************************\n`);
// }
