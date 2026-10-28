/* EPD 1 · Bloque I · Bienes, multiplicador y relación IS (Sesiones 1–3) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL, R2 = MP.redondear;

  MP.registrarEPD({
    id: 'epd1', num: 1,
    titulo: 'Bienes, multiplicador y curva IS',
    sesiones: 'Sesiones 1–3',
    resumen: 'Medición del PIB, PIB nominal y real, el multiplicador keynesiano y la relación IS con inversión endógena.'
  });

  // Utilidades para preguntas
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
  function e0(x) { return fmt(x, 0); }
  function e2(x) { return fmt(x, 2); }

  /* =====================================================================
     1 · El PIB por las tres vías
     ===================================================================== */
  var CADENAS = [
    { n: 3, emp: ['Agrícola', 'Harinera', 'Panadería'], bien: ['trigo', 'harina', 'pan'] },
    { n: 3, emp: ['Minera', 'Siderúrgica', 'Fábrica de bicicletas'], bien: ['mineral de hierro', 'acero', 'bicicletas'] },
    { n: 3, emp: ['Algodonera', 'Hilandería', 'Taller textil'], bien: ['algodón', 'hilo', 'camisas'] },
    { n: 2, emp: ['Granja', 'Quesería'], bien: ['leche', 'queso'] },
    { n: 2, emp: ['Maderera', 'Carpintería'], bien: ['madera', 'muebles'] },
    { n: 2, emp: ['Olivarera', 'Almazara'], bien: ['aceituna', 'aceite'] }
  ];

  MP.registrar('epd1', {
    id: 'pib-tres-vias', icono: '🏭', sesion: 'S1',
    titulo: 'El PIB por las tres vías',
    resumen: 'Valor añadido, rentas y gasto final en una cadena de empresas. Evita la doble contabilización.',
    generar: function (R) {
      var cad = R.elegir(CADENAS), n = cad.n;
      var V = [], interm = [0], venta = [], W = [], B = [], VAB = [], F = [];
      V[0] = R.paso(80, 300, 10);
      for (var i = 0; i < n; i++) {
        if (i > 0) V[i] = interm[i] + R.paso(60, 280, 10);
        if (i < n - 1) {
          venta[i] = R2(V[i] * R.paso(0.5, 0.9, 0.05) / 10, 0) * 10;
          if (venta[i] >= V[i] || venta[i] < 10) return null;
          interm[i + 1] = venta[i];
          F[i] = V[i] - venta[i];
        } else { venta[i] = 0; F[i] = V[i]; }
        VAB[i] = V[i] - interm[i];
        W[i] = R2(VAB[i] * R.paso(0.4, 0.75, 0.05) / 5, 0) * 5;
        B[i] = VAB[i] - W[i];
        if (B[i] <= 0 || W[i] <= 0) return null;
      }
      var ocultaB = R.prob(0.5);
      var sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); };
      var PIB = sum(VAB), sumV = sum(V), sumW = sum(W), sumB = sum(B), sumF = sum(F), dup = sum(venta);

      var lis = cad.emp.map(function (nom, i) {
        var t = '<li><b>Empresa ' + (i + 1) + ' (' + nom + '):</b> produce ' + cad.bien[i] + ' por valor de ' + e0(V[i]) + ' €';
        if (i > 0) t += ', para lo que compra ' + cad.bien[i - 1] + ' por ' + e0(interm[i]) + ' € a la empresa ' + i;
        if (i < n - 1) t += '. Vende ' + e0(venta[i]) + ' € a la empresa ' + (i + 2) + ' y ' + e0(F[i]) + ' € directamente a las familias';
        else t += ' y lo vende íntegramente a las familias';
        t += '. Paga salarios por ' + e0(W[i]) + ' €' + (ocultaB ? '' : ' y obtiene un beneficio de ' + e0(B[i]) + ' €') + '.</li>';
        return t;
      }).join('');
      var enun = '<p>En una economía cerrada y sin sector público existen solo ' + (n === 3 ? 'tres' : 'dos') + ' empresas durante el año:</p><ul>' + lis + '</ul>' +
        (ocultaB ? '<p>No conocemos los beneficios: el resto del valor añadido, una vez pagados los salarios, son beneficios de cada empresa.</p>' : '');

      var vabTxt = cad.emp.map(function (_, i) { return 'VAB<sub>' + (i + 1) + '</sub> = ' + e0(V[i]) + ' − ' + e0(interm[i]) + ' = ' + e0(VAB[i]); }).join('<br>');
      var k = n === 3 ? 1 : 1; // empresa 2
      var preg = [
        num('a', '¿Cuál es el valor añadido bruto (VAB) de la empresa 2 (' + cad.emp[k] + ')?', VAB[k], {
          dec: 0, unidad: '€',
          errores: [{ v: V[k], msg: 'Has dado el valor de su producción. El VAB descuenta los bienes intermedios que compra a otras empresas.' }],
          pista: 'VAB = valor de la producción − compras de bienes intermedios.',
          explica: eq('VAB<sub>2</sub> = ' + e0(V[k]) + ' − ' + e0(interm[k]) + ' = <b>' + e0(VAB[k]) + ' €</b>')
        }),
        num('b', 'Calcula el PIB por la vía de la producción (suma de valores añadidos).', PIB, {
          dec: 0, unidad: '€',
          errores: [{ v: sumV, msg: 'Has sumado las ventas brutas: eso cuenta dos veces los bienes intermedios. Suma solo valores añadidos.' }],
          pista: 'Calcula el VAB de cada empresa y súmalos.',
          explica: eq(vabTxt) + eq('PIB = ' + VAB.map(e0).join(' + ') + ' = <b>' + e0(PIB) + ' €</b>')
        }),
        num('c', 'Calcula la masa salarial total de la economía.', sumW, {
          dec: 0, unidad: '€', pista: 'Suma los salarios que paga cada empresa.',
          explica: eq('Salarios = ' + W.map(e0).join(' + ') + ' = <b>' + e0(sumW) + ' €</b>')
        }),
        num('d', ocultaB ? 'Calcula los beneficios totales (VAB menos salarios en cada empresa).' : 'Calcula los beneficios totales.', sumB, {
          dec: 0, unidad: '€',
          errores: ocultaB ? [{ v: sumV - sumW, msg: 'Has restado los salarios a las ventas. Los beneficios salen del valor añadido, no de las ventas.' }] : [],
          pista: ocultaB ? 'Beneficio de cada empresa = VAB − salarios.' : 'Suma los beneficios de las empresas.',
          explica: (ocultaB ? eq(cad.emp.map(function (_, i) { return 'B<sub>' + (i + 1) + '</sub> = ' + e0(VAB[i]) + ' − ' + e0(W[i]) + ' = ' + e0(B[i]); }).join('<br>')) : '') +
            eq('Beneficios = ' + B.map(e0).join(' + ') + ' = <b>' + e0(sumB) + ' €</b>') +
            '<p>Vía de la renta: ' + e0(sumW) + ' + ' + e0(sumB) + ' = ' + e0(PIB) + ' €, el mismo PIB.</p>'
        }),
        num('e', 'Calcula el PIB por la vía del gasto final de las familias.', sumF, {
          dec: 0, unidad: '€',
          errores: [{ v: sumV, msg: 'Has sumado todas las ventas, también las que van de una empresa a otra. Solo cuenta el gasto en bienes finales.' }],
          pista: 'Suma solo lo que compran las familias (bienes finales).',
          explica: eq('Gasto final = ' + F.map(e0).join(' + ') + ' = <b>' + e0(sumF) + ' €</b>') + '<p>Las tres vías coinciden: ' + e0(PIB) + ' €.</p>'
        }),
        num('f', 'Si sumaras las ventas brutas de todas las empresas, ¿cuántos euros estarías contando dos veces?', dup, {
          dec: 0, unidad: '€',
          errores: [{ v: sumV, msg: 'Esa es la suma de ventas brutas. Se pide la parte duplicada: la diferencia entre esa suma y el PIB.' }],
          pista: 'Compara la suma de ventas brutas con el PIB.',
          explica: eq('Ventas brutas = ' + V.map(e0).join(' + ') + ' = ' + e0(sumV) + ' €') +
            eq('Doble contabilización = ' + e0(sumV) + ' − ' + e0(PIB) + ' = <b>' + e0(dup) + ' €</b>') +
            '<p>Coincide con el valor de los bienes intermedios (' + venta.filter(function (x) { return x > 0; }).map(e0).join(' + ') + ' €), que ya está incluido en el precio de los bienes siguientes.</p>'
        })
      ];
      var tonos = [C.navy, C.cobalt, '#7fb3d5'];
      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Tres vías, un mismo PIB',
          render: function () {
            return MP.barras({
              titulo: 'Comparación de las tres vías del PIB',
              ylab: '€',
              fmt: function (t) { return fmt(t, 0); },
              grupos: [
                { etiqueta: 'Producción', sub: 'Σ VAB', pilas: VAB.map(function (x, i) { return { v: x, color: tonos[i], etiqueta: 'E' + (i + 1) }; }) },
                { etiqueta: 'Rentas', sub: 'W + B', pilas: [{ v: sumW, color: C.teal, etiqueta: 'Salarios' }, { v: sumB, color: C.gold, etiqueta: 'Benef.' }] },
                { etiqueta: 'Gasto final', sub: 'familias', pilas: F.map(function (x, i) { return { v: x, color: tonos[i], etiqueta: x > 0 ? cad.bien[i] : '' }; }) },
                { etiqueta: 'Ventas brutas', sub: '✗ error', pilas: [{ v: PIB, color: '#cbd5e1', etiqueta: 'PIB' }, { v: dup, color: C.crimson, etiqueta: '2×' }] }
              ]
            });
          },
          nota: 'Las tres primeras barras miden lo mismo. La cuarta muestra el error de sumar ventas brutas: la parte roja son bienes intermedios contados dos veces.'
        }
      };
    }
  });

  /* =====================================================================
     2 · PIB nominal, PIB real y deflactor
     ===================================================================== */
  var BIENES = [['Manzanas', 'Ordenadores'], ['Pan', 'Bicicletas'], ['Café', 'Teléfonos'], ['Naranjas', 'Coches eléctricos'], ['Libros', 'Lavadoras']];

  MP.registrar('epd1', {
    id: 'pib-real', icono: '📊', sesion: 'S1',
    titulo: 'PIB nominal, real y deflactor',
    resumen: 'Separa cuánto crece la producción y cuánto los precios. Deflactor e inflación.',
    generar: function (R) {
      var b = R.elegir(BIENES);
      var pA1 = R.int(2, 12), pB1 = R.paso(20, 200, 5);
      var qA1 = R.paso(50, 400, 10), qB1 = R.paso(10, 120, 5);
      var pA2 = pA1 + R.int(-1, 4), pB2 = pB1 + R.paso(-15, 40, 5);
      var qA2 = qA1 + R.paso(-40, 80, 10), qB2 = qB1 + R.paso(-10, 30, 5);
      if (pA2 < 1 || pB2 < 5 || qA2 < 10 || qB2 < 5) return null;
      var base = R.prob(0.75) ? 1 : 2;
      var N1 = pA1 * qA1 + pB1 * qB1, N2 = pA2 * qA2 + pB2 * qB2;
      var pa = base === 1 ? pA1 : pA2, pb = base === 1 ? pB1 : pB2;
      var Rl1 = pa * qA1 + pb * qB1, Rl2 = pa * qA2 + pb * qB2;
      var gN = (N2 / N1 - 1) * 100, gR = (Rl2 / Rl1 - 1) * 100;
      var D1 = N1 / Rl1 * 100, D2 = N2 / Rl2 * 100, inf = (D2 / D1 - 1) * 100;
      if (gR < -8 || gR > 30 || inf < -4 || inf > 25 || Math.abs(gN - gR) < 1.5) return null;
      var otro = base === 1 ? 2 : 1;
      var Rot = otro === 2 ? Rl2 : Rl1, Not = otro === 2 ? N2 : N1, Dot = otro === 2 ? D2 : D1;
      var qa = otro === 2 ? qA2 : qA1, qb = otro === 2 ? qB2 : qB1;

      var tabla = '<table class="tabla"><thead><tr><th></th><th>P ' + b[0].toLowerCase() + '</th><th>Q ' + b[0].toLowerCase() + '</th><th>P ' + b[1].toLowerCase() + '</th><th>Q ' + b[1].toLowerCase() + '</th></tr></thead><tbody>' +
        '<tr><th>Año 1</th><td>' + e0(pA1) + ' €</td><td>' + e0(qA1) + '</td><td>' + e0(pB1) + ' €</td><td>' + e0(qB1) + '</td></tr>' +
        '<tr><th>Año 2</th><td>' + e0(pA2) + ' €</td><td>' + e0(qA2) + '</td><td>' + e0(pB2) + ' €</td><td>' + e0(qB2) + '</td></tr></tbody></table>';
      var enun = '<p>Una economía produce solo dos bienes: ' + b[0].toLowerCase() + ' y ' + b[1].toLowerCase() + '. Precios (P) y cantidades (Q):</p>' + tabla +
        '<p>Toma el <b>año ' + base + ' como año base</b>. Expresa las tasas en porcentaje con dos decimales.</p>';

      var preg = [
        num('a', 'PIB nominal del año 1.', N1, { dec: 0, unidad: '€', pista: 'Precios y cantidades del propio año 1.',
          explica: eq('PIB<sup>N</sup><sub>1</sub> = ' + e0(pA1) + '·' + e0(qA1) + ' + ' + e0(pB1) + '·' + e0(qB1) + ' = <b>' + e0(N1) + ' €</b>') }),
        num('b', 'PIB nominal del año 2.', N2, { dec: 0, unidad: '€', pista: 'Precios y cantidades del propio año 2.',
          explica: eq('PIB<sup>N</sup><sub>2</sub> = ' + e0(pA2) + '·' + e0(qA2) + ' + ' + e0(pB2) + '·' + e0(qB2) + ' = <b>' + e0(N2) + ' €</b>') }),
        num('c', 'PIB real del año ' + otro + ' (a precios del año ' + base + ').', Rot, {
          dec: 0, unidad: '€',
          errores: [{ v: Not, msg: 'Ese es el PIB nominal del año ' + otro + '. Para el real usa los precios del año base con las cantidades del año ' + otro + '.' }],
          pista: 'Cantidades del año ' + otro + ' × precios del año base.',
          explica: eq('PIB<sup>R</sup><sub>' + otro + '</sub> = ' + e0(pa) + '·' + e0(qa) + ' + ' + e0(pb) + '·' + e0(qb) + ' = <b>' + e0(Rot) + ' €</b>') +
            '<p>En el año base el PIB real coincide con el nominal (' + e0(base === 1 ? N1 : N2) + ' €).</p>'
        }),
        num('d', 'Tasa de crecimiento del PIB nominal.', gN, { unidad: '%', pista: '(PIB<sub>2</sub> − PIB<sub>1</sub>) / PIB<sub>1</sub> × 100, en nominal.',
          explica: eq('g<sup>N</sup> = ' + fr(e0(N2) + ' − ' + e0(N1), e0(N1)) + ' × 100 = <b>' + e2(gN) + '%</b>') }),
        num('e', 'Tasa de crecimiento del PIB real.', gR, {
          unidad: '%',
          errores: [{ v: gN, msg: 'Ese es el crecimiento nominal: mezcla más producción y precios más altos. Usa el PIB real de ambos años.' }],
          pista: 'Usa el PIB real de los dos años (recuerda que en el año base real = nominal).',
          explica: eq('g<sup>R</sup> = ' + fr(e0(Rl2) + ' − ' + e0(Rl1), e0(Rl1)) + ' × 100 = <b>' + e2(gR) + '%</b>') +
            '<p>La diferencia con el crecimiento nominal (' + e2(gN) + '%) se debe a la variación de los precios.</p>'
        }),
        num('f', 'Deflactor del PIB del año ' + otro + ' (año ' + base + ' = 100).', Dot, {
          unidad: '',
          errores: [{ v: (otro === 2 ? Rl2 / N2 : Rl1 / N1) * 100, msg: 'Has invertido el cociente. Deflactor = PIB nominal / PIB real × 100.' }],
          pista: 'Deflactor = PIB nominal / PIB real × 100.',
          explica: eq('Deflactor<sub>' + otro + '</sub> = ' + fr(e0(Not), e0(Rot)) + ' × 100 = <b>' + e2(Dot) + '</b>')
        }),
        num('g', 'Tasa de inflación medida por el deflactor entre el año 1 y el año 2.', inf, {
          unidad: '%',
          errores: [{ v: gN - gR, msg: 'Restar tasas es solo una aproximación. Calcula la variación exacta del deflactor.' }],
          pista: 'Variación porcentual del deflactor entre los dos años (el del año base vale 100).',
          explica: eq('π = ' + fr(e2(D2) + ' − ' + e2(D1), e2(D1)) + ' × 100 = <b>' + e2(inf) + '%</b>') +
            '<p>Comprueba la identidad: (1 + g<sup>N</sup>) = (1 + g<sup>R</sup>)(1 + π) → ' + fmt(1 + gN / 100, 4) + ' = ' + fmt(1 + gR / 100, 4) + ' × ' + fmt(1 + inf / 100, 4) + '.</p>'
        })
      ];
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'PIB nominal frente a real',
          render: function () {
            return MP.barras({
              titulo: 'PIB nominal y real', ylab: '€', fmt: function (t) { return fmt(t, 0); },
              grupos: [
                { etiqueta: 'Año 1', sub: 'nominal', pilas: [{ v: N1, color: C.crimson }] },
                { etiqueta: 'Año 1', sub: 'real', pilas: [{ v: Rl1, color: C.cobalt }] },
                { etiqueta: 'Año 2', sub: 'nominal', pilas: [{ v: N2, color: C.crimson }] },
                { etiqueta: 'Año 2', sub: 'real', pilas: [{ v: Rl2, color: C.cobalt }] }
              ],
              leyenda: [{ color: C.crimson, etiqueta: 'Nominal (precios corrientes)' }, { color: C.cobalt, etiqueta: 'Real (precios del año ' + base + ')' }]
            });
          },
          nota: 'En el año base las dos barras son iguales. En el otro año, la distancia entre ellas refleja el cambio de precios.'
        }
      };
    }
  });

  /* =====================================================================
     3 · Equilibrio y multiplicador keynesiano
     ===================================================================== */
  var C1 = [0.5, 0.6, 0.75, 0.8, 0.9];

  MP.registrar('epd1', {
    id: 'multiplicador', icono: '✖️', sesion: 'S2',
    titulo: 'Equilibrio y multiplicador',
    resumen: 'Cruz keynesiana: producción de equilibrio, saldo presupuestario y efectos de G, T y del ahorro.',
    generar: function (R) {
      var c1 = R.elegir(C1), a = 1 / (1 - c1);
      var c0 = R.paso(50, 300, 10), I = R.paso(100, 500, 10), G = R.paso(100, 600, 10), T = R.paso(100, 500, 10);
      var A = c0 - c1 * T + I + G;
      var Y = a * A;
      if (A <= 0 || Y - T <= 0 || Y > 9000) return null;
      var Cc = c0 + c1 * (Y - T), SP = T - G;
      var esc = R.elegir(['objetivo', 'impuestos', 'ahorro', 'equilibrado']);
      var A2 = A, Y2, preg2 = [], resto = '';
      var cTxt = fmt(c1, 2);

      var base = [
        num('a', 'Valor del multiplicador del gasto autónomo (α).', a, {
          errores: [{ v: 1 / c1, msg: 'El multiplicador es 1/(1 − c₁), no 1/c₁.' }, { v: 1 - c1, msg: 'Eso es la propensión marginal a ahorrar. El multiplicador es su inversa.' }],
          pista: 'α = 1 / (1 − c₁).',
          explica: eq('α = ' + fr('1', '1 − ' + cTxt) + ' = ' + fr('1', fmt(1 - c1, 2)) + ' = <b>' + e2(a) + '</b>')
        }),
        num('b', 'Gasto autónomo (Ā).', A, {
          errores: [{ v: c0 + I + G, msg: 'Falta restar el efecto de los impuestos sobre el consumo: −c₁·T.' }, { v: c0 - T + I + G, msg: 'Los impuestos reducen el consumo en c₁·T, no en T.' }],
          pista: 'Ā = c₀ − c₁·T + I + G.',
          explica: eq('Ā = ' + e0(c0) + ' − ' + cTxt + '·' + e0(T) + ' + ' + e0(I) + ' + ' + e0(G) + ' = <b>' + e2(A) + '</b>')
        }),
        num('c', 'Producción de equilibrio (Y*).', Y, {
          errores: [{ v: a * (c0 + I + G), msg: 'Has olvidado restar c₁·T en el gasto autónomo.' }, { v: A / c1, msg: 'El multiplicador es 1/(1 − c₁).' }, { v: A, msg: 'Ese es el gasto autónomo. Falta multiplicarlo por α.' }],
          pista: 'Y* = α · Ā.',
          explica: eq('Y* = ' + e2(a) + ' × ' + e2(A) + ' = <b>' + e2(Y) + '</b>')
        }),
        num('d', 'Consumo de equilibrio (C*).', Cc, {
          errores: [{ v: c0 + c1 * Y, msg: 'El consumo depende de la renta disponible, Y − T.' }],
          pista: 'C* = c₀ + c₁·(Y* − T).',
          explica: eq('C* = ' + e0(c0) + ' + ' + cTxt + '·(' + e2(Y) + ' − ' + e0(T) + ') = <b>' + e2(Cc) + '</b>')
        }),
        num('e', 'Saldo presupuestario del Estado (SP = T − G). Si es déficit, escríbelo con signo negativo.', SP, {
          dec: 0, pista: 'SP = T − G.',
          explica: eq('SP = ' + e0(T) + ' − ' + e0(G) + ' = <b>' + e0(SP) + '</b>') + '<p>' + (SP < 0 ? 'Déficit público de ' + e0(-SP) + '.' : SP > 0 ? 'Superávit público de ' + e0(SP) + '.' : 'Presupuesto equilibrado.') + '</p>'
        })
      ];

      if (esc === 'objetivo') {
        var dG = R.paso(20, 150, 10) * (R.prob(0.8) ? 1 : -1);
        Y2 = Y + a * dG; A2 = A + dG;
        var SP2 = T - (G + dG);
        resto = '<p>El Gobierno quiere situar la producción en <b>Y = ' + e2(Y2) + '</b> modificando solo el gasto público.</p>';
        preg2 = [
          num('f', '¿Cuánto debe variar el gasto público (ΔG)?', dG, {
            errores: [{ v: Y2 - Y, msg: 'Esa es la brecha de producción ΔY. El gasto necesario es ΔY/α.' }],
            pista: 'ΔY = α · ΔG → ΔG = ΔY / α.',
            explica: eq('ΔY = ' + e2(Y2) + ' − ' + e2(Y) + ' = ' + e2(Y2 - Y)) + eq('ΔG = ' + fr(e2(Y2 - Y), e2(a)) + ' = <b>' + e2(dG) + '</b>')
          }),
          num('g', 'Nuevo saldo presupuestario.', SP2, { dec: 0, pista: 'SP′ = T − (G + ΔG).',
            explica: eq('SP′ = ' + e0(T) + ' − ' + e0(G + dG) + ' = <b>' + e0(SP2) + '</b>') })
        ];
      } else if (esc === 'impuestos') {
        var dT = R.paso(20, 100, 10) * R.signo();
        var mT = -c1 * a, dY = mT * dT;
        Y2 = Y + dY; A2 = A - c1 * dT;
        resto = '<p>El Gobierno ' + (dT > 0 ? 'sube' : 'baja') + ' los impuestos en <b>' + e0(Math.abs(dT)) + '</b> (ΔT = ' + e0(dT) + ') sin tocar el gasto.</p>';
        preg2 = [
          num('f', 'Multiplicador de los impuestos (ΔY/ΔT).', mT, {
            errores: [{ v: -a, msg: 'Una variación de T afecta primero al consumo en −c₁·ΔT: el multiplicador es −c₁·α.' }, { v: c1 * a, msg: 'Revisa el signo: subir impuestos reduce la producción.' }],
            pista: 'ΔY/ΔT = −c₁ / (1 − c₁).',
            explica: eq('ΔY/ΔT = −' + cTxt + ' × ' + e2(a) + ' = <b>' + e2(mT) + '</b>')
          }),
          num('g', 'Variación de la producción (ΔY).', dY, {
            errores: [{ v: -a * dT, msg: 'Has aplicado el multiplicador del gasto. Con impuestos es −c₁·α.' }],
            pista: 'ΔY = −c₁·α·ΔT.',
            explica: eq('ΔY = ' + e2(mT) + ' × (' + e0(dT) + ') = <b>' + e2(dY) + '</b>') + '<p>Nueva producción: ' + e2(Y2) + '. Saldo presupuestario: ' + e0(T + dT - G) + '.</p>'
          }),
          num('h', 'Nuevo saldo presupuestario.', T + dT - G, { dec: 0, pista: 'SP′ = (T + ΔT) − G.',
            explica: eq('SP′ = ' + e0(T + dT) + ' − ' + e0(G) + ' = <b>' + e0(T + dT - G) + '</b>') })
        ];
      } else if (esc === 'ahorro') {
        var dc0 = -R.paso(20, 100, 10);
        Y2 = Y + a * dc0; A2 = A + dc0;
        var S1 = (Y - T) - Cc, C2 = c0 + dc0 + c1 * (Y2 - T), S2 = (Y2 - T) - C2;
        resto = '<p>Ante la incertidumbre, las familias deciden ahorrar más: el consumo autónomo cae en <b>' + e0(-dc0) + '</b> (Δc₀ = ' + e0(dc0) + ').</p>';
        preg2 = [
          num('f', 'Nueva producción de equilibrio.', Y2, {
            errores: [{ v: Y + dc0, msg: 'Falta el efecto multiplicador: ΔY = α·Δc₀.' }],
            pista: 'ΔY = α · Δc₀.',
            explica: eq('ΔY = ' + e2(a) + ' × (' + e0(dc0) + ') = ' + e2(a * dc0)) + eq('Y′ = <b>' + e2(Y2) + '</b>')
          }),
          num('g', 'Ahorro privado inicial (S = Y − T − C).', S1, { pista: 'S = (Y* − T) − C*.',
            explica: eq('S = ' + e2(Y - T) + ' − ' + e2(Cc) + ' = <b>' + e2(S1) + '</b>') }),
          num('h', 'Variación del ahorro privado en el nuevo equilibrio (ΔS).', S2 - S1, {
            tol: 0.05,
            errores: [{ v: -dc0, msg: 'Es lo que las familias querían ahorrar de más, pero al caer la renta el ahorro final no cambia. Es la paradoja del ahorro.' }],
            pista: 'En equilibrio, S = I + G − T. ¿Ha cambiado alguno de esos términos?',
            explica: eq('C′ = ' + e0(c0 + dc0) + ' + ' + cTxt + '·(' + e2(Y2) + ' − ' + e0(T) + ') = ' + e2(C2)) + eq('S′ = ' + e2(Y2 - T) + ' − ' + e2(C2) + ' = ' + e2(S2) + ' → ΔS = <b>' + e2(S2 - S1) + '</b>') +
              '<p><b>Paradoja del ahorro:</b> el intento colectivo de ahorrar más reduce la producción hasta que el ahorro vuelve a igualar I + G − T = ' + e0(I + G - T) + '.</p>'
          })
        ];
      } else {
        var dB = R.paso(20, 100, 10);
        Y2 = Y + dB; A2 = A + dB - c1 * dB;
        resto = '<p>El Gobierno aumenta el gasto público en <b>' + e0(dB) + '</b> y lo financia íntegramente subiendo los impuestos en la misma cuantía (ΔG = ΔT = ' + e0(dB) + ').</p>';
        preg2 = [
          num('f', 'Variación de la producción (ΔY).', dB, {
            errores: [{ v: a * dB, msg: 'Has olvidado el efecto de la subida de impuestos, que resta −c₁·α·ΔT.' }, { v: 0, msg: 'Los dos efectos no se anulan: el gasto entra entero en la demanda, los impuestos solo reducen el consumo en c₁·ΔT.' }],
            pista: 'ΔY = α·ΔG − c₁·α·ΔT.',
            explica: eq('ΔY = ' + e2(a) + '·' + e0(dB) + ' − ' + cTxt + '·' + e2(a) + '·' + e0(dB) + ' = (1 − ' + cTxt + ')·' + e2(a) + '·' + e0(dB) + ' = <b>' + e2(dB) + '</b>') +
              '<p>El multiplicador del presupuesto equilibrado vale 1.</p>'
          }),
          num('g', 'Nuevo saldo presupuestario.', SP, { dec: 0, pista: 'Gasto e impuestos suben lo mismo.',
            explica: eq('SP′ = ' + e0(T + dB) + ' − ' + e0(G + dB) + ' = <b>' + e0(SP) + '</b> (no cambia)') })
        ];
      }

      var enun = '<p>Una economía cerrada se describe con las siguientes ecuaciones:</p>' +
        '<div class="datos">C = ' + e0(c0) + ' + ' + cTxt + '·Y<sub>d</sub> &nbsp;·&nbsp; I = ' + e0(I) + ' &nbsp;·&nbsp; G = ' + e0(G) + ' &nbsp;·&nbsp; T = ' + e0(T) + '</div>' +
        '<p>donde Y<sub>d</sub> = Y − T es la renta disponible.</p>';

      return {
        enunciado: enun,
        preguntas: base.concat([{ tipo: 'sep', html: resto }]).concat(preg2),
        grafico: {
          titulo: 'Cruz keynesiana',
          render: function () {
            var xmax = Math.max(Y, Y2) * 1.35, xmin = 0;
            if (Math.abs(Y2 - Y) < 0.12 * Y || a >= 5) { xmin = Math.min(Y, Y2) - Math.max(Math.abs(Y2 - Y) * 1.5, 0.08 * Y); xmax = Math.max(Y, Y2) + Math.max(Math.abs(Y2 - Y) * 1.5, 0.08 * Y); }
            return MP.grafico({
              titulo: 'Cruz keynesiana', x: [xmin, xmax], y: [xmin, xmax], xlab: 'Producción, Y', ylab: 'Demanda, Z',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 0); },
              lineas: [
                { pts: [[xmin, xmin], [xmax, xmax]], color: C.slate, w: 1.6, dash: '6 5', etiqueta: '45°: Z = Y' },
                { pts: [[xmin, A + c1 * xmin], [xmax, A + c1 * xmax]], color: C.cobalt, etiqueta: 'ZZ' },
                { pts: [[xmin, A2 + c1 * xmin], [xmax, A2 + c1 * xmax]], color: C.gold, etiqueta: 'ZZ′', etqEn: 'inicio' }
              ],
              puntos: [{ x: Y, y: Y, etiqueta: 'E', marcaX: 'Y*', color: C.navy }, { x: Y2, y: Y2, etiqueta: 'E′', marcaX: "Y′", color: C.gold }]
            }) + MP.leyenda([{ color: C.cobalt, etiqueta: 'Demanda inicial' }, { color: C.gold, etiqueta: 'Demanda tras el cambio' }]);
          },
          nota: 'El equilibrio está donde la demanda ZZ corta la recta de 45°. Un cambio en el gasto autónomo desplaza ZZ en vertical; la producción varía α veces más.'
        }
      };
    }
  });

  /* =====================================================================
     4 · La relación IS con inversión endógena
     ===================================================================== */
  var PARES = [[0.6, 0.15], [0.65, 0.15], [0.6, 0.2], [0.5, 0.1], [0.7, 0.1], [0.55, 0.2], [0.45, 0.05], [0.5, 0.25], [0.4, 0.1]];

  MP.registrar('epd1', {
    id: 'curva-is', icono: '📉', sesion: 'S3',
    titulo: 'La curva IS',
    resumen: 'Inversión que depende de ventas y tipos: multiplicador ampliado, ecuación de la IS y desplazamientos.',
    generar: function (R) {
      var par = R.elegir(PARES), c1 = par[0], d1 = par[1];
      var a = 1 / (1 - c1 - d1);
      var c0 = R.paso(100, 300, 10), d0 = R.paso(50, 250, 10), G = R.paso(150, 450, 10), T = R.paso(100, 400, 10);
      var d2 = R.elegir([500, 800, 1000, 1200, 1500, 2000]);
      var i = R.paso(0.01, 0.06, 0.005);
      var A = c0 - c1 * T + d0 + G;
      var Y = a * (A - d2 * i), Cc = c0 + c1 * (Y - T), I = d0 + d1 * Y - d2 * i, SP = T - G;
      if (A <= 0 || Y <= T || I <= 25 || Y > 9000) return null;
      var esc = R.prob(0.5) ? 'G' : 'i';
      var dG = 0, di = 0, Y2, I2, i2 = i, A2 = A;
      if (esc === 'G') { dG = R.paso(20, 80, 10) * R.signo(); A2 = A + dG; Y2 = Y + a * dG; I2 = d0 + d1 * Y2 - d2 * i; }
      else { di = R.paso(0.005, 0.02, 0.005) * R.signo(); i2 = R2(i + di, 4); if (i2 < 0.005) return null; Y2 = Y - a * d2 * di; I2 = d0 + d1 * Y2 - d2 * i2; }
      if (I2 <= 25 || Y2 <= T) return null;
      var pc = function (x) { return fmt(x * 100, 2) + '%'; };
      var iTxt = fmt(i, 3);

      var enun = '<p>Considera una economía cerrada descrita por:</p>' +
        '<div class="datos">C = ' + e0(c0) + ' + ' + fmt(c1, 2) + '·(Y − T)<br>I = ' + e0(d0) + ' + ' + fmt(d1, 2) + '·Y − ' + e0(d2) + '·i<br>G = ' + e0(G) + ' &nbsp;·&nbsp; T = ' + e0(T) + '</div>' +
        '<p>El banco central fija el tipo de interés en <b>i = ' + pc(i) + '</b> (' + iTxt + ' en tanto por uno).</p>';
      var preg = [
        num('a', 'Multiplicador ampliado de la IS (α<sub>IS</sub>).', a, {
          errores: [{ v: 1 / (1 - c1), msg: 'Ese es el multiplicador sin inversión endógena. Ahora la inversión también responde a Y: α = 1/(1 − c₁ − d₁).' }],
          pista: 'α<sub>IS</sub> = 1 / (1 − c₁ − d₁).',
          explica: eq('α<sub>IS</sub> = ' + fr('1', '1 − ' + fmt(c1, 2) + ' − ' + fmt(d1, 2)) + ' = ' + fr('1', fmt(1 - c1 - d1, 2)) + ' = <b>' + e2(a) + '</b>') +
            '<p>Condición de estabilidad: c₁ + d₁ = ' + fmt(c1 + d1, 2) + ' &lt; 1.</p>'
        }),
        num('b', 'Gasto autónomo (Ā = c₀ − c₁T + d₀ + G).', A, {
          errores: [{ v: c0 + d0 + G, msg: 'Falta restar c₁·T.' }],
          pista: 'Ā = c₀ − c₁·T + d₀ + G.',
          explica: eq('Ā = ' + e0(c0) + ' − ' + fmt(c1, 2) + '·' + e0(T) + ' + ' + e0(d0) + ' + ' + e0(G) + ' = <b>' + e2(A) + '</b>')
        }),
        { tipo: 'sep', html: '<p>Escribe la curva IS como <b>Y = [ordenada] − [pendiente]·i</b>, con i en tanto por uno.</p>' },
        num('c', 'Ordenada de la IS (α<sub>IS</sub>·Ā).', a * A, {
          pista: 'Multiplica el gasto autónomo por α<sub>IS</sub>.',
          explica: eq('α<sub>IS</sub>·Ā = ' + e2(a) + ' × ' + e2(A) + ' = <b>' + e2(a * A) + '</b>')
        }),
        num('d', 'Coeficiente de i en la IS (α<sub>IS</sub>·d₂).', a * d2, {
          errores: [{ v: d2, msg: 'Falta multiplicar d₂ por α<sub>IS</sub>.' }],
          pista: 'Multiplica d₂ por α<sub>IS</sub>.',
          explica: eq('α<sub>IS</sub>·d₂ = ' + e2(a) + ' × ' + e0(d2) + ' = <b>' + e2(a * d2) + '</b>') + eq('IS: Y = ' + e2(a * A) + ' − ' + e2(a * d2) + '·i')
        }),
        num('e', 'Producción de equilibrio (Y*).', Y, {
          errores: [{ v: a * A - a * d2 * i * 100, msg: 'Has metido el tipo en porcentaje (' + fmt(i * 100, 2) + '). En la ecuación va en tanto por uno: ' + iTxt + '.' }, { v: (A - d2 * i) / (1 - c1), msg: 'Has usado el multiplicador sin d₁.' }],
          pista: 'Sustituye i = ' + iTxt + ' en la IS.',
          explica: eq('Y* = ' + e2(a * A) + ' − ' + e2(a * d2) + ' × ' + iTxt + ' = <b>' + e2(Y) + '</b>')
        }),
        num('f', 'Consumo de equilibrio (C*).', Cc, { pista: 'C* = c₀ + c₁·(Y* − T).',
          explica: eq('C* = ' + e0(c0) + ' + ' + fmt(c1, 2) + '·(' + e2(Y) + ' − ' + e0(T) + ') = <b>' + e2(Cc) + '</b>') }),
        num('g', 'Inversión de equilibrio (I*).', I, {
          errores: [{ v: d0 + d1 * Y - d2 * i * 100, msg: 'El tipo va en tanto por uno (' + iTxt + ').' }],
          pista: 'I* = d₀ + d₁·Y* − d₂·i.',
          explica: eq('I* = ' + e0(d0) + ' + ' + fmt(d1, 2) + '·' + e2(Y) + ' − ' + e0(d2) + '·' + iTxt + ' = <b>' + e2(I) + '</b>') +
            '<p>Comprobación: C + I + G = ' + e2(Cc) + ' + ' + e2(I) + ' + ' + e0(G) + ' = ' + e2(Cc + I + G) + ' = Y*.</p>'
        })
      ];
      var resto, p2;
      if (esc === 'G') {
        resto = '<p>El Gobierno ' + (dG > 0 ? 'aprueba un plan de gasto' : 'recorta el gasto') + ': <b>ΔG = ' + e0(dG) + '</b>. El banco central mantiene el tipo en ' + pc(i) + '.</p>';
        p2 = [
          num('h', 'Nueva producción de equilibrio.', Y2, {
            errores: [{ v: Y + dG / (1 - c1), msg: 'Usa el multiplicador ampliado α<sub>IS</sub>.' }, { v: Y + dG, msg: 'Falta el efecto multiplicador.' }],
            pista: 'ΔY = α<sub>IS</sub>·ΔG: la IS se desplaza en horizontal.',
            explica: eq('ΔY = ' + e2(a) + ' × ' + e0(dG) + ' = ' + e2(a * dG)) + eq('Y′ = ' + e2(Y) + ' + ' + e2(a * dG) + ' = <b>' + e2(Y2) + '</b>')
          }),
          num('i', 'Nueva inversión.', I2, { pista: 'Con i constante, la inversión solo cambia por las ventas: ΔI = d₁·ΔY.',
            explica: eq('I′ = ' + e2(I) + ' + ' + fmt(d1, 2) + ' × ' + e2(Y2 - Y) + ' = <b>' + e2(I2) + '</b>') }),
          num('j', 'Nuevo saldo presupuestario.', T - G - dG, { dec: 0, pista: 'SP′ = T − (G + ΔG).',
            explica: eq('SP′ = ' + e0(T) + ' − ' + e0(G + dG) + ' = <b>' + e0(T - G - dG) + '</b>') + '<p>Con impuestos de cuantía fija, el saldo cambia exactamente en −ΔG.</p>' })
        ];
      } else {
        resto = '<p>El banco central ' + (di > 0 ? 'sube' : 'baja') + ' el tipo de interés hasta <b>i′ = ' + pc(i2) + '</b>. La política fiscal no cambia.</p>';
        p2 = [
          num('h', 'Nueva producción de equilibrio.', Y2, {
            errores: [{ v: Y - a * d2 * di * 100, msg: 'El cambio de tipo va en tanto por uno (Δi = ' + fmt(di, 3) + ').' }],
            pista: 'Muévete a lo largo de la IS: Y = ' + e2(a * A) + ' − ' + e2(a * d2) + '·i′.',
            explica: eq('Y′ = ' + e2(a * A) + ' − ' + e2(a * d2) + ' × ' + fmt(i2, 3) + ' = <b>' + e2(Y2) + '</b>') + '<p>No hay desplazamiento de la IS: es un movimiento a lo largo de ella.</p>'
          }),
          num('i', 'Nueva inversión.', I2, { pista: 'I′ = d₀ + d₁·Y′ − d₂·i′.',
            explica: eq('I′ = ' + e0(d0) + ' + ' + fmt(d1, 2) + '·' + e2(Y2) + ' − ' + e0(d2) + '·' + fmt(i2, 3) + ' = <b>' + e2(I2) + '</b>') +
              '<p>La inversión cambia por dos canales: el coste del crédito (−d₂·Δi = ' + e2(-d2 * di) + ') y las ventas (d₁·ΔY = ' + e2(d1 * (Y2 - Y)) + ').</p>' })
        ];
      }
      return {
        enunciado: enun,
        preguntas: preg.concat([{ tipo: 'sep', html: resto }]).concat(p2),
        grafico: {
          titulo: 'Curva IS',
          render: function () {
            var imax = Math.max(i, i2) * 100 * 1.9 + 1;
            var isPts = function (Aa) { return [[a * Aa, 0], [a * (Aa - d2 * imax / 100), imax]]; };
            var xs = [Y, Y2, a * A, a * A2];
            var lin = [{ pts: isPts(A), color: C.cobalt, etiqueta: 'IS', etqEn: 'inicio', etqPt: [a * (A - d2 * imax * 0.9 / 100), imax * 0.9] }];
            if (esc === 'G') lin.push({ pts: isPts(A2), color: C.gold, etiqueta: 'IS′', etqPt: [a * (A2 - d2 * imax * 0.75 / 100), imax * 0.75] });
            lin.push({ pts: [[0, i * 100], [1e6, i * 100]], color: C.crimson, w: 2, etiqueta: 'LM: i = ' + pc(i), etqPt: [1e9, i * 100] });
            if (esc === 'i') lin.push({ pts: [[0, i2 * 100], [1e6, i2 * 100]], color: C.gold, w: 2, dash: '7 5', etiqueta: "LM′", etqPt: [1e9, i2 * 100] });
            return MP.grafico({
              titulo: 'Curva IS', x: MP.rango(xs.concat([a * (A - d2 * imax / 100), a * (A2 - d2 * imax / 100)]), 0.08), y: [0, imax], xlab: 'Producción, Y', ylab: 'i (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); }, lineas: lin,
              puntos: [{ x: Y, y: i * 100, etiqueta: 'E', color: C.navy }, { x: Y2, y: i2 * 100, etiqueta: 'E′', color: C.gold }]
            });
          },
          nota: esc === 'G' ? 'El gasto público desplaza la IS en horizontal α<sub>IS</sub>·ΔG; con el tipo fijo, la producción se mueve lo mismo.' : 'Un cambio del tipo no desplaza la IS: la economía se mueve a lo largo de ella.'
        }
      };
    }
  });
})();
