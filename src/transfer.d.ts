/// <reference types="node" />
export = transfer;
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
declare function transfer(extensions: Record<string, Extension>, source: string, persist?: PersistCallback | undefined): Promise<Record<string, any>>;
declare namespace transfer {
    export { persistToFileSystem, plantuml, ExtensionCallback, PersistCallback, Extension };
}
type Extension = boolean | ExtensionCallback;
type PersistCallback = (extension: string, value: string) => Promise<any>;
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
declare function persistToFileSystem(pathAndName: string, fs?: typeof import("fs") | undefined): PersistCallback;
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
declare function plantuml(command: string, execa?: {
    (file: string, arguments?: readonly string[] | undefined, options?: import("execa").Options<string> | undefined): import("execa").ExecaChildProcess<string>;
    (file: string, arguments?: readonly string[] | undefined, options?: import("execa").Options<null> | undefined): import("execa").ExecaChildProcess<Buffer>;
    (file: string, options?: import("execa").Options<string> | undefined): import("execa").ExecaChildProcess<string>;
    (file: string, options?: import("execa").Options<null> | undefined): import("execa").ExecaChildProcess<Buffer>;
    sync(file: string, arguments?: readonly string[] | undefined, options?: import("execa").SyncOptions<string> | undefined): import("execa").ExecaSyncReturnValue<string>;
    sync(file: string, arguments?: readonly string[] | undefined, options?: import("execa").SyncOptions<null> | undefined): import("execa").ExecaSyncReturnValue<Buffer>;
    sync(file: string, options?: import("execa").SyncOptions<string> | undefined): import("execa").ExecaSyncReturnValue<string>;
    sync(file: string, options?: import("execa").SyncOptions<null> | undefined): import("execa").ExecaSyncReturnValue<Buffer>;
    command(command: string, options?: import("execa").Options<string> | undefined): import("execa").ExecaChildProcess<string>;
    command(command: string, options?: import("execa").Options<null> | undefined): import("execa").ExecaChildProcess<Buffer>;
    commandSync(command: string, options?: import("execa").SyncOptions<string> | undefined): import("execa").ExecaSyncReturnValue<string>;
    commandSync(command: string, options?: import("execa").SyncOptions<null> | undefined): import("execa").ExecaSyncReturnValue<Buffer>;
    node(scriptPath: string, arguments?: readonly string[] | undefined, options?: import("execa").NodeOptions<string> | undefined): import("execa").ExecaChildProcess<string>;
    node(scriptPath: string, arguments?: readonly string[] | undefined, options?: import("execa").Options<null> | undefined): import("execa").ExecaChildProcess<Buffer>;
    node(scriptPath: string, options?: import("execa").Options<string> | undefined): import("execa").ExecaChildProcess<string>;
    node(scriptPath: string, options?: import("execa").Options<null> | undefined): import("execa").ExecaChildProcess<Buffer>;
} | undefined): ExtensionCallback;
declare namespace plantuml {
    export { DOCKER_COMMAND as DOCKER };
    export { JAVA_COMMAND as JAVA };
}
type ExtensionCallback = (source: string, extension: string) => Promise<string>;
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
declare function DOCKER_COMMAND(image?: string): string;
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
declare function JAVA_COMMAND(pathToJar?: string): string;
