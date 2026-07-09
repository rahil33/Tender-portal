const formatDate = (date, format = 'YYYY-MM-DD') => {
  const d = new Date(date);
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
};

const formatDateTime = (date) => {
  return formatDate(date, 'YYYY-MM-DD HH:mm:ss');
};

const getStartOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfDay = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfMonth = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

const getStartOfYear = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const getEndOfYear = (date = new Date()) => {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
};

const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const subtractDays = (date, days) => {
  return addDays(date, -days);
};

const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const addYears = (date, years) => {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
};

const getDaysDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const getHoursDifference = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60));
};

const isToday = (date) => {
  const d = new Date(date);
  const today = new Date();
  return d.toDateString() === today.toDateString();
};

const isYesterday = (date) => {
  const d = new Date(date);
  const yesterday = subtractDays(new Date(), 1);
  return d.toDateString() === yesterday.toDateString();
};

const isThisWeek = (date) => {
  const d = new Date(date);
  const now = new Date();
  const weekAgo = subtractDays(now, 7);
  return d >= weekAgo && d <= now;
};

const isThisMonth = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

const isThisYear = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getFullYear() === now.getFullYear();
};

const getTimeAgo = (date) => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };
  
  if (seconds < intervals.minute) return 'just now';
  if (seconds < intervals.hour) return `${Math.floor(seconds / intervals.minute)} minutes ago`;
  if (seconds < intervals.day) return `${Math.floor(seconds / intervals.hour)} hours ago`;
  if (seconds < intervals.week) return `${Math.floor(seconds / intervals.day)} days ago`;
  if (seconds < intervals.month) return `${Math.floor(seconds / intervals.week)} weeks ago`;
  if (seconds < intervals.year) return `${Math.floor(seconds / intervals.month)} months ago`;
  
  return `${Math.floor(seconds / intervals.year)} years ago`;
};

const isValidDate = (date) => {
  const d = new Date(date);
  return d instanceof Date && !isNaN(d);
};

module.exports = {
  formatDate,
  formatDateTime,
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getEndOfMonth,
  getStartOfYear,
  getEndOfYear,
  addDays,
  subtractDays,
  addMonths,
  addYears,
  getDaysDifference,
  getHoursDifference,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getTimeAgo,
  isValidDate,
};