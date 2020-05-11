const {
  findKeyInDetails,
  getDetails,
  pipe,
  getSeries,
  searchDateInSeries,
  filterBySlug,
  fallbackArrayPosition,
} = require("./utils");

const findPropInData = (data) => (propKey) =>
  pipe(getDetails, findKeyInDetails(propKey), getSeries)(data);

const searchScoresStartAndEndPositionsByDates = (scores) => (start, end) => [
  searchDateInSeries(scores)(start),
  searchDateInSeries(scores)(end),
];

const searchScoresStarAndEndPositionsWithFallbackByDates = (scores) => (
  start,
  end
) => [
  fallbackArrayPosition(scores)(searchDateInSeries(scores)(start), true),
  fallbackArrayPosition(scores)(searchDateInSeries(scores)(end), false),
];

const getScoreWithExtras = (
  scores,
  extras,
  startScoresPosition,
  endScoresPosition,
  title
) => {
  const result = [];
  for (let i = startScoresPosition; i <= endScoresPosition; i++) {
    const score = scores[i];
    const extra =
      scores.length === extras.length
        ? extras[i]
        : extras[searchDateInSeries(extras)(score.x)];
    result.push({
      title: title,
      date: score.x,
      score: score.y,
      extra: { ...(extra ? extra.y : extra) },
    });
  }
  return result;
};

/**
 * Basic version of the function.
 * Retrieve set of data in "scores" between 2 dates given as input.
 * Filters data by "aggregation-overall" and returns scores for each of them.
 * This version ALWAYS expects start and end dates included in the series!
 * Moreover it does not perform any checks so, if for ex. score is missing in data,
 * an empty array will be assigned to scores and search function will return -1 as if
 * it didn't find anything and it won't work.
 * Having data injected as first param will allow easily testing this function by injecting
 * any kind of data to cover different cases.
 * Time complexity: O(M * log(S)), M length of aggregation-overall, S length of scores
 * Space complexity: O(M * S), M length of aggregation-overall, S length of scores
 * @param data
 * @returns {function(*=, *=): *} a function accepting start and end as valid date
 * strings(ex. "2017-01-17T12:51:49.637937Z")
 */
const basicGetInfoFromSeries = (data) => (start, end) =>
  filterBySlug(data, "aggregation-overall").reduce((acc, slug) => {
    const scores = findPropInData(slug)("score");
    const [
      startPosition,
      endPosition,
    ] = searchScoresStartAndEndPositionsByDates(scores)(start, end);
    acc.push(...scores.slice(startPosition, endPosition + 1));
    return acc;
  }, []);

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
 * Having data injected as first param will allow easily testing this function by injecting
 * any kind of data to cover different cases.
 * Time complexity: O(M * S * log(S + E)), M length of aggregation-overall, N length of scores, E length of extras
 * Space complexity: O(M * S), M length of aggregation-overall, S length of scores
 * @param data
 * @returns {function(...[*]=)} a function accepting start and end as valid date
 * strings(ex. "2017-01-17T12:51:49.637937Z")
 */
const getInfoFromSeries = (data) => (start, end) => {
  const { isValidDateString } = require("./utils");

  if (!isValidDateString(start) || !isValidDateString(end)) {
    return {};
  }

  return filterBySlug(data, "aggregation-overall").reduce((acc, slug) => {
    const findProp = findPropInData(slug);
    const scores = findProp("score");
    if (scores.length) {
      const [
        startPosition,
        endPosition,
      ] = searchScoresStarAndEndPositionsWithFallbackByDates(scores)(
        start,
        end
      );
      acc.push(
        ...getScoreWithExtras(
          scores,
          findProp("extra"),
          startPosition,
          endPosition,
          slug.title
        )
      );
    }
    return acc;
  }, []);
};

const data = require("./fake-data/data").data;

console.log(
  basicGetInfoFromSeries(data)(
    "2017-01-17T12:51:49.637937Z",
    "2017-01-17T17:27:12.822450Z"
  )
);

console.log(
  getInfoFromSeries(data)(
    "2017-01-17T12:51:49.637937Z",
    "2017-01-17T17:27:12.822450Z"
  )
);
