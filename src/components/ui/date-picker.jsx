'use client'

import { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react'
import DatePicker from 'react-datepicker'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import 'react-datepicker/dist/react-datepicker.css'



export const DatePickerComponent = forwardRef(({ value, onChange, className, placeholder = "Select date", filterDate }, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  
  // Expose method to open the date picker
  useImperativeHandle(ref, () => ({
    open: () => {
      setIsOpen(true)
      // Trigger click on the input button
      if (inputRef.current) {
        inputRef.current.click()
      }
    },
    close: () => setIsOpen(false),
    // Expose refs for direct access
    inputElement: inputRef.current,
    container: containerRef.current
  }))

  const CustomInput = ({ value, onClick }) => {
    return (
      <button
        ref={inputRef}
        type="button"
        onClick={onClick}
        className={cn(
          "flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md text-sm font-normal focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white hover:border-gray-400 transition-all duration-200 cursor-pointer w-full",
          className
        )}
      >
        <Calendar className="h-4 w-4 text-gray-400" />
        <span className="text-gray-700 truncate flex-1 text-left">{value || placeholder}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full">
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
        popperPlacement="bottom-start"
        dayClassName={(date) => {
          const today = new Date()
          const isToday = date.toDateString() === today.toDateString()
          const isSelected = value && date.toDateString() === value.toDateString()
          
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
        dateFormat="MM-dd-yyyy"
        placeholderText={placeholder}
        autoComplete="off"
        filterDate={filterDate}
      />
    </div>
  )
})

DatePickerComponent.displayName = 'DatePickerComponent'
