const transfer = require('../transfer.js')

const NAME = 'NAME';
const PLANTUML = 'PLANTUML';
const VALUE = 'VALUE';

describe('transfer', () => {
  describe('with persist option', () => {
    const persistMock = async function (extension) {
      return `directory/${NAME}.${extension}`
    };

    test('should call `persist` when extension is `true`', async () => {
      const persist = jest.fn(persistMock);

      await transfer({puml: true}, PLANTUML, persist);

      expect(persist).toHaveBeenCalledWith('puml', PLANTUML);
    });

    test('should call `persist` when extension is a function', async () => {
      const callback = jest.fn(async (input) => input.toLowerCase());
      const persist = jest.fn(persistMock);

      await transfer({lower: callback}, PLANTUML, persist);

      expect(persist).toHaveBeenCalledWith('lower', 'plantuml');
    });

    test('should call `persist` when extension is a value', async () => {
      const persist = jest.fn(persistMock);

      await transfer({wat: VALUE}, PLANTUML, persist);

      expect(persist).toHaveBeenCalledWith('wat', VALUE);
    });

    test('should set return value from `persist` per extension', async () => {
      const callback = jest.fn(async () => false);
      const persist = jest.fn(
        async function (extension) { return extension }
      );

      expect(
        await transfer({abc: VALUE, def: true, ghi: callback}, PLANTUML, persist)
      ).toEqual({abc: 'abc', def: 'def', ghi: 'ghi'});
    });
  });

  describe('without persist option', () => {
    test('should map source to extension when persist is not set', async () => {
      let it = await transfer({puml: true}, PLANTUML);

      expect(it).toEqual({puml: PLANTUML});
    });

    test('should call the extension when it is a function', async () => {
      const callback = jest.fn(async (input/*, ext*/) => input.toLowerCase());

      let it = await transfer({lower: callback}, PLANTUML);

      expect(it).toEqual({lower: 'plantuml'});
      expect(callback).toHaveBeenCalledWith(PLANTUML, 'lower');
    });

    test('should pass the extension value in all other cases', async () => {
      let it = await transfer({wat: VALUE}, PLANTUML);

      expect(it).toEqual({wat: VALUE});
    });
  });
});

describe('transfer.persistToFileSystem', () => {
  const pathAndName = 'DIRECTORY/NAME';

  test('should pass correct arguments to fs.writeFileSync', async () => {
    const fs = {writeFileSync: jest.fn()};

    const persist = transfer.persistToFileSystem(pathAndName, fs);
    await persist('ext', VALUE);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      `${pathAndName}.ext`, VALUE, {encoding: 'utf8'}
    );
  });

  test('should return the persisted location', async () => {
    const fs = {writeFileSync: jest.fn()};

    const persist = transfer.persistToFileSystem(pathAndName, fs);
    expect(await persist('ext', VALUE, NAME)).toEqual(`DIRECTORY/NAME.ext`);
  });
});

describe('transfer.plantuml', () => {
  const COMMAND = 'plantuml cmd';
  const EXT = 'svg';
  const mockCommand = (stdout, exitCode = 0) =>
    async () => Promise.resolve({exitCode, stdout});

  test('should pass command to execa.command', async () => {
    const execa = {command: jest.fn(mockCommand(VALUE))};

    const it = transfer.plantuml(COMMAND, execa);
    await it(PLANTUML, EXT);

    expect(execa.command).toHaveBeenCalledWith(
      `${COMMAND} -t${EXT}`, {input: PLANTUML, stderr: 'pipe'}
    );
  });

  test('should return stdout from execa.command', async () => {
    const execa = {command: jest.fn(mockCommand(new Buffer(VALUE)))};

    const it = transfer.plantuml(COMMAND, execa);

    expect(await it(EXT, PLANTUML)).toEqual(VALUE);
  });

  test('should fail with empty stdout from execa.command', async () => {
    const execa = {command: jest.fn(mockCommand(''))};

    const it = transfer.plantuml(COMMAND, execa);

    await expect(it(EXT, PLANTUML)).rejects.toThrow('empty output');
  });

  test('should fail with undefined stdout from execa.command', async () => {
    const execa = {command: jest.fn(mockCommand(undefined))};

    const it = transfer.plantuml(COMMAND, execa);

    await expect(it(EXT, PLANTUML)).rejects.toThrow('empty output');
  });

  test('should fail with exitCode from execa.command', async () => {
    const execa = {command: jest.fn(mockCommand('WAT', 123))};

    const it = transfer.plantuml(COMMAND, execa);

    await expect(it(EXT, PLANTUML)).rejects.toThrow(`exit code 123`);
  });

  test('should fail when execa.command fails', async () => {
    const execa = {command: jest.fn(async () => Promise.reject(new Error('from test')))};

    const it = transfer.plantuml(COMMAND, execa);

    await expect(it(EXT, PLANTUML)).rejects.toThrow('from test');
  });
});
