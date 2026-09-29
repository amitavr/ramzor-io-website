"use strict";

document.documentElement.classList.add("js");
if (window.lucide) window.lucide.createIcons();

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");
menuButton.hidden = false;

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  menuButton.title = "Open navigation";
  navigation.classList.remove("is-open");
}

menuButton.addEventListener("click", () => {
  const expanded = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(expanded));
  menuButton.setAttribute("aria-label", expanded ? "Close navigation" : "Open navigation");
  menuButton.title = expanded ? "Close navigation" : "Open navigation";
  navigation.classList.toggle("is-open", expanded);
});
navigation.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && navigation.classList.contains("is-open")) {
    closeMenu();
    menuButton.focus();
  }
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".site-header")) closeMenu();
});
window.matchMedia("(min-width: 901px)").addEventListener("change", closeMenu);

const contactDialog = document.getElementById("contact-dialog");
const dialogOpeners = new WeakMap();
const contactPromptKey = "ramzor.io-junction-prompt-seen";
let contactPromptSeen = false;
try {
  contactPromptSeen = sessionStorage.getItem(contactPromptKey) === "true";
} catch { /* Storage may be unavailable in privacy-restricted browsers. */ }

function markContactPromptSeen() {
  contactPromptSeen = true;
  try { sessionStorage.setItem(contactPromptKey, "true"); } catch { /* Keep the in-memory state. */ }
}

function openContactDialog(opener = menuButton) {
  if (contactDialog.open || document.querySelector("dialog[open]")) return;
  markContactPromptSeen();
  dialogOpeners.set(contactDialog, opener);
  contactDialog.showModal();
  document.body.classList.add("modal-open");
}

document.querySelectorAll("[data-contact]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openContactDialog(link);
  });
});

let contactPromptReady = false;
function considerContactPrompt() {
  if (!contactPromptReady || contactPromptSeen) return;
  const scrollableDistance = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollableDistance <= 0 || window.scrollY / scrollableDistance < .48) return;
  window.removeEventListener("scroll", considerContactPrompt);
  openContactDialog();
}
window.addEventListener("scroll", considerContactPrompt, { passive: true });
window.setTimeout(() => {
  contactPromptReady = true;
  considerContactPrompt();
}, 7000);

const privacyButton = document.querySelector("[data-privacy]");
privacyButton.hidden = false;
privacyButton.addEventListener("click", () => {
  const privacyDialog = document.getElementById("privacy-dialog");
  dialogOpeners.set(privacyDialog, privacyButton);
  privacyDialog.showModal();
  document.body.classList.add("modal-open");
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector("[data-close-dialog]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    const opener = dialogOpeners.get(dialog);
    const focusTarget = opener && opener.getClientRects().length ? opener : menuButton;
    focusTarget.focus();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      dialog.close();
    }
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
  });
});

const contactForm = document.getElementById("contact-form");
const contactReady = document.getElementById("contact-ready");
const formStatus = document.getElementById("form-status");
const formSubmit = contactForm.querySelector('[type="submit"]');
contactForm.elements.namedItem("startedAt").value = String(Date.now());
contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  formSubmit.disabled = true;
  formStatus.classList.remove("is-error");
  formStatus.textContent = "Sending your inquiry…";
  try {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
    });
    if (!response.ok) throw new Error("Submission failed");
    contactForm.reset();
    contactForm.elements.namedItem("startedAt").value = String(Date.now());
    contactForm.hidden = true;
    contactReady.hidden = false;
    contactReady.querySelector("h3").focus();
  } catch {
    formStatus.classList.add("is-error");
    formStatus.textContent = "We couldn't send your inquiry. Please email contact@ramzor.io directly.";
  } finally {
    formSubmit.disabled = false;
  }
});
document.getElementById("edit-inquiry").addEventListener("click", () => {
  contactReady.hidden = true;
  contactForm.hidden = false;
  formStatus.classList.remove("is-error");
  formStatus.textContent = "Your details are sent securely to contact@ramzor.io.";
  contactForm.elements.namedItem("startedAt").value = String(Date.now());
  contactForm.elements.namedItem("name").focus();
});

