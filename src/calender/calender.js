import React, { useState } from "react";
import 'react-calendar/dist/Calendar.css';
import "./calender.css";
import Calendar from "react-calendar";
import moment from "moment";
import CalendarContainer from "./CalendarContainer";  // CalendarContainer 임포트
import DropdownButton from "./DropdownButton";  // DropdownButton 임포트
import CalendarWrapper from "./CalendarWrapper";  // CalendarWrapper 임포트

const CustomCalendar = ({ onChange, value }) => {
  const [nowDate, setNowDate] = useState("날짜");
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleCalendar = () => {
    setIsOpen(!isOpen);
  };

  const handleDateChange = (selectedDate) => {
    onChange(selectedDate);
    setIsOpen(false);
    setNowDate(moment(selectedDate).format("2025년 03월 26일"));
  };

  return (
    <CalendarContainer>
      <DropdownButton onClick={handleToggleCalendar}>{nowDate}</DropdownButton>
      <CalendarWrapper isOpen={isOpen}>
        <Calendar onChange={handleDateChange} value={value}></Calendar>
      </CalendarWrapper>
    </CalendarContainer>
  );
};

export default CustomCalendar;
