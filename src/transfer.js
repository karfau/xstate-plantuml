/**
 * @callback ExtensionCallback
 * @param {string} source
 * @param {string} extension
 * @returns {Promise<string>}
 */
/**
 * @callback PersistCallback
 * @param {string} extension indicates the kind of data to persist
 * @param {string} value the value to persist
 * @returns {Promise<any>} The resolved value to return for `extension` after persisting
 */
/**
 * @typedef {boolean | ExtensionCallback} Extension
 */

/**
 * Creates a `PersistCallback` for the most common implementation of file system storage.
 *
 * @param {string} pathAndName target path anf file name without extension
 * @param {import('fs')} [fs=import(fs)]
 * @returns {PersistCallback}
 */
function persistToFileSystem (pathAndName, fs = require('fs')) {
  return /** @type {PersistCallback} */(async (ext, value) => {
    let location = `${pathAndName}.${ext}`;
    fs.writeFileSync(location, value, {encoding: 'utf8'});
    return location
  });
}

/**
 * Creates a method that uses the command line to execute plantuml
 * and create images from puml source.
 *
 * @param {string} command
 * @param {import('execa')} [execa=import('execa')]
 * @returns {ExtensionCallback}
 *
 * @see plantuml.DOCKER
 * @see plantuml.JAVA
 */
function plantuml(command, execa = require('execa')) {
  return /** @type {ExtensionCallback} */(async (value, extension) => {
    let cmd = `${command} -t${extension}`
    const {stdout, exitCode} = await execa.command(
      cmd, {input: value, stderr: 'pipe'}
    );
    if (exitCode !== 0) throw new Error(`plantuml command had exit code ${exitCode}: '${cmd}'`)
    if (!stdout) throw new Error(`plantum command has empty output: '${cmd}'`)
    return stdout.toString()
  });
}

/**
 * Creates base command to execute plantuml using a docker image.
 * The output format will be added later and needs to be omitted.
 * Uses `karfau/plantuml:latest` by default.
 * The version to use can be configured using `PLANTUML_VERSION` env variable.
 *
 * @param image name of the docker image to use
 * @returns {string} the base command to execute
 *
 * @see https://github.com/karfau/plantuml-docker
 * @see https://hub.docker.com/r/karfau/plantuml/tags?page=1&ordering=last_updated
 * @see https://plantuml.com/
 */
const DOCKER_COMMAND = (image = `karfau/plantuml:${process.env.PLANTUML_VERSION || 'latest'}`) =>
  `docker run --rm -i ${image} -pipe -nometadata`;
plantuml.DOCKER = DOCKER_COMMAND;

/**
 * Creates command to execute plantuml using `java`.
 * The output format will be added later and needs to be omitted.
 * Uses `plantuml.jar` in the current directory by default.
 *
 * @param pathToJar The relative or absolute path (including filename) to plantuml jar
 * @returns {string} the base command to execute
 *
 * @see https://plantuml.com/
 * @see https://java.com/en/download/
 */
const JAVA_COMMAND = (pathToJar = 'plantuml.jar') => `java -jar ${pathToJar} -pipe -nometadata`;

/**
 * Transforms and/or `persist`s `source` for each extension in `extensions`.
 * This helps to only update the (image) files related to input that has changed.
 *
 * @param {Record<string, Extension>} extensions
 * @param {string} source the data to transform/and or persist
 * @param {PersistCallback} [persist] the async method to use when persisting data
 * @returns {Promise<Record<string, any>>}
 *
 * @see persistToFileSystem
 */
async function transfer(extensions, source, persist) {
  const result = {}
  for (const [extension, config] of Object.entries(extensions)) {
    let value;
    if (typeof config === 'function') {
      value = await config(source, extension)
    } else if (config === true) {
      value = source;
    } else {
      value = config;
    }
    result[extension] = persist ? await persist(extension, `${value}`) : value;
  }
  return result;
}
plantuml.DOCKER = DOCKER_COMMAND;
plantuml.JAVA = JAVA_COMMAND

transfer.persistToFileSystem = persistToFileSystem;
transfer.plantuml = plantuml;

module.exports = transfer;
