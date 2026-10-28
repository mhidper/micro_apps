/* EPD 3 · Bloque III · El sistema financiero en la macroeconomía (Sesiones 9–10) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL, R2 = MP.redondear;

  MP.registrarEPD({
    id: 'epd3', num: 3,
    titulo: 'Sistema financiero y macroeconomía',
    sesiones: 'Sesiones 9–10',
    resumen: 'Tipos reales y prima de riesgo en el IS-LM ampliado, límite inferior cero y apalancamiento bancario.'
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
  function e0(x) { return fmt(x, 0); }
  function e2(x) { return fmt(x, 2); }
  function p(x) { return fmt(x, 2) + '%'; } // x ya en puntos porcentuales

  /* =====================================================================
     10 · IS-LM ampliado: tipo real, prima de riesgo y ZLB
     ===================================================================== */
  var PARES = [[0.6, 0.1], [0.5, 0.1], [0.6, 0.15], [0.55, 0.2], [0.65, 0.15], [0.5, 0.25], [0.7, 0.1]];

  MP.registrar('epd3', {
    id: 'islm-ampliado', icono: '💳', sesion: 'S9',
    titulo: 'IS-LM ampliado y prima de riesgo',
    resumen: 'Fisher, coste del crédito r + x, shocks financieros y si el banco central puede compensarlos antes de tocar el cero.',
    generar: function (R) {
      var par = R.elegir(PARES), c1 = par[0], d1 = par[1], a = 1 / (1 - c1 - d1);
      var c0 = R.paso(100, 250, 10), d0 = R.paso(100, 250, 10), G = R.paso(150, 300, 10), T = R.paso(150, 300, 10);
      var d2 = R.elegir([10, 20, 25, 30, 40, 50]);
      var i = R.int(1, 5), pe = R.int(0, 3), x0 = R.elegir([0.5, 1, 1.5, 2]), dx = R.elegir([1, 2, 3, 4, 5]);
      var r0 = i - pe, x1 = x0 + dx;
      var A = c0 - c1 * T + d0 + G;
      function Yf(cost) { return a * (A - d2 * cost); }
      function If(Y, cost) { return d0 + d1 * Y - d2 * cost; }
      var k0 = r0 + x0, Y0 = Yf(k0), I0 = If(Y0, k0), C0 = c0 + c1 * (Y0 - T);
      var k1 = r0 + x1, Y1 = Yf(k1), I1 = If(Y1, k1);
      if (A <= 0 || Y1 <= T || I1 <= 0 || I0 <= 0 || Y0 > 9000) return null;
      var rN = k0 - x1, iN = rN + pe, zlb = iN < 0;
      // Con i = 0 (si el ZLB limita)
      var kZ = -pe + x1, YZ = Yf(kZ), dGZ = (Y0 - YZ) / a;

      var enun = '<p>Una economía cerrada se describe con las siguientes relaciones (tipos y prima en <b>puntos porcentuales</b>: un 2% se escribe 2):</p>' +
        '<div class="datos">C = ' + e0(c0) + ' + ' + fmt(c1, 2) + '·(Y − T)<br>I = ' + e0(d0) + ' + ' + fmt(d1, 2) + '·Y − ' + e0(d2) + '·(r + x)<br>G = ' + e0(G) + ' &nbsp;·&nbsp; T = ' + e0(T) + '</div>' +
        '<p>Tipo oficial del banco central: <b>i = ' + p(i) + '</b>. Inflación esperada: <b>π<sup>e</sup> = ' + p(pe) + '</b>. Prima de riesgo inicial: <b>x = ' + p(x0) + '</b>.</p>';
      var preg = [
        num('a', 'Tipo de interés real de política (r), en %.', r0, {
          unidad: '%', errores: [{ v: i + pe, msg: 'El tipo real descuenta la inflación esperada: r = i − π<sup>e</sup>.' }],
          pista: 'Ecuación de Fisher: r = i − π<sup>e</sup>.',
          explica: eq('r = ' + p(i) + ' − ' + p(pe) + ' = <b>' + p(r0) + '</b>')
        }),
        num('b', 'Coste real del crédito para empresas y familias (r + x), en %.', k0, {
          unidad: '%', errores: [{ v: i + x0, msg: 'Las empresas descuentan la inflación: usa el tipo real r, no el nominal.' }],
          pista: 'Coste del crédito = r + x.',
          explica: eq('r + x = ' + p(r0) + ' + ' + p(x0) + ' = <b>' + p(k0) + '</b>')
        }),
        num('c', 'Producción de equilibrio inicial (Y₀).', Y0, {
          errores: [{ v: Yf(i + x0), msg: 'En la IS ampliada entra el coste real (r + x), no el tipo nominal.' }, { v: Yf(r0), msg: 'Falta la prima de riesgo: el coste del crédito es r + x.' }],
          pista: 'IS ampliada: Y = α·[Ā − d₂·(r + x)], con α = 1/(1 − c₁ − d₁) y Ā = c₀ − c₁T + d₀ + G.',
          explica: eq('α = ' + fr('1', fmt(1 - c1 - d1, 2)) + ' = ' + e2(a) + ' &nbsp;·&nbsp; Ā = ' + e0(c0) + ' − ' + fmt(c1, 2) + '·' + e0(T) + ' + ' + e0(d0) + ' + ' + e0(G) + ' = ' + e2(A)) +
            eq('IS: Y = ' + e2(a * A) + ' − ' + e2(a * d2) + '·(r + x)') + eq('Y₀ = ' + e2(a * A) + ' − ' + e2(a * d2) + '·' + fmt(k0, 2) + ' = <b>' + e2(Y0) + '</b>')
        }),
        num('d', 'Inversión inicial (I₀).', I0, { pista: 'I = d₀ + d₁Y − d₂(r + x).',
          explica: eq('I₀ = ' + e0(d0) + ' + ' + fmt(d1, 2) + '·' + e2(Y0) + ' − ' + e0(d2) + '·' + fmt(k0, 2) + ' = <b>' + e2(I0) + '</b>') +
            '<p>Comprobación: C₀ + I₀ + G = ' + e2(C0) + ' + ' + e2(I0) + ' + ' + e0(G) + ' = ' + e2(C0 + I0 + G) + '.</p>' }),
        { tipo: 'sep', html: '<p>Una crisis de confianza eleva la prima de riesgo de ' + p(x0) + ' a <b>' + p(x1) + '</b> (Δx = +' + p(dx) + '). El banco central, de momento, no cambia el tipo.</p>' },
        num('e', 'Nueva producción de equilibrio (Y₁).', Y1, {
          errores: [{ v: Y0 - d2 * dx, msg: 'Falta el multiplicador: ΔY = −α·d₂·Δx.' }],
          pista: 'Solo cambia x en la IS: ΔY = −α·d₂·Δx.',
          explica: eq('Y₁ = ' + e2(a * A) + ' − ' + e2(a * d2) + '·' + fmt(k1, 2) + ' = <b>' + e2(Y1) + '</b>') + '<p>ΔY = ' + e2(Y1 - Y0) + ' (' + fmt((Y1 / Y0 - 1) * 100, 1) + '%). La IS se desplaza a la izquierda.</p>'
        }),
        num('f', 'Variación de la inversión (ΔI = I₁ − I₀).', I1 - I0, {
          errores: [{ v: -d2 * dx, msg: 'Ese es solo el canal financiero directo. Suma también el canal de las ventas: d₁·ΔY.' }],
          pista: 'ΔI = d₁·ΔY − d₂·Δx.',
          explica: eq('ΔI = ' + fmt(d1, 2) + '·(' + e2(Y1 - Y0) + ') − ' + e0(d2) + '·' + fmt(dx, 2) + ' = ' + e2(d1 * (Y1 - Y0)) + ' + (' + e2(-d2 * dx) + ') = <b>' + e2(I1 - I0) + '</b>') +
            '<p>Dos canales: el coste del crédito (' + e2(-d2 * dx) + ') y la caída de ventas (' + e2(d1 * (Y1 - Y0)) + ').</p>'
        }),
        { tipo: 'sep', html: '<p>El banco central quiere devolver la producción a Y₀ = ' + e2(Y0) + ' con política monetaria convencional.</p>' },
        num('g', 'Tipo real (r′) que tendría que conseguir, en %.', rN, {
          unidad: '%', errores: [{ v: r0 - dx * a, msg: 'No hace falta el multiplicador: basta con que r′ + x₁ vuelva a ' + p(k0) + '.' }],
          pista: 'Para recuperar Y₀, el coste del crédito debe volver a ' + p(k0) + ': r′ = ' + p(k0) + ' − x₁.',
          explica: eq("r′ = " + p(k0) + ' − ' + p(x1) + ' = <b>' + p(rN) + '</b>')
        }),
        num('h', 'Tipo nominal oficial (i′) necesario, en %.', iN, {
          unidad: '%', errores: [{ v: rN - pe, msg: 'Fisher: i = r + π<sup>e</sup>.' }],
          pista: 'i′ = r′ + π<sup>e</sup>.',
          explica: eq("i′ = " + p(rN) + ' + ' + p(pe) + ' = <b>' + p(iN) + '</b>')
        }),
        opc(R, 'k', '¿Puede el banco central estabilizar la producción solo con el tipo oficial?',
          zlb ? 'No: necesitaría un tipo nominal negativo y choca con el límite inferior cero' : 'Sí: le basta con bajar el tipo oficial hasta ' + p(iN),
          [zlb ? { t: 'Sí: basta con bajar el tipo hasta ' + p(iN), msg: 'Un tipo nominal negativo no es viable: el público preferiría guardar efectivo.' } : { t: 'No: el límite inferior cero se lo impide', msg: 'El tipo necesario (' + p(iN) + ') no es negativo, así que es alcanzable.' },
            { t: 'Solo si el Gobierno sube los impuestos a la vez', msg: 'Subir impuestos deprimiría aún más la demanda.' }],
          { explica: '<p>' + (zlb ? 'El tipo nominal requerido (' + p(iN) + ') es negativo: la política monetaria convencional se agota en i = 0.' : 'El tipo requerido es alcanzable (' + p(iN) + ' ≥ 0).') + '</p>' })
      ];
      if (zlb) {
        preg.push({ tipo: 'sep', html: '<p>El banco central baja el tipo hasta <b>i = 0%</b> y el Gobierno completa el estímulo con gasto público.</p>' });
        preg.push(num('m', 'Producción con i = 0% (Y<sub>ZLB</sub>).', YZ, { pista: 'Con i = 0, r = −π<sup>e</sup> y el coste del crédito es x₁ − π<sup>e</sup>.',
          explica: eq('r + x = −' + p(pe) + ' + ' + p(x1) + ' = ' + p(kZ)) + eq('Y<sub>ZLB</sub> = ' + e2(a * A) + ' − ' + e2(a * d2) + '·' + fmt(kZ, 2) + ' = <b>' + e2(YZ) + '</b>') }));
        preg.push(num('n', 'Aumento de gasto público (ΔG) necesario para volver a Y₀.', dGZ, {
          errores: [{ v: Y0 - YZ, msg: 'Esa es la brecha de producción. El gasto necesario es ΔY/α.' }],
          pista: 'ΔG = (Y₀ − Y<sub>ZLB</sub>) / α.',
          explica: eq('ΔG = ' + fr(e2(Y0) + ' − ' + e2(YZ), e2(a)) + ' = <b>' + e2(dGZ) + '</b>')
        }));
      }
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'IS-LM ampliado en el plano (Y, r)',
          render: function () {
            // IS: r = (Ā − Y/α)/d₂ − x
            var rTop = Math.max(r0, 0) + 4, rBot = Math.min(rN, -pe, 0) - 2;
            var isL = function (x) { var y1 = rBot, y2 = rTop; return [[a * (A - d2 * (y1 + x)), y1], [a * (A - d2 * (y2 + x)), y2]]; };
            var ends = isL(x0).concat(isL(x1)).map(function (q) { return q[0]; }).concat([Y0, Y1, zlb ? YZ : Y0]);
            var xr = MP.rango(ends, 0.04), xmin = Math.max(0, xr[0]), xmax = xr[1];
            var lin = [
              { pts: isL(x0), color: C.cobalt, etiqueta: 'IS (x = ' + p(x0) + ')', etqPt: [a * (A - d2 * (rTop * 0.85 + x0)), rTop * 0.85] },
              { pts: isL(x1), color: C.gold, etiqueta: 'IS′ (x = ' + p(x1) + ')', etqPt: [a * (A - d2 * (rBot * 0.6 + x1)), rBot * 0.6] },
              { pts: [[0, r0], [xmax * 2, r0]], color: C.crimson, w: 2, etiqueta: 'LM: r = ' + p(r0), etqPt: [1e9, r0] },
              { pts: [[0, rN], [xmax * 2, rN]], color: C.teal, w: 2, dash: '7 5', etiqueta: "LM′: r = " + p(rN), etqPt: [1e9, rN] }
            ];
            var pts = [{ x: Y0, y: r0, etiqueta: 'E₀', color: C.navy }, { x: Y1, y: r0, etiqueta: 'E₁', color: C.gold }, { x: Y0, y: rN, etiqueta: 'E₂', color: C.teal }];
            if (zlb) lin.push({ pts: [[0, -pe], [xmax * 2, -pe]], color: C.slate, w: 1.6, dash: '3 4', etiqueta: 'i = 0 → r = ' + p(-pe), etqPt: [-1e9, -pe] });
            return MP.grafico({
              titulo: 'IS-LM ampliado', x: [xmin, xmax], y: [rBot, rTop], xlab: 'Producción, Y', ylab: 'r (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); }, lineas: lin, puntos: pts
            });
          },
          nota: 'La prima de riesgo desplaza la IS a la izquierda (E₀ → E₁). Para volver a Y₀ el banco central debe bajar el tipo real hasta r′ (E₂).' + (zlb ? ' Aquí r′ exige un tipo nominal negativo: la línea gris marca el suelo que impone i = 0.' : '')
        }
      };
    }
  });

  /* =====================================================================
     11 · Balance bancario y apalancamiento
     ===================================================================== */
  MP.registrar('epd3', {
    id: 'apalancamiento', icono: '🏛️', sesion: 'S10',
    titulo: 'Balance bancario y apalancamiento',
    resumen: 'Cómo una pérdida pequeña en el activo destruye capital y obliga a reducir el crédito.',
    generar: function (R) {
      var K0 = R.int(6, 20), lev0 = R.elegir([10, 12, 15, 20, 25]);
      var A0 = K0 * lev0;
      var Rv = R2(A0 * R.paso(0.05, 0.1, 0.01), 0), Bo = R2(A0 * R.paso(0.15, 0.3, 0.05), 0), Lo = A0 - Rv - Bo;
      var D = A0 - K0;
      var L = Math.round(K0 * R.paso(0.3, 0.8, 0.1));
      if (L < 1 || L >= K0) return null;
      var A1 = A0 - L, K1 = K0 - L, lev1 = A1 / K1;
      var Lmax = R.elegir([10, 12, 15, 20].filter(function (x) { return x <= lev0; }));
      if (!Lmax || Lmax * K1 >= A1 || lev1 > 60) return null;
      var esc = R.prob(0.65) ? 'desapalancar' : 'recapitalizar';
      var Amax = Lmax * K1, red = A1 - Amax, Knec = A1 / Lmax - K1;
      var enun = '<p>Un banco comercial presenta el siguiente balance (en M€):</p>' +
        '<table class="tabla balance"><thead><tr><th>Activo</th><th></th><th>Pasivo y capital</th><th></th></tr></thead><tbody>' +
        '<tr><td>Reservas en el banco central</td><td>' + e0(Rv) + '</td><td>Depósitos</td><td>' + e0(D) + '</td></tr>' +
        '<tr><td>Bonos del Tesoro</td><td>' + e0(Bo) + '</td><td>Capital propio</td><td>' + e0(K0) + '</td></tr>' +
        '<tr><td>Préstamos e hipotecas</td><td>' + e0(Lo) + '</td><td></td><td></td></tr>' +
        '<tr class="tot"><td>Total activo</td><td>' + e0(A0) + '</td><td>Total</td><td>' + e0(A0) + '</td></tr></tbody></table>';
      var preg = [
        num('a', 'Ratio de apalancamiento inicial (Activo / Capital).', lev0, {
          unidad: 'x', errores: [{ v: D / K0, msg: 'El apalancamiento se mide con el activo total, no con los depósitos.' }, { v: K0 / A0, msg: 'Eso es la ratio de capital. El apalancamiento es su inversa.' }],
          pista: 'Apalancamiento = Activo / Capital.',
          explica: eq('Apalancamiento = ' + fr(e0(A0), e0(K0)) + ' = <b>' + fmt(lev0, 2) + 'x</b>') + '<p>Por cada euro de capital, el banco mantiene ' + fmt(lev0, 0) + ' euros de activos.</p>'
        }),
        num('b', 'Ratio de capital sobre activos, en %.', K0 / A0 * 100, { unidad: '%', pista: 'Capital / Activo × 100.',
          explica: eq(fr(e0(K0), e0(A0)) + ' × 100 = <b>' + fmt(K0 / A0 * 100, 2) + '%</b>') }),
        { tipo: 'sep', html: '<p>Los impagos de la cartera de préstamos generan <b>pérdidas de ' + e0(L) + ' M€</b>. Los depósitos no cambian.</p>' },
        num('c', 'Nuevo activo total.', A1, { dec: 0, pista: 'Las pérdidas reducen el valor de los préstamos.', explica: eq('A₁ = ' + e0(A0) + ' − ' + e0(L) + ' = <b>' + e0(A1) + '</b>') }),
        num('d', 'Nuevo capital propio.', K1, {
          dec: 0, errores: [{ v: K0, msg: 'Las pérdidas las absorben los accionistas: el capital es la diferencia entre activo y depósitos.' }],
          pista: 'Capital = Activo − Depósitos.',
          explica: eq('K₁ = ' + e0(A1) + ' − ' + e0(D) + ' = <b>' + e0(K1) + '</b>') +
            '<p>Una caída del activo del ' + fmt(L / A0 * 100, 1) + '% ha destruido el ' + fmt(L / K0 * 100, 1) + '% del capital.</p>'
        }),
        num('e', 'Nuevo ratio de apalancamiento.', lev1, { unidad: 'x', pista: 'A₁ / K₁.',
          explica: eq(fr(e0(A1), e0(K1)) + ' = <b>' + fmt(lev1, 2) + 'x</b>') + '<p>Ratio de capital: ' + fmt(K1 / A1 * 100, 2) + '%.</p>' }),
        { tipo: 'sep', html: '<p>El supervisor exige un apalancamiento máximo de <b>' + Lmax + 'x</b>.' + (esc === 'desapalancar' ? ' En plena desconfianza, el banco no puede captar capital nuevo.' : ' El banco quiere mantener el tamaño de su balance.') + '</p>' }
      ];
      if (esc === 'desapalancar') {
        preg.push(num('f', 'Activo máximo que puede mantener el banco.', Amax, { dec: 0,
          errores: [{ v: Lmax * K0, msg: 'Usa el capital que le queda tras las pérdidas (' + e0(K1) + '), no el inicial.' }],
          pista: 'Activo máximo = apalancamiento máximo × capital disponible.',
          explica: eq('A<sub>máx</sub> = ' + Lmax + ' × ' + e0(K1) + ' = <b>' + e0(Amax) + '</b>') }));
        preg.push(num('g', 'Reducción obligatoria del balance (en M€).', red, { dec: 0, pista: 'A₁ − A<sub>máx</sub>.',
          explica: eq('Reducción = ' + e0(A1) + ' − ' + e0(Amax) + ' = <b>' + e0(red) + ' M€</b>') +
            '<p>Una pérdida de ' + e0(L) + ' M€ obliga a recortar ' + e0(red) + ' M€ de activos (' + fmt(red / L, 1) + ' veces la pérdida): el banco deja de renovar créditos y vende activos. Es el <i>credit crunch</i> que eleva la prima de riesgo de toda la economía.</p>' }));
        preg.push(num('h', '¿Qué porcentaje de su activo debe reducir?', red / A1 * 100, { unidad: '%', pista: 'Reducción / A₁ × 100.',
          explica: eq(fr(e0(red), e0(A1)) + ' × 100 = <b>' + fmt(red / A1 * 100, 2) + '%</b>') }));
      } else {
        preg.push(num('f', 'Capital necesario para cumplir con ' + Lmax + 'x sin reducir el activo.', A1 / Lmax, {
          pista: 'K necesario = A₁ / ' + Lmax + '.', explica: eq('K<sub>nec</sub> = ' + fr(e0(A1), Lmax) + ' = <b>' + e2(A1 / Lmax) + '</b>') }));
        preg.push(num('g', 'Ampliación de capital que debe captar (en M€).', Knec, {
          errores: [{ v: L, msg: 'Reponer solo lo perdido no basta si el límite es más estricto que el apalancamiento inicial; calcula K<sub>nec</sub> − K₁.' }],
          pista: 'K<sub>nec</sub> − K₁.',
          explica: eq('Ampliación = ' + e2(A1 / Lmax) + ' − ' + e0(K1) + ' = <b>' + e2(Knec) + ' M€</b>') +
            '<p>Si no logra captarlo, la alternativa es reducir el balance en ' + e0(red) + ' M€.</p>' }));
      }
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'El balance antes y después',
          render: function () {
            var gr = [
              { etiqueta: 'Inicial', sub: fmt(lev0, 1) + 'x', pilas: [{ v: D, color: C.cobalt, etiqueta: 'Depósitos' }, { v: K0, color: C.gold, etiqueta: 'K' }] },
              { etiqueta: 'Tras pérdidas', sub: fmt(lev1, 1) + 'x', pilas: [{ v: D, color: C.cobalt, etiqueta: 'Depósitos' }, { v: K1, color: C.gold, etiqueta: 'K' }] }
            ];
            if (esc === 'desapalancar') gr.push({ etiqueta: 'Desapalancado', sub: Lmax + 'x', pilas: [{ v: Amax - K1, color: C.cobalt, etiqueta: 'Depósitos' }, { v: K1, color: C.gold, etiqueta: 'K' }] });
            else gr.push({ etiqueta: 'Recapitalizado', sub: Lmax + 'x', pilas: [{ v: A1 - A1 / Lmax, color: C.cobalt, etiqueta: 'Deuda' }, { v: A1 / Lmax, color: C.gold, etiqueta: 'K' }] });
            return MP.barras({ titulo: 'Balance bancario', ylab: 'M€ (pasivo + capital = activo)', fmt: function (t) { return fmt(t, 0); }, grupos: gr,
              leyenda: [{ color: C.cobalt, etiqueta: 'Recursos ajenos' }, { color: C.gold, etiqueta: 'Capital propio' }] });
          },
          nota: 'La franja dorada es el colchón que absorbe pérdidas. Cuanto más fina, más apalancado está el banco.'
        }
      };
    }
  });
})();
