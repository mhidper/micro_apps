/* ============================================================
   Práctica de Macroeconomía · núcleo común
   - Aleatoriedad reproducible por semilla (cada ejercicio tiene un código)
   - Formato y lectura de números en español
   - Comprobación con tolerancia y detección de errores típicos
   - Gráficos SVG (rectas y barras) sin dependencias externas
   Los generadores de cada EPD (epd1.js, epd2.js, epd3.js) se registran
   con MP.registrar(...) y devuelven un objeto ejercicio.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- Aleatoriedad con semilla (mulberry32) ---------- */
  function crearRNG(seed) {
    var a = seed >>> 0;
    function next() {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    }
    return {
      next: next,
      int: function (lo, hi) { return lo + Math.floor(next() * (hi - lo + 1)); },
      // número en [lo, hi] múltiplo de paso
      paso: function (lo, hi, paso) {
        var n = Math.round((hi - lo) / paso);
        return redondear(lo + paso * Math.floor(next() * (n + 1)), 10);
      },
      elegir: function (arr) { return arr[Math.floor(next() * arr.length)]; },
      signo: function () { return next() < 0.5 ? -1 : 1; },
      prob: function (p) { return next() < p; },
      barajar: function (arr) {
        var b = arr.slice();
        for (var i = b.length - 1; i > 0; i--) {
          var j = Math.floor(next() * (i + 1));
          var t = b[i]; b[i] = b[j]; b[j] = t;
        }
        return b;
      }
    };
  }
  function nuevaSemilla() {
    var s;
    try {
      var u = new Uint32Array(1); global.crypto.getRandomValues(u); s = u[0];
    } catch (e) { s = Math.floor(Math.random() * 4294967296); }
    return s >>> 0;
  }
  function semillaATexto(s) { return (s >>> 0).toString(36).toUpperCase(); }
  function textoASemilla(t) {
    var n = parseInt(String(t || ''), 36);
    return isFinite(n) ? (n >>> 0) : null;
  }

  /* ---------- Números ---------- */
  function redondear(x, d) {
    var f = Math.pow(10, d || 0);
    return Math.round((x + (x >= 0 ? 1e-12 : -1e-12)) * f) / f;
  }
  // Formato español: miles con punto, decimales con coma, signo menos tipográfico.
  // fijo=true fuerza 'dec' decimales (útil para euros: 95,20)
  function fmt(x, dec, fijo) {
    if (dec === undefined) dec = 2;
    if (!isFinite(x)) return '—';
    var r = redondear(x, dec);
    if (Object.is(r, -0) || Math.abs(r) < Math.pow(10, -dec) / 2) r = 0;
    var neg = r < 0;
    var s = Math.abs(r).toFixed(dec);
    var partes = s.split('.');
    var ent = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    var dc = partes[1] || '';
    if (!fijo) dc = dc.replace(/0+$/, '');
    return (neg ? '−' : '') + ent + (dc ? ',' + dc : '');
  }
  function pct(x, dec) { return fmt(x * 100, dec === undefined ? 2 : dec) + '%'; }

  // Lee lo que escribe el alumno: "3.000", "3000", "3,5", "0.035", "-12,5 %", "1.234,56"
  function leerNumero(txt) {
    if (txt === null || txt === undefined) return NaN;
    var s = String(txt).trim()
      .replace(/[−–—]/g, '-')
      .replace(/\s+/g, '')
      .replace(/(M€|€|%|pp|p\.p\.|pb|x)$/i, '')
      .replace(/^\+/, '');
    if (!s) return NaN;
    var tienePunto = s.indexOf('.') >= 0, tieneComa = s.indexOf(',') >= 0;
    if (tienePunto && tieneComa) {
      // el último separador es el decimal
      if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
      else s = s.replace(/,/g, '');
    } else if (tieneComa) {
      if (/^-?\d{1,3}(,\d{3}){2,}$/.test(s)) s = s.replace(/,/g, '');
      else s = s.replace(',', '.');
    } else if (tienePunto) {
      // "3.000" o "1.520.000" → miles; "3.5" o "0.035" → decimal
      if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    }
    if (!/^-?\d*\.?\d+$/.test(s)) return NaN;
    return parseFloat(s);
  }

  // Interpretaciones posibles: "3.077" puede ser 3077 (miles) o 3,077 (decimal con punto)
  function candidatos(txt) {
    var out = [], v1 = leerNumero(txt);
    if (isFinite(v1)) out.push(v1);
    var s = String(txt || '').trim().replace(/[−–—]/g, '-').replace(/\s+/g, '').replace(/(M€|€|%|pp|p\.p\.|pb|x)$/i, '').replace(/^\+/, '');
    if (/^-?\d{1,3}\.\d{3}$/.test(s)) { var v2 = parseFloat(s); if (out.indexOf(v2) < 0) out.push(v2); }
    return out;
  }
  function tolerancia(p) {
    if (p.tol !== undefined) return p.tol;
    var dec = p.dec === undefined ? 2 : p.dec;
    return Math.max(0.51 * Math.pow(10, -dec), 0.0025 * Math.abs(p.sol));
  }
  function cerca(v, objetivo, tol) { return Math.abs(v - objetivo) <= tol + 1e-9; }

  // Devuelve {estado:'ok'|'casi'|'error'|'vacio', msg}
  function comprobar(p, txt) {
    if (p.tipo === 'opc') {
      if (txt === null || txt === undefined || txt === '') return { estado: 'vacio', msg: 'Elige una opción.' };
      var k = Number(txt);
      if (k === p.correcta) return { estado: 'ok', msg: p.okMsg || '' };
      var e = (p.erroresOpc || {})[k];
      return { estado: 'error', msg: e || 'No es la opción correcta. Vuelve a razonarlo.' };
    }
    var cands = candidatos(txt);
    if (!cands.length) return { estado: 'vacio', msg: 'Escribe un número (usa coma para los decimales).' };
    var tol = tolerancia(p);
    for (var c = 0; c < cands.length; c++) if (cerca(cands[c], p.sol, tol)) return { estado: 'ok', msg: '' };
    var v = cands[0];
    // si una lectura alternativa se parece más a la solución, usar esa para el diagnóstico
    cands.forEach(function (x) { if (Math.abs(x - p.sol) < Math.abs(v - p.sol)) v = x; });
    // Porcentajes escritos en tanto por uno (0,05 en lugar de 5 %)
    if (p.unidad === '%' || p.unidad === 'pp') {
      if (cerca(v * 100, p.sol, tol)) {
        return { estado: 'ok', msg: 'Correcto. Lo has escrito en tanto por uno; aquí se pide en %: ' + fmt(p.sol, p.dec) + (p.unidad === '%' ? '%' : ' pp') + '.' };
      }
    }
    // Errores típicos previstos por el generador
    var errs = p.errores || [];
    for (var i = 0; i < errs.length; i++) {
      var ev = errs[i].v;
      if (isFinite(ev) && Math.abs(ev - p.sol) > tol && cerca(v, ev, Math.max(tol, 0.0025 * Math.abs(ev)))) {
        return { estado: 'error', msg: errs[i].msg };
      }
    }
    // Signo cambiado
    if (p.sol !== 0 && cerca(-v, p.sol, tol)) return { estado: 'error', msg: 'Revisa el signo: el valor absoluto es correcto, pero el sentido no.' };
    // Cerca pero fuera de tolerancia → probablemente redondeos
    if (p.sol !== 0 && Math.abs(v - p.sol) / Math.abs(p.sol) < 0.02) {
      return { estado: 'casi', msg: 'Muy cerca. Probablemente sea un problema de redondeo: arrastra más decimales en los pasos intermedios.' };
    }
    return { estado: 'error', msg: 'No es correcto. Revisa el planteamiento.' };
  }

  /* ---------- Fórmulas en HTML ---------- */
  function fr(num, den) { return '<span class="fr"><span class="fr-n">' + num + '</span><span class="fr-d">' + den + '</span></span>'; }
  function eq(html) { return '<div class="eq">' + html + '</div>'; }
  function v(t) { return '<var>' + t + '</var>'; }

  /* ---------- Gráficos SVG ---------- */
  var COL = {
    navy: '#0b1c36', cobalt: '#056caa', azure: '#0776b5', gold: '#d97706',
    crimson: '#e11d48', teal: '#059669', slate: '#64748b', indigo: '#4338ca',
    grid: '#e8e2d8', axis: '#4a3b32', soft: '#94a3b8'
  };
  function pasoBonito(rango, objetivo) {
    var bruto = rango / (objetivo || 5);
    var pot = Math.pow(10, Math.floor(Math.log10(bruto)));
    var n = bruto / pot;
    var m = n < 1.5 ? 1 : n < 2.25 ? 2 : n < 3.5 ? 2.5 : n < 7.5 ? 5 : 10;
    return m * pot;
  }
  function ticks(lo, hi, obj) {
    if (!(hi > lo)) return [lo];
    var p = pasoBonito(hi - lo, obj);
    var out = [];
    if (!(p > 0) || (hi - lo) / p > 60) return [lo, hi];
    for (var t = Math.ceil(lo / p - 1e-9) * p; t <= hi + 1e-9; t += p) out.push(redondear(t, 10));
    return out;
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var idClip = 0;

  // Gráfico de rectas/curvas en un plano
  function grafico(o) {
    var W = o.w || 520, H = o.h || 380;
    var m = { l: 58, r: 18, t: 18, b: 52 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var x0 = o.x[0], x1 = o.x[1], y0 = o.y[0], y1 = o.y[1];
    function X(x) { return m.l + (x - x0) / (x1 - x0) * pw; }
    function Y(y) { return m.t + (1 - (y - y0) / (y1 - y0)) * ph; }
    var fx = o.fmtX || function (t) { return fmt(t, 2); };
    var fy = o.fmtY || function (t) { return fmt(t, 2); };
    var cid = 'clip' + (++idClip);
    var s = '<svg class="graf" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titulo || 'Gráfico') + '" xmlns="http://www.w3.org/2000/svg">';
    s += '<defs><clipPath id="' + cid + '"><rect x="' + m.l + '" y="' + m.t + '" width="' + pw + '" height="' + ph + '"/></clipPath>';
    s += '<marker id="ar' + cid + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="context-stroke"/></marker></defs>';
    // rejilla y ejes
    var tx = o.ticksX || ticks(x0, x1, 4), ty = o.ticksY || ticks(y0, y1, 5);
    tx.forEach(function (t) {
      s += '<line x1="' + X(t) + '" y1="' + m.t + '" x2="' + X(t) + '" y2="' + (m.t + ph) + '" stroke="' + COL.grid + '" stroke-width="1"/>';
      s += '<text x="' + X(t) + '" y="' + (m.t + ph + 20) + '" text-anchor="middle" class="g-tick">' + esc(fx(t)) + '</text>';
    });
    ty.forEach(function (t) {
      s += '<line x1="' + m.l + '" y1="' + Y(t) + '" x2="' + (m.l + pw) + '" y2="' + Y(t) + '" stroke="' + COL.grid + '" stroke-width="1"/>';
      s += '<text x="' + (m.l - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end" class="g-tick">' + esc(fy(t)) + '</text>';
    });
    s += '<line x1="' + m.l + '" y1="' + (m.t + ph) + '" x2="' + (m.l + pw) + '" y2="' + (m.t + ph) + '" stroke="' + COL.axis + '" stroke-width="1.4"/>';
    s += '<line x1="' + m.l + '" y1="' + m.t + '" x2="' + m.l + '" y2="' + (m.t + ph) + '" stroke="' + COL.axis + '" stroke-width="1.4"/>';
    if (o.xlab) s += '<text x="' + (m.l + pw) + '" y="' + (H - 8) + '" text-anchor="end" class="g-lab">' + esc(o.xlab) + '</text>';
    if (o.ylab) s += '<text x="' + (m.l + 6) + '" y="' + (m.t + 14) + '" text-anchor="start" class="g-lab g-ylab">' + esc(o.ylab) + '</text>';

    s += '<g clip-path="url(#' + cid + ')">';
    (o.areas || []).forEach(function (a) {
      var d = a.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ') + ' Z';
      s += '<path d="' + d + '" fill="' + (a.color || COL.gold) + '" opacity="' + (a.op || 0.12) + '"/>';
    });
    (o.lineas || []).forEach(function (l) {
      var d = l.pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' ');
      s += '<path d="' + d + '" fill="none" stroke="' + (l.color || COL.cobalt) + '" stroke-width="' + (l.w || 2.6) + '"' + (l.dash ? ' stroke-dasharray="' + l.dash + '"' : '') + ' stroke-linecap="round" stroke-linejoin="round"/>';
    });
    (o.flechas || []).forEach(function (f) {
      s += '<line x1="' + X(f.de[0]) + '" y1="' + Y(f.de[1]) + '" x2="' + X(f.a[0]) + '" y2="' + Y(f.a[1]) + '" stroke="' + (f.color || COL.crimson) + '" stroke-width="2" marker-end="url(#ar' + cid + ')"' + (f.dash ? ' stroke-dasharray="' + f.dash + '"' : '') + '/>';
    });
    (o.puntos || []).forEach(function (p) {
      if (p.guias !== false) {
        s += '<line x1="' + X(p.x) + '" y1="' + Y(p.y) + '" x2="' + X(p.x) + '" y2="' + (m.t + ph) + '" stroke="' + COL.soft + '" stroke-dasharray="4 4" stroke-width="1"/>';
        s += '<line x1="' + m.l + '" y1="' + Y(p.y) + '" x2="' + X(p.x) + '" y2="' + Y(p.y) + '" stroke="' + COL.soft + '" stroke-dasharray="4 4" stroke-width="1"/>';
      }
    });
    s += '</g>';
    // etiquetas de rectas (fuera del clip para que no se corten)
    (o.lineas || []).forEach(function (l) {
      if (!l.etiqueta) return;
      var p = l.etqEn === 'inicio' ? l.pts[0] : l.pts[l.pts.length - 1];
      if (l.etqPt) p = l.etqPt;
      var px = Math.min(Math.max(X(p[0]), m.l + 4), m.l + pw - 4), py = Math.min(Math.max(Y(p[1]), m.t + 10), m.t + ph - 6);
      var anc = px > m.l + pw * 0.8 ? 'end' : 'start';
      s += '<text x="' + (px + (anc === 'end' ? -4 : 4)) + '" y="' + (py - 6) + '" text-anchor="' + anc + '" class="g-etq" fill="' + (l.color || COL.cobalt) + '">' + esc(l.etiqueta) + '</text>';
    });
    (o.puntos || []).forEach(function (p) {
      s += '<circle cx="' + X(p.x) + '" cy="' + Y(p.y) + '" r="5.5" fill="' + (p.color || COL.navy) + '" stroke="#fff" stroke-width="2"/>';
      if (p.etiqueta) s += '<text x="' + (X(p.x) + 9) + '" y="' + (Y(p.y) - 9) + '" class="g-pt" fill="' + (p.color || COL.navy) + '">' + esc(p.etiqueta) + '</text>';
      if (p.marcaX) s += '<text x="' + X(p.x) + '" y="' + (m.t + ph + 40) + '" text-anchor="middle" class="g-marca" fill="' + (p.color || COL.navy) + '">' + esc(p.marcaX) + '</text>';
    });
    s += '</svg>';
    return s;
  }

  // Barras (opcionalmente apiladas). grupos: [{etiqueta, pilas:[{v, color, etiqueta}]}]
  function barras(o) {
    var W = o.w || 520, H = o.h || 360;
    var m = { l: 58, r: 12, t: 22, b: 56 };
    var pw = W - m.l - m.r, ph = H - m.t - m.b;
    var max = o.max || 0;
    o.grupos.forEach(function (g) {
      var tot = g.pilas.reduce(function (a, p) { return a + Math.max(0, p.v); }, 0);
      if (tot > max) max = tot;
    });
    max = max * 1.12;
    function Y(v) { return m.t + ph - v / max * ph; }
    var f = o.fmt || function (t) { return fmt(t, 1); };
    var s = '<svg class="graf" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.titulo || 'Gráfico de barras') + '" xmlns="http://www.w3.org/2000/svg">';
    ticks(0, max, 5).forEach(function (t) {
      s += '<line x1="' + m.l + '" y1="' + Y(t) + '" x2="' + (m.l + pw) + '" y2="' + Y(t) + '" stroke="' + COL.grid + '"/>';
      s += '<text x="' + (m.l - 8) + '" y="' + (Y(t) + 4) + '" text-anchor="end" class="g-tick">' + esc(f(t)) + '</text>';
    });
    var n = o.grupos.length, bw = Math.min(110, pw / n * 0.56);
    o.grupos.forEach(function (g, i) {
      var cx = m.l + pw * (i + 0.5) / n, base = 0;
      g.pilas.forEach(function (p) {
        if (p.v <= 0) return;
        var y1 = Y(base + p.v), y0 = Y(base);
        s += '<rect x="' + (cx - bw / 2) + '" y="' + y1 + '" width="' + bw + '" height="' + Math.max(0.5, y0 - y1) + '" fill="' + p.color + '" rx="3"/>';
        if (y0 - y1 > 16 && p.etiqueta) s += '<text x="' + cx + '" y="' + ((y0 + y1) / 2 + 4) + '" text-anchor="middle" class="g-in">' + esc(p.etiqueta) + '</text>';
        base += p.v;
      });
      s += '<text x="' + cx + '" y="' + (Y(base) - 6) + '" text-anchor="middle" class="g-top">' + esc(g.total !== undefined ? g.total : f(base)) + '</text>';
      s += '<text x="' + cx + '" y="' + (m.t + ph + 20) + '" text-anchor="middle" class="g-lab">' + esc(g.etiqueta) + '</text>';
      if (g.sub) s += '<text x="' + cx + '" y="' + (m.t + ph + 37) + '" text-anchor="middle" class="g-tick">' + esc(g.sub) + '</text>';
    });
    s += '<line x1="' + m.l + '" y1="' + (m.t + ph) + '" x2="' + (m.l + pw) + '" y2="' + (m.t + ph) + '" stroke="' + COL.axis + '" stroke-width="1.4"/>';
    if (o.ylab) s += '<text x="' + m.l + '" y="12" class="g-lab">' + esc(o.ylab) + '</text>';
    s += '</svg>';
    if (o.leyenda) {
      s += '<div class="leyenda">' + o.leyenda.map(function (l) {
        return '<span><i style="background:' + l.color + '"></i>' + esc(l.etiqueta) + '</span>';
      }).join('') + '</div>';
    }
    return s;
  }
  function leyenda(items) {
    return '<div class="leyenda">' + items.map(function (l) {
      return '<span><i style="background:' + l.color + (l.dash ? ';background:repeating-linear-gradient(90deg,' + l.color + ' 0 6px,transparent 6px 10px)' : '') + '"></i>' + esc(l.etiqueta) + '</span>';
    }).join('') + '</div>';
  }
  // Rango con margen
  function rango(vals, margen, cero) {
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    if (cero) lo = Math.min(lo, 0);
    var d = hi - lo;
    if (!(d > 1e-6 * Math.max(1, Math.abs(hi)))) d = Math.abs(hi) * 0.2 || 1;
    return [lo - d * (margen || 0.15), hi + d * (margen || 0.15)];
  }

  /* ---------- Registro de EPD y tipologías ---------- */
  var EPDS = [];
  var TIPOS = {};
  function registrarEPD(e) { EPDS.push(e); e.tipos = e.tipos || []; }
  function registrar(epdId, tipo) {
    var e = EPDS.filter(function (x) { return x.id === epdId; })[0];
    if (!e) throw new Error('EPD desconocida: ' + epdId);
    tipo.epd = epdId;
    e.tipos.push(tipo);
    TIPOS[tipo.id] = tipo;
  }
  // Genera un ejercicio válido (los generadores pueden rechazar casos: devuelven null)
  function generar(tipo, seed) {
    for (var k = 0; k < 400; k++) {
      var R = crearRNG((seed + k * 2654435761) >>> 0);
      var ej = tipo.generar(R);
      if (ej) { ej.seed = seed; return ej; }
    }
    throw new Error('No se pudo generar un caso válido para ' + tipo.id);
  }

  global.MP = {
    crearRNG: crearRNG, nuevaSemilla: nuevaSemilla, semillaATexto: semillaATexto, textoASemilla: textoASemilla,
    redondear: redondear, fmt: fmt, pct: pct, leerNumero: leerNumero, comprobar: comprobar, tolerancia: tolerancia,
    fr: fr, eq: eq, v: v, COL: COL, grafico: grafico, barras: barras, leyenda: leyenda, rango: rango, esc: esc,
    EPDS: EPDS, TIPOS: TIPOS, registrarEPD: registrarEPD, registrar: registrar, generar: generar
  };
})(typeof window !== 'undefined' ? window : globalThis);
