import React, { useState, useEffect } from 'react'

export default function TimeSlotPicker({ value = '', onChange = () => {} }) {
  const [fromTime, setFromTime] = useState('')
  const [toTime, setToTime] = useState('')
  const [period, setPeriod] = useState('AM')

  useEffect(() => {
    // Parse existing value if it exists (format: "12-5 PM")
    if (value) {
      const match = value.match(/(\d{1,2})-(\d{1,2})\s*(AM|PM)/i)
      if (match) {
        setFromTime(String(match[1]).padStart(2, '0'))
        setToTime(String(match[2]).padStart(2, '0'))
        setPeriod(match[3].toUpperCase())
      }
    }
  }, [value])

  const handleChange = (from, to, per) => {
    if (from && to) {
      const formattedValue = `${from}-${to} ${per}`
      onChange(formattedValue)
    }
  }

  const handleFromChange = (e) => {
    const val = e.target.value
    setFromTime(val)
    handleChange(val, toTime, period)
  }

  const handleToChange = (e) => {
    const val = e.target.value
    setToTime(val)
    handleChange(fromTime, val, period)
  }

  const handlePeriodChange = (e) => {
    const val = e.target.value
    setPeriod(val)
    handleChange(fromTime, toTime, val)
  }

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 flex items-center gap-2 bg-slate-700/40 border border-slate-600 rounded-lg p-3">
        {/* From Time */}
        <input
          type="number"
          min="1"
          max="12"
          value={fromTime}
          onChange={handleFromChange}
          placeholder="From"
          className="w-16 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-center font-semibold"
        />
        
        {/* Dash separator */}
        <span className="text-slate-300 font-bold text-lg">-</span>
        
        {/* To Time */}
        <input
          type="number"
          min="1"
          max="12"
          value={toTime}
          onChange={handleToChange}
          placeholder="To"
          className="w-16 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-center font-semibold"
        />
        
        {/* Period Selector */}
        <select
          value={period}
          onChange={handlePeriodChange}
          className="ml-auto bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm font-semibold text-indigo-300"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      {/* Display preview */}
      {fromTime && toTime && (
        <div className="px-4 py-2 bg-gradient-to-r from-indigo-600/30 to-indigo-500/30 border border-indigo-500/60 rounded-lg text-sm font-bold text-indigo-200 whitespace-nowrap min-w-max">
          🕐 {fromTime}-{toTime} {period}
        </div>
      )}
    </div>
  )
}
