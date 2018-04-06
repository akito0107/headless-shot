const puppeteer = require("puppeteer");
const yaml = require("js-yaml");
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const logger = require("pino")();
const RandExp = require("randexp");

async function main(scenario) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  logger.info("precondition start.");
  const precondition = scenario["precondition"];
  await goto(page, precondition["url"]);
  await run(page, precondition["steps"]);
  logger.info("precondition done.");

  const now = Date.now();
  logger.info(`main scenario start. at ${now.toLocaleString()}`);
  for (let i = 0; i < scenario["iteration"]; i++) {
    logger.info(`${i} th iteration start`);
    try {
      await goto(page, scenario["url"]);
      await run(page, scenario["steps"]);
    } catch (e) {
      await page.screenshot({
        path: `${now.toLocaleString()}-${i}.png`,
        fullPage: true
      });
      logger.error(e);
    }
  }
  logger.info("main scenario end");

  await browser.close();
}

async function goto(page, url) {
  await page.goto(url);
}

async function run(page, steps) {
  for (const step of steps) {
    const action = step["action"];
    switch (action["type"]) {
      case "input":
        const input = action["form"];
        if (input["value"]) {
          await page.type(input["selector"], input["value"]);
        } else {
          const regex = new RegExp(input["constrains"]["regexp"]);

          const randex = new RandExp(regex);
          randex.defaultRange.subtract(32, 126);
          randex.defaultRange.add(0, 65535);

          await page.type(input["selector"], randex.gen());
        }
        break;
      case "wait":
        await page.waitFor(action["duration"]);
        break;
      case "click":
        const target = await page.$(action["selector"]);
        await target.click();
        break;
      case "select":
        const select = action["form"];
        const v = select["constrains"]["values"];
        await page.select(
          select["selector"],
          `${v[Math.floor(Math.random() * v.length)]}`
        );
        break;
      case "ensure":
        await ensure(page, action);
        break;
      default:
        throw new Error(`unknown action type: ${action["type"]}`);
    }
  }
}

async function ensure(page, conds) {
  if (conds["location"]) {
    const url = await page.url();

    if (conds["location"]["value"]) {
      assert.strictEqual(
        url,
        conds["location"]["value"],
        `location check failed: must be ${
          conds["location"]["value"]
        }, but: ${url}`
      );
    }

    if (conds["location"]["regexp"]) {
      const regexp = new RegExp(conds["location"]["regexp"]);
      assert(
        regexp.test(url),
        `location check failed: must be ${
          conds["location"]["regexp"]
        }, but: ${url}`
      );
    }
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
