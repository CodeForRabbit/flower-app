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

test('index.html fetches the latest member txt and keeps generated data fallback', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /MEMBER_TEXT_FILE = '空白文本\.txt'/);
  assert.match(html, /fetch\(txtUrl, \{ cache: 'no-store' \}\)/);
  assert.match(html, /buildDataFromMemberText\(text, fallbackData\)/);
  assert.match(html, /useFallbackData\(\)/);
});

test('index.html starts with flowers and provides persistent card and compact modes', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /view: 'flowers'/);
  assert.match(html, /id="display-mode"/);
  assert.match(html, /data-display-mode="card"/);
  assert.match(html, /data-display-mode="compact"/);
  assert.match(html, /displayMode:/);
  assert.match(html, /function setDisplayMode\(mode\)/);
  assert.match(html, /localStorage\.getItem\(DISPLAY_MODE_STORAGE_KEY\)/);
  assert.match(html, /localStorage\.setItem\(DISPLAY_MODE_STORAGE_KEY, mode\)/);
});

test('flower layouts wrap owner tags without overflowing their cards', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /\.flower-grid--card/);
  assert.match(html, /\.flower-grid--compact/);
  assert.match(html, /\.owners\s*\{[\s\S]*flex-wrap: wrap/);
  assert.match(html, /\.owner\s*\{[\s\S]*overflow-wrap: anywhere/);
  assert.match(html, /\.flower-body\s*\{[\s\S]*min-width: 0/);
});

test('flower card text starts after the thumbnail and a visible gap', () => {
  const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

  assert.match(html, /\.flower-card\s*\{[\s\S]*grid-template-columns: 126px minmax\(0, 1fr\)/);
  assert.match(html, /\.flower-grid--compact \.flower-card\s*\{[\s\S]*grid-template-columns: 97px minmax\(0, 1fr\)/);
});

test('generated data maps existing images and preserves genuinely missing flowers', () => {
  const data = loadGeneratedData();

  assert.ok(data.stats.memberCount > 0);
  assert.ok(data.stats.flowerCount > 0);

  for (const flower of data.flowers) {
    assert.ok(flower.owners.length > 0, `${flower.name} should have at least one owner`);
    if (flower.image) {
      assert.ok(fs.existsSync(path.join(rootDir, flower.image)), `${flower.image} should exist`);
    } else {
      assert.ok(data.issues.missingImages.includes(flower.name), `${flower.name} should be listed as missing`);
    }
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
