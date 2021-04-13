// import React from 'react'
import moment from 'moment'
import { days, dayIDs } from '../constants/AvailabilityTypes'

export const parseSchedule = ({schedule, fillEmpty, formatTime}) => {
  if (!schedule)
    return

  schedule = schedule.map(d => {
    return {id: dayIDs[d.day], day: toUpper(d.day), start: formatTime(d.startTime), end: formatTime(d.endTime)}
  })

  if (fillEmpty) {
    days.forEach(d => {
      if (schedule.filter(e => e.id === d.id).length === 0) {
        schedule.push({id: d.id})
      }
    })
  }

  schedule.sort((a, b) => a.id - b.id)

  return schedule
}

export function toGridTime(datetime) {
  return parseInt(moment(datetime).local().format('H'))
}
 
// Takes DateTime returned by mongoDB and parses to a readable format
export function toDisplayTime(datetime) {
  return moment(datetime).local().format('h:mm A')
}

// Takes hour as int and convert to ISO UTC format for mongoDB
function toMongoDate(hour) {
  console.log("Got: " + hour)
  const local = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0})
  console.log(local)
  var test = local.toISOString()
  // var test = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0}).toISOString()
  // console.log("Tried to convert to: " + test)
  console.log(test)
  console.log(local.toISOString())
  console.log(local.toString())
  return test
}

function toUpper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}