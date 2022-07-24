const open = require("open");
const series = require("./series2.json");
const { join } = require("path");
const { writeFile } = require("fs");
require("dotenv").config();
// FLAGS SETUP
// 1. MODE: x-->exec (opens tabs and updates), w--> (updates), (default)m:(open)
// 2. UPDATE EP COUNT: y-->(up the count), n-->(lower the count)
// 3. URL ROOT OPENER: y-->(open in main), n-->(open in episode)
const FLAGS = ["m", "y", "n"];
const flagLen = process.argv.length > 2 ? process.argv.length : 0;
for (let i = 2; i < flagLen && i < 5; i++) {
  FLAGS[i - 2] = process.argv[i];
}

console.log(process.env.BASE_PATH);

function main() {
  // OPEN URLS IN CHROME
  const BASE_PATH =
    FLAGS[2] === "y" ? process.env.BASE_URL_ALT : process.env.BASE_URL;
  for (let i = 0; i < series.length; i++) {
    open(join(BASE_PATH, `${series[i].name}${series[i].ep}`), {
      app: ["google chrome", "--incognito"],
    });
  }
}
function updateCount() {
  // UPDATE EPISODE COUNT FOR SERIES
  const newList = [];
  let longestTitle = 1;
  for (let i = 0; i < series.length; i++) {
    if (Number(series[i].ep) + 1 <= Number(series[i].limit)) {
      newList.push({
        name: series[i].name,
        ep:
          FLAGS[1] === "y"
            ? Number(series[i].ep) + 1 + ""
            : Number(series[i].ep) - 1 <= 0
            ? 1
            : +Number(series[i].ep) - 1 + "",
        limit: series[i].limit,
      });
      longestTitle = Math.max(longestTitle, series[i].name.length);
    }
  }

  // SAVE FOR THE NEW BINGE :)
  const rewrite = JSON.stringify(newList);
  writeFile("series2.json", rewrite, (err) => {
    if (err) console.log(err);
  });

  FLAGS[1] === "y"
    ? console.log("UPDATE SUCCESS! NEW WEEK:\n")
    : console.log("CHANGES REVERTED! SERIES:\n");
  console.log("*".repeat(longestTitle + 8), "\n");
  for (let i = 0; i < newList.length; i++) {
    const title = newList[i].name.replace(/-/g, " ");
    console.log(`* ${title}, ep: ${newList[i].ep}\n`);
  }
  console.log("*".repeat(longestTitle + 8));
}

switch (FLAGS[0]) {
  case "x":
    main();
    updateCount();
    break;
  case "w":
    updateCount();
    break;
  default:
    main();
}
