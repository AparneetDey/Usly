export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Normalizes a date or date string to YYYY-MM-DD format (local date)
 * avoiding UTC offset shifts.
 */
export const formatCalendarDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  
  // If input string is 'YYYY-MM-DD...', extract YYYY-MM-DD directly
  if (typeof dateInput === 'string' && dateInput.includes('T')) {
    const parts = dateInput.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Checks if two dates refer to the exact same calendar day
 */
export const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false;
  return formatCalendarDate(date1) === formatCalendarDate(date2);
};

/**
 * Checks if a given date is today
 */
export const isToday = (dateInput) => {
  return isSameDay(dateInput, new Date());
};

/**
 * Returns 35 or 42 grid cell objects for a given year and month.
 * Includes padding days from previous and next months.
 */
export const getDaysForMonthGrid = (year, month) => {
  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun, 1 = Mon ...
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const gridDays = [];

  // Previous month padding days
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, month - 1, daysInPrevMonth - i);
    gridDays.push({
      date: prevDate,
      dateString: formatCalendarDate(prevDate),
      dayNumber: prevDate.getDate(),
      isCurrentMonth: false,
      isPrevMonth: true,
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const currDate = new Date(year, month, d);
    gridDays.push({
      date: currDate,
      dateString: formatCalendarDate(currDate),
      dayNumber: d,
      isCurrentMonth: true,
      isPrevMonth: false,
    });
  }

  // Next month padding days to fill 5 or 6 full 7-day rows (35 or 42 cells)
  const totalCells = gridDays.length > 35 ? 42 : 35;
  const remainingCells = totalCells - gridDays.length;

  for (let d = 1; d <= remainingCells; d++) {
    const nextDate = new Date(year, month + 1, d);
    gridDays.push({
      date: nextDate,
      dateString: formatCalendarDate(nextDate),
      dayNumber: d,
      isCurrentMonth: false,
      isPrevMonth: false,
    });
  }

  return gridDays;
};
