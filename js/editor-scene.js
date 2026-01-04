const rings = document.querySelectorAll(".ring");
const ringLabels = document.querySelectorAll(".ring-label");
const closeBtn = document.getElementById("close");
const specsPanel = document.getElementById("specs-panel");
const footerText = document.getElementById("footer-text");
const subtextScene2 = document.getElementById("subtext-scene2");
const scene = document.querySelector("a-scene");
const focusShadow = document.getElementById("focus-shadow");

// Data for each ring
const ringContent = {
  "ring1": {
    title: "AURIX NOCTIS <span style='display:block; font-size: 0.5em; font-weight: 400; margin-top: 5px; opacity: 0.8;'>Platinum Ring</span>",
    desc: "Forged in pure platinum.<br>Refined through precise craftsmanship.<br>Timeless in form and feel.",
    specs: [
      { key: "Metal", val: "Platinum 950" },
      { key: "Finish", val: "Mirror Polish" }
    ]
  },
  "ring2": {
    title: "AURIX AETHER <span style='display:block; font-size: 0.5em; font-weight: 400; margin-top: 5px; opacity: 0.8;'>Platinum + Diamonds</span>",
    desc: "Platinum meets radiant brilliance.<br>Diamonds set with absolute precision.<br>Designed to shine effortlessly.",
    specs: [
      { key: "Metal", val: "Platinum 950" },
      { key: "Stones", val: "Natural Diamonds" },
      { key: "Finish", val: "High Polish" }
    ]
  },
  "ring3": {
    title: "AURIX OBSIDIAN <span style='display:block; font-size: 0.5em; font-weight: 400; margin-top: 5px; opacity: 0.8;'>Statement Piece</span>",
    desc: "A bold expression of luxury.<br>Sculpted with strength and balance.<br>Crafted to command attention.",
    specs: [
      { key: "Metal", val: "Platinum 950" },
      { key: "Finish", val: "Signature Polish" }
    ]
  }
};

let activeRing = null;
let isDragging = false;
let lastX = 0;
const originalPositions = new Map();

function initRings() {
  rings.forEach(ring => {
    // Capture original position and rotation accurately
    const pos = ring.getAttribute("position");
    const rot = ring.getAttribute("rotation");

    originalPositions.set(ring, { 
      pos: { x: pos.x, y: pos.y, z: pos.z },
      rot: { x: rot.x, y: rot.y, z: rot.z }
    });

    ring.addEventListener("click", () => {
    if (activeRing) return;

    // hide others
    rings.forEach(r => {
      if (r !== ring) r.object3D.visible = false;
    });
    
    // Hide labels
    ringLabels.forEach(l => l.object3D.visible = false);

    activeRing = ring;

    // Update Specs Panel Content
    const data = ringContent[ring.id];
    if (data) {
      let specsHTML = "";
      data.specs.forEach(s => {
        specsHTML += `<div class="spec-row"><span class="spec-key">${s.key}:</span> <span class="spec-val">${s.val}</span></div>`;
      });
      
      specsPanel.innerHTML = `<h3>${data.title}</h3><p style="margin-bottom: 25px;">${data.desc}</p>${specsHTML}`;
    }

    // POP-UP MOVE: Move to Left Side (-1.4) and closer
    ring.setAttribute("animation__pos", {
      property: "position",
      to: "-1.4 0 3", 
      dur: 1000,
      easing: "easeInOutQuad"
    });

    // Show Shadow
    if (focusShadow) focusShadow.setAttribute("visible", true);

    closeBtn.style.display = "block";
    if (specsPanel) specsPanel.style.display = "block";
    if (subtextScene2) subtextScene2.classList.add("hidden");
    if (footerText) footerText.classList.remove("visible"); // Fix: Hide footer text on click to prevent overlap
  });

  // Platinum material
  ring.addEventListener("model-loaded", () => {
    ring.object3D.traverse(node => {
      if (node.isMesh) {
        node.material.metalness = 1.0;
        node.material.roughness = 0.15; // Shinier
        node.material.color.set("#ffffff"); // Pure white for platinum
      }
    });
  });
  });
}

// Ensure A-Frame is fully loaded before capturing positions
if (scene.hasLoaded) {
  initRings();
} else {
  scene.addEventListener("loaded", initRings);
}

/* ---------------- DRAG ROTATION ---------------- */

window.addEventListener("mousedown", e => {
  if (!activeRing) return;
  isDragging = true;
  lastX = e.clientX;
});

window.addEventListener("mousemove", e => {
  if (!isDragging || !activeRing) return;

  const deltaX = e.clientX - lastX;
  lastX = e.clientX;

  const rot = activeRing.getAttribute("rotation");
  activeRing.setAttribute("rotation", {
    x: rot.x,
    y: rot.y + deltaX * 0.1, // Slower, smoother rotation (0.05 - 0.1)
    z: rot.z
  });
});

window.addEventListener("mouseup", () => {
  isDragging = false;
});

/* ---------------- CLOSE BUTTON ---------------- */

closeBtn.addEventListener("click", () => {
  if (!activeRing) return;

  const data = originalPositions.get(activeRing);

  // Slide back to original position
  activeRing.setAttribute("animation__pos", {
    property: "position",
    to: `${data.pos.x} ${data.pos.y} ${data.pos.z}`,
    dur: 1000,
    easing: "easeInOutQuad"
  });

  // Hide UI immediately
  closeBtn.style.display = "none";
  if (specsPanel) specsPanel.style.display = "none";
  if (subtextScene2) subtextScene2.classList.add("hidden");
  
  // Hide Shadow
  if (focusShadow) focusShadow.setAttribute("visible", false);

  // Show Final Statement
  if (footerText) footerText.classList.add("visible");

  // Wait for animation to finish before showing others
  setTimeout(() => {
    // FORCE SNAP: Reset position and rotation exactly
    activeRing.setAttribute("position", data.pos);
    activeRing.setAttribute("rotation", data.rot);
    
    // Clean up animation component
    activeRing.removeAttribute("animation__pos");
    
    rings.forEach(r => r.object3D.visible = true);
    ringLabels.forEach(l => l.object3D.visible = true);
    activeRing = null;
  }, 1000);
});
