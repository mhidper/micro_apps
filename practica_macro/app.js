/* Práctica EPD · Macroeconomía — interfaz
   Rutas (hash): #/  ·  #/epd1  ·  #/epd1/<tipologia>/<codigo>  */
(function () {
  'use strict';
  var $app = document.getElementById('app');
  var $atras = document.getElementById('btnAtras');
  var $ayudas = document.getElementById('ayudas');
  var esc = MP.esc;

  /* ---------- Preferencias y progreso (solo en este navegador) ---------- */
  var CLAVE = 'mh_practica_macro_v1';
  function leerEstado() {
    try { return JSON.parse(localStorage.getItem(CLAVE)) || {}; } catch (e) { return {}; }
  }
  function guardarEstado(s) { try { localStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* sin almacenamiento */ } }
  var estado = leerEstado();
  estado.prog = estado.prog || {};
  if (estado.ayudas === false) $ayudas.checked = false;
  $ayudas.addEventListener('change', function () {
    estado.ayudas = $ayudas.checked; guardarEstado(estado);
    document.body.classList.toggle('sin-ayudas', !$ayudas.checked);
  });
  document.body.classList.toggle('sin-ayudas', !$ayudas.checked);

  function prog(id) { return estado.prog[id] || { hechos: 0, limpios: 0 }; }
  function sumarProgreso(id, limpio) {
    var p = prog(id); p.hechos++; if (limpio) p.limpios++;
    estado.prog[id] = p; guardarEstado(estado);
  }

  /* ---------- Router ---------- */
  function ruta() {
    var h = (location.hash || '#/').replace(/^#\/?/, '');
    return h.split('/').filter(Boolean);
  }
  function ir(h) { if (location.hash !== h) location.hash = h; else render(); }
  window.addEventListener('hashchange', render);
  $atras.addEventListener('click', function () {
    var r = ruta();
    if (r.length >= 2 && r[0] !== 'examen') ir('#/' + r[0]); else ir('#/');
  });

  function render() {
    var r = ruta();
    window.scrollTo(0, 0);
    if (!r.length) return vistaInicio();
    if (r[0] === 'examen' && MP.Examen) {
      $atras.hidden = false;
      var sx = r[1] ? MP.textoASemilla(r[1]) : null;
      if (sx === null) { history.replaceState(null, '', '#/examen/' + MP.semillaATexto(MP.nuevaSemilla())); return render(); }
      return MP.Examen.vista({ app: $app, ir: ir, contarExamen: function () { estado.examenes = (estado.examenes || 0) + 1; guardarEstado(estado); } }, sx);
    }
    var epd = MP.EPDS.filter(function (e) { return e.id === r[0]; })[0];
    if (!epd) return ir('#/');
    if (r.length === 1) return vistaEPD(epd);
    var tipo = MP.TIPOS[r[1]];
    if (!tipo || tipo.epd !== epd.id) return ir('#/' + epd.id);
    var seed = r[2] ? MP.textoASemilla(r[2]) : null;
    if (seed === null) { history.replaceState(null, '', '#/' + epd.id + '/' + tipo.id + '/' + MP.semillaATexto(MP.nuevaSemilla())); return render(); }
    vistaEjercicio(epd, tipo, seed);
  }

  /* ---------- Vistas ---------- */
  function vistaInicio() {
    $atras.hidden = true;
    document.title = 'Práctica EPD · Macroeconomía UPO';
    var total = 0;
    Object.keys(estado.prog).forEach(function (k) { total += estado.prog[k].hechos || 0; });
    var h = '<section class="intro">' +
      '<p class="antetitulo">Enseñanzas Prácticas y de Desarrollo</p>' +
      '<h1>Practica sin límite</h1>' +
      '<p class="lede">Cada ejercicio se genera con datos nuevos, con el mismo planteamiento que los problemas de clase. Comprueba cada apartado, pide una pista si te atascas y repasa la solución paso a paso.</p>' +
      (total ? '<p class="contador">Llevas <b>' + total + '</b> ejercicio' + (total === 1 ? '' : 's') + ' terminado' + (total === 1 ? '' : 's') + ' en este dispositivo.</p>' : '') +
      '</section><section class="rejilla-epd">';
    MP.EPDS.forEach(function (e) {
      var hechos = e.tipos.reduce(function (a, t) { return a + prog(t.id).hechos; }, 0);
      var tocados = e.tipos.filter(function (t) { return prog(t.id).hechos > 0; }).length;
      h += '<a class="tarjeta-epd" href="#/' + e.id + '">' +
        '<span class="epd-num">EPD ' + e.num + '</span>' +
        '<h2>' + esc(e.titulo) + '</h2>' +
        '<p class="epd-ses">' + esc(e.sesiones) + ' · ' + e.tipos.length + ' tipos de ejercicio</p>' +
        '<p>' + esc(e.resumen) + '</p>' +
        '<div class="barra-prog" aria-label="' + tocados + ' de ' + e.tipos.length + ' tipos practicados"><span style="width:' + (tocados / e.tipos.length * 100) + '%"></span></div>' +
        '<p class="epd-pie">' + (hechos ? hechos + ' resueltos · ' + tocados + '/' + e.tipos.length + ' tipos practicados' : 'Empieza cuando quieras') + '<span class="flecha">→</span></p>' +
        '</a>';
    });
    if (MP.Examen) {
      var nx = estado.examenes || 0;
      h += '<a class="tarjeta-epd tarjeta-examen" href="#/examen">' +
        '<span class="epd-num">Simulacro de examen</span>' +
        '<h2>Genera un examen tipo</h2>' +
        '<p>Tres ejercicios al azar con el formato del examen: dos del modelo IS-LM con su gráfico y uno de PIB, dinero, bancos o deuda. Respondes todo, entregas y ves la nota y las soluciones. Cada vez que lo pidas, un examen distinto.</p>' +
        '<p class="epd-pie">' + (nx ? nx + ' simulacro' + (nx === 1 ? '' : 's') + ' corregido' + (nx === 1 ? '' : 's') : 'Formato del examen de la semana del 9 de noviembre') + '<span class="flecha">→</span></p>' +
        '</a>';
    }
    h += '</section>' +
      '<section class="como"><h2>Cómo funciona</h2><ol>' +
      '<li><b>Elige un tipo de ejercicio.</b> Los datos cambian cada vez, el razonamiento es el de clase.</li>' +
      '<li><b>Responde apartado a apartado.</b> Usa coma para los decimales y escribe los porcentajes como se indique.</li>' +
      '<li><b>Si fallas</b>, el sistema reconoce los errores típicos y te lo dice. Con las ayudas activadas puedes pedir una pista o ver la solución del apartado.</li>' +
      '<li><b>Desactiva las ayudas</b> (arriba a la derecha) cuando quieras practicar en condiciones de examen.</li></ol></section>';
    $app.innerHTML = h;
  }

  function vistaEPD(e) {
    $atras.hidden = false;
    document.title = 'EPD ' + e.num + ' · ' + e.titulo + ' · Práctica Macro';
    var h = '<section class="intro intro-epd"><p class="antetitulo">EPD ' + e.num + ' · ' + esc(e.sesiones) + '</p><h1>' + esc(e.titulo) + '</h1><p class="lede">' + esc(e.resumen) + '</p></section><section class="lista-tipos">';
    e.tipos.forEach(function (t) {
      var p = prog(t.id);
      h += '<a class="tarjeta-tipo" href="#/' + e.id + '/' + t.id + '">' +
        '<span class="tipo-ico" aria-hidden="true">' + t.icono + '</span>' +
        '<span class="tipo-cuerpo"><span class="tipo-ses">' + esc(t.sesion) + '</span><h2>' + esc(t.titulo) + '</h2><p>' + esc(t.resumen) + '</p>' +
        (p.hechos ? '<span class="tipo-prog">✓ ' + p.hechos + ' resuelto' + (p.hechos === 1 ? '' : 's') + (p.limpios ? ' · ' + p.limpios + ' sin ayuda' : '') + '</span>' : '') +
        '</span><span class="flecha" aria-hidden="true">→</span></a>';
    });
    h += '</section>';
    $app.innerHTML = h;
  }

  function vistaEjercicio(epd, tipo, seed) {
    $atras.hidden = false;
    var ej;
    try { ej = MP.generar(tipo, seed); }
    catch (err) {
      $app.innerHTML = '<p class="aviso">No se ha podido generar este ejercicio. <a href="#/' + epd.id + '/' + tipo.id + '">Prueba con otro</a>.</p>';
      return;
    }
    var codigo = MP.semillaATexto(seed);
    document.title = tipo.titulo + ' · Práctica Macro';
    var preguntas = ej.preguntas.filter(function (q) { return q.tipo !== 'sep'; });
    var st = {}; // estado por apartado: {ok, fallos, ayuda}
    preguntas.forEach(function (q) { st[q.id] = { ok: false, fallos: 0, ayuda: false }; });
    var terminado = false;

    var h = '<nav class="miga"><a href="#/' + epd.id + '">EPD ' + epd.num + '</a> <span>›</span> ' + esc(tipo.sesion) + '</nav>' +
      '<div class="cab-ej"><h1>' + tipo.icono + ' ' + esc(tipo.titulo) + '</h1>' +
      '<div class="cod"><span>Ejercicio <b>#' + codigo + '</b></span><button type="button" class="btn-mini" id="btnCopiar" title="Copiar enlace a este ejercicio">🔗 Copiar enlace</button></div></div>' +
      '<div class="acciones">' +
      '<button type="button" class="btn btn-prim" id="btnNuevo">↻ Otro ejercicio</button>' +
      (ej.grafico ? '<button type="button" class="btn" id="btnGraf" aria-expanded="false">📈 Ver gráfico</button>' : '') +
      '<button type="button" class="btn" id="btnSol">Ver solución completa</button>' +
      '</div>' +
      '<article class="enunciado">' + ej.enunciado + '</article>' +
      (ej.grafico ? '<section class="panel-graf" id="panelGraf" hidden><h2>' + esc(ej.grafico.titulo) + '</h2><div class="graf-cont" id="grafCont"></div>' + (ej.grafico.nota ? '<p class="graf-nota">' + ej.grafico.nota + '</p>' : '') + '</section>' : '') +
      '<div class="marcador" id="marcador" aria-live="polite"></div>' +
      '<ol class="preguntas">';
    var letra = 0;
    ej.preguntas.forEach(function (q) {
      if (q.tipo === 'sep') { h += '<li class="sep">' + q.html + '</li>'; return; }
      var L = String.fromCharCode(97 + letra++);
      h += '<li class="preg" id="p-' + q.id + '" data-id="' + q.id + '"><div class="preg-cab"><span class="letra">' + L + ')</span><div class="preg-txt">' + q.texto + '</div></div>';
      if (q.tipo === 'opc') {
        h += '<fieldset class="opciones"><legend class="sr">Opciones del apartado ' + L + '</legend>' + q.opciones.map(function (o, k) {
          return '<label class="opcion"><input type="radio" name="o-' + q.id + '" value="' + k + '"><span>' + o + '</span></label>';
        }).join('') + '</fieldset>';
        h += '<div class="fila-resp"><button type="button" class="btn btn-comp" data-acc="comp">Comprobar</button>';
      } else {
        var u = q.unidad === '%' ? '%' : q.unidad === 'pp' ? 'pp' : q.unidad === '€' ? '€' : q.unidad === 'x' ? 'x' : '';
        h += '<div class="fila-resp"><span class="campo"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Respuesta del apartado ' + L + '" placeholder="Tu respuesta">' + (u ? '<span class="unidad">' + u + '</span>' : '') + '</span>' +
          '<button type="button" class="btn btn-comp" data-acc="comp">Comprobar</button>';
      }
      h += '<button type="button" class="btn-txt ayuda" data-acc="pista" hidden>💡 Pista</button>' +
        '<button type="button" class="btn-txt ayuda" data-acc="ver" hidden>Ver solución</button></div>' +
        '<div class="fb" role="status" aria-live="polite"></div>' +
        '<div class="pista" hidden>' + (q.pista || '') + '</div>' +
        '<div class="sol" hidden><p class="sol-tit">Solución</p>' + (q.explica || '') + '</div></li>';
    });
    h += '</ol><div id="fin" class="fin" hidden></div>';
    $app.innerHTML = h;
    $app.focus({ preventScroll: true });

    // Botones generales
    document.getElementById('btnNuevo').onclick = function () { ir('#/' + epd.id + '/' + tipo.id + '/' + MP.semillaATexto(MP.nuevaSemilla())); };
    document.getElementById('btnCopiar').onclick = function () {
      var url = location.href;
      var b = this;
      function hecho() { b.textContent = '✓ Copiado'; setTimeout(function () { b.textContent = '🔗 Copiar enlace'; }, 1800); }
      try { navigator.clipboard.writeText(url).then(hecho, function () { prompt('Copia este enlace:', url); }); }
      catch (e) { prompt('Copia este enlace:', url); }
    };
    if (ej.grafico) {
      var bg = document.getElementById('btnGraf'), pg = document.getElementById('panelGraf'), dibujado = false;
      bg.onclick = function () {
        var abrir = pg.hidden;
        if (abrir && !dibujado) { document.getElementById('grafCont').innerHTML = ej.grafico.render(); dibujado = true; }
        pg.hidden = !abrir;
        bg.setAttribute('aria-expanded', String(abrir));
        bg.textContent = abrir ? '📈 Ocultar gráfico' : '📈 Ver gráfico';
        if (abrir) pg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      };
    }
    document.getElementById('btnSol').onclick = function () {
      preguntas.forEach(function (q) { revelar(q, false); });
      if (ej.grafico && document.getElementById('panelGraf').hidden) document.getElementById('btnGraf').click();
      comprobarFin();
    };

    // Apartados
    preguntas.forEach(function (q) {
      var li = document.getElementById('p-' + q.id);
      var inp = li.querySelector('input[type=text]');
      if (inp) inp.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); corregir(q); } });
      li.addEventListener('click', function (ev) {
        var acc = ev.target.getAttribute('data-acc');
        if (acc === 'comp') corregir(q);
        else if (acc === 'pista') { li.querySelector('.pista').hidden = false; st[q.id].ayuda = true; ev.target.hidden = true; }
        else if (acc === 'ver') revelar(q, true);
      });
    });
    actualizarMarcador();

    function valorDe(q) {
      var li = document.getElementById('p-' + q.id);
      if (q.tipo === 'opc') { var s = li.querySelector('input[type=radio]:checked'); return s ? s.value : ''; }
      return li.querySelector('input[type=text]').value;
    }
    function corregir(q) {
      if (st[q.id].ok) return;
      var li = document.getElementById('p-' + q.id), fb = li.querySelector('.fb');
      var res = MP.comprobar(q, valorDe(q));
      li.classList.remove('bien', 'mal', 'casi');
      if (res.estado === 'vacio') { fb.textContent = res.msg; return; }
      if (res.estado === 'ok') {
        st[q.id].ok = true;
        li.classList.add('bien');
        fb.innerHTML = '<b>✓ Correcto.</b> ' + (res.msg || '');
        bloquear(li);
        li.querySelector('.sol').hidden = false;
        li.querySelector('.sol').classList.add('plegada');
        anadirPlegado(li);
      } else {
        st[q.id].fallos++;
        li.classList.add(res.estado === 'casi' ? 'casi' : 'mal');
        fb.innerHTML = (res.estado === 'casi' ? '<b>≈ Casi.</b> ' : '<b>✗</b> ') + res.msg;
        if (q.pista) li.querySelector('[data-acc=pista]').hidden = li.querySelector('.pista').hidden === false;
        if (st[q.id].fallos >= 2) li.querySelector('[data-acc=ver]').hidden = false;
      }
      actualizarMarcador();
      comprobarFin();
    }
    function bloquear(li) {
      li.querySelectorAll('input').forEach(function (x) { x.disabled = true; });
      li.querySelectorAll('[data-acc]').forEach(function (x) { x.hidden = true; });
    }
    function anadirPlegado(li) {
      if (li.querySelector('.ver-pasos')) return;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn-txt ver-pasos'; b.textContent = 'Ver los pasos';
      b.onclick = function () { var s = li.querySelector('.sol'); s.classList.toggle('plegada'); b.textContent = s.classList.contains('plegada') ? 'Ver los pasos' : 'Ocultar los pasos'; };
      li.querySelector('.fb').appendChild(b);
    }
    function revelar(q, desdeBoton) {
      var li = document.getElementById('p-' + q.id);
      if (!st[q.id].ok) {
        st[q.id].ayuda = true; st[q.id].revelado = true;
        li.classList.remove('mal', 'casi'); li.classList.add('revelada');
        var fb = li.querySelector('.fb');
        var solTxt = q.tipo === 'opc' ? q.opciones[q.correcta] : MP.fmt(q.sol, q.dec === undefined ? 2 : q.dec) + (q.unidad === '%' ? '%' : q.unidad === 'pp' ? ' pp' : q.unidad === '€' ? ' €' : q.unidad === 'x' ? 'x' : '');
        fb.innerHTML = '<b>Respuesta:</b> ' + solTxt;
        if (q.tipo === 'opc') { var r = li.querySelectorAll('input[type=radio]')[q.correcta]; if (r) r.checked = true; }
        bloquear(li);
      }
      var s = li.querySelector('.sol'); s.hidden = false; s.classList.remove('plegada');
      var vp = li.querySelector('.ver-pasos'); if (vp) vp.textContent = 'Ocultar los pasos';
      if (desdeBoton) { actualizarMarcador(); comprobarFin(); }
    }
    function actualizarMarcador() {
      var bien = 0, rev = 0;
      preguntas.forEach(function (q) { if (st[q.id].ok) bien++; else if (st[q.id].revelado) rev++; });
      var n = preguntas.length;
      document.getElementById('marcador').innerHTML =
        '<div class="marc-barra"><span class="m-bien" style="width:' + (bien / n * 100) + '%"></span><span class="m-rev" style="width:' + (rev / n * 100) + '%"></span></div>' +
        '<span>' + bien + ' de ' + n + ' apartados resueltos' + (rev ? ' · ' + rev + ' vistos' : '') + '</span>';
    }
    function comprobarFin() {
      if (terminado) return;
      var todos = preguntas.every(function (q) { return st[q.id].ok || st[q.id].revelado; });
      if (!todos) return;
      terminado = true;
      var resueltos = preguntas.filter(function (q) { return st[q.id].ok; }).length;
      var limpio = preguntas.every(function (q) { return st[q.id].ok && !st[q.id].ayuda && st[q.id].fallos === 0; });
      if (resueltos > 0) sumarProgreso(tipo.id, limpio);
      var fin = document.getElementById('fin');
      var msg = limpio ? '<h2>🎯 Perfecto</h2><p>Todos los apartados a la primera y sin ayudas.</p>'
        : resueltos === preguntas.length ? '<h2>✓ Ejercicio resuelto</h2><p>Has llegado a todas las respuestas. Prueba otro para afianzarlo' + ($ayudas.checked ? ', o desactiva las ayudas para ponerte a prueba.' : '.') + '</p>'
        : '<h2>Ejercicio revisado</h2><p>Has resuelto ' + resueltos + ' de ' + preguntas.length + ' apartados. Repasa los pasos de los que se te resistieron e inténtalo con datos nuevos.</p>';
      fin.innerHTML = msg + '<button type="button" class="btn btn-prim" id="btnNuevo2">↻ Otro ejercicio de este tipo</button>';
      fin.hidden = false;
      document.getElementById('btnNuevo2').onclick = function () { document.getElementById('btnNuevo').click(); };
    }
  }

  render();
})();
