(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const els = {
    playfield: $("playfield"), player: $("player"), target: $("target"),
    start: $("start-btn"), stop: $("stop-btn"), state: $("session-state"),
    caption: $("field-caption"), breathWord: $("breath-word"), breathHint: $("breath-hint"),
    score: $("score"), elapsed: $("elapsed"), pulses: $("pulses"),
    summary: $("sensor-summary"), dot: $("sensor-dot"),
    orientationState: $("orientation-state"), motionState: $("motion-state"),
    beta: $("beta-val"), gamma: $("gamma-val"), tilt: $("tilt-val"),
    gx: $("gx-val"), gy: $("gy-val"), gz: $("gz-val"),
    ax: $("ax-val"), ay: $("ay-val"), az: $("az-val")
  };

  const state = {
    running: false, orientationSeen: false, gyroSeen: false, motionSeen: false,
    x: 50, y: 50, beta: null, gamma: null,
    gx: null, gy: null, gz: null, gyroSensor: null,
    ax: null, ay: null, az: null, previousMagnitude: null,
    score: 0, pulses: 0, startedAt: 0, elapsedBefore: 0,
    animationFrame: null, clockTimer: null, breathTimer: null,
    lastPulseAt: 0, lastTargetAt: 0, targetX: 75, targetY: 28,
    usingGravityIncluded: false
  };

  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const fmt = (n) => Number.isFinite(n) ? n.toFixed(2) : "—";
  const totalSeconds = () => state.elapsedBefore + (state.running ? (Date.now() - state.startedAt) / 1000 : 0);
  const formatTime = (seconds) => {
    const s = Math.max(0, Math.floor(seconds));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  function setSensorState(element, text, ok) {
    element.textContent = text;
    element.classList.toggle("ok", Boolean(ok));
  }

  function updateReadings() {
    els.beta.textContent = fmt(state.beta);
    els.gamma.textContent = fmt(state.gamma);
    els.tilt.textContent = `${fmt(state.beta)} / ${fmt(state.gamma)}`;
    els.gx.textContent = fmt(state.gx);
    els.gy.textContent = fmt(state.gy);
    els.gz.textContent = fmt(state.gz);
    els.ax.textContent = fmt(state.ax);
    els.ay.textContent = fmt(state.ay);
    els.az.textContent = fmt(state.az);
    setSensorState(els.orientationState, state.gyroSeen ? "Gyroscope active" : (state.orientationSeen ? "Tilt fallback" : "Waiting"), state.gyroSeen || state.orientationSeen);
    setSensorState(els.motionState, state.motionSeen ? "Active" : "Waiting", state.motionSeen);
    els.dot.classList.toggle("active", state.gyroSeen || state.orientationSeen || state.motionSeen);
    if (state.gyroSeen && state.motionSeen) {
      els.summary.textContent = "Raw gyroscope and accelerometer readings are active. Tilt steers the orb; movement pulses add energy.";
    } else if (state.orientationSeen && state.motionSeen) {
      els.summary.textContent = "Accelerometer and device-orientation events are active. The browser does not expose raw gyroscope readings here, so tilt steering is using the orientation fallback.";
    } else if (state.gyroSeen || state.orientationSeen) {
      els.summary.textContent = "Rotation/orientation data is active. Accelerometer data has not arrived yet; check browser permissions and device support.";
    } else if (state.motionSeen) {
      els.summary.textContent = "Accelerometer data is active. Orientation has not arrived yet; touch controls remain available as a fallback.";
    } else if (state.running) {
      els.summary.textContent = "Waiting for sensor events. On Android, open this page in Chrome over HTTPS and check site permissions.";
    }
  }

  function placePlayer() {
    els.player.style.left = `${state.x}%`;
    els.player.style.top = `${state.y}%`;
  }

  function moveTarget() {
    // Keep target away from the edge and shift it to encourage gentle exploration.
    state.targetX = 18 + Math.random() * 64;
    state.targetY = 18 + Math.random() * 58;
    els.target.style.left = `${state.targetX}%`;
    els.target.style.top = `${state.targetY}%`;
  }

  function checkTarget() {
    const dx = (state.x - state.targetX) * 0.75;
    const dy = state.y - state.targetY;
    if (Math.hypot(dx, dy) < 8) {
      state.score += 1;
      els.score.textContent = String(state.score);
      els.caption.textContent = "A spark found — keep your movement gentle";
      moveTarget();
    }
  }

  function onOrientation(event) {
    if (event.beta == null && event.gamma == null) return;
    state.orientationSeen = true;
    state.beta = Number.isFinite(event.beta) ? event.beta : state.beta;
    state.gamma = Number.isFinite(event.gamma) ? event.gamma : state.gamma;
    // Normalize common handheld tilts to a comfortable game area.
    // Clamp to avoid extreme angles jumping the orb across the field.
    if (Number.isFinite(state.gamma)) state.x = clamp(50 + state.gamma * 1.05, 5, 95);
    if (Number.isFinite(state.beta)) state.y = clamp(50 + state.beta * 0.72, 7, 93);
    placePlayer();
    checkTarget();
    updateReadings();
  }

  function onGyroscopeReading() {
    if (!state.gyroSensor) return;
    state.gx = Number.isFinite(state.gyroSensor.x) ? state.gyroSensor.x : null;
    state.gy = Number.isFinite(state.gyroSensor.y) ? state.gyroSensor.y : null;
    state.gz = Number.isFinite(state.gyroSensor.z) ? state.gyroSensor.z : null;
    state.gyroSeen = true;
    updateReadings();
  }

  function onGyroscopeError(event) {
    // A browser/device may block the Generic Sensor API. Tilt steering can still use deviceorientation.
    if (event && event.error && event.error.name === "NotAllowedError") {
      els.summary.textContent = "Gyroscope access was denied. Check site permissions; device orientation may still be available for steering.";
    }
    setSensorState(els.orientationState, state.orientationSeen ? "Tilt fallback" : "Unavailable", state.orientationSeen);
  }

  function onMotion(event) {
    const acceleration = event.acceleration;
    const inclGravity = event.accelerationIncludingGravity;
    const source = acceleration && [acceleration.x, acceleration.y, acceleration.z].some(Number.isFinite)
      ? acceleration : inclGravity;
    if (!source) return;
    const ax = Number.isFinite(source.x) ? source.x : 0;
    const ay = Number.isFinite(source.y) ? source.y : 0;
    const az = Number.isFinite(source.z) ? source.z : 0;
    state.usingGravityIncluded = source === inclGravity;
    state.ax = ax; state.ay = ay; state.az = az;
    state.motionSeen = true;

    const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
    const now = Date.now();
    // Trigger only on a distinct change, with a cooldown to reduce accidental repeats.
    if (state.previousMagnitude !== null &&
        Math.abs(magnitude - state.previousMagnitude) > 2.2 &&
        now - state.lastPulseAt > 1800 &&
        state.running) {
      triggerPulse();
    }
    state.previousMagnitude = magnitude;
    updateReadings();
  }

  function triggerPulse() {
    state.pulses += 1;
    state.lastPulseAt = Date.now();
    els.pulses.textContent = String(state.pulses);
    els.player.classList.add("pulse");
    els.caption.textContent = "Energy pulse — notice your movement";
    window.setTimeout(() => els.player.classList.remove("pulse"), 650);
  }

  function updateBreathing() {
    // 4 seconds in, 2 seconds pause, 4 seconds out, 2 seconds pause.
    const phase = Math.floor((totalSeconds() % 12));
    if (phase < 4) {
      els.breathWord.textContent = "Breathe in";
      els.breathHint.textContent = "Let your shoulders soften";
    } else if (phase < 6) {
      els.breathWord.textContent = "Pause gently";
      els.breathHint.textContent = "No need to force it";
    } else if (phase < 10) {
      els.breathWord.textContent = "Breathe out";
      els.breathHint.textContent = "Release unnecessary tension";
    } else {
      els.breathWord.textContent = "Rest";
      els.breathHint.textContent = "Return to a natural breath";
    }
  }

  function tick() {
    if (!state.running) return;
    els.elapsed.textContent = formatTime(totalSeconds());
    updateBreathing();
    if (Date.now() - state.lastTargetAt > 10000) {
      state.lastTargetAt = Date.now();
      moveTarget();
    }
    state.animationFrame = window.requestAnimationFrame(tick);
  }

  function onTouchMove(event) {
    if (!state.running || state.orientationSeen) return;
    const rect = els.playfield.getBoundingClientRect();
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    state.x = clamp(((touch.clientX - rect.left) / rect.width) * 100, 5, 95);
    state.y = clamp(((touch.clientY - rect.top) / rect.height) * 100, 7, 93);
    placePlayer();
    checkTarget();
  }

  async function requestSensorPermission() {
    // iOS Safari requires a permission request from a direct user gesture.
    const permissionFunctions = [];
    if (typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function") {
      permissionFunctions.push(() => DeviceMotionEvent.requestPermission());
    }
    if (typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function") {
      permissionFunctions.push(() => DeviceOrientationEvent.requestPermission());
    }
    for (const request of permissionFunctions) {
      try {
        const result = await request();
        if (result !== "granted") {
          throw new Error("Motion permission was not granted. Check browser site settings and try again.");
        }
      } catch (error) {
        throw new Error(error && error.message ? error.message : "Could not request motion permission.");
      }
    }
  }

  async function start() {
    if (state.running) return;
    if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
      els.summary.textContent = "Sensor APIs usually require HTTPS. Publish this folder on GitHub Pages or test on localhost.";
      return;
    }

    els.start.disabled = true;
    els.start.textContent = "Requesting access…";
    try {
      await requestSensorPermission();
      state.running = true;
      state.startedAt = Date.now();
      state.lastTargetAt = Date.now();
      window.addEventListener("deviceorientation", onOrientation, true);
      window.addEventListener("devicemotion", onMotion, true);
      // Generic Sensor API exposes raw angular velocity when supported by the browser/device.
      if ("Gyroscope" in window) {
        try {
          state.gyroSensor = new Gyroscope({ frequency: 30 });
          state.gyroSensor.addEventListener("reading", onGyroscopeReading);
          state.gyroSensor.addEventListener("error", onGyroscopeError);
          state.gyroSensor.start();
        } catch (gyroError) {
          state.gyroSensor = null;
        }
      }
      els.state.textContent = "In flow";
      els.caption.textContent = "Tilt gently to guide the light";
      els.start.textContent = "Sensors running";
      els.stop.disabled = false;
      els.summary.textContent = "Listening for device motion and orientation events…";
      state.animationFrame = window.requestAnimationFrame(tick);
      els.playfield.addEventListener("touchmove", onTouchMove, { passive: true });
      // Some browsers dispatch no sensor events; report the situation after a short wait.
      window.setTimeout(() => {
        if (state.running && !state.orientationSeen && !state.motionSeen) {
          els.summary.textContent = "No sensor events detected yet. Check HTTPS, Chrome site permissions, and whether the phone supports motion sensors.";
          els.caption.textContent = "No sensor events yet — check permissions";
        }
      }, 2500);
    } catch (error) {
      els.summary.textContent = error.message || "Sensor permission failed. Try again after checking browser permissions.";
      els.start.disabled = false;
      els.start.textContent = "Try sensor access again";
    }
  }

  function stop() {
    if (state.running) state.elapsedBefore += (Date.now() - state.startedAt) / 1000;
    state.running = false;
    window.removeEventListener("deviceorientation", onOrientation, true);
    window.removeEventListener("devicemotion", onMotion, true);
    if (state.gyroSensor) {
      try {
        state.gyroSensor.removeEventListener("reading", onGyroscopeReading);
        state.gyroSensor.removeEventListener("error", onGyroscopeError);
        state.gyroSensor.stop();
      } catch (_) {}
      state.gyroSensor = null;
    }
    if (state.animationFrame !== null) window.cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
    els.playfield.removeEventListener("touchmove", onTouchMove);
    els.state.textContent = "Paused";
    els.caption.textContent = "Paused — rest your hands";
    els.start.disabled = false;
    els.start.textContent = "Resume sensors";
    els.stop.disabled = true;
    els.elapsed.textContent = formatTime(totalSeconds());
  }

  els.start.addEventListener("click", start);
  els.stop.addEventListener("click", stop);
  // Keep the orb keyboard/mouse-testable for desktop evaluation.
  els.playfield.addEventListener("click", (event) => {
    if (state.running && !state.orientationSeen && event.target === els.playfield) {
      const rect = els.playfield.getBoundingClientRect();
      state.x = clamp(((event.clientX - rect.left) / rect.width) * 100, 5, 95);
      state.y = clamp(((event.clientY - rect.top) / rect.height) * 100, 7, 93);
      placePlayer(); checkTarget();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.running) stop();
  });
  window.addEventListener("pagehide", () => {
    window.removeEventListener("deviceorientation", onOrientation, true);
    window.removeEventListener("devicemotion", onMotion, true);
  });
  updateReadings();
})();
