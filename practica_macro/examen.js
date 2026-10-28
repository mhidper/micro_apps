/* Simulacro de examen: tres ejercicios generados al azar
   - Dos del bloque IS-LM (distintos entre sí), cada uno con un apartado gráfico
   - Uno de otra familia (PIB, dinero, bancos, deuda)
   - Versión corta de cada tipología: solo los apartados que se piden en examen
   - Se responde todo y se corrige al entregar */
(function () {
  'use strict';
  var esc = MP.esc;

  // Apartados que se conservan en la versión de examen y enunciado del gráfico
  var ISLM = {
    'multiplicador': { ids: ['c', 'e', 'f', 'g', 'h'], graf: 'Representa en la cruz keynesiana el equilibrio inicial y el nuevo equilibrio. Indica cómo se desplaza la demanda agregada y cuánto varía la producción.' },
    'curva-is': { ids: ['c', 'd', 'e', 'h', 'i'], graf: 'Representa en el plano (Y, i) la curva IS y la LM, con el equilibrio inicial y el final. Señala si hay desplazamiento de alguna curva o movimiento a lo largo de ella.' },
    'islm-inventarios': { ids: ['c', 'e', 'f', 'g', 'h'], graf: 'Representa en el plano IS-LM el equilibrio, el punto de producción Y₁ y la dirección del ajuste. Indica en qué región hay acumulación o desacumulación de existencias.' },
    'policy-mix': { ids: ['a', 'c', 'e', 'f', 'h'], graf: 'Representa en el plano IS-LM los tres equilibrios: el inicial (E₁), tras la medida fiscal (E′) y tras la respuesta del banco central (E₂).' },
    'islm-ampliado': { ids: ['b', 'c', 'e', 'h', 'k', 'n'], graf: 'Representa en el plano (Y, r) el efecto del aumento de la prima de riesgo y la respuesta que necesitaría el banco central. Si aparece el límite inferior cero, señálalo.' }
  };
  var OTROS = {
    'pib-tres-vias': { ids: ['b', 'c', 'd', 'f'] },
    'pib-real': { ids: ['c', 'e', 'f', 'g'] },
    'dinero-bonos': { ids: ['a', 'b', 'c', 'e', 'f'] },
    'multiplicador-monetario': { ids: ['a', 'b', 'f', 'g', 'h'] },
    'deuda': { ids: ['r', 'b', 'd', 'f', 'h'] },
    'apalancamiento': { ids: ['a', 'd', 'e', 'f', 'g'] }
  };

  // Recorta un ejercicio completo a su versión de examen
  function recortar(ej, conf) {
    var out = [], sepPendiente = null;
    ej.preguntas.forEach(function (q) {
      if (q.tipo === 'sep') { sepPendiente = q; return; }
      if (conf.ids.indexOf(q.id) < 0) return;
      if (sepPendiente) { out.push(sepPendiente); sepPendiente = null; }
      out.push(q);
    });
    if (conf.graf && ej.grafico) out.push({ id: 'graf', tipo: 'graf', texto: conf.graf });
    var copia = {};
    for (var k in ej) copia[k] = ej[k];
    copia.preguntas = out;
    return copia;
  }

  function generarExamen(seed) {
    var R = MP.crearRNG(seed);
    var islm = R.barajar(Object.keys(ISLM)).slice(0, 2);
    var otro = R.elegir(Object.keys(OTROS));
    var lista = [islm[0], islm[1], otro];
    // El ejercicio "diferente" va en tercer lugar; los dos IS-LM, en orden aleatorio
    return lista.map(function (id) {
      var tipo = MP.TIPOS[id];
      var sub = (R.int(0, 2147483646) ^ (seed >>> 1)) >>> 0;
      var ej = MP.generar(tipo, sub);
      return { tipo: tipo, ej: recortar(ej, ISLM[id] || OTROS[id]) };
    });
  }

  function fmtSol(q) {
    if (q.tipo === 'opc') return q.opciones[q.correcta];
    var u = q.unidad === '%' ? '%' : q.unidad === 'pp' ? ' pp' : q.unidad === '€' ? ' €' : q.unidad === 'x' ? 'x' : '';
    return MP.fmt(q.sol, q.dec === undefined ? 2 : q.dec) + u;
  }

  // Vista completa del examen. ctx: {app, ir, nuevaRuta(codigo)}
  function vista(ctx, seed) {
    var $app = ctx.app;
    var codigo = MP.semillaATexto(seed);
    var ejs;
    try { ejs = generarExamen(seed); }
    catch (e) { $app.innerHTML = '<p class="aviso">No se ha podido generar el examen. <a href="#/examen">Prueba con otro</a>.</p>'; return; }
    document.title = 'Simulacro de examen · Práctica Macro';
    var entregado = false;
    var t0 = Date.now(), reloj;
    var Cu = MP.Cuenta;
    if (Cu) Cu.log('examen_inicio', { epd: 'examen', tipo: 'examen', ejercicio: codigo, detalle: { ejercicios: ejs.map(function (x) { return x.tipo.id; }) } });

    var h = '<section class="intro intro-epd examen-cab">' +
      '<p class="antetitulo">Simulacro de examen</p>' +
      '<h1>Examen tipo de Macroeconomía</h1>' +
      '<p class="lede">Tres ejercicios con el formato del examen: dos sobre el modelo IS-LM, con su representación gráfica, y uno de otro bloque. Responde todos los apartados y pulsa <b>Entregar y corregir</b> al final. Haz los gráficos en papel y compáralos después con la solución.</p>' +
      '<div class="examen-meta"><span>Examen <b>#' + codigo + '</b></span><span class="reloj" id="reloj" aria-live="off">⏱ 00:00</span></div>' +
      '<div class="acciones"><button type="button" class="btn btn-prim" id="exNuevo">↻ Generar otro examen</button>' +
      '<button type="button" class="btn-mini" id="exCopiar">🔗 Copiar enlace</button></div>' +
      '<ol class="indice-ex">' + ejs.map(function (x, i) {
        return '<li><a href="#ej' + (i + 1) + '" data-ancla="ej' + (i + 1) + '"><b>Ejercicio ' + (i + 1) + '.</b> ' + esc(x.tipo.titulo) + '</a></li>';
      }).join('') + '</ol></section>';

    ejs.forEach(function (x, i) {
      var n = i + 1, letra = 0;
      h += '<section class="ej-examen" id="ej' + n + '">' +
        '<h2 class="ej-tit"><span class="ej-num">Ejercicio ' + n + '</span>' + x.tipo.icono + ' ' + esc(x.tipo.titulo) + '</h2>' +
        '<article class="enunciado">' + x.ej.enunciado + '</article><ol class="preguntas">';
      x.ej.preguntas.forEach(function (q) {
        if (q.tipo === 'sep') { h += '<li class="sep">' + q.html + '</li>'; return; }
        var L = String.fromCharCode(97 + letra++), pid = 'x' + n + '-' + q.id;
        h += '<li class="preg" id="' + pid + '"><div class="preg-cab"><span class="letra">' + L + ')</span><div class="preg-txt">' + (q.tipo === 'graf' ? '📈 ' : '') + q.texto + '</div></div>';
        if (q.tipo === 'graf') {
          h += '<p class="graf-aviso">Apartado gráfico: dibújalo en papel. Al corregir verás el gráfico de la solución.</p>' +
            '<div class="graf-sol" hidden><div class="graf-cont"></div>' + (x.ej.grafico.nota ? '<p class="graf-nota">' + x.ej.grafico.nota + '</p>' : '') + '</div>';
        } else if (q.tipo === 'opc') {
          h += '<fieldset class="opciones"><legend class="sr">Opciones del apartado ' + L + '</legend>' + q.opciones.map(function (o, k) {
            return '<label class="opcion"><input type="radio" name="o-' + pid + '" value="' + k + '"><span>' + o + '</span></label>';
          }).join('') + '</fieldset>';
        } else {
          var u = q.unidad === '%' ? '%' : q.unidad === 'pp' ? 'pp' : q.unidad === '€' ? '€' : q.unidad === 'x' ? 'x' : '';
          h += '<div class="fila-resp"><span class="campo"><input type="text" inputmode="decimal" autocomplete="off" spellcheck="false" aria-label="Respuesta del apartado ' + L + ' del ejercicio ' + n + '" placeholder="Tu respuesta">' + (u ? '<span class="unidad">' + u + '</span>' : '') + '</span></div>';
        }
        h += '<div class="fb" role="status"></div>' + (q.explica ? '<div class="sol" hidden><p class="sol-tit">Solución</p>' + q.explica + '</div>' : '') + '</li>';
      });
      h += '</ol></section>';
    });
    h += '<div class="entregar"><button type="button" class="btn btn-prim btn-grande" id="exEntregar">Entregar y corregir</button><p>Podrás ver la nota, la solución de cada apartado y los gráficos.</p></div>' +
      '<div id="exResultado" class="fin" hidden></div>';
    $app.innerHTML = h;

    function tic() {
      var s = Math.floor((Date.now() - t0) / 1000);
      var el = document.getElementById('reloj');
      if (!el) { clearInterval(reloj); return; }
      el.textContent = '⏱ ' + String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    }
    reloj = setInterval(tic, 1000);

    $app.querySelectorAll('[data-ancla]').forEach(function (a) {
      a.addEventListener('click', function (ev) {
        ev.preventDefault();
        var d = document.getElementById(a.getAttribute('data-ancla'));
        if (d) d.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    document.getElementById('exNuevo').onclick = function () {
      if (!entregado && haRespondido() && !confirm('¿Generar otro examen? Perderás las respuestas de este.')) return;
      ctx.ir('#/examen/' + MP.semillaATexto(MP.nuevaSemilla()));
    };
    document.getElementById('exCopiar').onclick = function () {
      var url = location.href, b = this;
      function hecho() { b.textContent = '✓ Copiado'; setTimeout(function () { b.textContent = '🔗 Copiar enlace'; }, 1800); }
      try { navigator.clipboard.writeText(url).then(hecho, function () { prompt('Copia este enlace:', url); }); }
      catch (e) { prompt('Copia este enlace:', url); }
    };
    document.getElementById('exEntregar').onclick = function () {
      if (!haRespondido() && !confirm('No has respondido ningún apartado. ¿Quieres ver igualmente la solución?')) return;
      corregir();
    };

    function haRespondido() {
      return Array.prototype.some.call($app.querySelectorAll('.preg input'), function (i) { return i.type === 'radio' ? i.checked : i.value.trim() !== ''; });
    }

    function corregir() {
      if (entregado) return;
      entregado = true;
      clearInterval(reloj);
      var notas = [];
      ejs.forEach(function (x, i) {
        var n = i + 1, puntos = 0, total = 0;
        x.ej.preguntas.forEach(function (q) {
          if (q.tipo === 'sep') return;
          var li = document.getElementById('x' + n + '-' + q.id);
          if (q.tipo === 'graf') {
            var gs = li.querySelector('.graf-sol');
            gs.querySelector('.graf-cont').innerHTML = x.ej.grafico.render();
            gs.hidden = false;
            li.querySelector('.graf-aviso').textContent = 'Compara tu gráfico con el de la solución (este apartado no puntúa en el simulacro).';
            li.classList.add('revelada');
            return;
          }
          total++;
          var val;
          if (q.tipo === 'opc') { var s = li.querySelector('input[type=radio]:checked'); val = s ? s.value : ''; }
          else val = li.querySelector('input[type=text]').value;
          var res = MP.comprobar(q, val);
          var fb = li.querySelector('.fb');
          if (res.estado === 'ok') { puntos += 1; li.classList.add('bien'); fb.innerHTML = '<b>✓ Correcto.</b> ' + (res.msg || ''); }
          else if (res.estado === 'casi') { puntos += 0.5; li.classList.add('casi'); fb.innerHTML = '<b>≈ Medio punto.</b> ' + res.msg + ' Solución: <b>' + fmtSol(q) + '</b>'; }
          else if (res.estado === 'vacio') { li.classList.add('revelada'); fb.innerHTML = '<b>Sin responder.</b> Solución: <b>' + fmtSol(q) + '</b>'; }
          else { li.classList.add('mal'); fb.innerHTML = '<b>✗</b> ' + res.msg + ' Solución: <b>' + fmtSol(q) + '</b>'; }
          if (q.tipo === 'opc') { var r = li.querySelectorAll('input[type=radio]')[q.correcta]; if (r && res.estado !== 'ok') r.parentNode.classList.add('opcion-correcta'); }
          var sol = li.querySelector('.sol'); if (sol) sol.hidden = false;
          li.querySelectorAll('input').forEach(function (e) { e.disabled = true; });
        });
        notas.push({ tipo: x.tipo, puntos: puntos, total: total, nota: total ? puntos / total * 10 / 3 : 0 });
      });
      var nota = notas.reduce(function (a, b) { return a + b.nota; }, 0);
      var t = Math.floor((Date.now() - t0) / 60000);
      var res = document.getElementById('exResultado');
      res.innerHTML = '<h2>Nota orientativa: ' + MP.fmt(nota, 1) + ' / 10</h2>' +
        '<ul class="desglose">' + notas.map(function (x, i) {
          return '<li><span>Ejercicio ' + (i + 1) + ' · ' + esc(x.tipo.titulo) + '</span><b>' + MP.fmt(x.puntos, 1) + ' de ' + x.total + ' apartados</b></li>';
        }).join('') + '</ul>' +
        '<p>Tiempo empleado: ' + t + ' min. Cada ejercicio vale lo mismo; los apartados gráficos no puntúan aquí, compáralos tú con la solución.</p>' +
        '<button type="button" class="btn btn-prim" id="exNuevo2">↻ Generar otro examen</button>';
      res.hidden = false;
      document.getElementById('exEntregar').parentNode.hidden = true;
      document.getElementById('exNuevo2').onclick = function () { ctx.ir('#/examen/' + MP.semillaATexto(MP.nuevaSemilla())); };
      res.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (Cu) {
        var pt = notas.reduce(function (a, b) { return a + b.puntos; }, 0), tt = notas.reduce(function (a, b) { return a + b.total; }, 0);
        Cu.anotar('examen_entregado', { epd: 'examen', tipo: 'examen', ejercicio: codigo, aciertos: pt, total: tt, nota: Math.round(nota * 100) / 100,
          segundos: Math.round((Date.now() - t0) / 1000), detalle: { ejercicios: notas.map(function (x) { return { tipo: x.tipo.id, puntos: x.puntos, total: x.total }; }) } });
      }
    }
  }

  MP.Examen = { generar: generarExamen, vista: vista, ISLM: ISLM, OTROS: OTROS };
})();
