import React, {usedState, useEffect, useState} from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


function Plan() {
    const [dateRange, setDateRange] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(null);

    const onChange = (dates) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    useEffect(() => {
        if (startDate && endDate) {
            setDateRange(`Selected date range: ${startDate.toDateString()} - ${endDate.toDateString()}`);
        } else if (startDate) {
            setDateRange(`Selected date range: ${startDate.toDateString()}`);
        } else {
            setDateRange("");
        }
    }, [startDate, endDate]);

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <DatePicker
                selected = {startDate}
                onChange = {onChange}
                startDate = {startDate}
                endDate = {endDate}
                selectsRange
                inline
            />

        <p>{dateRange}</p>

        </div>
    );
}

export default Plan;
