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
  // console.log(`start ==> ${start}`);

  const StartHours = moment.tz(start, tz);
  // console.log(`StartHours ==> ${StartHours}`);
  const EndHours = moment.tz(end, tz);

  let bookingArr = [];
  for (let booking of bookings) {
    // console.log(`booking.DateTime ==> ${booking.DateTime}`);
    // console.log(
    //   `moment.tz(booking.DateTime, tz), ==> ${moment.tz(booking.DateTime, tz)}`
    // );

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

  // console.log(`start ==> ${start}`);
  // console.log(`end ==> ${end}`);

  const slots = [];
  let tempStart = moment(start);

  // let bookingsArr = [];
  // for (let book of bookings) {
  //   let temp = moment(book.DateTime);
  //   bookingsArr.push(temp);
  // console.log(`getSlots book ==> ${book}`);
  // console.log(`getSlots book ==> ${book.DateTime}`);
  // console.log(`getSlots book ==> ${book.Duration}`);
  // }

  // if (bookingsArr) {
  //   console.log(`bookingsArr ${bookingsArr} ${bookingsArr.length}`);
  // }

  while (tempStart.isSame(end) === false) {
    let isSlotAvailable = true;
    let myTime = moment(tempStart, Timezone);
    // slots.push(myTime);
    // console.log(`myTime ==> ${myTime}`);
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
  console.log("\n");

  return slots;
}

export function getNewTz(doc, tz) {
  const { StartHours, EndHours, Slots, bookings } = doc;
  let slotsArr = [];

  // console.log(`StartHours NEWTZ 1 ==> ${StartHours}`);
  StartHours.tz(tz);
  // console.log(`StartHours NEWTZ 2 ==> ${StartHours}`);
  EndHours.tz(tz);

  for (let slot of Slots) {
    // slotsArr.push(slot.tz(tz));
    slot.tz(tz).format();
  }

  // TODO descomentar aqui
  // let count = 0;
  for (let booking of bookings) {
    // console.log("Count " + count);
    // count++;
    // console.log("FUnction getnewtz");
    // console.log(`booking ==> ${booking.DateTime} - ${booking.Duration}`);
    booking.DateTime.tz(tz);
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
