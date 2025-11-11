import { useState, useEffect } from 'react';
import { useStateStore } from 'mgsmu-react';
import './calendar.css';

const weekDays =
{
  'de': [
    "Mo",
    "Di",
    "Mi",
    "Do",
    "Fr",
    "Sa",
    "So",
  ],
  'en': [
    "MON",
    "TUE",
    "WED",
    "THU",
    "FRI",
    "SAT",
    "SON",
  ]
};

const months =
{
  'de': [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ],
  'en': [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ]
};

interface CalendarProps {
  clicked: (date: string) => void;
  open: boolean;
  lang?: 'de' | 'en';
}

interface CalendarVal {
  calOpen: boolean;
  entryMonth: number;
  entryYear: number;
  lang: string;
  title: string;
  selectedDate?: string;
  dueDateType?: string;
  changeMonth?: boolean;
  dir?: 'prev' | 'next';
}

interface Day {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  weekNumber: number;
}

interface WeekRow {
  weekNumber: number;
  days: Day[];
}

type Lang = 'de' | 'en';

const today = new Date();

const Calendar: React.FC<CalendarProps> = ({ clicked, open, lang = 'de' }) => {
  const [calendarVal, setCalendarVal, removeCalendarVal] = useStateStore("calendar");
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDay = today.getDate();
  const [calendar, setCalendar] = useState<Day[]>([]);
  const [weekdays] = useState<string[]>(weekDays.de);
  const [selectedDay, setSelectedDay] = useState<string | undefined>(undefined)

  const computeTitle = (lang: Lang, month: number, year: number) => {
    const monthName = months[lang]?.[month] || 'Invalid Month';
    return `${monthName} ${year}`;
  };

  useEffect(() => {//swipe
    if (!calendarVal?.changeMonth) return
    if (!calendarVal) return;
    switch (true) {
      case calendarVal.changeMonth && calendarVal.dir !== undefined:
        changeMonth(calendarVal.dir)
        break;
    }

  }, [calendarVal]);

  useEffect(() => {//init
    if (open === undefined) return;
    if (open === false) { //close Calendar
      removeCalendarVal();
      return;
    }
    setCalendarVal({
      calOpen: open,
      entryMonth: today.getMonth(),
      entryYear: today.getFullYear(),
      lang,
      title: computeTitle(lang, today.getMonth(), today.getFullYear()),
      selectedDate: '',
      dueDateType: '',
    } as CalendarVal);
  }, [open]);

  const changeMonth = (dir: string) => {
    if (!dir) return;
    setSelectedDay(undefined)
    const { entryMonth, entryYear, lang } = calendarVal
    let newMonth = entryMonth;
    let newYear = entryYear;

    if (dir === 'prev') {
      newMonth -= 1;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
    }

    setCalendarVal((prev: CalendarVal) => ({
      ...prev,
      entryMonth: newMonth,
      entryYear: newYear,
      changeMonth: undefined,
      dir: undefined,
      title: computeTitle(lang, newMonth, newYear),
    }));
  };

  const generateCalendar = () => {
    const year = calendarVal.entryYear;
    const month = calendarVal.entryMonth
    const firstDayOfMonth = new Date(year, month, 1);
    let firstWeekDay = (firstDayOfMonth.getDay() + 6) % 7; // Monday as 0, Sunday as 6
    const startDate = new Date(year, month, 1 - firstWeekDay); // Adjust to Monday of the first week

    const days = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const isCurrentMonth = date.getMonth() === month;
      const isToday =
        date.getDate() === currentDay &&
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear;

      days.push({
        date,
        isCurrentMonth,
        isToday,
        weekNumber: getISOWeekNumber(date),
      });
    }
    return days;
  };

  useEffect(() => {//build and change Cal UI
    if (!calendarVal?.entryMonth) return;
    setCalendar(generateCalendar());
  }, [calendarVal?.entryMonth]);

  const calHeadRow = () => {
    return (
      <>
        <div className="calendar_row">
          <div className="cal-row cal_kw title">KW</div>
          {weekdays.map((day, dayIndex) => (
            <div className={`cal-row cal-field weekday ${dayIndex === 0 ? 'first' : ''}`} key={dayIndex}>{day}</div>
          ))}
        </div>
      </>
    )
  };

  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);

  const formatDateOnly = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

  const clickDay = (date: Date, identifier: string) => {
    setSelectedDay(identifier);
    const formatedDate = formatDateOnly(date);
    setCalendarVal((prev: CalendarVal) => ({
      ...prev,
      title: computeTitle(lang, today.getMonth(), today.getFullYear()),
      selectedDate: formatToDateFormat(formatedDate),
      dueDateType: calcDateDiff(formatedDate),
    }));
    clicked(formatedDate); //parent
  }

  const dayElement = (day: Day, idx: string) => {
    const dayTag = day.date.getDate()
    return (<>
      <div onClick={() => clickDay(day.date, idx)} key={idx}
        className={`cal-row cal-field days ${selectedDay === idx ? 'selected' : ''} ${day.isToday ? 'cal-today' : day.isCurrentMonth ? 'cal-fut' : 'cal-pas'}`}>
        {dayTag}
      </div>
    </>)
  }

  const calBody = () => {
    return (
      <>
        {calendar.reduce<WeekRow[]>((rows, day, index) => {
          const weekNumber = day.weekNumber;
          if (index % 7 === 0) rows.push({ weekNumber, days: [] });
          rows[rows.length - 1].days.push(day);
          return rows;
        }, []).map((week, index) => (
          <div key={index} className="calendar_row">
            <div className="cal-row cal_kw">{`${week.weekNumber}`}</div>
            {week.days.map((day: Day, idx: number) => (
              <div className='day-wrapper' key={idx}>
                {dayElement(day, `${index}_${idx}`)}
              </div>
            ))}
          </div>
        ))}
      </>
    )
  }

  if (!open) return;

  return (
    <div className="calendar">
      {calHeadRow()}
      {calBody()}
    </div>
  );
};

