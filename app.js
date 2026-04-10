let data = [];
let flowerMap = {};

Promise.all([
  fetch('data.json').then(r => r.json()),
  fetch('flowers.json').then(r => r.json())
]).then(([d, f]) => {
  data = d;
  flowerMap = f;
  render(data);
});

function parseFlowers(str) {
  if (!str) return [];
  return str.split(/[，、,]/).map(s => s.trim());
}

function render(list) {
  const el = document.getElementById("result");
  el.innerHTML = "";

  list.forEach(item => {
    const flowers = parseFlowers(item.flowers);

    const html = flowers.map(name => {
      const f = flowerMap[name] || {};
      return `
        <span class="flower">
          ${f.img ? `<img src="${f.img}"/>` : ""}
          ${name}
        </span>
      `;
    }).join("");

    el.innerHTML += `
      <div class="card">
        <h3>${item.name}</h3>
        <div>${html}</div>
      </div>
    `;
  });
}

// 筛选
document.querySelectorAll("input,select")
  .forEach(el => el.addEventListener("input", filter));

function filter() {
  const m = memberSearch.value;
  const f = flowerSearch.value;
  const level = levelFilter.value;

  const res = data.filter(item => {
    const flowers = parseFlowers(item.flowers);

    const matchM = item.name.includes(m);

    const matchF = flowers.some(name => {
      const info = flowerMap[name] || {};
      return name.includes(f) && (!level || info.level === level);
    });

    return matchM && matchF;
  });

  render(res);
}