const observationTabs = [...document.querySelectorAll("[data-observation]")];
const observationMedia = document.querySelector(".observation-media");
function selectObservation(tab) {
  observationTabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute("aria-controls")).hidden = !selected;
  });
  observationMedia.dataset.layer = tab.dataset.observation;
  observationMedia.dispatchEvent(new Event("layerchange"));
}
observationTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectObservation(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % observationTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + observationTabs.length) % observationTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = observationTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectObservation(observationTabs[nextIndex]);
    observationTabs[nextIndex].focus();
  });
});
document.getElementById("copyright-year").textContent = String(new Date().getFullYear());

function countLineCrossings(progress, movement, countLine, loopLength) {
  return Math.floor((progress + movement - countLine) / loopLength) - Math.floor((progress - countLine) / loopLength);
}

function setDemoMetricsVisible(visible) {
  document.querySelectorAll("[data-demo-metrics]").forEach((metrics) => { metrics.hidden = !visible; });
}

function createIntersection({ isHero = false } = {}) {
  const THREE = window.THREE;
  const showFallback = isHero ? showStaticHero : showStaticStudy;
  if (!THREE) return showFallback();
  const host = document.getElementById(isHero ? "hero-scene" : "intersection-scene");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sceneToggle = document.getElementById(isHero ? "hero-scene-toggle" : "scene-toggle");
  const crossingOutput = document.getElementById("demo-vehicle-count");
  const periodOutput = document.getElementById("demo-observation-period");
  const completedOutput = document.getElementById("demo-completed-count");
  const movingOutput = document.getElementById("demo-moving-count");
  const waitingOutput = document.getElementById("demo-waiting-count");
  const longestQueueOutput = document.getElementById("demo-longest-queue");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
  } catch {
    return showFallback();
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0xf4f6f3, 0);
  host.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-28, 28, 23, -23, .1, 150);
  camera.position.set(33, 37, 33);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xb7c3a8, 2.6));
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(-14, 30, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -32;
  sun.shadow.camera.right = 32;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -32;
  sun.shadow.normalBias = .035;
  sun.shadow.bias = -.0002;
  sun.shadow.radius = 3;
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  const materialCache = new Map();
  function material(color, options = {}) {
    const key = `${color}:${JSON.stringify(options)}`;
    if (!materialCache.has(key)) materialCache.set(key, new THREE.MeshStandardMaterial({ color, roughness: .85, ...options }));
    return materialCache.get(key);
  }
  function box(width, height, depth, color, position, parent = world, options = {}) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material(color, options));
    mesh.position.set(...position);
    mesh.castShadow = height > .15;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  function cylinder(radius, height, color, position, parent = world) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 12), material(color));
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }

  box(43, .3, 43, 0xe8ede3, [0, -.25, 0]);
  box(7.6, .055, 43, 0x535e59, [0, -.06, 0]);
  box(43, .055, 7.6, 0x535e59, [0, -.025, 0]);
  const roadWhite = 0xe8edda;
  for (const coordinate of [-18, -14.5, -11, -7.5, 7.5, 11, 14.5, 18]) {
    box(.075, .012, 1.7, roadWhite, [0, .015, coordinate]);
    box(1.7, .012, .075, roadWhite, [coordinate, .02, 0]);
  }
  for (const side of [-1, 1]) {
    for (const position of [-2.9, -2.05, -1.2, -.35, .5, 1.35, 2.2, 3.05]) {
      box(.43, .02, 1.15, roadWhite, [position, .015, side * 5.1]);
      box(1.15, .02, .43, roadWhite, [side * 5.1, .025, position]);
    }
    box(3.35, .02, .13, roadWhite, [side * 1.9, .03, side * 6.3]);
    box(.13, .02, 3.35, roadWhite, [side * 6.3, .03, -side * 1.9]);
    for (const roadPosition of [-13, 13]) {
      box(.09, .015, 12, roadWhite, [side * 3.5, .01, roadPosition]);
      box(12, .015, .09, roadWhite, [roadPosition, .01, side * 3.5]);
    }
  }

  for (const horizontal of [-1, 1]) {
    for (const vertical of [-1, 1]) {
      box(16.7, .2, 16.7, 0xdde3d8, [horizontal * 12.3, .01, vertical * 12.3]);
      box(15.5, .08, 15.5, 0xe8ece1, [horizontal * 12.5, .14, vertical * 12.5]);
      box(5, .09, 2.9, 0xbbcca7, [horizontal * 7.1, .22, vertical * 7.1]);
    }
  }

  function building(position, width, depth, height, color) {
    const group = new THREE.Group();
    group.position.set(...position);
    world.add(group);
    box(width + .3, .24, depth + .3, 0xc8d0c2, [0, .24, 0], group);
    box(width, height, depth, color, [0, height / 2 + .35, 0], group);
    box(width + .15, .22, depth + .15, 0xf3f4ec, [0, height + .44, 0], group);
    box(width - .8, .1, depth - .8, 0xd6ded0, [0, height + .57, 0], group);
    box(1.1, .45, 1.4, 0xb2beb0, [width * .15, height + .82, -.4], group);
    for (let level = 1; level < height - .2; level += 1.5) {
      box(width - .7, .59, .025, 0x9faf9f, [0, level + .45, depth / 2 + .014], group, { metalness: .1 });
      box(.025, .59, depth - .7, 0xabbcac, [width / 2 + .014, level + .45, 0], group, { metalness: .1 });
      for (let windowPosition = -width / 2 + 1.1; windowPosition < width / 2 - .3; windowPosition += 1.2) box(.13, .65, .04, color, [windowPosition, level + .45, depth / 2 + .04], group);
    }
  }
  building([-11.5, 0, -11], 8, 7.6, 6.8, 0xe8e9dd);
  building([-11.5, 0, -18], 6.7, 3.6, 4.6, 0xe2e5d6);
  building([12, 0, -12.5], 7.8, 9.2, 4.7, 0xe6e7df);
  building([18, 0, 11.5], 4, 7, 3.3, 0xd9dfcf);
  building([-12, 0, 13.5], 8.5, 6.1, 3.4, 0xe8e8dc);

  function tree(horizontal, vertical, scale = 1) {
    const group = new THREE.Group();
    group.position.set(horizontal, .2, vertical);
    group.scale.setScalar(scale);
    world.add(group);
    cylinder(.12, 1.3, 0x879078, [0, .75, 0], group);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 1), material(0x97b373, { flatShading: true }));
    crown.position.y = 2.1;
    crown.scale.y = 1.2;
    crown.castShadow = true;
    group.add(crown);
    cylinder(.8, .1, 0xc4d2b5, [0, .1, 0], group);
  }
  [[-6.1,-8.2,1],[-6.2,-15,1.1],[6.2,-9.1,.9],[6.1,-17,1],[7.3,7.3,1.1],[11.2,7.2,.9],[14,13,1.15],[8.1,15.9,1],[-6.1,7.7,.9],[-7.1,18.6,1],[-18.4,6.4,.95]].forEach((coordinates) => tree(...coordinates));

  box(6.5, .14, 8, 0xc6d4b7, [10.7, .25, 12.8]);
  box(.9, .04, 8, 0xe4e9d9, [11, .35, 12.8]);
  box(6.5, .04, .9, 0xe4e9d9, [10.7, .36, 11.5]);
  for (const location of [[8.5, 13.5], [13, 9.2], [-6, 12]]) {
    box(1.7, .14, .55, 0xb89e6b, [location[0], .8, location[1]]);
    box(1.7, .45, .11, 0xb89e6b, [location[0], 1.01, location[1] + .23]);
    box(.1, .6, .45, 0x677666, [location[0] - .6, .45, location[1]]);
    box(.1, .6, .45, 0x677666, [location[0] + .6, .45, location[1]]);
  }

  const signals = [];
  function trafficLight(horizontal, vertical, rotation, phase) {
    const group = new THREE.Group();
    group.position.set(horizontal, .1, vertical);
    group.rotation.y = rotation;
    world.add(group);
    cylinder(.09, 3.2, 0x47544a, [0, 1.6, 0], group);
    box(.56, 1.26, .37, 0x263b2c, [0, 3.2, 0], group);
    const bulbs = [];
    for (let index = 0; index < 3; index += 1) {
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(.155, 12, 8), new THREE.MeshStandardMaterial({ color: 0x475448, emissive: 0x000000, roughness: .4 }));
      bulb.position.set(0, 3.57 - index * .37, .195);
      bulb.scale.z = .5;
      group.add(bulb);
      bulbs.push(bulb);
      box(.41, .07, .33, 0x263b2c, [0, 3.76 - index * .37, .2], group);
    }
    signals.push({ bulbs, phase });
  }
  trafficLight(4.4, 6.1, 0, "north");
  trafficLight(-4.4, -6.1, Math.PI, "north");
  trafficLight(6.1, -4.4, Math.PI / 2, "east");
  trafficLight(-6.1, 4.4, -Math.PI / 2, "east");

  const carColors = [0xf6f1dc, 0xe1b363, 0x8faa99, 0xd9e1d5, 0xc4cec8, 0xf0eee5, 0x9bad87, 0xc57960];
  function car(color, outlined) {
    const group = new THREE.Group();
    box(1.08, .39, 2.2, color, [0, .51, 0], group, { roughness: .48 });
    box(.9, .4, 1.1, color, [0, .89, -.13], group, { roughness: .48 });
    box(.8, .3, .035, 0x6e8580, [0, .91, .437], group, { roughness: .3 });
    box(.8, .28, .035, 0x6e8580, [0, .91, -.697], group, { roughness: .3 });
    for (const side of [-1, 1]) {
      box(.03, .26, .9, 0x6e8580, [side * .46, .91, -.13], group);
      box(.18, .12, .03, 0xffefd2, [side * .33, .55, 1.115], group);
      box(.18, .1, .03, 0xbf6754, [side * .33, .55, -1.115], group);
      for (const axle of [-.7, .7]) {
        const wheel = cylinder(.23, .13, 0x303e35, [side * .56, .3, axle], group);
        wheel.rotation.z = Math.PI / 2;
      }
    }
    if (outlined) {
      const points = [[-.72,.15,-1.3],[.72,.15,-1.3],[.72,.15,1.3],[-.72,.15,1.3],[-.72,.15,-1.3]].map((point) => new THREE.Vector3(...point));
      group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color: 0x92bc68, transparent: true, opacity: .9 })));
    }
    world.add(group);
    return group;
  }
  const loopLength = 44;
  const countLineProgress = 5;
  const stopLineProgress = 15.2;
  const queueStartProgress = 3;
  const queueEndProgress = stopLineProgress + .5;
  const movementExitProgress = loopLength - queueEndProgress;
  const lanes = [
    { axis: "z", offset: -1.85, direction: 1, phase: "north" },
    { axis: "z", offset: 1.85, direction: -1, phase: "north" },
    { axis: "x", offset: 1.85, direction: 1, phase: "east" },
    { axis: "x", offset: -1.85, direction: -1, phase: "east" },
  ];
  const layers = { movements: new THREE.Group(), queues: new THREE.Group(), counts: new THREE.Group() };
  Object.values(layers).forEach((layer) => world.add(layer));
  function movementPath(coordinates, color) {
    const curve = new THREE.CatmullRomCurve3(coordinates.map(([horizontal, vertical]) => new THREE.Vector3(horizontal, .14, vertical)));
    const pathMaterial = new THREE.MeshBasicMaterial({ color });
    layers.movements.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 64, .13, 5, false), pathMaterial));
    const arrow = new THREE.Mesh(new THREE.ConeGeometry(.44, 1.2, 3), pathMaterial);
    arrow.position.copy(curve.getPoint(.9));
    arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), curve.getTangent(.9).normalize());
    layers.movements.add(arrow);
  }
  if (!isHero) {
    movementPath([[1.85, 19], [1.85, 7], [1.85, -7], [1.85, -19]], 0xa6d76e);
    movementPath([[-1.85, -19], [-1.85, -7], [-1.5, -2], [3, 1.85], [9, 1.85], [19, 1.85]], 0xffc15b);
    movementPath([[-19, 1.85], [-8, 1.85], [-4, 2], [-1.85, 5], [-1.85, 19]], 0xfb8170);
    lanes.forEach((lane) => {
      const queueRegion = new THREE.Group();
      const queueLength = queueEndProgress - queueStartProgress;
      const position = ((queueStartProgress + queueEndProgress) / 2 - loopLength / 2) * lane.direction;
      queueRegion.position.set(lane.axis === "x" ? position : lane.offset, 0, lane.axis === "z" ? position : lane.offset);
      queueRegion.rotation.y = lane.axis === "z" ? (lane.direction === -1 ? 0 : Math.PI) : -lane.direction * Math.PI / 2;
      layers.queues.add(queueRegion);
      box(3.2, .025, queueLength, 0xf5bd52, [0, .04, 0], queueRegion, { transparent: true, opacity: .38, depthWrite: false });
      box(.15, .025, queueLength, 0xffc15b, [1.75, .1, 0], queueRegion);
      for (const end of [-queueLength / 2, queueLength / 2]) box(.7, .025, .15, 0xffc15b, [1.45, .1, end], queueRegion);
    });
    lanes.forEach((lane) => {
      const gate = (countLineProgress - loopLength / 2) * lane.direction;
      box(lane.axis === "z" ? 3.3 : .24, .025, lane.axis === "z" ? .24 : 3.3, 0xa6d76e,
        [lane.axis === "x" ? gate : lane.offset, .1, lane.axis === "z" ? gate : lane.offset], layers.counts);
      box(lane.axis === "z" ? 3.2 : 12, .02, lane.axis === "z" ? 12 : 3.2, 0xadd980,
        [lane.axis === "x" ? -12 * lane.direction : lane.offset, .035, lane.axis === "z" ? -12 * lane.direction : lane.offset],
        layers.counts, { transparent: true, opacity: .2, depthWrite: false });
    });
  }
  lanes.forEach((lane, laneIndex) => {
    lane.cars = [1, 8, 16, 32].map((progress, index) => {
      const mesh = car(carColors[(laneIndex * 3 + index) % carColors.length], !isHero && index === 2);
      mesh.rotation.y = lane.axis === "z" ? (lane.direction === 1 ? 0 : Math.PI) : (lane.direction === 1 ? Math.PI / 2 : -Math.PI / 2);
      let trail;
      if (!isHero) {
        const trailGeometry = new THREE.BufferGeometry();
        trailGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
        trail = new THREE.Line(trailGeometry, new THREE.LineBasicMaterial({ color: 0xc9eaa4, transparent: true, opacity: .8 }));
        trail.frustumCulled = false;
        layers.movements.add(trail);
      }
      return { mesh, trail, progress: progress + laneIndex * .4 };
    });
  });
  let elapsed = 3;
  let observedSeconds = 0;
  let vehicleCrossings = 0;
  let completedMovements = 0;
  let activePhase = "north";
  function updateTraffic(delta) {
    elapsed += delta;
    observedSeconds += delta;
    const cycle = elapsed % 30;
    activePhase = cycle < 11 ? "north" : cycle < 15 ? "clear" : cycle < 26 ? "east" : "clear";
    signals.forEach(({ bulbs, phase }) => {
      const green = activePhase === phase;
      bulbs.forEach((bulb, index) => {
        const lit = index === (green ? 2 : 0);
        const color = lit ? (green ? 0x83d768 : 0xf36a4e) : 0x445143;
        bulb.material.color.setHex(color);
        bulb.material.emissive.setHex(lit ? color : 0x000000);
        bulb.material.emissiveIntensity = lit ? .5 : 0;
      });
    });
    let movingVehicles = 0;
    let waitingVehicles = 0;
    let longestQueue = 0;
    lanes.forEach((lane) => {
      const positions = lane.cars.map((vehicle) => vehicle.progress);
      let queuedInLane = 0;
      lane.cars.forEach((vehicle, index) => {
        const gap = Math.min(...positions.filter((_, candidate) => candidate !== index).map((position) => (position - vehicle.progress + loopLength) % loopLength));
        let availableMovement = Math.max(0, gap - 3.3);
        if (activePhase !== lane.phase && vehicle.progress <= stopLineProgress) availableMovement = Math.min(availableMovement, Math.max(0, stopLineProgress - vehicle.progress));
        const movement = Math.min(delta * 3.7, availableMovement);
        vehicleCrossings += countLineCrossings(vehicle.progress, movement, countLineProgress, loopLength);
        completedMovements += countLineCrossings(vehicle.progress, movement, movementExitProgress, loopLength);
        vehicle.progress = (vehicle.progress + movement) % loopLength;
        if (availableMovement > .001) movingVehicles += 1;
        else if (vehicle.progress >= queueStartProgress && vehicle.progress <= queueEndProgress) queuedInLane += 1;
        const position = lane.direction * (vehicle.progress - loopLength / 2);
        vehicle.mesh.position.set(lane.axis === "x" ? position : lane.offset, .035, lane.axis === "z" ? position : lane.offset);
        if (vehicle.trail) {
          const tail = lane.direction * (Math.max(0, vehicle.progress - 4.5) - loopLength / 2);
          const points = vehicle.trail.geometry.attributes.position;
          points.setXYZ(0, lane.axis === "x" ? tail : lane.offset, .12, lane.axis === "z" ? tail : lane.offset);
          points.setXYZ(1, lane.axis === "x" ? position : lane.offset, .12, lane.axis === "z" ? position : lane.offset);
          points.needsUpdate = true;
        }
      });
      waitingVehicles += queuedInLane;
      longestQueue = Math.max(longestQueue, queuedInLane);
    });
    if (!isHero) {
      const wholeSeconds = Math.floor(observedSeconds);
      const observationPeriod = `${String(Math.floor(wholeSeconds / 60)).padStart(2, "0")}:${String(wholeSeconds % 60).padStart(2, "0")}`;
      for (const [output, value] of [[crossingOutput, vehicleCrossings], [periodOutput, observationPeriod],
        [completedOutput, completedMovements], [movingOutput, movingVehicles], [waitingOutput, waitingVehicles], [longestQueueOutput, longestQueue]]) {
        const text = String(value);
        if (output.value !== text) output.value = text;
      }
    }
    renderer.domElement.dataset.elapsed = elapsed.toFixed(2);
    renderer.domElement.dataset.phase = activePhase;
  }

  let paused = reducedMotion.matches;
  let inView = false;
  let frameHandle = 0;
  let previousTime = 0;
  function render() { renderer.render(scene, camera); }
  function animate(timestamp) {
    frameHandle = 0;
    if (paused || !inView || document.hidden) return;
    const delta = previousTime ? Math.min((timestamp - previousTime) / 1000, .05) : 0;
    previousTime = timestamp;
    updateTraffic(delta);
    render();
    frameHandle = requestAnimationFrame(animate);
  }
  function resumeRendering() {
    previousTime = 0;
    if (!frameHandle && !paused && inView && !document.hidden) frameHandle = requestAnimationFrame(animate);
  }
  function setPaused(value) {
    paused = value;
    if (paused && frameHandle) {
      cancelAnimationFrame(frameHandle);
      frameHandle = 0;
    }
    sceneToggle.setAttribute("aria-pressed", String(paused));
    const animationName = isHero ? "hero animation" : "intersection animation";
    sceneToggle.setAttribute("aria-label", `${paused ? "Resume" : "Pause"} ${animationName}`);
    sceneToggle.title = sceneToggle.getAttribute("aria-label");
    sceneToggle.querySelector("[data-pause]").toggleAttribute("hidden", paused);
    sceneToggle.querySelector("[data-play]").toggleAttribute("hidden", !paused);
    resumeRendering();
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    if (!width || !height) return;
    const aspect = width / height;
    const span = isHero ? 43 * Math.max(1, (1183 / 918) / aspect) : window.innerWidth <= 620 ? 61 : 54;
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  function updateLayer() {
    const selected = isHero ? "none" : observationMedia.dataset.layer;
    Object.entries(layers).forEach(([name, layer]) => { layer.visible = name === selected; });
    const descriptions = {
      movements: "Illustrative intersection with movement arrows. Figures show animated vehicles clearing the junction and moving through the scene.",
      queues: "Illustrative intersection with amber queue regions on all four approaches. Waiting vehicles and queue lengths are counted from the animation, not recorded traffic.",
      counts: "Illustrative intersection with counting lines. Crossings and observation time are calculated from this animation, not recorded traffic.",
    };
    if (!isHero) host.setAttribute("aria-label", descriptions[selected]);
    renderer.domElement.dataset.layer = selected;
    render();
  }
  if (!isHero) observationMedia.addEventListener("layerchange", updateLayer);
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    resumeRendering();
  }, { threshold: .02 }).observe(isHero ? document.querySelector(".hero") : host);
  document.addEventListener("visibilitychange", resumeRendering);
  reducedMotion.addEventListener("change", (event) => setPaused(event.matches));
  sceneToggle.addEventListener("click", () => setPaused(!paused));
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    setPaused(true);
    showFallback();
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    resize();
    host.classList.add("scene-ready");
    sceneToggle.hidden = false;
    if (isHero) {
      host.setAttribute("aria-label", "Illustrative intersection with moving vehicles and changing traffic signals. Not a real deployment.");
    } else {
      setDemoMetricsVisible(true);
      document.querySelector(".observation-tabs").hidden = false;
      document.getElementById("scene-caption").textContent = "Illustrative animation. Not a real deployment.";
    }
    updateLayer();
    setPaused(reducedMotion.matches);
  });
  updateTraffic(0);
  if (!isHero) setDemoMetricsVisible(true);
  resize();
  updateLayer();
  sceneToggle.hidden = false;
  host.classList.add("scene-ready");
  setPaused(paused);
}