export default Calendar;

//Exportable Helper

/** Calculates the due date status based on a target date.
 * Returns a string indicating if the date is today, upcoming, future, overdue, etc.
 * @param date - The target date as a string (YYYY-MM-DD or ISO format)
 * @returns A string representing the due date type
 */
export const calcDateDiff = ( date: string ): 'due-today' | 'upcoming' | 'future' | 'overdue' | 'long-overdue' | 'critically-overdue' | 'unknown' => {
  const targetDate = new Date(date);
  const currentDate = new Date();
  // Normalize both dates to midnight
  targetDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  const msInDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((targetDate.getTime() - currentDate.getTime()) / msInDay);
  const daysLate = Math.abs(daysDiff);

  let dueDateType: 'due-today' | 'upcoming' | 'future' | 'overdue' | 'long-overdue' | 'critically-overdue' | 'unknown';

  switch (true) {
    case daysDiff === 0:
      dueDateType = 'due-today';
      break;
    case daysDiff > 0 && daysDiff <= 7:
      dueDateType = 'upcoming';
      break;
    case daysDiff > 7:
      dueDateType = 'future';
      break;
    case daysDiff < 0 && daysLate <= 3:
      dueDateType = 'overdue';
      break;
    case daysDiff < 0 && daysLate <= 25:
      dueDateType = 'long-overdue';
      break;
    case daysDiff < 0 && daysLate > 25:
      dueDateType = 'critically-overdue';
      break;
    default:
      dueDateType = 'unknown';
      break;
  }

  return dueDateType;
};

/** Pads a number to 2 digits (polyfill for older JS targets) */
const pad2 = (n: number): string => (n < 10 ? '0' + n : '' + n);

/**Formats a date into DD.MM.YYYY (de) or MM/DD/YYYY (en) format.
 * Optionally returns a short format (omitting the year if it's the current year).
 * @param input - A date string or Date object
 * @param short - If true, returns a short version (omits year if current year)
 * @param lang - 'de' for German, 'en' for English
 * @returns Formatted date string or undefined if invalid date
 */
export const formatToDateFormat = (
  input: string | Date,
  short = false,
  lang: 'de' | 'en' = 'en'
): string | undefined => {
  const date = new Date(input);
  if (isNaN(date.getTime())) return undefined;

  const day = pad2(date.getUTCDate());
  const month = pad2(date.getUTCMonth() + 1);
  const year = date.getUTCFullYear();
  const currentYear = new Date().getUTCFullYear();
  const isCurrentYear = year === currentYear;

  switch (lang) {
    case 'de': // German: DD.MM.YYYY
      return short && isCurrentYear ? `${day}.${month}.` : `${day}.${month}.${year}`;

    case 'en': // English: MM/DD/YYYY
    default:
      return short && isCurrentYear ? `${month}/${day}` : `${month}/${day}/${year}`;
  }
};

/**
 * Returns the ISO week number for a given date.
 * ISO weeks start on Monday and the first week of the year
 * is the week with the first Thursday of the year.
 *
 * @param date - The date to calculate the week number for
 * @returns The ISO week number (1-53)
 */
export const getISOWeekNumber = (date: Date): number => {
  const target = new Date(date.valueOf());

  // Get the day number (Monday = 0, Sunday = 6)
  const dayNr = (date.getDay() + 6) % 7;

  // Set to Thursday of the current week
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();

  // Set target to Jan 1 of the year
  target.setMonth(0, 1);

  // Move to the first Thursday of the year if necessary
  if (target.getDay() !== 4) {
    target.setDate(target.getDate() + ((4 - target.getDay() + 7) % 7));
  }

  // Calculate full weeks between first Thursday and current Thursday
  return Math.ceil(((firstThursday - target.valueOf()) / 86400000 + 1) / 7);
};
