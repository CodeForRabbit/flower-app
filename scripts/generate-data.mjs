import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MEMBER_FILE_CANDIDATES = [
  path.join(ROOT_DIR, '公会成员.txt'),
  path.join(ROOT_DIR, '空白文本.txt'),
];
const ALBUM_DIR = path.join(ROOT_DIR, '鲜花图册');
const OUTPUT_FILE = path.join(ROOT_DIR, 'assets', 'guild-flower-data.js');

function cleanName(value) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function splitFlowerList(value) {
  return value
    .split(/[、，,:：]/g)
    .map(cleanName)
    .filter(Boolean);
}

export function parseMemberText(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const delimiterIndex = line.search(/[:：]/);
      if (delimiterIndex === -1) {
        return null;
      }

      const name = cleanName(line.slice(0, delimiterIndex));
      const rawFlowers = splitFlowerList(line.slice(delimiterIndex + 1));
      const seen = new Set();
      const duplicateSet = new Set();
      const flowers = [];

      for (const flower of rawFlowers) {
        if (seen.has(flower)) {
          duplicateSet.add(flower);
        } else {
          seen.add(flower);
          flowers.push(flower);
        }
      }

      return {
        name,
        flowers,
        duplicateFlowers: [...duplicateSet],
      };
    })
    .filter((member) => member && member.name);
}

export function buildFlowerImageMap(imagePaths) {
  const map = {};

  for (const imagePath of imagePaths) {
    if (path.extname(imagePath).toLowerCase() !== '.png') {
      continue;
    }

    const flowerName = cleanName(path.basename(imagePath, path.extname(imagePath)));
    if (flowerName && !map[flowerName]) {
      map[flowerName] = imagePath.split(path.sep).join('/');
    }
  }

  return map;
}

export function buildGuildFlowerData(memberText, imagePaths) {
  const imageMap = buildFlowerImageMap(imagePaths);
  const members = parseMemberText(memberText).map((member) => ({
    ...member,
    count: member.flowers.length,
  }));
  const flowerOwners = new Map();

  for (const member of members) {
    for (const flower of member.flowers) {
      if (!flowerOwners.has(flower)) {
        flowerOwners.set(flower, []);
      }
      flowerOwners.get(flower).push(member.name);
    }
  }

  const flowers = [...flowerOwners.entries()]
    .map(([name, owners]) => ({
      name,
      image: imageMap[name] ?? null,
      owners,
      ownerCount: owners.length,
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));

  const missingImages = flowers
    .filter((flower) => !flower.image)
    .map((flower) => flower.name);
  const duplicateEntries = members
    .filter((member) => member.duplicateFlowers.length > 0)
    .map((member) => ({
      member: member.name,
      flowers: member.duplicateFlowers,
    }));

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      memberCount: members.length,
      flowerCount: flowers.length,
      imageCount: Object.keys(imageMap).length,
      missingImageCount: missingImages.length,
      duplicateEntryCount: duplicateEntries.length,
    },
    members,
    flowers,
    imageMap,
    issues: {
      missingImages,
      duplicateEntries,
    },
  };
}

export function writeDataFile(data, outputPath = OUTPUT_FILE) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const json = JSON.stringify(data, null, 2);
  fs.writeFileSync(outputPath, `window.GUILD_FLOWER_DATA = ${json};\n`, 'utf8');
}

function walkFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(absolutePath));
    } else if (entry.isFile()) {
      files.push(path.relative(ROOT_DIR, absolutePath));
    }
  }

  return files;
}

export function generateFromWorkspace() {
  const memberFile = MEMBER_FILE_CANDIDATES.find((file) => fs.existsSync(file));
  if (!memberFile) {
    throw new Error('Missing member list file. Expected 公会成员.txt or 空白文本.txt in the project root.');
  }

  const memberText = fs.readFileSync(memberFile, 'utf8');
  const imagePaths = walkFiles(ALBUM_DIR);
  const data = buildGuildFlowerData(memberText, imagePaths);
  writeDataFile(data, OUTPUT_FILE);
  return data;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const data = generateFromWorkspace();
  console.log(`Generated ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
  console.log(`Members: ${data.stats.memberCount}`);
  console.log(`Flowers: ${data.stats.flowerCount}`);
  console.log(`Images: ${data.stats.imageCount}`);
  console.log(`Missing images: ${data.stats.missingImageCount}`);
  console.log(`Duplicate member entries: ${data.stats.duplicateEntryCount}`);
}
