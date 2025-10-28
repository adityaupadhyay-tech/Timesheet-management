'use client'

import { useState } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'



export function DatePickerComponent({ value, onChange, className, placeholder = "Select date" }) {
  const [isOpen, setIsOpen] = useState(false)

  const CustomInput = ({ value, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-lg text-xs sm:text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer w-full sm:min-w-[180px]",
        className
      )}
    >
      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
      <span className="text-gray-700 truncate">{value || placeholder}</span>
      <svg className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        dateFormat="MM/dd/yyyy"
        placeholderText={placeholder}
        autoComplete="off"
      />
    </div>
  )
}
