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
window.matchMedia("(min-width: 621px)").addEventListener("change", closeMenu);

const contactDialog = document.getElementById("contact-dialog");
document.querySelectorAll("[data-contact]").forEach((link) => {
  link.addEventListener("click", (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    contactDialog.showModal();
    document.body.classList.add("modal-open");
  });
});

const privacyButton = document.querySelector("[data-privacy]");
privacyButton.hidden = false;
privacyButton.addEventListener("click", () => {
  document.getElementById("privacy-dialog").showModal();
  document.body.classList.add("modal-open");
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.querySelector("[data-close-dialog]").addEventListener("click", () => dialog.close());
  dialog.addEventListener("close", () => document.body.classList.remove("modal-open"));
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
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) return;
  const details = new FormData(contactForm);
  const contactAddress = document.querySelector("[data-contact-email]").getAttribute("href").slice(7);
  const subject = `ramzor.io inquiry: ${details.get("interest")}`;
  const message = [
    "Hello ramzor.io team,", "", `Name: ${String(details.get("name")).trim()}`,
    `Email: ${String(details.get("email")).trim()}`, `Organization: ${String(details.get("organization")).trim()}`,
    `Interest: ${details.get("interest")}`, "", String(details.get("message")).trim(),
  ].join("\r\n");
  document.getElementById("email-draft").href = `mailto:${contactAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  contactForm.hidden = true;
  contactReady.hidden = false;
  contactReady.querySelector("h3").focus();
});
document.getElementById("edit-inquiry").addEventListener("click", () => {
  contactReady.hidden = true;
  contactForm.hidden = false;
  contactForm.elements.namedItem("name").focus();
});

const audienceTabs = [...document.querySelectorAll("[data-audience]")];
function selectAudience(tab) {
  audienceTabs.forEach((candidate) => {
    const selected = candidate === tab;
    candidate.setAttribute("aria-selected", String(selected));
    candidate.tabIndex = selected ? 0 : -1;
    document.getElementById(candidate.getAttribute("aria-controls")).hidden = !selected;
  });
}
audienceTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectAudience(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % audienceTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + audienceTabs.length) % audienceTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = audienceTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectAudience(audienceTabs[nextIndex]);
    audienceTabs[nextIndex].focus();
  });
});
document.getElementById("copyright-year").textContent = String(new Date().getFullYear());

function createIntersection() {
  const THREE = window.THREE;
  if (!THREE) return;
  const host = document.getElementById("intersection-scene");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sceneToggle = document.getElementById("scene-toggle");
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power", preserveDrawingBuffer: true });
  } catch {
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
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
  sun.shadow.mapSize.set(2048, 2048);
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
  const lanes = [
    { axis: "z", offset: -1.85, direction: 1, phase: "north" },
    { axis: "z", offset: 1.85, direction: -1, phase: "north" },
    { axis: "x", offset: 1.85, direction: 1, phase: "east" },
    { axis: "x", offset: -1.85, direction: -1, phase: "east" },
  ];
  lanes.forEach((lane, laneIndex) => {
    lane.cars = [1, 8, 16, 32].map((progress, index) => {
      const mesh = car(carColors[(laneIndex * 3 + index) % carColors.length], index === 2);
      mesh.rotation.y = lane.axis === "z" ? (lane.direction === 1 ? 0 : Math.PI) : (lane.direction === 1 ? Math.PI / 2 : -Math.PI / 2);
      return { mesh, progress: progress + laneIndex * .4 };
    });
  });
  let elapsed = 3;
  let activePhase = "north";
  function updateTraffic(delta) {
    elapsed += delta;
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
    lanes.forEach((lane) => {
      const positions = lane.cars.map((vehicle) => vehicle.progress);
      lane.cars.forEach((vehicle, index) => {
        let movement = delta * 3.7;
        const gap = Math.min(...positions.filter((_, candidate) => candidate !== index).map((position) => (position - vehicle.progress + 44) % 44));
        movement = Math.max(0, Math.min(movement, gap - 3.3));
        const stopLine = 15.2;
        if (activePhase !== lane.phase && vehicle.progress <= stopLine) movement = Math.min(movement, Math.max(0, stopLine - vehicle.progress));
        vehicle.progress = (vehicle.progress + movement) % 44;
        const position = lane.direction * (vehicle.progress - 22);
        vehicle.mesh.position.set(lane.axis === "x" ? position : lane.offset, .035, lane.axis === "z" ? position : lane.offset);
      });
    });
    renderer.domElement.dataset.elapsed = elapsed.toFixed(2);
    renderer.domElement.dataset.phase = activePhase;
  }

  let paused = reducedMotion.matches;
  let inView = true;
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
    sceneToggle.setAttribute("aria-pressed", String(paused));
    sceneToggle.setAttribute("aria-label", paused ? "Resume intersection animation" : "Pause intersection animation");
    sceneToggle.title = paused ? "Resume intersection animation" : "Pause intersection animation";
    sceneToggle.querySelector("[data-pause]").toggleAttribute("hidden", paused);
    sceneToggle.querySelector("[data-play]").toggleAttribute("hidden", !paused);
    resumeRendering();
  }
  function resize() {
    const width = host.clientWidth;
    const height = host.clientHeight;
    const aspect = width / height;
    const span = window.innerWidth <= 620 ? 46 : 43;
    camera.left = -span * aspect / 2;
    camera.right = span * aspect / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  }
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver((entries) => {
    inView = entries[0].isIntersecting;
    resumeRendering();
  }, { threshold: .02 }).observe(document.querySelector(".hero"));
  document.addEventListener("visibilitychange", resumeRendering);
  reducedMotion.addEventListener("change", (event) => setPaused(event.matches));
  sceneToggle.addEventListener("click", () => setPaused(!paused));
  renderer.domElement.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    setPaused(true);
    sceneToggle.hidden = true;
    host.classList.remove("scene-ready");
  });
  renderer.domElement.addEventListener("webglcontextrestored", () => {
    resize();
    host.classList.add("scene-ready");
    sceneToggle.hidden = false;
    setPaused(reducedMotion.matches);
  });
  updateTraffic(0);
  resize();
  sceneToggle.hidden = false;
  host.classList.add("scene-ready");
  setPaused(paused);
}

createIntersection();