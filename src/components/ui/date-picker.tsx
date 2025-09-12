'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'

interface DatePickerProps {
  value: Date
  onChange: (date: Date) => void
  className?: string
  placeholder?: string
}

export function DatePickerComponent({ value, onChange, className, placeholder = "Select date" }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const CustomInput = ({ value, onClick }: { value?: string; onClick?: () => void }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer min-w-[180px]",
        className
      )}
    >
      <Calendar className="h-4 w-4 text-gray-400" />
      <span className="text-gray-700">{value || placeholder}</span>
      <svg className="h-4 w-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )

  return (
    <div className="relative">
      <DatePicker
        selected={value}
        onChange={(date) => {
          if (date) {
            onChange(date)
            setIsOpen(false)
          }
        }}
        customInput={<CustomInput />}
        open={isOpen}
        onSelect={() => setIsOpen(false)}
        onClickOutside={() => setIsOpen(false)}
        onInputClick={() => setIsOpen(true)}
        showPopperArrow={false}
        popperClassName="react-datepicker-popper"
        calendarClassName="react-datepicker-custom"
        dayClassName={(date) => {
          const today = new Date()
          const isToday = date.toDateString() === today.toDateString()
          const isSelected = date.toDateString() === value.toDateString()
          
          return cn(
            "react-datepicker__day",
            isToday && "react-datepicker__day--today",
            isSelected && "react-datepicker__day--selected"
          )
        }}
        formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 3)}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        yearDropdownItemNumber={20}
        scrollableYearDropdown
        maxDate={new Date()}
        dateFormat="MMM dd, yyyy"
        placeholderText={placeholder}
        autoComplete="off"
      />
      
      <style jsx global>{`
        .react-datepicker-popper {
          z-index: 9999 !important;
        }
        
        .react-datepicker-custom {
          border: 1px solid #e5e7eb !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
          font-family: inherit !important;
        }
        
        .react-datepicker__header {
          background-color: #f9fafb !important;
          border-bottom: 1px solid #e5e7eb !important;
          border-radius: 0.5rem 0.5rem 0 0 !important;
          padding: 1rem !important;
        }
        
        .react-datepicker__current-month {
          font-size: 0.875rem !important;
          font-weight: 600 !important;
          color: #111827 !important;
          margin-bottom: 0.5rem !important;
        }
        
        .react-datepicker__day-names {
          margin-bottom: 0.5rem !important;
        }
        
        .react-datepicker__day-name {
          color: #6b7280 !important;
          font-size: 0.75rem !important;
          font-weight: 500 !important;
          width: 2rem !important;
          line-height: 2rem !important;
        }
        
        .react-datepicker__day {
          width: 2rem !important;
          height: 2rem !important;
          line-height: 2rem !important;
          border-radius: 0.375rem !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
          transition: all 0.2s !important;
        }
        
        .react-datepicker__day:hover {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
        }
        
        .react-datepicker__day--today {
          background-color: #dbeafe !important;
          color: #1d4ed8 !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
        }
        
        .react-datepicker__day--selected:hover {
          background-color: #2563eb !important;
        }
        
        .react-datepicker__day--outside-month {
          color: #d1d5db !important;
        }
        
        .react-datepicker__navigation {
          top: 1rem !important;
          width: 2rem !important;
          height: 2rem !important;
          border-radius: 0.375rem !important;
          transition: all 0.2s !important;
        }
        
        .react-datepicker__navigation:hover {
          background-color: #f3f4f6 !important;
        }
        
        .react-datepicker__navigation--previous {
          left: 1rem !important;
        }
        
        .react-datepicker__navigation--next {
          right: 1rem !important;
        }
        
        .react-datepicker__month-dropdown,
        .react-datepicker__year-dropdown {
          background-color: white !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 0.375rem !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          max-height: 12rem !important;
          overflow-y: auto !important;
        }
        
        .react-datepicker__month-option,
        .react-datepicker__year-option {
          padding: 0.5rem 0.75rem !important;
          font-size: 0.875rem !important;
          color: #374151 !important;
          transition: all 0.2s !important;
        }
        
        .react-datepicker__month-option:hover,
        .react-datepicker__year-option:hover {
          background-color: #f3f4f6 !important;
        }
        
        .react-datepicker__month-option--selected,
        .react-datepicker__year-option--selected {
          background-color: #3b82f6 !important;
          color: white !important;
          font-weight: 600 !important;
        }
      `}</style>
    </div>
  )
}
