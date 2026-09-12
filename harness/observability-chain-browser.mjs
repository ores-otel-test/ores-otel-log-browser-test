import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { Linter } from 'eslint';

const sourceRoot = process.env.NEXT_LOGGERS_SOURCE;
assert.ok(sourceRoot, 'NEXT_LOGGERS_SOURCE must be set');
const eslintPlugin = (await import(pathToFileURL(`${sourceRoot}/dist/eslint-plugin.js`).href)).default;

function lint(code) {
  const linter = new Linter();
  return linter.verify(
    code,
    [{
      languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      plugins: { 'next-loggers': eslintPlugin },
      rules: { 'next-loggers/require-observability-chain': 'error' },
    }],
    { filename: 'browser-consumer.mjs' },
  );
}

test('browserLogger complete chains pass', () => {
  const messages = lint(`
    import { browserLogger } from '@oresoftware/next-loggers/browser';
    const routineId = 'ores-routine-Browser7_XyZ23456789';
    browserLogger.error('window error')
      .addTraceId('ores-trace-Browser9_XyZ23456789')
      .addRoutineId(routineId)
      .send();
  `);
  assert.deepEqual(messages, []);
});

test('browserLogger incomplete chains fail', () => {
  const messages = lint(`
    import { browserLogger } from '@oresoftware/next-loggers/browser';
    browserLogger.warn('csp event').send();
  `);
  assert.equal(messages.length, 1);
  assert.match(messages[0].message, /ores-trace/);
  assert.match(messages[0].message, /routineId/);
});

test('browser bridge can explicitly suppress one statement', () => {
  const messages = lint(`
    import { browserLogger } from '@oresoftware/next-loggers/browser';
    // eslint-disable-next-line next-loggers/require-observability-chain -- browser SDK compatibility shim
    browserLogger.debug('shim');
  `);
  assert.deepEqual(messages, []);
});
