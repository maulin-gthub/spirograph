(() => {
  "use strict";

  const inkCanvas = document.getElementById("inkCanvas");
  const guideCanvas = document.getElementById("guideCanvas");
  const inkCtx = inkCanvas.getContext("2d");
  const guideCtx = guideCanvas.getContext("2d");
  const stage = document.querySelector(".stage");
  const dragHint = document.getElementById("dragHint");

  const controls = {
    ringSize: document.getElementById("ringSize"),
    wheelSize: document.getElementById("wheelSize"),
    penOffset: document.getElementById("penOffset"),
    speed: document.getElementById("speed"),
    lineWidth: document.getElementById("lineWidth"),
    colorPicker: document.getElementById("colorPicker"),
    rainbowMode: document.getElementById("rainbowMode"),
    bgColor: document.getElementById("bgColor"),
  };

  const valLabels = {
    ringSize: document.getElementById("ringSizeVal"),
    wheelSize: document.getElementById("wheelSizeVal"),
    penOffset: document.getElementById("penOffsetVal"),
    speed: document.getElementById("speedVal"),
    lineWidth: document.getElementById("lineWidthVal"),
  };

  const autoBtn = document.getElementById("autoBtn");
  const clearBtn = document.getElementById("clearBtn");
  const panelToggleBtn = document.getElementById("panelToggleBtn");
  const panel = document.getElementById("panel");
  const panelHandle = document.getElementById("panelHandle");
  const randomBtn = document.getElementById("randomBtn");
  const saveBtn = document.getElementById("saveBtn");
  const shareBtn = document.getElementById("shareBtn");
  const modeButtons = document.querySelectorAll(".mode-btn");

  let mode = "hypo"; // "hypo" = wheel rolls inside the ring, "epi" = outside
  let autoMode = false;
  let t = 0; // current drawing progress (radians)
  let unwrappedAngle = 0; // tracks the drag angle across multiple revolutions
  let totalT = 0; // the drawing is complete once t reaches this
  let hue = 0;
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let cssWidth = 0;
  let cssHeight = 0;
  let hintShown = true;

  let dragging = false;
  let lastPointerAngle = 0;

  function gcd(a, b) {
    a = Math.round(Math.abs(a));
    b = Math.round(Math.abs(b));
    while (b) {
      [a, b] = [b, a % b];
    }
    return a || 1;
  }

  function updateLabels() {
    valLabels.ringSize.textContent = controls.ringSize.value;
    valLabels.wheelSize.textContent = controls.wheelSize.value;
    valLabels.penOffset.textContent = controls.penOffset.value;
    valLabels.speed.textContent = controls.speed.value;
    valLabels.lineWidth.textContent = controls.lineWidth.value;
  }

  function resizeCanvases() {
    const rect = stage.getBoundingClientRect();
    cssWidth = rect.width;
    cssHeight = rect.height;
    dpr = Math.max(1, window.devicePixelRatio || 1);
    for (const [canvas, ctx] of [[inkCanvas, inkCtx], [guideCanvas, guideCtx]]) {
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      canvas.style.width = cssWidth + "px";
      canvas.style.height = cssHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    restart();
  }

  function fillBackground() {
    inkCtx.save();
    inkCtx.setTransform(1, 0, 0, 1, 0, 0);
    inkCtx.fillStyle = controls.bgColor.value;
    inkCtx.fillRect(0, 0, inkCanvas.width, inkCanvas.height);
    inkCtx.restore();
  }

  function restart() {
    t = 0;
    unwrappedAngle = 0;
    hue = 0;
    fillBackground();
    const R = Number(controls.ringSize.value);
    const r = Number(controls.wheelSize.value);
    const g = gcd(R, r);
    totalT = 2 * Math.PI * (r / g);
    autoMode = false;
    autoBtn.textContent = "▶";
    autoBtn.title = "Auto-draw for me";
  }

  function point(tt) {
    const R = Number(controls.ringSize.value);
    const r = Number(controls.wheelSize.value);
    const d = Number(controls.penOffset.value);
    let x, y;
    if (mode === "hypo") {
      const k = (R - r) / r;
      x = (R - r) * Math.cos(tt) + d * Math.cos(k * tt);
      y = (R - r) * Math.sin(tt) - d * Math.sin(k * tt);
    } else {
      const k = (R + r) / r;
      x = (R + r) * Math.cos(tt) - d * Math.cos(k * tt);
      y = (R + r) * Math.sin(tt) - d * Math.sin(k * tt);
    }
    return { x, y };
  }

  function wheelCenter(tt) {
    const R = Number(controls.ringSize.value);
    const r = Number(controls.wheelSize.value);
    const dist = mode === "hypo" ? R - r : R + r;
    return { x: dist * Math.cos(tt), y: dist * Math.sin(tt) };
  }

  function strokeColor() {
    if (controls.rainbowMode.checked) {
      return `hsl(${hue}, 85%, 62%)`;
    }
    return controls.colorPicker.value;
  }

  function drawInkSegment(fromT, toT) {
    const cx = cssWidth / 2;
    const cy = cssHeight / 2;
    const a = point(fromT);
    const b = point(toT);
    inkCtx.lineWidth = Number(controls.lineWidth.value);
    inkCtx.lineCap = "round";
    inkCtx.lineJoin = "round";
    inkCtx.strokeStyle = strokeColor();
    inkCtx.beginPath();
    inkCtx.moveTo(cx + a.x, cy + a.y);
    inkCtx.lineTo(cx + b.x, cy + b.y);
    inkCtx.stroke();
    hue = (hue + 0.6) % 360;
  }

  function drawGuide() {
    guideCtx.clearRect(0, 0, cssWidth, cssHeight);
    const cx = cssWidth / 2;
    const cy = cssHeight / 2;
    const R = Number(controls.ringSize.value);
    const r = Number(controls.wheelSize.value);

    guideCtx.save();
    guideCtx.translate(cx, cy);

    // fixed outer ring
    guideCtx.strokeStyle = "rgba(255,255,255,0.25)";
    guideCtx.lineWidth = 1.5;
    guideCtx.beginPath();
    guideCtx.arc(0, 0, R, 0, Math.PI * 2);
    guideCtx.stroke();

    // rolling wheel + pen, only meaningful while a pattern is in progress
    const wc = wheelCenter(t);
    guideCtx.strokeStyle = "rgba(255,255,255,0.35)";
    guideCtx.beginPath();
    guideCtx.arc(wc.x, wc.y, r, 0, Math.PI * 2);
    guideCtx.stroke();

    const pen = point(t);
    guideCtx.strokeStyle = "rgba(255,255,255,0.3)";
    guideCtx.beginPath();
    guideCtx.moveTo(wc.x, wc.y);
    guideCtx.lineTo(pen.x, pen.y);
    guideCtx.stroke();

    const complete = t >= totalT - 0.001;
    guideCtx.fillStyle = complete ? "#ffd35c" : strokeColor();
    guideCtx.beginPath();
    guideCtx.arc(pen.x, pen.y, complete ? 7 : 5, 0, Math.PI * 2);
    guideCtx.fill();

    guideCtx.restore();
  }

  function guideLoop() {
    drawGuide();
    requestAnimationFrame(guideLoop);
  }

  // --- Auto-draw playback (optional, for people who just want to watch) ---

  function autoTick() {
    if (autoMode && t < totalT) {
      const steps = Number(controls.speed.value) * 3;
      const dt = 0.02;
      for (let i = 0; i < steps && t < totalT; i++) {
        const from = t;
        t = Math.min(t + dt, totalT);
        drawInkSegment(from, t);
      }
      if (t >= totalT) {
        autoMode = false;
        autoBtn.textContent = "▶";
      }
    }
    requestAnimationFrame(autoTick);
  }

  // --- Hand-drawing via pointer drag ---

  function pointerAngle(clientX, clientY) {
    const rect = inkCanvas.getBoundingClientRect();
    const cx = rect.left + cssWidth / 2;
    const cy = rect.top + cssHeight / 2;
    return Math.atan2(clientY - cy, clientX - cx);
  }

  function hideHint() {
    if (hintShown) {
      hintShown = false;
      dragHint.classList.add("hidden");
    }
  }

  function onPointerDown(e) {
    if (t >= totalT) return; // pattern already complete, nothing more to trace
    autoMode = false;
    autoBtn.textContent = "▶";
    dragging = true;
    lastPointerAngle = pointerAngle(e.clientX, e.clientY);
    inkCanvas.setPointerCapture(e.pointerId);
    hideHint();
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const angle = pointerAngle(e.clientX, e.clientY);
    let delta = angle - lastPointerAngle;
    while (delta > Math.PI) delta -= Math.PI * 2;
    while (delta < -Math.PI) delta += Math.PI * 2;
    lastPointerAngle = angle;

    const newUnwrapped = unwrappedAngle + delta;
    const newT = Math.min(Math.max(newUnwrapped, 0), totalT);
    if (newT !== t) {
      drawInkSegment(t, newT);
      t = newT;
    }
    unwrappedAngle = newUnwrapped < 0 ? 0 : newUnwrapped > totalT ? totalT : newUnwrapped;
  }

  function onPointerUp(e) {
    dragging = false;
    try {
      inkCanvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  }

  inkCanvas.addEventListener("pointerdown", onPointerDown);
  inkCanvas.addEventListener("pointermove", onPointerMove);
  inkCanvas.addEventListener("pointerup", onPointerUp);
  inkCanvas.addEventListener("pointercancel", onPointerUp);

  // --- Controls wiring ---

  Object.values(controls).forEach((el) => {
    const evt = el.type === "range" ? "input" : "change";
    el.addEventListener(evt, () => {
      updateLabels();
      restart();
    });
  });

  modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      modeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      mode = btn.dataset.mode;
      restart();
    });
  });

  autoBtn.addEventListener("click", () => {
    if (t >= totalT) return;
    autoMode = !autoMode;
    autoBtn.textContent = autoMode ? "⏸" : "▶";
    autoBtn.title = autoMode ? "Stop and draw by hand" : "Auto-draw for me";
    hideHint();
  });

  clearBtn.addEventListener("click", () => {
    restart();
  });

  randomBtn.addEventListener("click", () => {
    controls.ringSize.value = randInt(80, 220);
    controls.wheelSize.value = randInt(15, 140);
    controls.penOffset.value = randInt(5, 140);
    controls.colorPicker.value = randColor();
    updateLabels();
    restart();
  });

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randColor() {
    const hues = Math.floor(Math.random() * 360);
    return hslToHex(hues, 80, 60);
  }

  function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, "0");
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
  }

  // --- Mobile panel toggle ---

  function closePanel() {
    panel.classList.remove("open");
  }

  panelToggleBtn.addEventListener("click", () => {
    panel.classList.toggle("open");
  });

  panelHandle.addEventListener("click", closePanel);

  let dragStartY = null;
  panelHandle.addEventListener("touchstart", (e) => {
    dragStartY = e.touches[0].clientY;
  }, { passive: true });
  panelHandle.addEventListener("touchmove", (e) => {
    if (dragStartY === null) return;
    const dy = e.touches[0].clientY - dragStartY;
    if (dy > 60) {
      closePanel();
      dragStartY = null;
    }
  }, { passive: true });
  panelHandle.addEventListener("touchend", () => {
    dragStartY = null;
  });

  // --- Save / Share ---

  function toBlob() {
    return new Promise((resolve) => inkCanvas.toBlob(resolve, "image/png"));
  }

  function toast(msg) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.style.position = "fixed";
      el.style.left = "50%";
      el.style.bottom = "max(24px, env(safe-area-inset-bottom))";
      el.style.transform = "translateX(-50%)";
      el.style.background = "rgba(20,20,28,0.95)";
      el.style.color = "#fff";
      el.style.padding = "10px 16px";
      el.style.borderRadius = "10px";
      el.style.fontSize = "0.85rem";
      el.style.zIndex = "999";
      el.style.transition = "opacity 0.3s ease";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = "1";
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
      el.style.opacity = "0";
    }, 2200);
  }

  async function downloadImage() {
    const blob = await toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `spirograph-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  saveBtn.addEventListener("click", async () => {
    await downloadImage();
    toast("Saved to your downloads");
  });

  shareBtn.addEventListener("click", async () => {
    const blob = await toBlob();
    const file = new File([blob], `spirograph-${Date.now()}.png`, { type: "image/png" });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My Spirograph drawing",
        });
        return;
      } catch (err) {
        if (err && err.name === "AbortError") return;
      }
    }

    await downloadImage();
    toast("Saved — share it from your photos or downloads app");
  });

  // --- Init ---

  window.addEventListener("resize", resizeCanvases);
  updateLabels();
  resizeCanvases();
  requestAnimationFrame(guideLoop);
  requestAnimationFrame(autoTick);
})();
