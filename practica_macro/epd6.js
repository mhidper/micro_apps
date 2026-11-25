/* EPD 6 · Bloque V · Perturbaciones y política monetaria en el modelo IS-LM-PC (Sesión 14) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL;

  MP.registrarEPD({
    id: 'epd6', num: 6,
    titulo: 'Perturbaciones y política monetaria en el IS-LM-PC',
    sesiones: 'Sesión 14',
    resumen: 'Consolidación fiscal y crowding-in, shock petrolero y estanflación, y cuánto debe mover los tipos el banco central según el anclaje de las expectativas.'
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
  function pu(x) { return fmt(x * 100, 2) + '%'; } // x en tanto por uno
  function ppu(x) { return fmt(x * 100, 2) + ' pp'; }
  function t4(x) { return fmt(x, 4); }

  /* =====================================================================
     14a · Consolidación fiscal: corto plazo, tipo neutral y crowding-in
     ===================================================================== */
  MP.registrar('epd6', {
    id: 'consolidacion-fiscal', icono: '✂️', sesion: 'S14',
    titulo: 'Consolidación fiscal y crowding-in',
    resumen: 'Un recorte del gasto público reduce la producción a corto plazo; a medio plazo baja el tipo neutral y la inversión ocupa el hueco.',
    generar: function (R) {
      var L = 1000;
      var un = R.elegir([0.08, 0.09, 0.10, 0.11, 0.12]), Yn = L * (1 - un);
      var c1 = R.elegir([0.5, 0.6]), d1 = 0.1, k = 1 / (1 - c1 - d1);
      var b = R.elegir([1000, 1500]), x = R.elegir([0.01, 0.02]);
      var T = R.paso(150, 250, 50), G = R.paso(200, 300, 25);
      var d0 = R.paso(100, 200, 50), c0 = R.paso(50, 250, 10);
      var A = c0 - c1 * T + d0 - b * x + G, a = k * A, s = k * b;
      var rn = (a - Yn) / s;
      if (rn < 0.01 || rn > 0.05) return null;
      var dG = -R.elegir([10, 15, 20, 25]);
      var phi = R.elegir([1, 2]) / L;
      var Y1 = Yn + k * dG, gap1 = Y1 - Yn, dpi1 = phi * gap1;
      var rn2 = (a + k * dG - Yn) / s;
      if (rn2 < 0.002) return null;
      var dIcp = d1 * gap1, dImp = -dG;

      var enun = '<p>Economía cerrada con L = ' + e0(L) + ', Y = N y u<sub>n</sub> = ' + pu(un) + '. El banco central está fuera del límite inferior cero.</p>' +
        '<div class="datos">' +
        'C = ' + e0(c0) + ' + ' + e1(c1) + '·(Y − T), con T = ' + e0(T) + '<br>' +
        'I = ' + e0(d0) + ' + ' + e1(d1) + '·Y − ' + e0(b) + '·(r + x), con x = ' + fmt(x, 2) + '<br>' +
        'G = ' + e0(G) + '<br>' +
        'Curva PC (θ = 1): π<sub>t</sub> − π<sub>t−1</sub> = ' + fmt(phi, 3) + '·(Y<sub>t</sub> − Y<sub>n</sub>)' +
        '</div>' +
        '<p>r, x y π en <b>tanto por uno</b> dentro de las ecuaciones; responda los tipos en % salvo que se indique otra unidad. La economía parte de su medio plazo (Y = Y<sub>n</sub>, r = r<sub>n</sub>).</p>';

      var preg = [
        num('a', 'Tipo neutral inicial (r<sub>n</sub>), en %.', rn * 100, {
          unidad: '%',
          pista: 'Obtenga la IS (Y = a − s·r) e imponga Y = Y_n = ' + e0(Yn) + '.',
          explica: eq('IS: Y = ' + e1(a) + ' − ' + e1(s) + '·r') +
            eq(e0(Yn) + ' = ' + e1(a) + ' − ' + e1(s) + '·r<sub>n</sub> &nbsp;⟹&nbsp; r<sub>n</sub> = ' + fr(e1(a - Yn), e1(s)) + ' = <b>' + pu(rn) + '</b>')
        }),
        sep('<p>El Gobierno recorta el gasto público en <b>ΔG = ' + e0(dG) + '</b> (los impuestos no cambian). En el año 1 el banco central aún no ha movido el tipo.</p>'),
        num('b', 'Producción a corto plazo (Y<sub>1</sub>) con r = r<sub>n</sub>.', Y1, {
          dec: 1,
          errores: [{ v: Yn + dG, msg: 'Falta el multiplicador: la producción cae k·ΔG, no solo ΔG.' }],
          pista: 'Con r fijo, ΔY = ΔG/(1 − c₁ − d₁).',
          explica: eq('ΔY = ' + fr(e0(dG), '1 − ' + e1(c1) + ' − ' + e1(d1)) + ' = ' + e1(k * dG) + ' &nbsp;⟹&nbsp; Y<sub>1</sub> = ' + e0(Yn) + ' ' + e1(k * dG) + ' = <b>' + e1(Y1) + '</b>')
        }),
        num('c', 'Variación de la inflación en el año 1 (Δπ), en puntos porcentuales.', dpi1 * 100, {
          unidad: 'pp',
          pista: 'Δπ = φ·(Y₁ − Y_n).',
          explica: eq('Δπ = ' + fmt(phi, 3) + '·(' + e1(gap1) + ') = ' + t4(dpi1) + ' = <b>' + ppu(dpi1) + '</b>') +
            '<p>Brecha negativa: presión a la baja sobre la inflación.</p>'
        }),
        num('d', 'Cambio de la inversión a corto plazo (ΔI), con r todavía fijo.', dIcp, {
          dec: 1,
          errores: [{ v: dImp, msg: 'Eso es el efecto a medio plazo. A corto plazo r no ha bajado y la inversión cae con las ventas.' }],
          pista: 'Con r constante solo actúa el término d₁·Y.',
          explica: eq('ΔI = ' + e1(d1) + '·ΔY = ' + e1(d1) + '·(' + e1(gap1) + ') = <b>' + e1(dIcp) + '</b>') +
            '<p>A corto plazo la austeridad también reduce la inversión: caen las ventas y el coste del crédito sigue igual.</p>'
        }),
        sep('<p>El banco central reacciona y lleva el tipo real hasta el nuevo neutral para devolver la producción al potencial.</p>'),
        num('e', 'Nuevo tipo neutral (r<sub>n</sub>\'), en %.', rn2 * 100, {
          unidad: '%',
          pista: 'La ordenada de la IS baja en k·|ΔG|. Imponga de nuevo Y = Y_n.',
          explica: eq('IS\': Y = ' + e1(a + k * dG) + ' − ' + e1(s) + '·r') +
            eq('r<sub>n</sub>\' = ' + fr(e1(a + k * dG - Yn), e1(s)) + ' = <b>' + pu(rn2) + '</b>')
        }),
        num('f', 'Variación del tipo real a medio plazo, en puntos básicos (pb).', (rn2 - rn) * 10000, {
          dec: 0, tol: 1,
          pista: '1 punto porcentual = 100 pb.',
          explica: eq('Δr = ' + pu(rn2) + ' − ' + pu(rn) + ' = <b>' + e0((rn2 - rn) * 10000) + ' pb</b>')
        }),
        num('g', 'Cambio de la inversión a medio plazo (ΔI), con Y = Y<sub>n</sub> y r = r<sub>n</sub>\'.', dImp, {
          dec: 1,
          errores: [{ v: dIcp, msg: 'Ese es el efecto a corto plazo. A medio plazo Y vuelve a Y_n y r baja.' }],
          pista: 'A medio plazo Y = Y_n y C no cambia. Mire la identidad Y_n = C + I + G.',
          explica: eq('ΔI = −' + e0(b) + '·(r<sub>n</sub>\' − r<sub>n</sub>) = −' + e0(b) + '·(' + t4(rn2 - rn) + ') = <b>+' + e1(dImp) + '</b>') +
            '<p>Coincide con −ΔG: con Y y C iguales que al principio, la inversión ocupa exactamente el hueco que deja el gasto público (<i>crowding-in</i>).</p>'
        }),
        opc(R, 'h', '¿Qué ocurriría si el banco central no pudiera bajar el tipo (límite inferior cero)?',
          'La producción quedaría por debajo del potencial más tiempo y la inversión no se recuperaría: el multiplicador de la austeridad sería mayor.',
          [
            { t: 'Nada distinto: la inversión sube igualmente porque el sector público pide menos préstamos.', msg: 'En el modelo, la inversión solo sube si baja r. Sin ese canal, el recorte se traduce en menos producción.' },
            { t: 'La inflación subiría porque hay menos gasto público.', msg: 'Con brecha negativa la inflación baja, no sube.' },
            { t: 'El PIB potencial caería en la misma cuantía que el gasto.', msg: 'Y_n depende del mercado de trabajo (WS-PS), no del gasto público.' }
          ],
          {
            pista: 'El crowding-in funciona a través del tipo de interés.',
            explica: '<p>El paso de la caída de la producción a la recuperación depende de que el banco central baje r hasta r<sub>n</sub>\'. Sin margen monetario, el recorte del gasto reduce la producción durante más tiempo. Es la lección de la Eurozona en 2011-2013 (Blanchard y Leigh, FMI, 2013).</p>'
          })
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Consolidación fiscal en el IS-LM',
          nota: 'A: inicio. B: corto plazo con r fijo. C: medio plazo, con el tipo en el nuevo neutral.',
          render: function () {
            var yLo = Y1 - 40, yHi = Yn + 40;
            function rIS(Y, aa) { return (aa - Y) / s * 100; }
            return MP.grafico({
              titulo: 'IS-LM',
              x: [yLo, yHi], y: [Math.max(0, rn2 * 100 - 1.5), rn * 100 + 1.5],
              xlab: 'Producción Y', ylab: 'Tipo real r (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[yLo, rIS(yLo, a)], [yHi, rIS(yHi, a)]], color: C.cobalt, etiqueta: 'IS' },
                { pts: [[yLo, rIS(yLo, a + k * dG)], [yHi, rIS(yHi, a + k * dG)]], color: C.gold, dash: '5 4', etiqueta: 'IS\' (ΔG < 0)' },
                { pts: [[yLo, rn * 100], [yHi, rn * 100]], color: C.slate, etiqueta: 'LM (rₙ)', etqEn: 'inicio' },
                { pts: [[yLo, rn2 * 100], [yHi, rn2 * 100]], color: C.crimson, dash: '5 4', etiqueta: 'LM\' (rₙ\')', etqEn: 'inicio' }
              ],
              puntos: [
                { x: Yn, y: rn * 100, color: C.navy, etiqueta: 'A' },
                { x: Y1, y: rn * 100, color: C.gold, etiqueta: 'B' },
                { x: Yn, y: rn2 * 100, color: C.crimson, etiqueta: 'C', marcaX: 'Yₙ' }
              ]
            });
          }
        }
      };
    }
  });

  /* =====================================================================
     14b · Shock petrolero: estanflación y la trampa del tipo neutral
     ===================================================================== */
  var MARGENES = [[1 / 3, '1/3'], [0.30, '0,30'], [0.40, '0,40']];

  MP.registrar('epd6', {
    id: 'shock-petrolero', icono: '🛢️', sesion: 'S14',
    titulo: 'Shock petrolero y estanflación',
    resumen: 'Un shock de oferta reduce el PIB potencial, dispara la inflación y obliga a subir el tipo neutral. Con θ = 1, llegar al neutral no basta.',
    generar: function (R) {
      var L = 1000, m0 = 0.25, wp0 = 0.8;
      var z = R.paso(0.86, 0.95, 0.01);
      var un = z - wp0;
      var mm = R.elegir(MARGENES), m1 = mm[0], wp1 = 1 / (1 + m1), un1 = z - wp1;
      var Yn = L * (1 - un), Yn1 = L * (1 - un1);
      var s = R.elegir([2000, 2500]);
      var rn = R.elegir([0.02, 0.025, 0.03, 0.035, 0.04]);
      var a = Yn + s * rn;
      var phi = 0.001;
      var gap = Yn - Yn1, pi1 = 0.02 + phi * gap;
      var rn1 = (a - Yn1) / s;
      var Ydes = Yn1 - (pi1 - 0.02) / phi, rdes = (a - Ydes) / s;
      if (Ydes <= 0) return null;

      var enun = '<p><i>Contexto: en octubre de 2026 la inflación de la eurozona subió al 4,0%, con la energía aportando cerca de 2 puntos tras el encarecimiento del petróleo y el gas por el conflicto en Oriente Próximo (CaixaBank Research, 4/11/2026).</i></p>' +
        '<p>Economía con L = ' + e0(L) + ' y Y = N:</p>' +
        '<div class="datos">' +
        'WS: <b>W/P<sup>e</sup> = ' + e2(z) + ' − u</b><br>' +
        'PS: margen inicial <b>m<sub>0</sub> = 0,25</b> (W/P = 0,80)<br>' +
        'IS: <b>Y = ' + e0(a) + ' − ' + e0(s) + '·r</b><br>' +
        'PC (θ = 1): <b>π<sub>t</sub> = π<sub>t−1</sub> + 0,001·(Y<sub>t</sub> − Y<sub>n</sub>)</b>, con π<sub>0</sub> = 2%' +
        '</div>' +
        '<p>r y π en tanto por uno en las ecuaciones; responda en %.</p>';

      var preg = [
        num('a', 'Tasa natural de desempleo inicial (u<sub>n</sub>), en %.', un * 100, {
          unidad: '%',
          pista: 'WS = PS con P = P^e.',
          explica: eq(e2(z) + ' − u<sub>n</sub> = 0,80 &nbsp;⟹&nbsp; <b>u<sub>n</sub> = ' + pu(un) + '</b>')
        }),
        num('b', 'Tipo neutral inicial (r<sub>n</sub>), en %.', rn * 100, {
          unidad: '%',
          pista: 'Calcule Y_n = L(1 − u_n) e iguálelo a la IS.',
          explica: eq('Y<sub>n</sub> = ' + e0(L) + '·(1 − ' + fmt(un, 2) + ') = ' + e0(Yn)) +
            eq(e0(Yn) + ' = ' + e0(a) + ' − ' + e0(s) + '·r<sub>n</sub> &nbsp;⟹&nbsp; <b>r<sub>n</sub> = ' + pu(rn) + '</b>')
        }),
        sep('<p>El encarecimiento de la energía eleva el margen hasta <b>m<sub>1</sub> = ' + mm[1] + '</b>.</p>'),
        num('c', 'Nuevo PIB potencial (Y<sub>n</sub>\').', Yn1, {
          dec: 1,
          errores: [{ v: Yn, msg: 'El shock de oferta sí cambia el potencial: sube la tasa natural de paro.' }],
          pista: 'Nuevo W/P = 1/(1 + m₁). Iguale con WS para obtener u_n\' y después Y_n\' = L(1 − u_n\').',
          explica: eq('W/P = ' + fr('1', '1 + ' + mm[1]) + ' = ' + t4(wp1) + ' &nbsp;⟹&nbsp; u<sub>n</sub>\' = ' + e2(z) + ' − ' + t4(wp1) + ' = ' + pu(un1)) +
            eq('Y<sub>n</sub>\' = ' + e0(L) + '·(1 − ' + t4(un1) + ') = <b>' + e1(Yn1) + '</b>')
        }),
        num('d', 'Inflación del año 1 (π<sub>1</sub>) si el banco central mantiene r = r<sub>n</sub>, en %.', pi1 * 100, {
          unidad: '%',
          errores: [{ v: 2 - phi * gap * 100, msg: 'Revise el signo: la IS no se mueve, así que Y sigue en ' + e0(Yn) + ', por encima del nuevo potencial.' }],
          pista: 'La IS no cambia: con r = r_n, Y sigue siendo ' + e0(Yn) + '. Compárelo con Y_n\'.',
          explica: eq('Y − Y<sub>n</sub>\' = ' + e0(Yn) + ' − ' + e1(Yn1) + ' = ' + e1(gap) + ' &nbsp;⟹&nbsp; Δπ = 0,001·' + e1(gap) + ' = ' + ppu(phi * gap)) +
            eq('π<sub>1</sub> = 2% + ' + ppu(phi * gap) + ' = <b>' + pu(pi1) + '</b>')
        }),
        num('e', 'Nuevo tipo neutral (r<sub>n</sub>\'), en %.', rn1 * 100, {
          unidad: '%',
          pista: 'Iguale la IS (que no cambia) al nuevo potencial.',
          explica: eq(e1(Yn1) + ' = ' + e0(a) + ' − ' + e0(s) + '·r<sub>n</sub>\' &nbsp;⟹&nbsp; r<sub>n</sub>\' = <b>' + pu(rn1) + '</b> (+' + e0((rn1 - rn) * 10000) + ' pb)') +
            '<p>Con menos capacidad productiva, el banco central tiene que enfriar la demanda: el tipo neutral sube aunque la economía produzca menos.</p>'
        }),
        num('f', 'Si en el año 2 el banco central fija r = r<sub>n</sub>\', ¿cuál es π<sub>2</sub>? (en %)', pi1 * 100, {
          unidad: '%',
          errores: [{ v: 2, msg: 'Esa es la trampa del tipo neutral: con θ = 1, r = rₙ\' hace Δπ = 0, pero la inflación no vuelve sola al 2%.' }],
          pista: 'Con r = r_n\', la brecha es cero. ¿Qué dice la PC con θ = 1?',
          explica: eq('Y = Y<sub>n</sub>\' &nbsp;⟹&nbsp; Δπ = 0 &nbsp;⟹&nbsp; π<sub>2</sub> = π<sub>1</sub> = <b>' + pu(pi1) + '</b>') +
            '<p>La inflación deja de subir, pero se queda en el nivel alcanzado.</p>'
        }),
        num('g', 'Tipo real necesario en el año 2 para devolver la inflación al 2% en un solo año, en %.', rdes * 100, {
          unidad: '%',
          errores: [{ v: rn1 * 100, msg: 'Con el tipo neutral la inflación se estabiliza en ' + pu(pi1) + '. Para bajarla hace falta una brecha negativa.' }],
          pista: 'Necesita Δπ = 2% − π₁. Despeje la Y que lo consigue en la PC y luego el r en la IS.',
          explica: eq('0,001·(Y − ' + e1(Yn1) + ') = ' + t4(0.02 - pi1) + ' &nbsp;⟹&nbsp; Y = ' + e1(Ydes)) +
            eq(e1(Ydes) + ' = ' + e0(a) + ' − ' + e0(s) + '·r &nbsp;⟹&nbsp; <b>r = ' + pu(rdes) + '</b>') +
            '<p>' + e0((rdes - rn1) * 10000) + ' pb por encima del nuevo neutral, con una caída transitoria de la producción hasta ' + e1(Ydes) + '.</p>'
        }),
        opc(R, 'h', '¿Qué curvas se desplazan con un shock petrolero en el modelo IS-LM-PC?',
          'Baja la PS, sube u<sub>n</sub>, cae Y<sub>n</sub> y la PC se traslada a la izquierda. La IS no se mueve.',
          [
            { t: 'La IS se desplaza a la izquierda porque las familias gastan más en energía.', msg: 'Es un shock de oferta: en el modelo no cambia el gasto autónomo, así que la IS no se mueve.' },
            { t: 'La LM sube automáticamente porque el petróleo encarece el dinero.', msg: 'La LM es una decisión del banco central; no se mueve sola.' },
            { t: 'La WS se desplaza hacia arriba y el PIB potencial aumenta.', msg: 'El shock afecta al margen (PS) y reduce el potencial.' }
          ],
          {
            pista: 'Piense en qué ecuación entra el margen m.',
            explica: '<p>El shock eleva los costes no salariales, lo que equivale a un mayor margen m. La PS baja, sube la tasa natural de paro y cae el PIB potencial. La IS no cambia, de modo que con el tipo inicial la demanda supera al nuevo potencial y aparece la estanflación.</p>'
          })
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Shock petrolero en el IS-LM-PC',
          nota: 'A: inicio y corto plazo (la IS no se mueve). C: nuevo neutral, la inflación se congela. D: tipo necesario para devolver la inflación al 2% en un año.',
          render: function () {
            var yLo = Ydes - 30, yHi = Yn + 30;
            function rIS(Y) { return (a - Y) / s * 100; }
            var g1 = MP.grafico({
              titulo: 'IS-LM', w: 520, h: 300,
              x: [yLo, yHi], y: [Math.max(0, rn * 100 - 1.5), rdes * 100 + 1.5],
              xlab: 'Producción Y', ylab: 'Tipo real r (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[yLo, rIS(yLo)], [yHi, rIS(yHi)]], color: C.cobalt, etiqueta: 'IS (fija)' },
                { pts: [[yLo, rn * 100], [yHi, rn * 100]], color: C.slate, etiqueta: 'LM (rₙ)', etqEn: 'inicio' },
                { pts: [[yLo, rn1 * 100], [yHi, rn1 * 100]], color: C.crimson, dash: '5 4', etiqueta: 'LM\' (rₙ\')', etqEn: 'inicio' },
                { pts: [[yLo, rdes * 100], [yHi, rdes * 100]], color: C.indigo, dash: '2 4', etiqueta: 'LM\'\' (desinflación)' }
              ],
              puntos: [
                { x: Yn, y: rn * 100, color: C.navy, etiqueta: 'A' },
                { x: Yn1, y: rn1 * 100, color: C.crimson, etiqueta: 'C' },
                { x: Ydes, y: rdes * 100, color: C.indigo, etiqueta: 'D' }
              ]
            });
            var dLo = phi * (yLo - Yn1) * 100, dHi = phi * (yHi - Yn1) * 100;
            var g2 = MP.grafico({
              titulo: 'Curva PC', w: 520, h: 260,
              x: [yLo, yHi], y: [dLo, dHi], xlab: 'Producción Y', ylab: 'Δπ (pp)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[yLo, 0], [yHi, 0]], color: C.soft, w: 1.2 },
                { pts: [[yLo, phi * (yLo - Yn) * 100], [yHi, phi * (yHi - Yn) * 100]], color: C.slate, dash: '5 4', etiqueta: 'PC inicial' },
                { pts: [[yLo, dLo], [yHi, dHi]], color: C.crimson, etiqueta: 'PC\'' }
              ],
              puntos: [
                { x: Yn, y: phi * gap * 100, color: C.navy, etiqueta: 'A\'' },
                { x: Yn1, y: 0, color: C.crimson, etiqueta: 'C', marcaX: 'Yₙ\'' },
                { x: Ydes, y: (0.02 - pi1) * 100, color: C.indigo, etiqueta: 'D' }
              ]
            });
            return g1 + g2;
          }
        }
      };
    }
  });

  /* =====================================================================
     14c · Expectativas ancladas frente a adaptativas: la regla de tipos
     ===================================================================== */
  MP.registrar('epd6', {
    id: 'anclaje-politica', icono: '⚓', sesion: 'S14',
    titulo: 'Expectativas ancladas o adaptativas: ¿cuánto mover los tipos?',
    resumen: 'Con expectativas ancladas basta llevar r al nuevo neutral. Con expectativas adaptativas hay que sobrepasarlo durante un tiempo y aceptar una pérdida de producción.',
    generar: function (R) {
      var L = 1000;
      var un = R.elegir([0.08, 0.09, 0.10]), Yn = L * (1 - un);
      var du = R.elegir([0.015, 0.02, 0.025, 0.03]);
      var Yn1 = L * (1 - un - du);
      var s = R.elegir([2000, 2500]);
      var rn = R.elegir([0.01, 0.015, 0.02, 0.025]);
      var a = Yn + s * rn;
      var phi = R.elegir([0.001, 0.002]);
      var gap1 = Yn - Yn1, dpi = phi * gap1, pi1 = 0.02 + dpi;
      if (pi1 > 0.09) return null;
      var rn1 = (a - Yn1) / s;
      var Ych = Yn1 - dpi / phi, rch = (a - Ych) / s;
      var Ygr = Yn1 - dpi / (2 * phi), rgr = (a - Ygr) / s, pi2gr = pi1 - dpi / 2;
      var pi3fijo = pi1 + 2 * dpi;
      var perdida = dpi / phi;

      var enun = '<p><i>Contexto: en septiembre de 2026, Isabel Schnabel (BCE) explicó que, con expectativas firmemente ancladas, la inflación puede volver al objetivo de forma gradual, y que si empiezan a desanclarse «puede requerirse una respuesta más contundente».</i></p>' +
        '<div class="datos">' +
        'IS: <b>Y = ' + e0(a) + ' − ' + e0(s) + '·r</b> &nbsp;·&nbsp; Y<sub>n</sub> = ' + e0(Yn) + '<br>' +
        'Curva de Phillips: <b>π<sub>t</sub> = π<sub>t</sub><sup>e</sup> + ' + fmt(phi, 3) + '·(Y<sub>t</sub> − Y<sub>n</sub>)</b>, objetivo π̄ = 2%<br>' +
        'Régimen A (ancladas, θ = 0): π<sub>t</sub><sup>e</sup> = 2% &nbsp;·&nbsp; Régimen B (adaptativas, θ = 1): π<sub>t</sub><sup>e</sup> = π<sub>t−1</sub>' +
        '</div>' +
        '<p>En el año 0 la economía está en su medio plazo (π<sub>0</sub> = 2%). Al inicio del año 1, un shock energético eleva la tasa natural de paro en ' + fmt(du * 100, 1) + ' pp, de modo que el potencial cae a <b>Y<sub>n</sub>\' = ' + e0(Yn1) + '</b>. En el año 1 el banco central no reacciona y mantiene el tipo inicial.</p>' +
        '<p>r y π en tanto por uno en las ecuaciones; responda en %.</p>';

      var preg = [
        num('a', 'Tipo neutral inicial (r<sub>n</sub>), en %.', rn * 100, {
          unidad: '%',
          explica: eq(e0(Yn) + ' = ' + e0(a) + ' − ' + e0(s) + '·r<sub>n</sub> &nbsp;⟹&nbsp; <b>r<sub>n</sub> = ' + pu(rn) + '</b>')
        }),
        num('b', 'Nuevo tipo neutral (r<sub>n</sub>\'), en %.', rn1 * 100, {
          unidad: '%',
          explica: eq(e0(Yn1) + ' = ' + e0(a) + ' − ' + e0(s) + '·r<sub>n</sub>\' &nbsp;⟹&nbsp; <b>r<sub>n</sub>\' = ' + pu(rn1) + '</b>')
        }),
        num('c', 'Inflación del año 1 (π<sub>1</sub>), en %. (Es la misma en los dos regímenes.)', pi1 * 100, {
          unidad: '%',
          pista: 'Con r = r_n, Y sigue en ' + e0(Yn) + '. La brecha respecto al nuevo potencial es positiva.',
          explica: eq('π<sub>1</sub> = 2% + ' + fmt(phi, 3) + '·(' + e0(Yn) + ' − ' + e0(Yn1) + ') = 2% + ' + ppu(dpi) + ' = <b>' + pu(pi1) + '</b>') +
            '<p>En el año 1 ambos regímenes parten de expectativas del 2%. La diferencia aparece después.</p>'
        }),
        sep('<p><b>Régimen A · expectativas ancladas (θ = 0).</b></p>'),
        num('d', 'Si desde el año 2 el banco central fija r = r<sub>n</sub>\', ¿cuál es π<sub>2</sub>? (en %)', 2, {
          unidad: '%',
          errores: [{ v: pi1 * 100, msg: 'Con θ = 0 la expectativa vuelve al 2%: si la brecha es cero, la inflación también vuelve al 2%.' }],
          explica: eq('π<sub>2</sub> = 2% + ' + fmt(phi, 3) + '·(Y<sub>n</sub>\' − Y<sub>n</sub>\') = <b>2%</b>') +
            '<p>Basta con un único movimiento del tipo hasta el nuevo neutral (+' + e0((rn1 - rn) * 10000) + ' pb).</p>'
        }),
        num('e', 'Si, en cambio, mantuviera r = r<sub>n</sub> indefinidamente, ¿cuál sería π<sub>2</sub>? (en %)', pi1 * 100, {
          unidad: '%',
          errores: [{ v: (pi1 + dpi) * 100, msg: 'Eso pasaría con expectativas adaptativas. Con θ = 0 la inflación no se acelera.' }],
          explica: eq('π<sub>2</sub> = 2% + ' + ppu(dpi) + ' = <b>' + pu(pi1) + '</b>') +
            '<p>La inflación queda por encima del objetivo, pero estable.</p>'
        }),
        sep('<p><b>Régimen B · expectativas adaptativas (θ = 1).</b></p>'),
        num('f', 'Si desde el año 2 el banco central fija r = r<sub>n</sub>\', ¿cuál es π<sub>2</sub>? (en %)', pi1 * 100, {
          unidad: '%',
          errores: [{ v: 2, msg: 'Esa es la trampa: con θ = 1, el tipo neutral congela la inflación en el nivel heredado.' }],
          explica: eq('π<sub>2</sub> = π<sub>1</sub> + 0 = <b>' + pu(pi1) + '</b>') +
            '<p>La inflación ya no sube, pero tampoco baja: se queda instalada.</p>'
        }),
        num('g', 'Estrategia de choque: tipo real del año 2 que devuelve la inflación al 2% en un solo año, en %.', rch * 100, {
          unidad: '%',
          errores: [{ v: rn1 * 100, msg: 'Con el neutral la inflación no baja. Hace falta una brecha negativa.' }],
          pista: 'Necesita Δπ = −' + fmt(dpi * 100, 2) + ' pp. Despeje Y en la PC y después r en la IS.',
          explica: eq(fmt(phi, 3) + '·(Y − ' + e0(Yn1) + ') = −' + t4(dpi) + ' &nbsp;⟹&nbsp; Y<sub>2</sub> = ' + e1(Ych)) +
            eq(e1(Ych) + ' = ' + e0(a) + ' − ' + e0(s) + '·r &nbsp;⟹&nbsp; <b>r<sub>2</sub> = ' + pu(rch) + '</b>') +
            '<p>En el año 3 el banco central vuelve a r<sub>n</sub>\' = ' + pu(rn1) + '.</p>'
        }),
        num('h', 'Estrategia gradual: tipo real constante en los años 2 y 3 que reparte la desinflación a partes iguales, en %.', rgr * 100, {
          unidad: '%',
          errores: [{ v: rch * 100, msg: 'Ese es el tipo de la estrategia de choque. Aquí cada año solo hay que bajar la inflación la mitad.' }],
          pista: 'Cada año Δπ = −' + fmt(dpi * 50, 3) + ' pp.',
          explica: eq(fmt(phi, 3) + '·(Y − ' + e0(Yn1) + ') = −' + t4(dpi / 2) + ' &nbsp;⟹&nbsp; Y = ' + e1(Ygr) + ' &nbsp;⟹&nbsp; <b>r = ' + pu(rgr) + '</b>') +
            '<p>π<sub>2</sub> = ' + pu(pi2gr) + ' y π<sub>3</sub> = 2%. En el año 4 el tipo vuelve a r<sub>n</sub>\'.</p>'
        }),
        num('i', 'Si el banco central mantuviera r = r<sub>n</sub> indefinidamente, ¿cuál sería π<sub>3</sub>? (en %)', pi3fijo * 100, {
          unidad: '%',
          errores: [{ v: pi1 * 100, msg: 'Eso ocurriría con expectativas ancladas. Con θ = 1 la inflación sube cada año.' }],
          explica: eq('π<sub>3</sub> = π<sub>1</sub> + 2·' + ppu(dpi) + ' = <b>' + pu(pi3fijo) + '</b>') +
            '<p>Con expectativas adaptativas, no actuar acelera la inflación año tras año.</p>'
        }),
        num('j', 'Pérdida acumulada de producción respecto a Y<sub>n</sub>\' para devolver la inflación al 2% (es igual en las dos estrategias).', perdida, {
          dec: 1,
          pista: 'Sume las brechas negativas de cada año en cada estrategia.',
          explica: eq('Choque: ' + e1(Yn1 - Ych) + ' &nbsp;·&nbsp; Gradual: ' + e1(Yn1 - Ygr) + ' + ' + e1(Yn1 - Ygr) + ' = <b>' + e1(perdida) + '</b>') +
            '<p>Con una curva de Phillips lineal, el coste total de bajar la inflación no depende del ritmo; cambia su reparto en el tiempo. En el régimen A ese coste es cero.</p>'
        }),
        opc(R, 'k', '¿Qué conclusión de política monetaria se obtiene?',
          'Con expectativas ancladas basta con llevar r al nuevo neutral; con expectativas adaptativas hay que situar r por encima del neutral durante un tiempo y aceptar una pérdida de producción.',
          [
            { t: 'En los dos regímenes basta con llevar el tipo al nuevo neutral.', msg: 'Con θ = 1, el neutral congela la inflación en el nivel alcanzado.' },
            { t: 'Con expectativas ancladas hay que subir más los tipos, porque la inflación no se corrige sola.', msg: 'Es al revés: con expectativas ancladas la inflación vuelve al 2% en cuanto la brecha se cierra.' },
            { t: 'Ante un shock de oferta el banco central no debe mover los tipos, porque no puede producir petróleo.', msg: 'Si no se mueve, con θ = 0 la inflación queda por encima del objetivo y con θ = 1 se acelera.' }
          ],
          {
            explica: '<p>El anclaje de las expectativas reduce la intensidad de la respuesta necesaria. Por eso los bancos centrales vigilan tanto las expectativas de inflación tras un shock de oferta.</p>'
          })
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Senda de la inflación según régimen y estrategia',
          nota: 'Verde: ancladas, r = rₙ\'. Rojo: adaptativas, choque. Ámbar: adaptativas, gradual. Gris: adaptativas, solo r = rₙ\' (trampa).',
          render: function () {
            var A = [2, pi1, 0.02, 0.02, 0.02], Bc = [2, pi1, 0.02, 0.02, 0.02], Bg = [2, pi1, pi2gr, 0.02, 0.02], Bt = [2, pi1, pi1, pi1, pi1];
            function pts(v, dx) { return v.map(function (y, i) { return [i + (dx || 0), i ? y * 100 : 2]; }); }
            return MP.grafico({
              titulo: 'Inflación por años',
              x: [0, 4.3], y: [1, Math.ceil(pi1 * 100 + 1.5)], ticksX: [0, 1, 2, 3, 4],
              xlab: 'Año', ylab: 'Inflación π (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: [[0, 2], [4.3, 2]], color: C.soft, w: 1.2, dash: '4 4' },
                { pts: pts(Bt), color: C.slate, dash: '2 4', etiqueta: 'B · solo rₙ\'' },
                { pts: pts(Bg), color: C.gold, dash: '6 4', etiqueta: 'B · gradual', etqPt: [2, pi2gr * 100] },
                { pts: pts(Bc, 0.04), color: C.crimson, etiqueta: 'B · choque', etqPt: [2.4, 2.4] },
                { pts: pts(A), color: C.teal, etiqueta: 'A · ancladas', etqPt: [3.2, 1.6] }
              ]
            });
          }
        }
      };
    }
  });
})();
