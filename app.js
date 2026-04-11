let data = [];
let memberIndex = new Map();
let flowerIndex = new Map();

const memberSelect = document.getElementById("memberSelect");
const flowerSelect = document.getElementById("flowerSelect");
const editMemberSelect = document.getElementById("editMemberSelect");
const editMemberName = document.getElementById("editMemberName");
const editMemberFlowers = document.getElementById("editMemberFlowers");
const flowerPickTags = document.getElementById("flowerPickTags");
const flowerInput = document.getElementById("flowerInput");
const flowerTagsEl = document.getElementById("flowerTags");
const saveLocalBtn = document.getElementById("saveLocalBtn");
const deleteMemberBtn = document.getElementById("deleteMemberBtn");
const saveGithubBtn = document.getElementById("saveGithubBtn");
const githubTokenInput = document.getElementById("githubToken");
const saveStatus = document.getElementById("saveStatus");
const editToggle = document.getElementById("editToggle");
const editorPanel = document.getElementById("editorPanel");

const GITHUB_OWNER = "CodeForRabbit";
const GITHUB_REPO = "flower-app";
const GITHUB_PATH = "data.json";
let flowerTags = [];

fetch('data.json')
  .then(r => r.json())
  .then(d => {
    data = d;
    buildIndex();
    hydrateSelects();
    hydrateEditor();
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

function hydrateEditor() {
  editMemberSelect.innerHTML = `<option value="">新成员</option>`;
  data
    .map(item => item.name)
    .sort()
    .forEach(name => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      editMemberSelect.appendChild(opt);
    });

  renderFlowerPickTags();
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

function normalizeFlowerList(str) {
  if (!str) return [];
  const tokens = str
    .split(/[，、,\s]+/)
    .map(s => s.trim())
    .filter(Boolean);
  const seen = new Set();
  const result = [];
  tokens.forEach(t => {
    if (!seen.has(t)) {
      seen.add(t);
      result.push(t);
    }
  });
  return result;
}

function setFlowerTagsFromString(str) {
  flowerTags = normalizeFlowerList(str);
  renderFlowerTags();
}

function renderFlowerTags() {
  flowerTagsEl.innerHTML = "";
  flowerTags.forEach(name => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = name;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = "×";
    btn.addEventListener("click", () => {
      flowerTags = flowerTags.filter(t => t !== name);
      renderFlowerTags();
      syncFlowersTextarea();
    });

    tag.appendChild(btn);
    flowerTagsEl.appendChild(tag);
  });
  syncFlowersTextarea();
  renderFlowerPickTags();
}

function syncFlowersTextarea() {
  editMemberFlowers.value = flowerTags.join("、");
}

function addFlowerTag(name) {
  const n = name.trim();
  if (!n) return;
  if (!flowerTags.includes(n)) {
    flowerTags.push(n);
    renderFlowerTags();
  }
}

function renderFlowerPickTags() {
  if (!flowerPickTags) return;
  flowerPickTags.innerHTML = "";
  const allNames = [...flowerIndex.keys()].sort();
  allNames.forEach(name => {
    const tag = document.createElement("button");
    tag.type = "button";
    tag.className = "pick-tag";
    if (flowerTags.includes(name)) tag.classList.add("active");
    tag.textContent = name;
    tag.addEventListener("click", () => {
      addFlowerTag(name);
    });
    flowerPickTags.appendChild(tag);
  });
}

function updateMemberFromEditor() {
  const name = editMemberName.value.trim();
  const flowers = normalizeFlowerList(editMemberFlowers.value).join("、");
  editMemberFlowers.value = flowers;
  if (!name) {
    renderTip("请先填写成员名称");
    return false;
  }

  const existing = data.find(item => item.name === name);
  if (existing) {
    existing.flowers = flowers;
  } else {
    data.push({ name, flowers });
  }

  buildIndex();
  hydrateSelects();
  hydrateEditor();
  renderTip("已更新，记得保存到仓库");
  return true;
}

function base64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

async function saveToGithub() {
  const token = githubTokenInput.value.trim();
  if (!token) {
    saveStatus.textContent = "请先填写 GitHub Token";
    return;
  }

  saveStatus.textContent = "正在保存到 GitHub...";

  const apiBase = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_PATH}`;

  const getRes = await fetch(apiBase, {
    headers: {
      Authorization: `token ${token}`
    }
  });

  if (!getRes.ok) {
    saveStatus.textContent = "读取仓库文件失败，请检查 Token 权限";
    return;
  }

  const fileInfo = await getRes.json();
  const content = JSON.stringify(data, null, 2) + "\n";
  const putRes = await fetch(apiBase, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Update data.json via web editor",
      content: base64EncodeUtf8(content),
      sha: fileInfo.sha
    })
  });

  if (!putRes.ok) {
    saveStatus.textContent = "写入失败，请检查 Token 权限或网络";
    return;
  }

  saveStatus.textContent = "保存成功，Pages 会自动更新";
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

editMemberSelect.addEventListener("change", () => {
  const name = editMemberSelect.value;
  if (!name) {
    editMemberName.value = "";
    editMemberFlowers.value = "";
    setFlowerTagsFromString("");
    return;
  }
  const member = data.find(item => item.name === name);
  editMemberName.value = member ? member.name : "";
  editMemberFlowers.value = member ? member.flowers : "";
  setFlowerTagsFromString(member ? member.flowers : "");
});

deleteMemberBtn.addEventListener("click", () => {
  const name = editMemberName.value.trim();
  if (!name) {
    renderTip("请先选择或输入成员名称");
    return;
  }
  const pass = window.prompt("请输入删除口令");
  if (pass !== "花家致富删除") {
    renderTip("删除口令错误");
    return;
  }
  const ok = window.confirm(`确定删除成员“${name}”吗？`);
  if (!ok) return;
  data = data.filter(item => item.name !== name);
  buildIndex();
  hydrateSelects();
  hydrateEditor();
  editMemberName.value = "";
  editMemberFlowers.value = "";
  setFlowerTagsFromString("");
  renderTip("已删除成员，记得保存到仓库");
});

saveLocalBtn.addEventListener("click", () => {
  updateMemberFromEditor();
});

saveGithubBtn.addEventListener("click", async () => {
  const ok = updateMemberFromEditor();
  if (ok) {
    await saveToGithub();
  }
});

flowerInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    addFlowerTag(flowerInput.value);
    flowerInput.value = "";
  }
});

editMemberFlowers.addEventListener("blur", () => {
  setFlowerTagsFromString(editMemberFlowers.value);
});

editToggle.addEventListener("click", () => {
  const isHidden = editorPanel.classList.contains("hidden");
  editorPanel.classList.toggle("hidden");
  editToggle.textContent = isHidden ? "收起编辑" : "编辑";
});
