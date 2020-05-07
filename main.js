const data = require("./fake-data/data").data;

/**
 * Basic version of the function.
 * Retrieve set of data in "scores" between 2 dates given as input.
 * Filters data by "aggregation-overall" and returns scores for each of them.
 * This version ALWAYS expects start and end dates included in the series!
 * Moreover it does not perform any checks so, if for ex. score is missing in data,
 * an empty array will be assigned to scores and search function will return -1 as if
 * it didn't find anything and it won't work.
 * Time complexity: O(M * log(S)), M length of aggregation-overall, S length of scores
 * Space complexity: O(M * S), M length of aggregation-overall, S length of scores
 * @param start - a valid string date ("2017-01-17T12:51:49.637937Z")
 * @param end - a valid string date
 * @returns {*} => array of arrays (one for each aggregation-overall) containing scores.
 */
const basicGetInfoFromSeries = (start, end) => {
  const {
    filterBySlug,
    findKeyInDetails,
    getDetails,
    searchDateInSeries,
    getSeries,
    pipe,
  } = require("./utils");

  return filterBySlug(data, "aggregation-overall").reduce((acc, slug) => {
    const scores = pipe(getDetails, findKeyInDetails("score"), getSeries)(slug);
    const searchScorePositionByDate = searchDateInSeries(scores);
    const [startPosition, endPosition] = [
      searchScorePositionByDate(start),
      searchScorePositionByDate(end),
    ];
    acc.push(...scores.slice(startPosition, endPosition + 1));
    return acc;
  }, []);
};

/**
 * Complete version of the function.
 * Retrieve set of data in "scores" between 2 dates given as input.
 * Filters data by "aggregation-overall" and returns scores for each of them.
 * Start and end dates don't need to be present in the series.
 * If date not present in scores, missing "start" will fallback to first position,
 * missing "end" will fallback to last position.
 * Assumption: position in scores, reflected as they are in extras. If those two arrays have different
 * lengths, date will be searched also in extras (only in this case), as fallback.
 * This is done to reduce computation and avoid searching extras for each score every.
 * Time complexity: O(M * S * log(S + E)), M length of aggregation-overall, N length of scores, E length of extras
 * Space complexity: O(M * S), M length of aggregation-overall, S length of scores
 * @param start - a valid string date ("2017-01-17T12:51:49.637937Z")
 * @param end - a valid string date
 * @returns {*} an object including slug title, x position, score (y) and extra info for mouseover or an empty object
 * in case of invalid dates passed as input
 */
const getInfoFromSeries = (start, end) => {
  const {
    filterBySlug,
    findKeyInDetails,
    getDetails,
    searchDateInSeries,
    getSeries,
    pipe,
    fallbackArrayPosition,
    isValidDateString,
  } = require("./utils");

  if (!isValidDateString(start) || !isValidDateString(end)) {
    return {};
  }

  return filterBySlug(data, "aggregation-overall").reduce((acc, slug) => {
    const scores = pipe(getDetails, findKeyInDetails("score"), getSeries)(slug);
    if (scores.length) {
      const searchScorePositionByDate = searchDateInSeries(scores);
      const fallBack = fallbackArrayPosition(scores);
      const [startPosition, endPosition] = [
        fallBack(searchScorePositionByDate(start), true),
        fallBack(searchScorePositionByDate(end), false),
      ];
      const extras = pipe(
        getDetails,
        findKeyInDetails("extra"),
        getSeries
      )(slug);
      for (let i = startPosition; i <= endPosition; i++) {
        const score = scores[i];
        const extra =
          scores.length === extras.length
            ? extras[i]
            : extras[searchDateInSeries(extras)(score.x)];
        // result object can also contains props from the slug. adding title as example
        acc.push({
          title: slug.title,
          date: score.x,
          score: score.y,
          extra: { ...(extra ? extra.y : extra) },
        });
      }
    }
    return acc;
  }, []);
};

console.log(
  basicGetInfoFromSeries(
    "2017-01-17T12:51:49.637937Z",
    "2017-01-17T17:27:12.822450Z"
  )
);

console.log(
  getInfoFromSeries(
    "2017-01-17T12:51:49.637937Z",
    "2017-01-17T17:27:12.822450Z"
  )
);
