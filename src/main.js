const puppeteer = require("puppeteer");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const logger = require("pino")();

async function main(scenario) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  logger.info("precondition start.");
  const precondition = scenario["precondition"];
  await goto(page, precondition["url"]);
  await run(precondition["steps"]);
  await ensure(page, precondition["ensure"]);
  logger.info("precondition done.");

  logger.info("main scenario start.");
  await goto(page, scenario["url"]);

  await browser.close();
}

async function type(page, name, value) {
  console.log(name, value);
  try {
    await page.type(`input[name="${name}"]`, value);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function select(page, name, value) {
  console.log(name, value);
  try {
    await page.select(`select[name="${name}"]`, value);
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function goto(page, url) {
  await page.goto(url);
}

async function run(page, steps) {
  for (const step of steps) {
    const action = step["action"];
    switch (action["type"]) {
      case "input":
        const form = action["form"];
        await page.type(form["selector"], form["value"]);
        break;
      case "wait":
        await page.waitFor(action["duration"]);
        break;
      case "click":
        const target = await page.$(action["selector"]);
        await target.click();
        break;
      default:
        throw new Error("unknown action type");
    }
  }
}

async function ensure(page, conds) {
  if (conds["location"]) {
    const url = await page.url();
    assert.strictEqual(url, ensure["location"]);
  }
}

const doc = yaml.safeLoad(
  fs.readFileSync(path.join(__dirname, "cases", "test.yaml"))
);

process.on("unhandledRejection", err => {
  console.error(err); // don't do just that.
  process.exit(1);
});

main(doc);
