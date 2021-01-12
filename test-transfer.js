const fs = require('fs');
const transfer = require('./src/transfer')

async function run (example = 'alarm') {
  const puml = fs.readFileSync(`./examples/${example}.puml`);
  const expected = fs.readFileSync(`./examples/${example}.svg`, 'utf8');

  const command = transfer.plantuml.DOCKER()
  console.error(command)
  /**
   * Without `persist` option: `transformed.svg` contains output (so we can compare)
   */
  const transformed = await transfer(
    {svg: transfer.plantuml(command)}, puml
  );
  /**
   * With `persist` option: `persisted.svg` contains path to persisted file
   */
  const persisted = await transfer(
    {
      puml: true,
      svg: transfer.plantuml(command)
    },
    puml,
    transfer.persistToFileSystem(`./examples/${example}`)
  );

  if (transformed.svg !== expected) {
    console.error(transformed.svg)
    throw `Output didn't match, persisted to ${persisted.svg}`;
  }
}
module.exports = {run};
