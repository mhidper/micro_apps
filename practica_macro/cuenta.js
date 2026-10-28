/* Práctica EPD · Macro — cuentas de alumnos, historial y telemetría
   - Registro: nombre + acrónimo UPO → código MACR-EPD-NNNN (único, asignado por el servidor)
   - Entrada: con el código, desde cualquier dispositivo (el servidor devuelve el historial)
   - Telemetría: cada acción se envía a la hoja de Google (Apps Script) con cola local
   - Mi espacio: progreso, uso y pronóstico (% de aciertos en los 3 últimos días de uso) */
(function () {
  'use strict';
  var CFG = window.MP_CONFIG || {};
  var EP = (CFG.endpoint || '').trim();
  var PREFIJO = 'MACR-EPD-';
  var K_CUENTA = 'mh_pm_cuenta', K_COLA = 'mh_pm_cola', K_CUENTAS = 'mh_pm_cuentas';
  var esc = MP.esc;

  function leer(k, def) { try { var v = JSON.parse(localStorage.getItem(k)); return v === null || v === undefined ? def : v; } catch (e) { return def; } }
  function guardar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  function borrar(k) { try { localStorage.removeItem(k); } catch (e) { /* nada */ } }
  function kHist(c) { return 'mh_pm_hist_' + c; }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function diaLocal(ts) { var d = new Date(ts); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function dispositivo() {
    var u = navigator.userAgent || '';
    var so = /iPhone|iPad|iPod/.test(u) ? 'iOS' : /Android/.test(u) ? 'Android' : /Macintosh/.test(u) ? 'Mac' : /Windows/.test(u) ? 'Windows' : /Linux/.test(u) ? 'Linux' : 'Otro';
    var app = false; try { app = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone; } catch (e) { /* nada */ }
    var hub = false; try { hub = window.self !== window.top; } catch (e) { hub = true; }
    return so + (app ? ' · app instalada' : '') + (hub ? ' · desde el hub' : '');
  }

  var cuenta = leer(K_CUENTA, null);
  var cola = leer(K_COLA, []);

  /* ---------- Historial local (por código) ---------- */
  function hist() { return cuenta ? leer(kHist(cuenta.codigo), []) : []; }
  function guardarHist(h) { if (cuenta) guardar(kHist(cuenta.codigo), h.slice(-3000)); }
  function fusionarHist(remoto) {
    if (!cuenta || !Array.isArray(remoto)) return;
    var h = hist(), ids = {};
    h.forEach(function (x) { ids[x.id] = true; });
    remoto.forEach(function (x) { if (x.id && !ids[x.id]) { h.push(x); ids[x.id] = true; } });
    h.sort(function (a, b) { return a.ts < b.ts ? -1 : a.ts > b.ts ? 1 : 0; });
    guardarHist(h);
  }

  /* ---------- Telemetría ---------- */
  var temporizador = null, enviando = false;
  function log(accion, d) {
    if (!cuenta) return null;
    var ev = { id: (d && d.id) || uid(), ts: new Date().toISOString(), codigo: cuenta.codigo, nombre: cuenta.nombre || '', acronimo: cuenta.acronimo || '', accion: accion, dispositivo: dispositivo() };
    if (d) for (var k in d) if (k !== 'id' && d[k] !== undefined) ev[k] = d[k];
    cola.push(ev);
    if (cola.length > 2000) cola = cola.slice(-2000);
    guardar(K_COLA, cola);
    programar();
    return ev;
  }
  function programar() {
    if (!EP) return;
    clearTimeout(temporizador);
    temporizador = setTimeout(function () { enviar(false); }, 1500);
  }
  function quitar(lote) {
    var ids = {};
    lote.forEach(function (x) { ids[x.id] = true; });
    cola = leer(K_COLA, []).filter(function (x) { return !ids[x.id]; });
    guardar(K_COLA, cola);
  }
  function enviar(beacon) {
    if (!EP) return;
    cola = leer(K_COLA, []);
    if (!cola.length) return;
    var lote = cola.slice(0, 60), body = JSON.stringify(lote);
    if (beacon && navigator.sendBeacon) {
      try { if (navigator.sendBeacon(EP, new Blob([body], { type: 'text/plain;charset=utf-8' }))) quitar(lote); } catch (e) { /* nada */ }
      return;
    }
    if (enviando || (navigator.onLine === false)) return;
    enviando = true;
    fetch(EP, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: body.length < 60000 })
      .then(function () { quitar(lote); enviando = false; if (cola.length) programar(); })
      .catch(function () { enviando = false; });
  }
  window.addEventListener('online', function () { enviar(false); });

  /* ---------- Tiempo de uso activo ---------- */
  var activo = 0, ultimaInteraccion = Date.now();
  ['click', 'keydown', 'touchstart', 'scroll', 'input'].forEach(function (t) {
    window.addEventListener(t, function () { ultimaInteraccion = Date.now(); }, { passive: true, capture: true });
  });
  setInterval(function () {
    if (!cuenta || document.visibilityState !== 'visible') return;
    if (Date.now() - ultimaInteraccion < 5 * 60 * 1000) activo += 15;
    if (activo >= 600) volcarSesion(false);
  }, 15000);
  function volcarSesion(beacon) {
    if (!cuenta) return;
    var s = Math.round(activo);
    if (s >= 15) {
      var it = { id: uid(), ts: new Date().toISOString(), accion: 'sesion', segundos: s };
      var h = hist(); h.push(it); guardarHist(h);
      log('sesion', { id: it.id, segundos: s });
      activo = 0;
    }
    enviar(beacon);
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') volcarSesion(true); });
  window.addEventListener('pagehide', function () { volcarSesion(true); });

  /* ---------- Registro de actividad que cuenta para el progreso ---------- */
  function anotar(accion, datos) {
    if (!cuenta) return;
    var it = { id: uid(), ts: new Date().toISOString(), accion: accion };
    for (var k in datos) it[k] = datos[k];
    var h = hist(); h.push({ id: it.id, ts: it.ts, accion: accion, epd: it.epd, tipo: it.tipo, aciertos: it.aciertos, total: it.total, nota: it.nota === undefined ? null : it.nota, segundos: it.segundos || 0 });
    guardarHist(h);
    log(accion, it);
  }

  /* ---------- Servidor ---------- */
  function pedir(params) {
    var u = EP + (EP.indexOf('?') >= 0 ? '&' : '?') + Object.keys(params).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(params[k]); }).join('&');
    return fetch(u, { method: 'GET', cache: 'no-store' }).then(function (r) { return r.json(); });
  }
  function fijarCuenta(c) {
    cuenta = { codigo: c.codigo, nombre: c.nombre || '', acronimo: c.acronimo || '' };
    guardar(K_CUENTA, cuenta);
    var cs = leer(K_CUENTAS, {}); cs[cuenta.codigo] = cuenta; guardar(K_CUENTAS, cs);
  }
  function normalizarCodigo(t) {
    var d = String(t || '').toUpperCase().replace(/\s+/g, '').replace(/^MACR-?EPD-?/, '').replace(/\D/g, '');
    return /^\d{4}$/.test(d) ? PREFIJO + d : null;
  }
  function registrar(nombre, acr) {
    nombre = String(nombre || '').trim(); acr = String(acr || '').trim().toLowerCase();
    if (!EP) {
      fijarCuenta({ codigo: PREFIJO + (1000 + Math.floor(Math.random() * 9000)), nombre: nombre, acronimo: acr });
      log('registro', { detalle: { modo: 'local' } });
      return Promise.resolve(cuenta);
    }
    return pedir({ accion: 'registro', nombre: nombre, acronimo: acr }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || 'error');
      fijarCuenta(r);
      log('registro', {});
      return cuenta;
    });
  }
  function entrar(texto) {
    var codigo = normalizarCodigo(texto);
    if (!codigo) return Promise.reject(new Error('formato'));
    var conocido = leer(K_CUENTAS, {})[codigo];
    if (!EP) {
      fijarCuenta(conocido || { codigo: codigo });
      log('acceso', { detalle: { modo: 'local' } });
      return Promise.resolve(cuenta);
    }
    return pedir({ accion: 'login', codigo: codigo }).then(function (r) {
      if (!r || !r.ok) throw new Error((r && r.error) || 'error');
      fijarCuenta(r.alumno);
      fusionarHist(r.historial);
      log('acceso', { detalle: { modo: 'codigo' } });
      return cuenta;
    }, function () {
      // Sin conexión: solo se admite un código ya usado en este dispositivo
      if (conocido) { fijarCuenta(conocido); log('acceso', { detalle: { modo: 'sin_conexion' } }); return cuenta; }
      throw new Error('sin_conexion');
    });
  }
  function salir() {
    volcarSesion(false);
    log('salida', {});
    enviar(false);
    cuenta = null;
    borrar(K_CUENTA);
  }
  function sincronizar() {
    if (!EP || !cuenta) return Promise.resolve(false);
    return pedir({ accion: 'login', codigo: cuenta.codigo }).then(function (r) {
      if (r && r.ok) { fusionarHist(r.historial); return true; }
      return false;
    }, function () { return false; });
  }

  /* ---------- Resumen para Mi espacio ---------- */
  function resumen() {
    var h = hist();
    var res = h.filter(function (x) { return x.accion === 'ejercicio_terminado' || x.accion === 'examen_entregado'; });
    var ses = h.filter(function (x) { return x.accion === 'sesion'; });
    var dias = {};
    h.forEach(function (x) { dias[diaLocal(x.ts)] = true; });
    var segundos = ses.reduce(function (a, x) { return a + (x.segundos || 0); }, 0) + Math.round(activo);
    var ac = 0, tot = 0;
    res.forEach(function (x) { ac += x.aciertos || 0; tot += x.total || 0; });
    // Pronóstico: % de aciertos en los tres últimos días con ejercicios
    var diasRes = [];
    res.forEach(function (x) { var d = diaLocal(x.ts); if (diasRes.indexOf(d) < 0) diasRes.push(d); });
    diasRes.sort();
    var ult = diasRes.slice(-3), pa = 0, pt = 0;
    res.forEach(function (x) { if (ult.indexOf(diaLocal(x.ts)) >= 0) { pa += x.aciertos || 0; pt += x.total || 0; } });
    var porTipo = {};
    res.forEach(function (x) {
      var t = x.accion === 'examen_entregado' ? 'examen' : x.tipo;
      var p = porTipo[t] || (porTipo[t] = { hechos: 0, aciertos: 0, total: 0, limpios: 0, ultimo: null, notas: [] });
      p.hechos++; p.aciertos += x.aciertos || 0; p.total += x.total || 0;
      if (x.total && x.aciertos === x.total) p.limpios++;
      if (x.nota !== null && x.nota !== undefined) p.notas.push(x.nota);
      p.ultimo = x.ts;
    });
    var porDia = {};
    res.forEach(function (x) { var d = diaLocal(x.ts); porDia[d] = (porDia[d] || 0) + 1; });
    return {
      ejercicios: res.filter(function (x) { return x.accion === 'ejercicio_terminado'; }).length,
      examenes: res.filter(function (x) { return x.accion === 'examen_entregado'; }).length,
      dias: Object.keys(dias).length, segundos: segundos, aciertos: ac, total: tot,
      pronostico: pt ? pa / pt : null, pronDias: ult, pronAciertos: pa, pronTotal: pt,
      porTipo: porTipo, porDia: porDia, recientes: res.slice(-8).reverse()
    };
  }
  function progTipo(id) {
    var p = resumen().porTipo[id];
    return p ? { hechos: p.hechos, limpios: p.limpios } : { hechos: 0, limpios: 0 };
  }

  /* ---------- Vistas ---------- */
  function fmtDia(d) { var p = d.split('-'); return p[2] + '/' + p[1]; }
  function fmtTiempo(s) {
    var h = Math.floor(s / 3600), m = Math.round((s % 3600) / 60);
    return h ? h + ' h ' + m + ' min' : m + ' min';
  }
  function copiar(texto, boton) {
    function hecho() { var t = boton.textContent; boton.textContent = '✓ Copiado'; setTimeout(function () { boton.textContent = t; }, 1800); }
    try { navigator.clipboard.writeText(texto).then(hecho, function () { prompt('Copia tu código:', texto); }); }
    catch (e) { prompt('Copia tu código:', texto); }
  }
  var ERRORES = {
    ya_registrado: 'Ese acrónimo ya tiene un código. Si lo has perdido, pídeselo al profesor.',
    datos_incompletos: 'Escribe tu nombre completo y tu acrónimo UPO.',
    no_existe: 'No hay ningún alumno con ese código. Revisa los cuatro dígitos.',
    formato: 'El código tiene cuatro dígitos después de MACR-EPD-.',
    sin_conexion: 'No hay conexión con el servidor. Inténtalo de nuevo en un momento.',
    error: 'No se ha podido completar. Inténtalo de nuevo.'
  };
  function msgError(e) { var k = e && e.message; return ERRORES[k] || (/fetch|network|Failed/i.test(k || '') ? ERRORES.sin_conexion : ERRORES.error); }

  function vistaAcceso(ctx) {
    var $app = ctx.app;
    document.title = 'Acceso · Práctica EPD Macro';
    $app.innerHTML =
      '<section class="intro acceso-intro"><p class="antetitulo">Tu espacio de práctica</p><h1>Entra en la Práctica EPD</h1>' +
      '<p class="lede">Para practicar necesitas tu código personal. Con él guardas tu progreso, ves cómo vas y puedes entrar desde cualquier dispositivo.</p></section>' +
      '<div class="pestanas" role="tablist">' +
      '<button type="button" role="tab" class="pestana activa" id="tabReg" aria-selected="true">Primera vez</button>' +
      '<button type="button" role="tab" class="pestana" id="tabEnt" aria-selected="false">Ya tengo código</button></div>' +
      '<section class="panel-acceso" id="panReg">' +
      '<form id="fReg" novalidate><label class="campo-f"><span>Nombre y apellidos</span><input id="rNombre" autocomplete="name" required minlength="3" maxlength="80"></label>' +
      '<label class="campo-f"><span>Acrónimo UPO</span><input id="rAcr" autocomplete="username" autocapitalize="none" spellcheck="false" required minlength="3" maxlength="20" placeholder="el de tu correo de la UPO"></label>' +
      '<p class="nota-datos">Al registrarte, la app guardará tu actividad (ejercicios, aciertos y tiempo de uso) para el seguimiento docente de la asignatura. Solo la ve el profesor.</p>' +
      '<div class="err" id="rErr" role="alert"></div>' +
      '<button type="submit" class="btn btn-prim btn-grande" id="rBtn">Registrarme y obtener mi código</button></form></section>' +
      '<section class="panel-acceso" id="panEnt" hidden>' +
      '<form id="fEnt" novalidate><label class="campo-f"><span>Tu código</span><span class="codigo-in"><b>MACR-EPD-</b><input id="eCod" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="0000" aria-label="Cuatro dígitos de tu código"></span></label>' +
      '<div class="err" id="eErr" role="alert"></div>' +
      '<button type="submit" class="btn btn-prim btn-grande" id="eBtn">Entrar</button>' +
      '<p class="nota-datos">¿Has perdido tu código? Pídeselo al profesor: no se puede recuperar desde la app.</p></form></section>';

    var tabR = document.getElementById('tabReg'), tabE = document.getElementById('tabEnt');
    function pestana(reg) {
      document.getElementById('panReg').hidden = !reg; document.getElementById('panEnt').hidden = reg;
      tabR.classList.toggle('activa', reg); tabE.classList.toggle('activa', !reg);
      tabR.setAttribute('aria-selected', String(reg)); tabE.setAttribute('aria-selected', String(!reg));
    }
    tabR.onclick = function () { pestana(true); };
    tabE.onclick = function () { pestana(false); document.getElementById('eCod').focus(); };

    document.getElementById('fReg').onsubmit = function (ev) {
      ev.preventDefault();
      var n = document.getElementById('rNombre').value.trim(), a = document.getElementById('rAcr').value.trim();
      var err = document.getElementById('rErr'), b = document.getElementById('rBtn');
      if (n.length < 3 || a.length < 3) { err.textContent = ERRORES.datos_incompletos; return; }
      err.textContent = ''; b.disabled = true; b.textContent = 'Generando tu código…';
      registrar(n, a).then(function (c) { vistaCodigoNuevo(ctx, c); }, function (e) {
        err.textContent = msgError(e); b.disabled = false; b.textContent = 'Registrarme y obtener mi código';
      });
    };
    document.getElementById('fEnt').onsubmit = function (ev) {
      ev.preventDefault();
      var err = document.getElementById('eErr'), b = document.getElementById('eBtn');
      err.textContent = ''; b.disabled = true; b.textContent = 'Comprobando…';
      entrar(document.getElementById('eCod').value).then(function () { ctx.ir('#/'); }, function (e) {
        err.textContent = msgError(e); b.disabled = false; b.textContent = 'Entrar';
      });
    };
  }

  function vistaCodigoNuevo(ctx, c) {
    var $app = ctx.app;
    $app.innerHTML =
      '<section class="codigo-nuevo"><p class="antetitulo">Registro completado</p>' +
      '<h1>' + (c.nombre ? 'Hola, ' + esc(c.nombre.split(' ')[0]) + '. ' : '') + 'Este es tu código</h1>' +
      '<div class="codigo-grande" id="codGrande">' + esc(c.codigo) + '</div>' +
      '<button type="button" class="btn" id="cCopiar">📋 Copiar código</button>' +
      '<div class="aviso-guardar"><b>⚠️ Guárdalo ahora.</b> Es tu llave para entrar en tu espacio: lo necesitarás cada vez que cambies de dispositivo o de navegador, y sin él no podrás recuperar tu progreso. Haz una captura de pantalla o apúntalo en un sitio seguro.</div>' +
      '<label class="chk"><input type="checkbox" id="cChk"> He guardado mi código</label>' +
      '<button type="button" class="btn btn-prim btn-grande" id="cEntrar" disabled>Entrar en mi espacio</button></section>';
    document.getElementById('cCopiar').onclick = function () { copiar(c.codigo, this); };
    document.getElementById('cChk').onchange = function () { document.getElementById('cEntrar').disabled = !this.checked; };
    document.getElementById('cEntrar').onclick = function () { log('codigo_guardado', {}); ctx.ir('#/'); };
  }

  function vistaEspacio(ctx, yaSincronizado) {
    var $app = ctx.app;
    if (!cuenta) return ctx.ir('#/acceso');
    document.title = 'Mi espacio · Práctica EPD Macro';
    var r = resumen();
    var pron = r.pronostico;
    var tituloTipo = function (t) { return t === 'examen' ? '📝 Simulacros de examen' : (MP.TIPOS[t] ? MP.TIPOS[t].icono + ' ' + MP.TIPOS[t].titulo : t); };
    // últimos 14 días
    var barras = '', maxDia = 1, hoy = new Date();
    var dias14 = [];
    for (var k = 13; k >= 0; k--) { var d = new Date(hoy); d.setDate(hoy.getDate() - k); var key = diaLocal(d); dias14.push(key); maxDia = Math.max(maxDia, r.porDia[key] || 0); }
    barras = dias14.map(function (key) {
      var n = r.porDia[key] || 0;
      return '<div class="dia" title="' + fmtDia(key) + ': ' + n + '"><span class="dia-barra" style="height:' + Math.max(n ? 8 : 2, n / maxDia * 100) + '%"></span><span class="dia-n">' + (n || '') + '</span><span class="dia-l">' + key.slice(8) + '</span></div>';
    }).join('');
    var filas = Object.keys(r.porTipo).sort(function (a, b) { return r.porTipo[b].hechos - r.porTipo[a].hechos; }).map(function (t) {
      var p = r.porTipo[t];
      var pc = p.total ? Math.round(p.aciertos / p.total * 100) : 0;
      return '<tr><td>' + esc(tituloTipo(t)) + '</td><td class="n">' + p.hechos + '</td><td class="n"><span class="pc ' + (pc >= 70 ? 'alto' : pc >= 50 ? 'medio' : 'bajo') + '">' + pc + '%</span></td><td class="n">' + fmtDia(diaLocal(p.ultimo)) + '</td></tr>';
    }).join('');
    var recientes = r.recientes.map(function (x) {
      var pc = x.total ? Math.round(x.aciertos / x.total * 100) : 0;
      var t = x.accion === 'examen_entregado' ? '📝 Simulacro de examen' + (x.nota !== null && x.nota !== undefined ? ' · ' + MP.fmt(x.nota, 1) + '/10' : '') : tituloTipo(x.tipo);
      return '<li><span>' + esc(t) + '</span><span class="rec-d">' + fmtDia(diaLocal(x.ts)) + ' · ' + MP.fmt(x.aciertos, 1) + '/' + x.total + ' (' + pc + '%)</span></li>';
    }).join('');

    $app.innerHTML =
      '<section class="intro intro-epd"><p class="antetitulo">Mi espacio</p><h1>' + (cuenta.nombre ? esc(cuenta.nombre) : 'Tu progreso') + '</h1></section>' +
      '<div class="tarjeta-codigo"><div><span class="tc-l">Tu código</span><span class="tc-c">' + esc(cuenta.codigo) + '</span></div>' +
      '<button type="button" class="btn-mini" id="mCopiar">📋 Copiar</button></div>' +
      '<p class="recordatorio">Guárdalo: lo necesitas para entrar desde otro dispositivo o navegador.</p>' +
      '<section class="pronostico"><div class="pr-num">' + (pron === null ? '—' : Math.round(pron * 100) + '%') + '</div>' +
      '<div class="pr-txt"><h2>Pronóstico para el examen</h2>' +
      (pron === null ? '<p>Aún no hay datos. Termina algún ejercicio o un simulacro y aquí verás tu pronóstico.</p>'
        : '<p>Equivale a un <b>' + MP.fmt(pron * 10, 1) + '</b> sobre 10. Es el porcentaje de apartados que has acertado <b>a la primera</b> en tus tres últimos días de uso (' + r.pronDias.map(fmtDia).join(', ') + '): ' + MP.fmt(r.pronAciertos, 1) + ' de ' + r.pronTotal + '.</p><p class="pr-aviso">Es orientativo: mide cómo te salen los ejercicios ahora, no garantiza la nota.</p>') +
      '</div></section>' +
      '<section class="kpis">' +
      '<div class="kpi"><b>' + r.dias + '</b><span>días de uso</span></div>' +
      '<div class="kpi"><b>' + fmtTiempo(r.segundos) + '</b><span>tiempo de práctica</span></div>' +
      '<div class="kpi"><b>' + r.ejercicios + '</b><span>ejercicios terminados</span></div>' +
      '<div class="kpi"><b>' + r.examenes + '</b><span>simulacros</span></div>' +
      '<div class="kpi"><b>' + (r.total ? Math.round(r.aciertos / r.total * 100) + '%' : '—') + '</b><span>acierto global</span></div>' +
      '</section>' +
      '<section class="bloque-esp"><h2>Actividad de las dos últimas semanas</h2><div class="dias">' + barras + '</div></section>' +
      '<section class="bloque-esp"><h2>Por tipo de ejercicio</h2>' +
      (filas ? '<div class="tabla-scroll"><table class="tabla t-esp"><thead><tr><th>Tipo</th><th>Hechos</th><th>Acierto</th><th>Último</th></tr></thead><tbody>' + filas + '</tbody></table></div>'
        : '<p class="vacio">Todavía no has terminado ningún ejercicio. <a href="#/">Empieza por una EPD</a>.</p>') + '</section>' +
      (recientes ? '<section class="bloque-esp"><h2>Últimos ejercicios</h2><ul class="recientes">' + recientes + '</ul></section>' : '') +
      '<div class="esp-pie"><button type="button" class="btn" id="mSalir">Cerrar sesión</button>' +
      (EP ? '' : '<span class="modo-local">Modo local: tu progreso se guarda solo en este dispositivo.</span>') + '</div>';
    document.getElementById('mCopiar').onclick = function () { copiar(cuenta.codigo, this); };
    document.getElementById('mSalir').onclick = function () {
      if (!confirm('¿Cerrar sesión? Para volver a entrar necesitarás tu código ' + cuenta.codigo + '.')) return;
      salir(); ctx.ir('#/acceso');
    };
    if (!yaSincronizado) {
      log('ver_espacio', {});
      sincronizar().then(function (cambio) { if (cambio && location.hash.indexOf('#/espacio') === 0) vistaEspacio(ctx, true); });
    }
  }

  // Al cargar la app con sesión abierta
  function iniciar() {
    if (!cuenta) return;
    log('acceso', { detalle: { modo: 'sesion_guardada' } });
    enviar(false);
  }

  MP.Cuenta = {
    actual: function () { return cuenta; }, registrar: registrar, entrar: entrar, salir: salir,
    log: log, anotar: anotar, resumen: resumen, progTipo: progTipo, sincronizar: sincronizar, iniciar: iniciar,
    vistaAcceso: vistaAcceso, vistaEspacio: vistaEspacio, endpoint: function () { return EP; }
  };
})();
