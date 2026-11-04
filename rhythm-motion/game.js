
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const el = {
    playfield: $("playfield"),
    player: $("player"),
    target: $("target"),
    start: $("start-btn"),
    stop: $("stop-btn"),
    session: $("session-state"),
    caption: $("field-caption"),
    breathWord: $("breath-word"),
    breathHint: $("breath-hint"),
    score: $("score"),
    elapsed: $("elapsed"),
    pulses: $("pulses"),
    summary: $("sensor-summary"),
    dot: $("sensor-dot"),
    orientationState: $("orientation-state"),
    motionState: $("motion-state"),
    beta: $("beta-val"),
    gamma: $("gamma-val"),
    tilt: $("tilt-val"),
    gx: $("gx-val"),
    gy: $("gy-val"),
    gz: $("gz-val"),
    ax: $("ax-val"),
    ay: $("ay-val"),
    az: $("az-val")
  };

  const state = {
    running: false,
    orientationSeen: false,
    motionSeen: false,
    x: 50,
    y: 50,
    beta: null,
    gamma: null,
    gx: null,
    gy: null,
    gz: null,
    ax: null,
    ay: null,
    az: null,
    score: 0,
    pulses: 0,
    startedAt: 0,
    elapsedBefore: 0,
    frame: null,
    lastPulseAt: 0,
    previousMagnitude: null,
    targetX: 75,
    targetY: 28,
    lastTargetAt: 0,
    gyro: null
  };

  const clamp = (v, min, max) =>
    Math.max(min, Math.min(max, v));

  const fmt = (v) =>
    Number.isFinite(v) ? v.toFixed(2) : "—";

  const elapsedSeconds = () =>
    state.elapsedBefore +
    (state.running
      ? (Date.now() - state.startedAt) / 1000
      : 0);

  const timeText = (seconds) => {
    seconds = Math.max(0, Math.floor(seconds));
    return (
      String(Math.floor(seconds / 60)).padStart(2, "0") +
      ":" +
      String(seconds % 60).padStart(2, "0")
    );
  };

  function setState(node, label, active) {
    if (!node) return;
    node.textContent = label;
    node.classList.toggle("ok", Boolean(active));
  }

  function updateReadings() {
    if (el.beta) el.beta.textContent = fmt(state.beta);
    if (el.gamma) el.gamma.textContent = fmt(state.gamma);

    if (el.tilt) {
      el.tilt.textContent =
        `${fmt(state.beta)} / ${fmt(state.gamma)}`;
    }

    if (el.gx) el.gx.textContent = fmt(state.gx);
    if (el.gy) el.gy.textContent = fmt(state.gy);
    if (el.gz) el.gz.textContent = fmt(state.gz);

    if (el.ax) el.ax.textContent = fmt(state.ax);
    if (el.ay) el.ay.textContent = fmt(state.ay);
    if (el.az) el.az.textContent = fmt(state.az);

    setState(
      el.orientationState,
      state.orientationSeen
        ? "Orientation active"
        : "Waiting for orientation",
      state.orientationSeen
    );

    setState(
      el.motionState,
      state.motionSeen
        ? "Motion active"
        : "Waiting for motion",
      state.motionSeen
    );

    if (el.dot) {
      el.dot.classList.toggle(
        "active",
        state.orientationSeen || state.motionSeen
      );
    }

    if (!el.summary) return;

    if (state.orientationSeen && state.motionSeen) {
      el.summary.textContent =
        "Orientation and motion events are arriving. " +
        "Tilt guides the orb; acceleration readings update as you move.";
    } else if (state.orientationSeen) {
      el.summary.textContent =
        "Tilt is working. No accelerometer event has arrived yet.";
    } else if (state.motionSeen) {
      el.summary.textContent =
        "Motion events are arriving. Waiting for orientation data.";
    } else if (state.running) {
      el.summary.textContent =
        "Waiting for sensor events. Gently tilt and move your phone.";
    } else {
      el.summary.textContent =
        "Tap Enable sensors & start, then gently move your phone.";
    }
  }

  function placePlayer() {
    if (!el.player) return;
    el.player.style.left = `${state.x}%`;
    el.player.style.top = `${state.y}%`;
  }

  function moveTarget() {
    state.targetX = 18 + Math.random() * 64;
    state.targetY = 18 + Math.random() * 58;

    if (el.target) {
      el.target.style.left = `${state.targetX}%`;
      el.target.style.top = `${state.targetY}%`;
    }
  }

  function checkTarget() {
    const distance = Math.hypot(
      (state.x - state.targetX) * 0.75,
      state.y - state.targetY
    );

    if (distance < 8) {
      state.score += 1;

      if (el.score) {
        el.score.textContent = String(state.score);
      }

      if (el.caption) {
        el.caption.textContent =
          "A spark found — keep your movement gentle";
      }

      moveTarget();
    }
  }

  function onOrientation(event) {
    if (event.beta == null && event.gamma == null) return;

    state.orientationSeen = true;

    if (Number.isFinite(event.beta)) {
      state.beta = event.beta;
    }

    if (Number.isFinite(event.gamma)) {
      state.gamma = event.gamma;
    }

    if (Number.isFinite(state.gamma)) {
      state.x = clamp(50 + state.gamma * 1.05, 5, 95);
    }

    if (Number.isFinite(state.beta)) {
      state.y = clamp(50 + state.beta * 0.72, 7, 93);
    }

    placePlayer();
    checkTarget();
    updateReadings();
  }

  function onMotion(event) {
    const acceleration = event.acceleration;
    const gravity = event.accelerationIncludingGravity;

    const source =
      acceleration &&
      [acceleration.x, acceleration.y, acceleration.z]
        .some(Number.isFinite)
        ? acceleration
        : gravity;

    if (!source) return;

    state.ax = Number.isFinite(source.x) ? source.x : null;
    state.ay = Number.isFinite(source.y) ? source.y : null;
    state.az = Number.isFinite(source.z) ? source.z : null;

    state.motionSeen = true;

    const values = [state.ax, state.ay, state.az].map(
      (v) => Number.isFinite(v) ? v : 0
    );

    const magnitude = Math.hypot(...values);
    const now = Date.now();

    if (
      state.previousMagnitude !== null &&
      Math.abs(magnitude - state.previousMagnitude) > 2.2 &&
      now - state.lastPulseAt > 1800 &&
      state.running
    ) {
      state.pulses += 1;
      state.lastPulseAt = now;

      if (el.pulses) {
        el.pulses.textContent = String(state.pulses);
      }

      if (el.player) {
        el.player.classList.add("pulse");

        window.setTimeout(() => {
          if (el.player) {
            el.player.classList.remove("pulse");
          }
        }, 650);
      }

      if (el.caption) {
        el.caption.textContent =
          "Energy pulse — notice your movement";
      }
    }

    state.previousMagnitude = magnitude;
    updateReadings();
  }

  function updateBreathing() {
    const phase = Math.floor(elapsedSeconds() % 12);

    if (!el.breathWord || !el.breathHint) return;

    if (phase < 4) {
      el.breathWord.textContent = "Breathe in";
      el.breathHint.textContent =
        "Let your shoulders soften";
    } else if (phase < 6) {
      el.breathWord.textContent = "Pause gently";
      el.breathHint.textContent =
        "No need to force it";
    } else if (phase < 10) {
      el.breathWord.textContent = "Breathe out";
      el.breathHint.textContent =
        "Release unnecessary tension";
    } else {
      el.breathWord.textContent = "Rest";
      el.breathHint.textContent =
        "Return to a natural breath";
    }
  }

  function tick() {
    if (!state.running) return;

    if (el.elapsed) {
      el.elapsed.textContent = timeText(elapsedSeconds());
    }

    updateBreathing();

    if (Date.now() - state.lastTargetAt > 10000) {
      state.lastTargetAt = Date.now();
      moveTarget();
    }

    state.frame = window.requestAnimationFrame(tick);
  }

  async function requestPermissions() {
    const eventTypes = [
      window.DeviceMotionEvent,
      window.DeviceOrientationEvent
    ];

    for (const type of eventTypes) {
      if (type && typeof type.requestPermission === "function") {
        const result = await type.requestPermission();

        if (result !== "granted") {
          throw new Error(
            "Motion permission was not granted. Check browser permissions."
          );
        }
      }
    }
  }

  async function start() {
    if (state.running) return;

    if (
      !window.isSecureContext &&
      location.hostname !== "localhost" &&
      location.hostname !== "127.0.0.1"
    ) {
      if (el.summary) {
        el.summary.textContent =
          "Sensors require HTTPS. Open the published GitHub Pages address.";
      }
      return;
    }

    if (el.start) {
      el.start.disabled = true;
      el.start.textContent = "Starting sensors…";
    }

    try {
      await requestPermissions();

      state.running = true;
      state.startedAt = Date.now();
      state.lastTargetAt = Date.now();
      state.orientationSeen = false;
      state.motionSeen = false;

      window.addEventListener(
        "deviceorientation",
        onOrientation,
        true
      );

      window.addEventListener(
        "devicemotion",
        onMotion,
        true
      );

      if (el.session) el.session.textContent = "In flow";

      if (el.caption) {
        el.caption.textContent =
          "Tilt gently to guide the light";
      }

      if (el.start) {
        el.start.textContent = "Sensors running";
      }

      if (el.stop) el.stop.disabled = false;

      if (el.summary) {
        el.summary.textContent =
          "Listening for device orientation and motion events…";
      }

      updateReadings();
      state.frame = window.requestAnimationFrame(tick);

      window.setTimeout(() => {
        if (!state.running) return;

        if (!state.orientationSeen && !state.motionSeen) {
          if (el.summary) {
            el.summary.textContent =
              "No sensor events received. Check Chrome settings and gently move the phone.";
          }
        } else if (
          state.orientationSeen &&
          !state.motionSeen
        ) {
          if (el.summary) {
            el.summary.textContent =
              "Tilt works, but no accelerometer event arrived. " +
              "The browser or device may not expose motion data.";
          }
        }
      }, 3000);
    } catch (error) {
      if (el.summary) {
        el.summary.textContent =
          error && error.message
            ? error.message
            : "Could not start sensors.";
      }

      if (el.start) {
        el.start.disabled = false;
        el.start.textContent = "Try sensor access again";
      }
    }
  }

  function stop() {
    if (state.running) {
      state.elapsedBefore +=
        (Date.now() - state.startedAt) / 1000;
    }

    state.running = false;

    window.removeEventListener(
      "deviceorientation",
      onOrientation,
      true
    );

    window.removeEventListener(
      "devicemotion",
      onMotion,
      true
    );

    if (state.gyro) {
      try {
        state.gyro.stop();
      } catch (_) {}

      state.gyro = null;
    }

    if (state.frame !== null) {
      window.cancelAnimationFrame(state.frame);
    }

    state.frame = null;

    if (el.session) el.session.textContent = "Paused";

    if (el.caption) {
      el.caption.textContent = "Paused — rest your hands";
    }

    if (el.start) {
      el.start.disabled = false;
      el.start.textContent = "Resume sensors";
    }

    if (el.stop) el.stop.disabled = true;

    if (el.elapsed) {
      el.elapsed.textContent = timeText(elapsedSeconds());
    }
  }

  if (el.start) {
    el.start.addEventListener("click", start);
  }

  if (el.stop) {
    el.stop.addEventListener("click", stop);
  }

  if (el.playfield) {
    el.playfield.addEventListener(
      "touchmove",
      (event) => {
        if (!state.running || state.orientationSeen) return;

        const touch = event.touches && event.touches[0];
        if (!touch) return;

        const rect = el.playfield.getBoundingClientRect();

        state.x = clamp(
          ((touch.clientX - rect.left) / rect.width) * 100,
          5,
          95
        );

        state.y = clamp(
          ((touch.clientY - rect.top) / rect.height) * 100,
          7,
          93
        );

        placePlayer();
        checkTarget();
      },
      { passive: true }
    );
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.running) {
      stop();
    }
  });

  window.addEventListener("pagehide", () => {
    window.removeEventListener(
      "deviceorientation",
      onOrientation,
      true
    );

    window.removeEventListener(
      "devicemotion",
      onMotion,
      true
    );
  });

  updateReadings();
})();
