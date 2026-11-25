/* EPD 5 · Bloque IV-V · Curva de Phillips, NAIRU y modelo IS-LM-PC (Sesiones 12–13) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL;

  MP.registrarEPD({
    id: 'epd5', num: 5,
    titulo: 'Curva de Phillips, NAIRU e IS-LM-PC',
    sesiones: 'Sesiones 12–13',
    resumen: 'Expectativas ancladas y adaptativas, la NAIRU, la curva PC en términos de producción y el tipo de interés neutral.'
  });

  function num(id, texto, sol, o) {
    var q = { id: id, tipo: 'num', texto: texto, sol: sol, dec: 2, unidad: '' };
    for (var k in o) q[k] = o[k];
    return q;
  }
  function opc(R, id, texto, correcta, incorrectas, o) {
    var todas = [{ t: correcta, ok: true }].concat(incorrectas.map(function (t) { return { t: t.t || t, ok: false, msg: t.msg }; }));
    var b = R.barajar(todas);
    var q = { id: id, tipo: 'opc', texto: texto, opciones: b.map(function (x) { return x.t; }), correcta: 0, erroresOpc: {} };
    b.forEach(function (x, i) { if (x.ok) q.correcta = i; else if (x.msg) q.erroresOpc[i] = x.msg; });
    for (var k in o) q[k] = o[k];
    return q;
  }
  function sep(html) { return { tipo: 'sep', html: html }; }
  function e0(x) { return fmt(x, 0); }
  function e1(x) { return fmt(x, 1); }
  function e2(x) { return fmt(x, 2); }
  function e4(x) { return fmt(x, 4); }
  function p(x) { return fmt(x, 2) + '%'; }      // x ya en puntos porcentuales
  function pu(x) { return fmt(x * 100, 2) + '%'; } // x en tanto por uno

  /* =====================================================================
     12 · De WS-PS a la curva de Phillips: expectativas y NAIRU
     ===================================================================== */
  MP.registrar('epd5', {
    id: 'phillips-nairu', icono: '🌀', sesion: 'S12',
    titulo: 'Curva de Phillips, expectativas y NAIRU',
    resumen: 'Tasa natural desde WS-PS, shock de márgenes y la diferencia entre expectativas ancladas (θ = 0) y adaptativas (θ = 1).',
    generar: function (R) {
      var alpha = R.elegir([1.5, 2, 2.5]);
      var m0 = R.elegir([0.20, 0.25, 0.30]);
      var z = R.paso(0.95, 1.10, 0.01);
      var wp0 = 1 / (1 + m0);
      var un = (z - wp0) / alpha;
      if (un < 0.04 || un > 0.15) return null;
      var dm = R.elegir([0.05, 0.10]);
      var m1 = m0 + dm, wp1 = 1 / (1 + m1), un1 = (z - wp1) / alpha;
      var pib = 0.02;
      var d = R.elegir([0.01, 0.015, 0.02]);        // u_t = u_n − d
      var ut = un - d;
      var dpi = alpha * d;                           // −α(u_t − u_n) = α·d
      var piA1 = pib + dpi, piA2 = piA1;
      var piB1 = pib + dpi, piB2 = piB1 + dpi, piB3 = piB2 + dpi;

      var enun = '<p>Considere una economía cuyo mercado de trabajo y formación de precios responden a:</p>' +
        '<div class="datos">' +
        'Ecuación de salarios (WS): <b>W / P<sup>e</sup> = ' + e2(z) + ' − ' + e1(alpha) + '·u</b><br>' +
        'Ecuación de precios (PS): <b>P = (1 + m)·W</b> &nbsp;con margen inicial <b>m = ' + e2(m0) + '</b><br>' +
        'Curva de Phillips: <b>π<sub>t</sub> = π<sub>t</sub><sup>e</sup> − ' + e1(alpha) + '·(u<sub>t</sub> − u<sub>n</sub>)</b>' +
        '</div>' +
        '<p>Escriba las tasas en porcentaje (por ejemplo, 8,5 para un 8,5%).</p>';

      var preg = [
        num('a', 'Salario real fijado por las empresas (W/P), con 4 decimales.', wp0, {
          dec: 4,
          errores: [{ v: 1 + m0, msg: 'Eso es 1 + m. El salario real es su inverso: W/P = 1/(1 + m).' }],
          pista: 'Despeje W/P en P = (1 + m)·W.',
          explica: eq(fr('W', 'P') + ' = ' + fr('1', '1 + m') + ' = ' + fr('1', e2(1 + m0)) + ' ≈ <b>' + e4(wp0) + '</b>')
        }),
        num('b', 'Tasa natural de desempleo (u<sub>n</sub>), en %.', un * 100, {
          unidad: '%',
          pista: 'En el medio plazo P = P^e: iguale WS y PS y despeje u.',
          explica: eq(e2(z) + ' − ' + e1(alpha) + '·u<sub>n</sub> = ' + e4(wp0) + ' &nbsp;⟹&nbsp; u<sub>n</sub> = ' + fr(e2(z) + ' − ' + e4(wp0), e1(alpha)) + ' ≈ <b>' + pu(un) + '</b>')
        }),
        sep('<p>La falta de competencia eleva el margen empresarial hasta <b>m\' = ' + e2(m1) + '</b>.</p>'),
        num('c', 'Nueva tasa natural de desempleo (u<sub>n</sub>\'), en %.', un1 * 100, {
          unidad: '%',
          errores: [{ v: un * 100, msg: 'Un mayor margen sí cambia la tasa natural: baja la PS y hay que volver a igualarla con la WS.' }],
          pista: 'Calcule el nuevo W/P = 1/(1 + m\') y vuelva a igualarlo con WS.',
          explica: '<p>Nuevo salario real: W/P = 1/' + e2(1 + m1) + ' ≈ ' + e4(wp1) + '.</p>' +
            eq(e2(z) + ' − ' + e1(alpha) + '·u<sub>n</sub>\' = ' + e4(wp1) + ' &nbsp;⟹&nbsp; <b>u<sub>n</sub>\' ≈ ' + pu(un1) + '</b>') +
            '<p>Las empresas se quedan con una parte mayor del producto; para que los trabajadores acepten ese menor salario real, el paro de equilibrio tiene que subir.</p>'
        }),
        sep('<p>Vuelva a los parámetros iniciales (u<sub>n</sub> = ' + pu(un) + '). Un plan de estímulo sitúa el desempleo en <b>u<sub>t</sub> = ' + pu(ut) + '</b> todos los años. En el año 0 la inflación es π<sub>0</sub> = 2%. ' +
          '<b>Régimen A</b> (expectativas ancladas, θ = 0): π<sup>e</sup><sub>t</sub> = π̄ = 2%. <b>Régimen B</b> (adaptativas, θ = 1): π<sup>e</sup><sub>t</sub> = π<sub>t−1</sub>.</p>'),
        num('d', 'Régimen A: inflación del año 1 (π<sub>1</sub>), en %.', piA1 * 100, {
          unidad: '%',
          errores: [{ v: (pib - dpi) * 100, msg: 'Revise el signo: con u<sub>t</sub> < u<sub>n</sub>, el término −α(u<sub>t</sub> − u<sub>n</sub>) es positivo.' }],
          pista: 'π₁ = 2% − α·(u_t − u_n).',
          explica: eq('π<sub>1</sub> = 2% − ' + e1(alpha) + '·(' + pu(ut) + ' − ' + pu(un) + ') = 2% + ' + pu(dpi) + ' = <b>' + pu(piA1) + '</b>')
        }),
        num('e', 'Régimen A: inflación del año 2 (π<sub>2</sub>), en %.', piA2 * 100, {
          unidad: '%',
          errores: [{ v: piB2 * 100, msg: 'Ese resultado corresponde a expectativas adaptativas. Con θ = 0 la expectativa sigue en el 2%.' }],
          pista: 'Con expectativas ancladas, la expectativa del año 2 vuelve a ser el 2%, no la inflación del año 1.',
          explica: eq('π<sub>2</sub> = π̄ − α(u<sub>t</sub> − u<sub>n</sub>) = 2% + ' + pu(dpi) + ' = <b>' + pu(piA2) + '</b>') +
            '<p>La inflación es más alta que el objetivo, pero estable: no se acelera de un año a otro.</p>'
        }),
        num('f', 'Régimen B: inflación del año 2 (π<sub>2</sub>), en %.', piB2 * 100, {
          unidad: '%',
          errores: [{ v: piA2 * 100, msg: 'Con θ = 1 la expectativa del año 2 es la inflación del año 1, no el 2%.' }],
          pista: 'π₁ es igual que en el régimen A. Después, π₂ = π₁ − α(u_t − u_n).',
          explica: eq('π<sub>1</sub> = 2% + ' + pu(dpi) + ' = ' + pu(piB1) + ' &nbsp;⟹&nbsp; π<sub>2</sub> = ' + pu(piB1) + ' + ' + pu(dpi) + ' = <b>' + pu(piB2) + '</b>')
        }),
        num('g', 'Régimen B: inflación del año 3 (π<sub>3</sub>), en %.', piB3 * 100, {
          unidad: '%',
          pista: 'Cada año la inflación sube α·(u_n − u_t) puntos.',
          explica: eq('π<sub>3</sub> = π<sub>2</sub> + ' + pu(dpi) + ' = ' + pu(piB2) + ' + ' + pu(dpi) + ' = <b>' + pu(piB3) + '</b>') +
            '<p>Con expectativas adaptativas, mantener el paro por debajo de la tasa natural acelera la inflación año tras año.</p>'
        }),
        opc(R, 'h', '¿Qué representa la tasa natural de desempleo cuando las expectativas son adaptativas (θ = 1)?',
          'La NAIRU: el único nivel de desempleo con el que la inflación no varía (π<sub>t</sub> = π<sub>t−1</sub>).',
          [
            { t: 'El nivel de desempleo con el que la inflación es exactamente el 2%.', msg: 'Con θ = 1, u = u<sub>n</sub> mantiene la inflación constante, pero en el nivel que tuviera, que puede ser distinto del 2%.' },
            { t: 'El desempleo mínimo que puede alcanzar una economía.', msg: 'El paro puede situarse por debajo de u<sub>n</sub>; lo que ocurre entonces es que la inflación se acelera.' },
            { t: 'El desempleo que elige el banco central para fijar el tipo de interés.', msg: 'u<sub>n</sub> sale del mercado de trabajo (WS-PS), no de una decisión del banco central.' }
          ],
          {
            pista: 'Fíjese en qué pasa con π<sub>t</sub> − π<sub>t−1</sub> cuando u<sub>t</sub> = u<sub>n</sub>.',
            explica: '<p>Con θ = 1 la curva de Phillips se escribe π<sub>t</sub> − π<sub>t−1</sub> = −α(u<sub>t</sub> − u<sub>n</sub>). Si u<sub>t</sub> = u<sub>n</sub>, la inflación no cambia: de ahí el nombre <i>Non-Accelerating Inflation Rate of Unemployment</i>.</p>'
          })
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Senda de la inflación según el régimen de expectativas',
          nota: 'Con el paro por debajo de la tasa natural, la inflación se estabiliza con expectativas ancladas y se acelera con expectativas adaptativas.',
          render: function () {
            var yA = [2, piA1 * 100, piA2 * 100, piA2 * 100], yB = [2, piB1 * 100, piB2 * 100, piB3 * 100];
            return MP.grafico({
              titulo: 'Inflación por años',
              x: [0, 3.3], y: [0, Math.ceil(piB3 * 100 + 1)],
              ticksX: [0, 1, 2, 3],
              xlab: 'Año', ylab: 'Inflación π (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[0, 2], [3.3, 2]], color: C.soft, w: 1.4, dash: '4 4', etiqueta: 'Objetivo 2%' },
                { pts: yA.map(function (v, i) { return [i, v]; }), color: C.teal, w: 2.6, etiqueta: 'A · ancladas' },
                { pts: yB.map(function (v, i) { return [i, v]; }), color: C.crimson, w: 2.6, etiqueta: 'B · adaptativas' }
              ],
              puntos: yB.map(function (v, i) { return { x: i, y: v, color: C.crimson, guias: false }; })
                .concat(yA.slice(1).map(function (v, i) { return { x: i + 1, y: v, color: C.teal, guias: false }; }))
            });
          }
        }
      };
    }
  });

  /* =====================================================================
     13 · Modelo IS-LM-PC y tipo de interés neutral
     ===================================================================== */
  MP.registrar('epd5', {
    id: 'islm-pc-neutral', icono: '🌡️', sesion: 'S13',
    titulo: 'Modelo IS-LM-PC y tipo neutral',
    resumen: 'Curva IS con tipos en tanto por uno, brecha de producción, dinámica de la inflación, tipo neutral rₙ y efecto de un shock fiscal.',
    generar: function (R) {
      var L = 1000;
      var un = R.elegir([0.08, 0.09, 0.10, 0.11, 0.12]);
      var Yn = L * (1 - un);
      var c1 = R.elegir([0.5, 0.6]), d1 = 0.1, k = 1 / (1 - c1 - d1);
      var b = R.elegir([1000, 1500]);
      var x = R.elegir([0.01, 0.02]);
      var T = R.paso(150, 250, 50), G = R.paso(150, 300, 25);
      var d0 = R.paso(100, 200, 50), c0 = R.paso(50, 250, 10);
      var A = c0 - c1 * T + d0 - b * x + G;
      var a = k * A, s = k * b;
      var rn = (a - Yn) / s;
      if (rn < 0.005 || rn > 0.05) return null;
      var alpha = R.elegir([1, 2]), phi = alpha / L;
      var gapR = R.elegir([0.005, 0.01, 0.015]);
      var r0 = rn - gapR;
      if (r0 < 0) return null;
      var Y0 = a - s * r0, gap = Y0 - Yn, dpi = phi * gap;
      var pi1 = 0.02 + dpi, pi2 = pi1 + dpi;
      var I0 = d0 + d1 * Y0 - b * (r0 + x), In = d0 + d1 * Yn - b * (rn + x);
      var dG = R.elegir([10, 20, 25]);
      var rn2 = (a + k * dG - Yn) / s;
      if (In <= 0 || I0 <= 0) return null;

      var enun = '<p>Economía cerrada con población activa <b>L = ' + e0(L) + '</b>, función de producción Y = N y tasa natural de desempleo <b>u<sub>n</sub> = ' + pu(un) + '</b>.</p>' +
        '<div class="datos">' +
        'Consumo: <b>C = ' + e0(c0) + ' + ' + e1(c1) + '·(Y − T)</b>, con T = ' + e0(T) + '<br>' +
        'Inversión: <b>I = ' + e0(d0) + ' + ' + e1(d1) + '·Y − ' + e0(b) + '·(r + x)</b>, con prima de riesgo x = ' + fmt(x, 2) + '<br>' +
        'Gasto público: <b>G = ' + e0(G) + '</b> &nbsp;·&nbsp; LM: el banco central fija <b>r</b><br>' +
        'Curva PC (θ = 1): <b>π<sub>t</sub> − π<sub>t−1</sub> = ' + fmt(phi, 3) + '·(Y<sub>t</sub> − Y<sub>n</sub>)</b>' +
        '</div>' +
        '<p>En la IS y en la PC, r, x y π van en <b>tanto por uno</b> (2% = 0,02). En las respuestas, escriba los tipos y la inflación en %.</p>';

      var preg = [
        num('a', 'PIB potencial (Y<sub>n</sub>).', Yn, {
          dec: 1, pista: 'Y_n = L·(1 − u_n).',
          explica: eq('Y<sub>n</sub> = ' + e0(L) + '·(1 − ' + fmt(un, 2) + ') = <b>' + e1(Yn) + '</b>')
        }),
        num('b', 'Curva IS, Y = a − s·r: valor de la ordenada <b>a</b>.', a, {
          dec: 1,
          errores: [{ v: A, msg: 'Ese es el gasto autónomo. Falta multiplicarlo por el multiplicador 1/(1 − c₁ − d₁).' }],
          pista: 'Sustituya C, I y G en Y = C + I + G, agrupe términos en Y y divida por (1 − c₁ − d₁).',
          explica: eq('Y = ' + e0(c0) + ' + ' + e1(c1) + '(Y − ' + e0(T) + ') + ' + e0(d0) + ' + ' + e1(d1) + 'Y − ' + e0(b) + '(r + ' + fmt(x, 2) + ') + ' + e0(G)) +
            eq('(1 − ' + e1(c1) + ' − ' + e1(d1) + ')·Y = ' + e1(A) + ' − ' + e0(b) + '·r &nbsp;⟹&nbsp; Y = ' + fmt(k, 4) + '·' + e1(A) + ' − ' + fmt(k, 4) + '·' + e0(b) + '·r') +
            eq('IS: Y = <b>' + e1(a) + '</b> − ' + e1(s) + '·r')
        }),
        num('c', 'Curva IS: pendiente <b>s</b> (cuánto cae Y por cada unidad de r en tanto por uno).', s, {
          dec: 1,
          errores: [{ v: b, msg: 'Ese es el coeficiente de r en la inversión. Hay que multiplicarlo por el multiplicador.' }],
          pista: 's = b/(1 − c₁ − d₁).',
          explica: eq('s = ' + fr(e0(b), '1 − ' + e1(c1) + ' − ' + e1(d1)) + ' = <b>' + e1(s) + '</b>')
        }),
        sep('<p>El banco central fija el tipo real en <b>r = ' + pu(r0) + '</b>. En el año 0 la inflación era π<sub>0</sub> = 2%.</p>'),
        num('d', 'Brecha de producción (Y − Y<sub>n</sub>).', gap, {
          dec: 1,
          pista: 'Calcule Y con la IS y réstele Y_n.',
          explica: eq('Y = ' + e1(a) + ' − ' + e1(s) + '·' + fmt(r0, 3) + ' = ' + e1(Y0) + ' &nbsp;⟹&nbsp; Y − Y<sub>n</sub> = ' + e1(Y0) + ' − ' + e1(Yn) + ' = <b>' + e1(gap) + '</b>') +
            '<p>Brecha positiva: la economía está sobrecalentada.</p>'
        }),
        num('e', 'Inflación del año 2 (π<sub>2</sub>) si el banco central mantiene ese tipo, en %.', pi2 * 100, {
          unidad: '%',
          errores: [{ v: pi1 * 100, msg: 'Eso es π₁. Con θ = 1 la inflación vuelve a subir en el año 2.' }],
          pista: 'Δπ = ' + fmt(phi, 3) + '·(Y − Y_n) cada año, partiendo de π₀ = 2%.',
          explica: eq('Δπ = ' + fmt(phi, 3) + '·' + e1(gap) + ' = ' + fmt(dpi, 4) + ' (' + pu(dpi) + ')') +
            eq('π<sub>1</sub> = 2% + ' + pu(dpi) + ' = ' + pu(pi1) + ' &nbsp;⟹&nbsp; π<sub>2</sub> = <b>' + pu(pi2) + '</b>')
        }),
        num('f', 'Tipo de interés neutral (r<sub>n</sub>), en %.', rn * 100, {
          unidad: '%',
          pista: 'Es el tipo real que hace Y = Y_n en la IS.',
          explica: eq(e1(Yn) + ' = ' + e1(a) + ' − ' + e1(s) + '·r<sub>n</sub> &nbsp;⟹&nbsp; r<sub>n</sub> = ' + fr(e1(a - Yn), e1(s)) + ' = ' + fmt(rn, 4) + ' = <b>' + pu(rn) + '</b>') +
            '<p>Con r = r<sub>n</sub> la brecha es cero y Δπ = 0: la inflación deja de moverse.</p>'
        }),
        num('g', 'Cambio en la inversión (ΔI) cuando el banco central pasa de r = ' + pu(r0) + ' a r<sub>n</sub> y la producción vuelve a Y<sub>n</sub>.', In - I0, {
          dec: 1,
          pista: 'ΔI = d₁·ΔY − b·Δr. Ambos efectos van en el mismo sentido.',
          explica: eq('ΔI = ' + e1(d1) + '·(' + e1(Yn) + ' − ' + e1(Y0) + ') − ' + e0(b) + '·(' + fmt(rn, 4) + ' − ' + fmt(r0, 4) + ') = <b>' + e1(In - I0) + '</b>') +
            '<p>El ajuste contractivo recae sobre la inversión (y, por la menor renta, sobre el consumo): es el efecto expulsión del tipo más alto.</p>'
        }),
        sep('<p>Partiendo del equilibrio de medio plazo, el Gobierno aumenta el gasto público en <b>ΔG = +' + e0(dG) + '</b>.</p>'),
        num('h', 'Nuevo tipo neutral (r<sub>n</sub>\'), en %.', rn2 * 100, {
          unidad: '%',
          errores: [{ v: rn * 100, msg: 'El aumento de G desplaza la IS a la derecha, así que el tipo neutral cambia.' }],
          pista: 'La ordenada de la IS sube en k·ΔG. Vuelva a imponer Y = Y_n.',
          explica: eq('IS\': Y = ' + e1(a + k * dG) + ' − ' + e1(s) + '·r') +
            eq(e1(Yn) + ' = ' + e1(a + k * dG) + ' − ' + e1(s) + '·r<sub>n</sub>\' &nbsp;⟹&nbsp; r<sub>n</sub>\' = <b>' + pu(rn2) + '</b>') +
            '<p>Un mayor gasto público permanente exige tipos más altos a medio plazo para que la demanda no supere el potencial.</p>'
        })
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Modelo IS-LM-PC en dos paneles',
          nota: 'Panel superior: IS y LM (tipo real). Panel inferior: curva PC. El banco central lleva r hasta rₙ para cerrar la brecha.',
          render: function () {
            var yLo = Yn - 2.2 * Math.abs(gap) - 20, yHi = Yn + 2.2 * Math.abs(gap) + 20;
            var rr = [Math.max(0, Math.min(r0, rn2) * 100 - 1.5), Math.max(rn, rn2) * 100 + 1.5];
            function rIS(Y, aa) { return (aa - Y) / s * 100; }
            var g1 = MP.grafico({
              titulo: 'IS-LM', w: 520, h: 300,
              x: [yLo, yHi], y: rr, xlab: 'Producción Y', ylab: 'Tipo real r (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[yLo, rIS(yLo, a)], [yHi, rIS(yHi, a)]], color: C.cobalt, etiqueta: 'IS' },
                { pts: [[yLo, rIS(yLo, a + k * dG)], [yHi, rIS(yHi, a + k * dG)]], color: C.gold, dash: '5 4', etiqueta: 'IS\' (ΔG)' },
                { pts: [[yLo, r0 * 100], [yHi, r0 * 100]], color: C.slate, etiqueta: 'LM (r = ' + pu(r0) + ')', etqEn: 'inicio' },
                { pts: [[yLo, rn * 100], [yHi, rn * 100]], color: C.crimson, dash: '5 4', etiqueta: 'LM\' (rₙ)', etqEn: 'inicio' }
              ],
              puntos: [
                { x: Y0, y: r0 * 100, color: C.navy, etiqueta: 'A' },
                { x: Yn, y: rn * 100, color: C.crimson, etiqueta: 'A\'' },
                { x: Yn, y: rn2 * 100, color: C.gold, etiqueta: 'A\'\'' }
              ]
            });
            var dLo = phi * (yLo - Yn) * 100, dHi = phi * (yHi - Yn) * 100;
            var g2 = MP.grafico({
              titulo: 'Curva PC', w: 520, h: 260,
              x: [yLo, yHi], y: [dLo, dHi], xlab: 'Producción Y', ylab: 'Δπ (pp)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[yLo, 0], [yHi, 0]], color: C.soft, w: 1.2 },
                { pts: [[yLo, dLo], [yHi, dHi]], color: C.crimson, etiqueta: 'PC' }
              ],
              puntos: [
                { x: Y0, y: dpi * 100, color: C.navy, etiqueta: 'A: Δπ = +' + fmt(dpi * 100, 2) + ' pp' },
                { x: Yn, y: 0, color: C.crimson, etiqueta: 'A\': Δπ = 0', marcaX: 'Yₙ' }
              ]
            });
            return g1 + g2;
          }
        }
      };
    }
  });
})();
