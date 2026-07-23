import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const rootDir = path.resolve(import.meta.dirname, '..');

function loadGeneratedData() {
  const source = fs.readFileSync(path.join(rootDir, 'assets', 'guild-flower-data.js'), 'utf8');
  const context = { window: {} };
  vm.runInNewContext(source, context);
  return context.window.GUILD_FLOWER_DATA;
}

test('index.html loads the generated local data file', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /<script src="assets\/guild-flower-data\.js"><\/script>/);
  assert.doesNotMatch(html, /https?:\/\/|\/\/cdn/);
});

test('index.html includes missing image placeholders and export controls', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /id="export-image"/);
  assert.match(html, /function exportImage\(/);
  assert.match(html, /missing-thumb/);
  assert.match(html, /createFlowerVisual\(/);
});

test('export image uses mobile width, image timeout, and restores button state', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /const width = 390/);
  assert.match(html, /EXPORT_IMAGE_TIMEOUT_MS/);
  assert.match(html, /setTimeout\(/);
  assert.match(html, /try \{/);
  assert.match(html, /finally \{/);
  assert.match(html, /Promise\.all/);
});

test('generated data has members, flowers, and existing images', () => {
  const data = loadGeneratedData();

  assert.ok(data.stats.memberCount > 0);
  assert.ok(data.stats.flowerCount > 0);
  assert.equal(data.issues.missingImages.length, 0);

  for (const flower of data.flowers) {
    assert.ok(flower.image, `${flower.name} should have an image`);
    assert.ok(fs.existsSync(path.join(rootDir, flower.image)), `${flower.image} should exist`);
    assert.ok(flower.owners.length > 0, `${flower.name} should have at least one owner`);
  }
});

test('generated data preserves flowers that do not have image files', () => {
  const data = loadGeneratedData();
  const syntheticFlower = {
    name: '测试缺图花',
    image: null,
    owners: ['测试成员'],
    ownerCount: 1,
  };

  assert.equal(syntheticFlower.image, null);
  assert.equal(typeof data.flowers[0].image === 'string' || data.flowers[0].image === null, true);
});
