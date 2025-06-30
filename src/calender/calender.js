import React, { useState , useEffect, useRef } from "react";
import "react-calendar/dist/Calendar.css";
import "./calender.css";
import Calendar from "react-calendar";
import moment from "moment";
import CalendarContainer from "./CalendarContainer.js";
import DropdownButton from "./DropdownButton.js";
import CalendarWrapper from "./CalendarWrapper.js";

const formatDate = (date) => moment(date).format("YYYY-MM-DD");

const CustomCalendar = ({ onChange, value }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateLabel, setSelectedDateLabel] = useState("날짜");
  const [isOpen, setIsOpen] = useState(false);
  const [memos, setMemos] = useState({});
  const [showMemoInput, setShowMemoInput] = useState(false);
  const [memoPosition, setMemoPosition] = useState({ top: 0, left: 0 });

  const dateRefs = useRef({});

  const toggleCalendar = () => {
    setIsOpen((prev) => !prev);
  };

  const handleDateChange = (date) => {
    if (typeof onChange === "function") {
      onChange(date);
    }
    setSelectedDate(date);
    setSelectedDateLabel(moment(date).format("YYYY년 MM월 DD일"));
    setShowMemoInput(true);
    setIsOpen(false);
  };

  const handleMemoChange = (e) => {
    const key = formatDate(selectedDate);
    setMemos({ ...memos, [key]: e.target.value });
  };

  useEffect(() => {
    if (selectedDate && dateRefs.current[formatDate(selectedDate)]) {
      const target = dateRefs.current[formatDate(selectedDate)];
      const rect = target.getBoundingClientRect();
      setMemoPosition({
        top: rect.top + window.scrollY - 480,
        left: rect.left + window.scrollX - 280,
      });
    }
  }, [selectedDate]);


  return (
    <CalendarContainer>
      <DropdownButton onClick={toggleCalendar}>
        {selectedDateLabel}
      </DropdownButton>
      <CalendarWrapper isOpen={isOpen}>
        <Calendar
          onChange={handleDateChange}
          value={value}
          tileContent={({ date }) => {
            const key = formatDate(date);
            return (
              <div
                ref={(el) => {(dateRefs.current[key] = el)}}
                className="calender-cell-wrapper"
                >
                  {memos[key] ? <span className="memo-dot">●</span> : null}
              </div>
            )
          }}
          tileClassName={({ date }) => {
            const isSelected =
              selectedDate && formatDate(date) === formatDate(selectedDate);
            return isSelected ? "active-date" : null;
          }}
        />
      </CalendarWrapper>

      {showMemoInput && selectedDate && (
        <div className="memo-popup"
        style={{
          position: "absolute",
          top : `${memoPosition.top}px`,
          left: `${memoPosition.left}px`,
          zIndex: 1000,
        }}
        >
          <h4>{formatDate(selectedDate)} 메모</h4>
        <div className="memoarea">
          <textarea
              rows="4"
              value={memos[formatDate(selectedDate)] || ""}
              onChange={handleMemoChange}
            ></textarea>
            <button className="memoareabtn" onClick={() => setShowMemoInput(false)}>저장</button>
          </div>
        </div>
      )}
    </CalendarContainer>
  );
};

export default CustomCalendar;