function showStaticHero() {
  const host = document.getElementById("hero-scene");
  host.classList.remove("scene-ready");
  host.setAttribute("aria-label", "Illustrative intersection still. Not a real deployment.");
  document.getElementById("hero-scene-toggle").hidden = true;
}

function showStaticStudy() {
  const host = document.getElementById("intersection-scene");
  host.classList.remove("scene-ready");
  host.setAttribute("aria-label", "Illustrative intersection still. Interactive overlays are unavailable.");
  document.getElementById("scene-toggle").hidden = true;
  setDemoMetricsVisible(false);
  document.querySelector(".observation-tabs").hidden = true;
  document.getElementById("scene-caption").textContent = "Illustrative still. Interactive overlays are unavailable in this browser.";
}

let intersectionLibrary;
function loadIntersectionLibrary() {
  if (window.THREE) return Promise.resolve();
  if (!intersectionLibrary) {
    intersectionLibrary = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "assets/three.min.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return intersectionLibrary;
}

function initializeHero() {
  const heroObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    heroObserver.disconnect();
    loadIntersectionLibrary().then(() => createIntersection({ isHero: true })).catch(showStaticHero);
  }, { rootMargin: "100px" });
  heroObserver.observe(document.querySelector(".hero"));
}

function initializeStudy() {
  const source = observationMedia.dataset.studySource;
  const media = source === "video" ? document.getElementById("study-video") : source === "image" ? document.getElementById("study-image") : null;
  if (media && media.getAttribute("src")) {
    const host = document.getElementById("intersection-scene");
    const overlay = document.getElementById("footage-overlay");
    host.hidden = true;
    media.hidden = false;
    setDemoMetricsVisible(false);
    overlay.toggleAttribute("hidden", overlay.childElementCount === 0);
    document.getElementById("scene-toggle").hidden = true;
    document.querySelector(".scene-reference").hidden = true;
    document.querySelector(".demo-label").textContent = media.dataset.label || "ILLUSTRATIVE MEDIA";
    document.getElementById("scene-caption").textContent = media.dataset.caption || "Illustrative media. Not a real deployment.";
    function fitMedia() {
      const width = source === "video" ? media.videoWidth : media.naturalWidth;
      const height = source === "video" ? media.videoHeight : media.naturalHeight;
      if (!width || !height) return;
      overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
    }
    function updateFootageLayer() {
      overlay.querySelectorAll("[data-layer]").forEach((layer) => {
        layer.toggleAttribute("hidden", layer.dataset.layer !== observationMedia.dataset.layer);
      });
    }
    media.addEventListener(source === "video" ? "loadedmetadata" : "load", fitMedia);
    media.addEventListener("error", () => {
      media.hidden = true;
      overlay.toggleAttribute("hidden", true);
      host.hidden = false;
      document.querySelector(".demo-label").textContent = "ILLUSTRATIVE FALLBACK";
      showStaticStudy();
    });
    observationMedia.addEventListener("layerchange", updateFootageLayer);
    fitMedia();
    updateFootageLayer();
    document.querySelector(".observation-tabs").hidden = overlay.childElementCount === 0;
    return;
  }
  const previewObserver = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;
    previewObserver.disconnect();
    if (observationMedia.dataset.studySource !== "demo") return;
    loadIntersectionLibrary().then(() => createIntersection()).catch(showStaticStudy);
  }, { rootMargin: "100px" });
  previewObserver.observe(observationMedia);
}

initializeHero();
initializeStudy();
