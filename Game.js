let money = 100;
let currentItem = null;
let offerCount = 0;

const containers = {
  cheap: { cost: 20, min: 5, max: 60 },
  medium: { cost: 50, min: 20, max: 150 },
  premium: { cost: 80, min: 50, max: 300 }
};

const rarities = [
  { name: "Común", chance: 50, emoji: "⚪" },
  { name: "Raro", chance: 25, emoji: "🔵" },
  { name: "Épico", chance: 15, emoji: "🟣" },
  { name: "Legendario", chance: 8, emoji: "🟠" },
  { name: "Mítico", chance: 2, emoji: "🔴" }
];

const itemNames = {
  Común: ["Maletín Negro", "Cables usados", "Control viejo", "Gorra gris"],
  Raro: ["Gafas polarizadas", "Tablet antigua", "Reloj digital", "Cámara vieja"],
  Épico: ["Espada de colección", "Drone usado", "Moneda de oro", "Bicicleta retro"],
  Legendario: ["Gafas rojas legendarias", "Katana firmada", "Anillo antiguo", "Maletín blindado"],
  Mítico: ["Cetro mágico", "Cristal del destino", "Computadora alienígena", "Casco místico"]
};

const npcNames = ["Pedro", "Lucía", "Juan", "Marta", "Kevin", "Sandra", "Oscar"];

let inventory = []; // objetos guardados

const moneyEl = document.getElementById("money");
const outputEl = document.getElementById("output");
const inventoryEl = document.getElementById("inventory");

function updateMoney() {
  moneyEl.innerText = "Dinero: $" + money;
}

function getRarity() {
  const roll = Math.random() * 100;
  let total = 0;
  for (const r of rarities) {
    total += r.chance;
    if (roll <= total) return r;
  }
  return rarities[0];
}

function generateItem(value) {
  const rarity = getRarity();
  const names = itemNames[rarity.name];
  const name = names[Math.floor(Math.random() * names.length)];
  return {
    name,
    rarity: rarity.name,
    emoji: rarity.emoji,
    value: Math.floor(value * (0.6 + Math.random() * 0.8)) // Valor variable con rango +-40%
  };
}

function buyContainer(type) {
  const container = containers[type];
  if (money < container.cost) {
    outputEl.innerHTML = `<p style="color:#e74c3c;">No tienes suficiente dinero para comprar este contenedor.</p>`;
    return;
  }
  money -= container.cost;
  updateMoney();

  outputEl.innerHTML = `<p>Compraste un contenedor (${type}) por $${container.cost}. Abriendo...</p>`;
  setTimeout(() => {
    currentItem = generateItem(container.max);
    inventory.push(currentItem);
    renderInventory();
    outputEl.innerHTML = `<p>Encontraste: <span class="rarity-${currentItem.rarity} special-effect">${currentItem.emoji} ${currentItem.name} (${currentItem.rarity})</span> valorado en $${currentItem.value}.</p>`;
    // Inicia ofertas para este objeto
    startOffers(currentItem);
  }, 1000);
}

function renderInventory() {
  inventoryEl.innerHTML = "";
  inventory.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "rarity-" + item.rarity;
    li.innerHTML = `
      ${item.emoji} ${item.name} (${item.rarity}) - Valor: $${item.value}
      <button onclick="startOffers(inventory[${index}])">Vender</button>
    `;
    inventoryEl.appendChild(li);
  });
}

function startOffers(item) {
  // Limpiar ofertas previas
  outputEl.innerHTML = `<p>Intentando vender: <span class="rarity-${item.rarity} special-effect">${item.emoji} ${item.name} (${item.rarity})</span></p><div id="offers"></div>`;
  const offersDiv = document.getElementById("offers");
  offersDiv.innerHTML = "";

  // Generar entre 2 y 4 compradores
  const buyersCount = Math.floor(2 + Math.random() * 3);

  let offers = [];
  for(let i=0; i<buyersCount; i++) {
    let offerPrice = Math.floor(item.value * (0.5 + Math.random())); // entre 50% y 150% del valor
    offerPrice = Math.min(offerPrice, money + offerPrice + 1000); // evitar ofertas demasiado locas
    offers.push({
      buyer: npcNames[Math.floor(Math.random() * npcNames.length)],
      price: offerPrice
    });
  }

  // Ordenar ofertas de mayor a menor
  offers.sort((a,b) => b.price - a.price);

  offers.forEach((offer, i) => {
    const btn = document.createElement("button");
    btn.textContent = `${offer.buyer} ofrece $${offer.price}`;
    btn.onclick = () => acceptOffer(item, offer.price);
    offersDiv.appendChild(btn);
  });

  // Botón para rechazar todas las ofertas y guardar en inventario
  const rejectBtn = document.createElement("button");
  rejectBtn.textContent = "Rechazar ofertas (Guardar en inventario)";
  rejectBtn.style.background = "#c0392b";
  rejectBtn.style.boxShadow = "0 3px #7b241c";
  rejectBtn.onclick = () => {
    outputEl.innerHTML = `<p>Has guardado el objeto en tu inventario para venderlo después.</p>`;
    renderInventory();
  };
  offersDiv.appendChild(rejectBtn);
}

function acceptOffer(item, price) {
  money += price;
  updateMoney();
  // Eliminar item del inventario
  inventory = inventory.filter(i => i !== item);
  renderInventory();
  outputEl.innerHTML = `<p>Vendiste <span class="rarity-${item.rarity} special-effect">${item.emoji} ${item.name}</span> por $${price}.</p>`;
}

// Lógica para que después de un tiempo aparezcan nuevos compradores para objetos en inventario
setInterval(() => {
  if(inventory.length === 0) return;

  const item = inventory[Math.floor(Math.random() * inventory.length)];
  outputEl.innerHTML = `<p>¡Un comprador está interesado en un objeto de tu inventario!</p>`;
  startOffers(item);
}, 30000); // cada 30 segundos

updateMoney();
renderInventory();