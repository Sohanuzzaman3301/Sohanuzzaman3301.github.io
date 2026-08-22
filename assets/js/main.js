(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Theme toggle --- */
  var themeBtn = document.querySelector(".theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var html = document.documentElement;
      var current = html.getAttribute("data-theme");
      var next = current === "dark" ? "light" : "dark";
      html.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
    });
  }

  /* --- Mobile nav toggle --- */
  var toggle = document.querySelector(".nav__toggle");
  var menu = document.getElementById("nav-menu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  /* --- Boot sequence typing --- */
  var boot = document.querySelector("[data-boot]");
  var lines = boot ? Array.prototype.slice.call(boot.querySelectorAll(".hero__line[data-boot]")) : [];

  function typeLine(line, done) {
    var full = line.textContent;
    line.textContent = "";
    var i = 0;
    var tick = window.setInterval(function () {
      i += 1;
      line.textContent = full.slice(0, i);
      if (i >= full.length) {
        window.clearInterval(tick);
        done();
      }
    }, 12);
  }

  function runBoot() {
    var status = boot.querySelector(".hero__line--status");
    if (!status) return;
    var cursor = document.createElement("span");
    cursor.className = "hero__cursor";
    status.appendChild(cursor);
    var idx = 0;
    function next() {
      if (idx < lines.length) {
        typeLine(lines[idx], function () { idx += 1; next(); });
      }
    }
    next();
  }

  if (boot) {
    if (reduceMotion) {
      var s = boot.querySelector(".hero__line--status");
      if (s) {
        var c = document.createElement("span");
        c.className = "hero__cursor";
        s.appendChild(c);
      }
    } else {
      runBoot();
    }
  }

  /* --- Log stream filler --- */
  var stream = document.querySelector("[data-logstream]");
  if (stream) {
    var samples = [
      "detection rule loaded: sig-2024-0812",
      "log pipeline: 4 sources connected",
      "alert correlation: 0 pending",
      "threat intel feed: updated 2h ago",
      "siem index: healthy, 12840 docs",
      "firewall rules: 142 active",
      "endpoint agents: 3/3 reporting",
      "vulnerability scan: last run 6h ago"
    ];
    var block = "";
    var repeat = 4;
    for (var r = 0; r < repeat; r++) {
      for (var i = 0; i < samples.length; i++) {
        block += "<p>" + samples[i] + "</p>";
      }
    }
    stream.innerHTML = block;
  }

  /* --- Radar sweep --- */
  var canvas = document.getElementById("radar");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var size = 180;
    var cx = size / 2;
    var cy = size / 2;
    var angle = 0;
    var blips = [
      { a: 0.7, r: 48, d: 1 },
      { a: 2.4, r: 70, d: -1 }
    ];

    function drawRadar() {
      var isDark = document.documentElement.getAttribute("data-theme") !== "light";
      var radarColor = isDark ? "rgba(94, 234, 212, " : "rgba(13, 148, 136, ";

      ctx.clearRect(0, 0, size, size);
      ctx.strokeStyle = radarColor + "0.4)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 54, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy);
      ctx.lineTo(cx + 80, cy);
      ctx.moveTo(cx, cy - 80);
      ctx.lineTo(cx, cy + 80);
      ctx.stroke();
      for (var i = 0; i < blips.length; i++) {
        var b = blips[i];
        b.a += 0.004 * b.d;
        var bx = cx + Math.cos(b.a) * b.r;
        var by = cy + Math.sin(b.a) * b.r;
        ctx.fillStyle = radarColor + "1)";
        ctx.beginPath();
        ctx.arc(bx, by, 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = radarColor + "0.25)";
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 80, angle, angle + 1.0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = radarColor + "0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * 80, cy + Math.sin(angle) * 80);
      ctx.stroke();
      ctx.lineWidth = 1;
      angle = (angle + 0.008) % (Math.PI * 2);
      if (!reduceMotion) {
        window.requestAnimationFrame(drawRadar);
      }
    }

    drawRadar();
  }

  // Whole-card click: navigate to data-href on card click (not on inner links)
  document.querySelectorAll('.card[data-href]').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('a')) return; // let internal links work normally
      window.location.href = card.dataset.href;
    });
  });

  /* --- Card image background color extraction (skip SVG) --- */
  document.querySelectorAll('.card__image img').forEach(img => {
    var src = img.currentSrc || img.src || '';
    if (src.endsWith('.svg') || src.includes('.svg?')) {
      // SVG: keep transparent, don't extract background color
      return;
    }
    if (img.complete) {
      setImageBackground(img);
    } else {
      img.addEventListener('load', () => setImageBackground(img));
    }
  });

  function setImageBackground(img) {
    try {
      var canvas = document.createElement('canvas');
      var ctx = canvas.getContext('2d');
      canvas.width = 1;
      canvas.height = 1;
      ctx.drawImage(img, 0, 0, 1, 1);
      var data = ctx.getImageData(0, 0, 1, 1).data;
      var color = 'rgb(' + data[0] + ', ' + data[1] + ', ' + data[2] + ')';
      img.parentElement.style.backgroundColor = color;
    } catch (e) {
      // Cross-origin images will fail silently
    }
  }
})();
