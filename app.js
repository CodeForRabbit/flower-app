let data = [];
let memberIndex = new Map();
let flowerIndex = new Map();

const memberSelect = document.getElementById("memberSelect");
const flowerSelect = document.getElementById("flowerSelect");

fetch('data.json')
  .then(r => r.json())
  .then(d => {
    data = d;
    buildIndex();
    hydrateSelects();
    renderDefault();
});

function parseFlowerToken(token) {
  if (!token) return null;
  let t = token.trim();
  if (!t || t.toLowerCase() === "nan") return null;
  t = t.replace(/[，、,]+$/g, "");
  const match = t.match(/^(.+?)(\d+)$/);
  if (match) {
    return { name: match[1].trim(), count: match[2], raw: t };
  }
  return { name: t, count: "", raw: t };
}

function parseFlowers(str) {
  if (!str) return [];
  return str
    .split(/[，、,\s]+/)
    .map(parseFlowerToken)
    .filter(Boolean);
}

function buildIndex() {
  memberIndex = new Map();
  flowerIndex = new Map();

  data.forEach(item => {
    const flowers = parseFlowers(item.flowers);
    memberIndex.set(item.name, { name: item.name, flowers });
    flowers.forEach(f => {
      if (!flowerIndex.has(f.name)) flowerIndex.set(f.name, new Set());
      flowerIndex.get(f.name).add(item.name);
    });
  });
}

function hydrateSelects() {
  memberSelect.innerHTML = `<option value="">请选择公会成员</option>`;
  flowerSelect.innerHTML = `<option value="">请选择花名</option>`;

  [...memberIndex.keys()].sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    memberSelect.appendChild(opt);
  });

  [...flowerIndex.keys()].sort().forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    flowerSelect.appendChild(opt);
  });
}

function renderDefault() {
  renderTip("请选择成员或花名进行筛选");
}

function renderMemberCards(list, highlightFlower) {
  const el = document.getElementById("result");
  el.innerHTML = "";

  if (!list.length) {
    renderTip("未找到匹配成员");
    return;
  }

  list.forEach(item => {
    const flowerHtml = item.flowers.map(f => {
      const isHighlight = highlightFlower && f.name.includes(highlightFlower);
      const count = f.count ? `(${f.count})` : "";
      return `
        <span class="flower ${isHighlight ? "highlight" : ""}">
          ${f.name}${count}
        </span>
      `;
    }).join("");

    const relatedHtml = item.flowers.map(f => {
      const owners = [...(flowerIndex.get(f.name) || [])]
        .filter(n => n !== item.name);
      const ownersHtml = owners.length
        ? owners.map(n => `<span class="owner">${n}</span>`).join("")
        : `<span class="empty">暂无同花成员</span>`;

      return `
        <div class="related">
          <div class="related-title">同花成员 · ${f.name}</div>
          <div class="related-list">${ownersHtml}</div>
        </div>
      `;
    }).join("");

    el.innerHTML += `
      <div class="card">
        <h3>${item.name}</h3>
        <div class="flower-list">${flowerHtml || '<span class="empty">暂无花名</span>'}</div>
        <div class="related-block">${relatedHtml}</div>
      </div>
    `;
  });
}

function renderFlowerCards(flowers) {
  const el = document.getElementById("result");
  el.innerHTML = "";

  if (!flowers.length) {
    renderTip("未找到匹配花名");
    return;
  }

  flowers.forEach(name => {
    const owners = [...(flowerIndex.get(name) || [])];
    const ownersHtml = owners.length
      ? owners.map(n => `<span class="owner">${n}</span>`).join("")
      : `<span class="empty">暂无成员</span>`;

    el.innerHTML += `
      <div class="card">
        <h3>${name}</h3>
        <div class="related-list">${ownersHtml}</div>
      </div>
    `;
  });
}

function renderTip(text) {
  const el = document.getElementById("result");
  el.innerHTML = `
    <div class="card">
      <div class="empty">${text}</div>
    </div>
  `;
}

function filter() {
  let memberQuery = memberSelect.value.trim();
  const flowerQuery = flowerSelect.value.trim();

  if (flowerQuery && memberQuery) {
    const member = memberIndex.get(memberQuery);
    const hasFlower = member && member.flowers.some(f => f.name === flowerQuery);
    if (!hasFlower) {
      memberSelect.value = "";
      memberQuery = "";
    }
  }

  if (!memberQuery && !flowerQuery) {
    renderDefault();
    return;
  }

  const memberMatches = data
    .map(item => ({ name: item.name, flowers: parseFlowers(item.flowers) }))
    .filter(item => !memberQuery || item.name.includes(memberQuery));

  if (memberQuery) {
    if (flowerQuery) {
      const filtered = memberMatches
        .filter(item => item.flowers.some(f => f.name.includes(flowerQuery)));
      renderMemberCards(filtered, flowerQuery);
    } else {
      renderMemberCards(memberMatches, "");
    }
    return;
  }

  if (flowerQuery) {
    const flowerMatches = [...flowerIndex.keys()]
      .filter(name => name.includes(flowerQuery));
    renderFlowerCards(flowerMatches);
  }
}

// 筛选
document.querySelectorAll("select")
  .forEach(el => el.addEventListener("change", filter));

document.getElementById("resetBtn")
  .addEventListener("click", () => {
    memberSelect.value = "";
    flowerSelect.value = "";
    renderDefault();
  });
