import { test } from 'node:test';
import assert from 'node:assert/strict';
import app from './index.js';

async function withServer(fn) {
  const server = await new Promise(resolve => {
    const instance = app.listen(0, () => resolve(instance));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve, reject) => {
      server.close(error => error ? reject(error) : resolve());
    });
  }
}

test('GET / returns service status', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.ok, true);
    assert.equal(body.service, 'clinic-api');
  });
});

test('DELETE /appointments/:id rejects non-numeric id (400)', async () => {
  await withServer(async base => {
    const response = await fetch(`${base}/appointments/abc`, { method: 'DELETE' });
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.error, 'invalid_id');
  });
});

test('DELETE /appointments/:id rejects zero and negative id (400)', async () => {
  await withServer(async base => {
    for (const bad of ['0', '-5']) {
      const response = await fetch(`${base}/appointments/${bad}`, { method: 'DELETE' });
      assert.equal(response.status, 400, `expected 400 for id=${bad}`);
    }
  });
});
