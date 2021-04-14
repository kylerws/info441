import React, { useState, useEffect, useContext, createContext } from 'react'
import { useAuth } from './useAuth'
import api from '../constants/APIEndpoints'
import { DateTime } from 'luxon'

// Schedules context
const schedContext = createContext()

export function ProvideSchedule({ children }) {
  const 
}