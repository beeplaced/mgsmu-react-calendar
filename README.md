# mgsmu-react-calendar - Minimal Global State Management Utility

mgsmu-react-calendar is a lightweight, fully TypeScript-compatible React calendar component.
It provides a flexible, locale-aware calendar with week numbers, selectable days, and customizable date formatting. Unlike heavy calendar libraries, mgsmu-calendar is simple, minimal, and easy to integrate into any React project.

## Features

- Lightweight & fast — minimal dependencies.
- Locale support — 'de' (German) and 'en' (English) built-in.
- Week numbers — ISO 8601 week numbering.
- Selectable days — click a day to trigger a callback.
- Date formatting — configurable short or full formats.
- Due date calculation — easily determine if a date is today, upcoming, overdue, etc.
- Global state integration — works seamlessly with mgsmu-react for shared state management.

## Dependencies

mgsmu-react-calendar relies on [mgsmu-react](https://www.npmjs.com/package/mgsmu-react) for lightweight global state management.
It uses mgsmu-react’s pub-sub mechanism to store and update calendar state across components.

If you haven’t installed it yet, you can add it with:
```bash
npm install mgsmu-react
# or
yarn add mgsmu-react
```


## install
```bash
npm install --save mgsmu-react-calendar
# or 
yarn add mgsmu-react-calendar

```

## Usage in any component

```jsx
import { useEffect, useState } from "react";
import Calendar from 'mgsmu-react-calendar';
import { useStateStore } from 'mgsmu-react'; //global State Management, e.g. if Header of button are used in different components
import 'mgsmu-react-calendar/calendar.css';

const Example = () => {
  const [calendarVal, setCalendarVal, removeCalendarVal] = useStateStore("calendar");
  const [open, setOpen] = useState<boolean | undefined>(undefined);

  const clicked = (entry: string) => { //do stuff with clicked date (optionally)
    console.log("clicked", entry);
  };

  useEffect(() => {//open Calendar on mount
    if (!calendarVal) {
      setOpen(true);
      return;
    }
  }, [calendarVal]);

  const swipe = (dir: 'prev' | 'next') => {
    if (!calendarVal) return;
    setCalendarVal({ ...calendarVal, changeMonth: true, dir });
  };

  return (
    <div className="page">
      <div className="calendar-title-row">
        <div>{calendarVal?.title}</div>
        <div onClick={() => swipe('prev')}>prev</div>
        <div onClick={() => swipe('next')}>next</div>
      </div>
      {calendarVal?.selectedDate && <div>selected: {calendarVal.selectedDate}</div>}
      {calendarVal?.dueDateType && <div>{calendarVal.dueDateType}</div>}
      <Calendar clicked={clicked} open={open} lang={'de'} />
    </div>
  );
};

export default Example;

```
### Styling

You can customize the appearance by overriding CSS variables in your global styles:
```jsx
:root {
  --calendar-title-row-bck-clr: lightcoral;
  --kw-txt-clr: blue;
  --weekday-txt-clr: darkgoldenrod;
  --border-color: black;
  --field-width: 50px;
  --field-height: 50px;
  --days-font-weight: 500;
  --days-font-size: 110%;
  --days-border-color: transparent;
  --days-border-width: 4px;
}
```
## CalendarValues

The CalendarValue holds the following data, which can be used in Parent Components

```jsx
interface CalendarVal {
  calOpen: boolean;
  entryMonth: number; //default currentMonth
  entryYear: number; //default currentYear
  lang: string; //default 'de'
  title: string;
  selectedDate?: string;
  dueDateType?: string;
  changeMonth?: boolean;
  dir?: 'prev' | 'next';
}
```
### Due Date Types

The calcDateDiff helper returns one of the following strings to indicate the status of a date relative to today:

- useable as external fn

```jsx
import { calcDateDiff } from 'mgsmu-react-calendar';
const dueDateType = calcDateDiff(date);
```
| Type                 | Meaning                                                      |
| -------------------- | ------------------------------------------------------------ |
| `due-today`          | The date is **today**.                                       |
| `upcoming`           | The date is **within the next 7 days** (exclusive of today). |
| `future`             | The date is **more than 7 days in the future**.              |
| `overdue`            | The date is **past** and **up to 3 days late**.              |
| `long-overdue`       | The date is **past** and **between 4 and 25 days late**.     |
| `critically-overdue` | The date is **past** and **more than 25 days late**.         |
| `unknown`            | Any date that **cannot be classified**, e.g., invalid input. |
----

### Date Formating

Formats a date into DD.MM.YYYY (de) or MM/DD/YYYY (en) format.

```jsx
import { formatToDateFormat } from 'mgsmu-react-calendar';
const dueDateType = formatToDateFormat( 
  input: string | Date,
  short = false, //optionally returns a short format (omitting the year if it's the current year)
  lang: 'de' | 'en' = 'en'
);

```
# Changelog

All notable changes to this project will be documented in this file.
---
<!-- 
## [0.0.1] - 2025-11-11
### Upload -->