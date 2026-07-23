import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildFlowerImageMap,
  buildGuildFlowerData,
  parseMemberText,
} from '../scripts/generate-data.mjs';

test('parseMemberText handles mixed colons, separators, blanks, and duplicates', () => {
  const members = parseMemberText(`
暖香:紫曜牡丹、粉胭海棠花，柔蓝飞燕草

柒柒柒：紫霁大岩桐、缃桃六初花、紫霁大岩桐
田诗萌:桃云木香花:春晓木香花、星耀灵蕊
`);

  assert.equal(members.length, 3);
  assert.deepEqual(members[0], {
    name: '暖香',
    flowers: ['紫曜牡丹', '粉胭海棠花', '柔蓝飞燕草'],
    duplicateFlowers: [],
  });
  assert.deepEqual(members[1], {
    name: '柒柒柒',
    flowers: ['紫霁大岩桐', '缃桃六初花'],
    duplicateFlowers: ['紫霁大岩桐'],
  });
  assert.deepEqual(members[2].flowers, ['桃云木香花', '春晓木香花', '星耀灵蕊']);
});

test('buildFlowerImageMap uses png basenames as flower names and ignores other files', () => {
  const imageMap = buildFlowerImageMap([
    '鲜花图册/23/紫曜牡丹.png',
    '鲜花图册/鲜花/金色/龙舟竞渡.png',
    '鲜花图册/.DS_Store',
    '鲜花图册/readme.txt',
  ]);

  assert.deepEqual(imageMap, {
    紫曜牡丹: '鲜花图册/23/紫曜牡丹.png',
    龙舟竞渡: '鲜花图册/鲜花/金色/龙舟竞渡.png',
  });
});

test('buildGuildFlowerData creates reverse lookup and missing image issues', () => {
  const data = buildGuildFlowerData(
    '暖香:紫曜牡丹、龙舟竞渡\n魔力卡花匠:不存在的花、龙舟竞渡、龙舟竞渡',
    ['鲜花图册/23/紫曜牡丹.png', '鲜花图册/鲜花/金色/龙舟竞渡.png'],
  );

  assert.equal(data.members.length, 2);
  assert.deepEqual(new Set(data.flowers.map((flower) => flower.name)), new Set(['不存在的花', '紫曜牡丹', '龙舟竞渡']));
  assert.deepEqual(data.flowers.find((flower) => flower.name === '龙舟竞渡').owners, ['暖香', '魔力卡花匠']);
  assert.deepEqual(data.issues.missingImages, ['不存在的花']);
  assert.deepEqual(data.issues.duplicateEntries, [
    { member: '魔力卡花匠', flowers: ['龙舟竞渡'] },
  ]);
});
