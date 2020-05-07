const filterBySlug = (array, slug) => array.filter((el) => el.slug === slug);

const findKeyInDetails = (key) => (details) =>
  details.find((el) => el.key === key);

const getDetails = (data) => (data && data.details) || [];

const getSeries = (data) => (data && data.series) || [];

const _pipe = (func1, func2) => (args) => func2(func1(args));

const pipe = (...functions) => functions.reduce(_pipe);

const fallbackArrayPosition = (array) => (position, isStart) =>
  position === -1 ? (isStart ? 0 : array.length - 1) : position;

const isValidDateString = (date) => isNaN(new Date(date));

/**
 * Implements binary search to return position in series array for a specific
 * date. Since array is already sorted, using this time complexity goes down to O(logN).
 * Using linear search for that huge amount of data could be heavy (time complexity O(N))
 * @param array
 * @returns {function(*=): number}
 */
const searchDateInSeries = (array) => (toSearch) => {
  const searchDateInSeriesRecursive = (start = 0, end = array.length) => {
    if (start > end) {
      return -1;
    }

    const middle = start + Math.floor((end - start) / 2);
    const arrayMiddleDate = new Date(array[middle].x);
    const dateToSearch = new Date(toSearch);

    if (arrayMiddleDate.getTime() === dateToSearch.getTime()) {
      return middle;
    }
    return arrayMiddleDate.getTime() > dateToSearch.getTime()
      ? searchDateInSeriesRecursive(start, middle - 1)
      : searchDateInSeriesRecursive(middle + 1, end);
  };
  return array.length ? searchDateInSeriesRecursive() : -1;
};

module.exports = {
  filterBySlug,
  findKeyInDetails,
  getDetails,
  searchDateInSeries,
  getSeries,
  pipe,
  fallbackArrayPosition,
  isValidDateString
};
