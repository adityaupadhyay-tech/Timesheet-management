'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PayCycleSelector = ({ onContinue }) => {
  const router = useRouter()
  const [selectedCycle, setSelectedCycle] = useState(null)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8)) // September 2025
  
  // Sample data - in a real app this would come from an API
  const [payCycles] = useState([
    {
      company: 'California PSL Testing Company',
      cycles: [
        { id: 'cal-bi-weekly-1', type: 'Bi-weekly', endDate: '9/22/2025', date: new Date(2025, 8, 22) },
        { id: 'cal-weekly-1', type: 'Weekly', endDate: '9/23/2025', date: new Date(2025, 8, 23) },
        { id: 'cal-bi-weekly-2', type: 'Bi-weekly', endDate: '9/19/2025', date: new Date(2025, 8, 19) },
        { id: 'cal-bi-weekly-3', type: 'Bi-weekly', endDate: '9/19/2025', date: new Date(2025, 8, 19) }
      ]
    },
    {
      company: 'Demo Taco Company',
      cycles: [
        { id: 'taco-bi-weekly-1', type: 'Bi-weekly', endDate: '9/19/2025', date: new Date(2025, 8, 19) },
        { id: 'taco-weekly-1', type: 'Weekly', endDate: '9/19/2025', date: new Date(2025, 8, 19) }
      ]
    },
    {
      company: "Praline's Frock Shop",
      cycles: [
        { id: 'praline-weekly-1', type: 'Weekly', endDate: '9/23/2025', date: new Date(2025, 8, 23) }
      ]
    },
    {
      company: "Fred's Flower Shop",
      cycles: [
        { id: 'fred-bi-weekly-1', type: 'Bi-weekly', endDate: '9/23/2025', date: new Date(2025, 8, 23) },
        { id: 'fred-bi-weekly-2', type: 'Bi-weekly', endDate: '9/12/2025', date: new Date(2025, 8, 12) }
      ]
    },
    {
      company: "Laurie's Law Office",
      cycles: [
        { id: 'laurie-weekly-1', type: 'Weekly', endDate: '9/20/2025', date: new Date(2025, 8, 20) }
      ]
    }
  ])

  // Get all available dates for the calendar
  const getAvailableDates = () => {
    const dates = new Set()
    payCycles.forEach(company => {
      company.cycles.forEach(cycle => {
        if (cycle.date.getMonth() === currentMonth.getMonth() && 
            cycle.date.getFullYear() === currentMonth.getFullYear()) {
          dates.add(cycle.date.getDate())
        }
      })
    })
    return dates
  }

  const availableDates = getAvailableDates()

  const handleCycleSelect = (cycle) => {
    setSelectedCycle(cycle)
  }

  const handleDateSelect = (date) => {
    // Find the cycle that matches this date
    const targetDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), date)
    
    for (const company of payCycles) {
      for (const cycle of company.cycles) {
        if (cycle.date.getTime() === targetDate.getTime()) {
          setSelectedCycle(cycle)
          return
        }
      }
    }
  }

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev)
      newMonth.setMonth(prev.getMonth() + direction)
      return newMonth
    })
  }

  const renderCalendar = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
    
    // Day headers
    dayNames.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="calendar-day-header">
          {day}
        </div>
      )
    })
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isAvailable = availableDates.has(day)
      const isSelected = selectedCycle && selectedCycle.date.getDate() === day &&
                        selectedCycle.date.getMonth() === month &&
                        selectedCycle.date.getFullYear() === year
      
      days.push(
        <div
          key={day}
          className={`calendar-day ${isAvailable ? 'available' : 'unavailable'} ${isSelected ? 'selected' : ''}`}
          onClick={() => isAvailable && handleDateSelect(day)}
        >
          {day}
        </div>
      )
    }
    
    return days
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  return (
    <div className="pay-cycle-selector">
      <style jsx>{`
        .pay-cycle-selector {
          --primary-color: #4f46e5;
          --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          --text-color: #1f2937;
          --text-muted-color: #9ca3af;
          --border-color: #e5e7eb;
          --background-color: #ffffff;
          --hover-color: #f3f4f6;
          --selected-background: #eff6ff;
          
          font-family: var(--font-family);
          color: var(--text-color);
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-color);
        }

        .header p {
          color: var(--text-muted-color);
          font-size: 1rem;
        }

        .selector-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        @media (max-width: 768px) {
          .selector-container {
            grid-template-columns: 1fr;
          }
        }

        .pay-cycle-list {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .pay-cycle-list h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: var(--text-color);
        }

        .company-group {
          margin-bottom: 1.5rem;
        }

        .company-group:last-child {
          margin-bottom: 0;
        }

        .company-header {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }

        .cycle-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }

        .cycle-row:hover {
          background-color: var(--hover-color);
        }

        .cycle-row.selected {
          background-color: var(--selected-background);
          border-color: var(--primary-color);
        }

        .cycle-type {
          font-weight: 500;
          color: var(--text-color);
        }

        .cycle-date {
          color: var(--text-muted-color);
          font-size: 0.875rem;
        }

        .calendar-container {
          background: var(--background-color);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }

        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .calendar-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-color);
        }

        .nav-button {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 0.375rem;
          padding: 0.5rem;
          cursor: pointer;
          color: var(--text-color);
          transition: all 0.2s ease;
        }

        .nav-button:hover {
          background-color: var(--hover-color);
          border-color: var(--primary-color);
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
        }

        .calendar-day-header {
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          color: var(--text-muted-color);
          padding: 0.5rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
        }

        .calendar-day.empty {
          visibility: hidden;
        }

        .calendar-day.unavailable {
          color: var(--text-muted-color);
          cursor: not-allowed;
        }

        .calendar-day.available {
          color: var(--text-color);
          cursor: pointer;
          border: 1px solid transparent;
        }

        .calendar-day.available:hover {
          background-color: var(--hover-color);
          border-color: var(--border-color);
        }

        .calendar-day.selected {
          background-color: var(--primary-color);
          color: white;
          font-weight: 600;
        }

        .summary-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .summary-section h4 {
          font-size: 1.125rem;
          font-weight: 500;
          color: var(--text-color);
          margin-bottom: 1rem;
        }

        .selected-info {
          color: var(--primary-color);
          font-weight: 600;
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          border: none;
          border-radius: 0.5rem;
          padding: 0.75rem 2rem;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: var(--font-family);
        }

        .btn-primary:hover {
          background-color: #4338ca;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
        }

        .btn-primary:disabled {
          background-color: var(--text-muted-color);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .btn-back {
          background: none;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          color: var(--text-color);
          transition: all 0.2s ease;
          font-family: var(--font-family);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-back:hover {
          background-color: var(--hover-color);
          border-color: var(--primary-color);
          color: var(--primary-color);
        }
      `}</style>

      <div className="header">
        <div style={{ marginBottom: '1rem' }}>
          <button 
            className="btn-back"
            onClick={() => router.push('/payroll')}
          >
            ← Back to Payroll
          </button>
        </div>
        <h1>Time Entry Worksheet: Select Pay Cycle</h1>
        <p>Choose your pay cycle to begin time entry</p>
      </div>

      <div className="selector-container">
        <div className="pay-cycle-list">
          <h3>Select Pay Cycle:</h3>
          {payCycles.map((company, companyIndex) => (
            <div key={companyIndex} className="company-group">
              <div className="company-header">{company.company}</div>
              {company.cycles.map((cycle) => (
                <div
                  key={cycle.id}
                  className={`cycle-row ${selectedCycle?.id === cycle.id ? 'selected' : ''}`}
                  onClick={() => handleCycleSelect(cycle)}
                >
                  <span className="cycle-type">{cycle.type}</span>
                  <span className="cycle-date">{cycle.endDate}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="calendar-container">
          <div className="calendar-header">
            <button className="nav-button" onClick={() => navigateMonth(-1)}>
              ←
            </button>
            <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button className="nav-button" onClick={() => navigateMonth(1)}>
              →
            </button>
          </div>
          <div className="calendar-grid">
            {renderCalendar()}
          </div>
        </div>
      </div>

      <div className="summary-section">
        <h4>
          Worksheet to load: 
          <span className="selected-info">
            {selectedCycle ? `${selectedCycle.endDate} ${selectedCycle.type}` : 'Please select a pay cycle'}
          </span>
        </h4>
        <button 
          className="btn-primary" 
          disabled={!selectedCycle}
          onClick={() => onContinue && onContinue(selectedCycle)}
        >
          Continue
        </button>
      </div>
    </div>
  )
}

export default PayCycleSelector
