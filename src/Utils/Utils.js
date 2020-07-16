import moment from "moment-timezone";
import Timezones from "./Timezones";
moment().format();
const TO_MILLISECONDS = 1000;

export function getStartAndEndHours(doc, data) {
  const { id } = doc;
  const { StartHours, EndHours, Duration, Timezone } = data;

  const { seconds: startSeconds, nanoseconds: startNanoSeconds } = StartHours;
  const { seconds: endSeconds, nanoseconds: endNanoSeconds } = EndHours;

  const momentStart = moment(startSeconds * TO_MILLISECONDS);
  const momentEnd = moment(endSeconds * TO_MILLISECONDS);

  console.log(`id ==> ${id}`);
  console.log(`Timezone ==> ${Timezone}`);
  // console.log(`Duration ==> ${Duration}`);
  // console.log(`StartHours ==> ${StartHours}`);
  // console.log(`startSeconds ==> ${startSeconds}`);
  // console.log(`startNanoSeconds ==> ${startNanoSeconds}`);
  // console.log(`EndHours ==> ${EndHours}`);
  // console.log(`endSeconds ==> ${endSeconds}`);
  // console.log(`endNanoSeconds ==> ${endNanoSeconds}`);

  console.log(`momentStart ==> ${momentStart}`);
  console.log(`momentEnd ==> ${momentEnd}`);
  console.log(`-----`);
  // momentStart.utc();
  // momentEnd.utc();
  // console.log(`momentStart ==> ${momentStart}`);
  // console.log(`momentEnd ==> ${momentEnd}`);
  // console.log(`-----`);
  momentStart.tz(Timezone);
  momentEnd.tz(Timezone);
  console.log(`momentStart ==> ${momentStart}`);
  console.log(`momentEnd ==> ${momentEnd}`);
  console.log(`-----`);
  console.log(`*****************************\n`);
}
