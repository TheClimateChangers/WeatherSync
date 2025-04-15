import React from 'react';
import DatePicker from 'react-datepicker';

const DateCalendar = ({ startDate, endDate, onDateChange, dateRange }) => (
  <div className="p-6">
    <h3>Pick a date range:</h3>
    <DatePicker
      selected={startDate}
      onChange={onDateChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
      inline
    />
    <p>{dateRange}</p>
  </div>
);

export default DateCalendar;
