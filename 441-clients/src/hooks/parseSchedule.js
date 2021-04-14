// import React from 'react'
import moment from 'moment'
import { days, dayIDs } from '../constants/AvailabilityTypes'

// Parses schedule for display
//
// schedule: array of schedule objects from server
// fillEmpty: boolean to fill in unavailable days, default false
// formatTime: callback function for formatting times
export const parseSchedule = ({schedule, fillEmpty, formatTime}) => {
  if (!schedule)
    return

  // Remove unavailable days
  schedule = schedule.filter(d => d.hasAvailability)
  
  // Parse values
  schedule = schedule.map(d => {
    return {id: dayIDs[d.day], day: toUpper(d.day), start: formatTime(d.startTime), end: formatTime(d.endTime)}
  })
  
  // Fill empty days?
  if (fillEmpty) {
    days.forEach(d => {
      if (schedule.filter(e => e.id === d.id).length === 0) {
        schedule.push({id: d.id})
      }
    })
  }

  // Sort Sunday to Saturday
  schedule.sort((a, b) => a.id - b.id)

  return schedule
}

// Takes DateTime and returns 24 hour as int
export function toGridTime(datetime) {
  return parseInt(moment(datetime).local().format('H'))
}
 
// Takes DateTime and parses to readable AM/PM format
export function toDisplayTime(datetime) {
  return moment(datetime).local().format('h A')
}

// Takes hour as int and convert to ISO UTC format for mongoDB
function toMongoDate(hour) {
  const local = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0})
  var test = local.toISOString()
  // var test = moment({'year': 1998, 'month': 0, 'date': 1, 'hour': hour, 'minute': 0}).toISOString()
  // console.log("Tried to convert to: " + test)
  return test
}

function toUpper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}