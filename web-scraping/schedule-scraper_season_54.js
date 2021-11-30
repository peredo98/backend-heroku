/*
Season: 54 (year 2020-2021)
Source: "https://www.pro-football-reference.com/years/2020/games.htm
Warning: format of site changes when season starts
*/

const request = require("request-promise");
const cheerio = require("cheerio");
const cheerioTableparser = require("cheerio-tableparser");

const { TEAM_LONG_TO_ABBR } = require("./team-name-map");

const MONTHS = new Map([
  ["January", 0],
  ["February", 1],
  ["March", 2],
  ["April", 3],
  ["May", 4],
  ["June", 5],
  ["July", 6],
  ["August", 7],
  ["September", 8],
  ["October", 9],
  ["November", 10],
  ["December", 11],
]);

/* 
returns number of milliseconds since Jan 1, 1979 00:00:00 UTC
date: string: LongMonthName Day
time: string: HH:MM XX

NOTE: assume year 2020, or 2021 for January
NOTE: assume server timezone eastern (GMT-400) for Date
*/
const getDateValue = (date, time) => {
  // set date
  let meridian = time.slice(-2);
  let dateObj = date + ' ' + time.split(meridian)[0] + ' ' + meridian;
  return dateObj;
};

const getGamesListFromTable = (table) => {
  const games = [];
  table[0].forEach((weekNum, idx) => {
    if (weekNum !== "Week") {
      const date = table[2][idx];
      const time = table[3][idx];
      const startTime = getDateValue(date, time);
      const week = weekNum;
      const visTeam = TEAM_LONG_TO_ABBR.get(
        table[4][idx].match(/">(.*)<\/a/).pop()
      );
      const homeTeam = TEAM_LONG_TO_ABBR.get(
        table[6][idx].match(/>(.*)</).pop()
      );
      const id = `${week}_${visTeam}_${homeTeam}`;
      games.push({ startTime, week, visTeam, homeTeam, id });
    }
  });
  return games;
};

const scrapeGamesTable = async () => {
  const result = await request.get(
    "https://www.pro-football-reference.com/years/2021/games.htm"
  );
  const $ = cheerio.load(result);
  cheerioTableparser($);
  const resultTable = $(
    "body > #wrap > #content > #all_games > #div_games"
  );
  const parsedTable = resultTable.parsetable();
  return parsedTable;
};

exports.getGames = async () => {
  const parsedTable = await scrapeGamesTable();
  return getGamesListFromTable(parsedTable);
};
