/* EPD 2 · Bloque II · Dinero, IS-LM y deuda pública (Sesiones 4–8) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL, R2 = MP.redondear;

  MP.registrarEPD({
    id: 'epd2', num: 2,
    titulo: 'Dinero, IS-LM y deuda pública',
    sesiones: 'Sesiones 4–8',
    resumen: 'Mercado de dinero y bonos, creación de dinero bancario, equilibrio IS-LM, policy mix y sostenibilidad de la deuda.'
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
  function pc(x, d) { return fmt(x * 100, d === undefined ? 2 : d) + '%'; }
  var PARES = [[0.6, 0.15], [0.65, 0.15], [0.6, 0.2], [0.5, 0.1], [0.7, 0.1], [0.55, 0.2], [0.45, 0.05], [0.5, 0.25]];

  // Economía IS-LM común a varias tipologías
  function economia(R) {
    var par = R.elegir(PARES), c1 = par[0], d1 = par[1];
    var e = {
      c1: c1, d1: d1, a: 1 / (1 - c1 - d1),
      c0: R.paso(100, 350, 10), d0: R.paso(80, 250, 10), G: R.paso(150, 450, 10), T: R.paso(100, 400, 10),
      d2: R.elegir([800, 1000, 1200, 1500, 2000]), i: R.paso(0.015, 0.06, 0.005)
    };
    e.A = e.c0 - e.c1 * e.T + e.d0 + e.G;
    e.Y = function (i, A) { return e.a * ((A === undefined ? e.A : A) - e.d2 * i); };
    e.I = function (Y, i) { return e.d0 + e.d1 * Y - e.d2 * i; };
    e.Cn = function (Y) { return e.c0 + e.c1 * (Y - e.T); };
    e.datos = '<div class="datos">C = ' + e0(e.c0) + ' + ' + fmt(c1, 2) + '·(Y − T)<br>I = ' + e0(e.d0) + ' + ' + fmt(d1, 2) + '·Y − ' + e0(e.d2) + '·i<br>G = ' + e0(e.G) + ' &nbsp;·&nbsp; T = ' + e0(e.T) + '</div>';
    return e;
  }
  function ok(e, Y, i) { return Y > e.T && e.I(Y, i) > 25 && Y < 9000; }
  function lineaIS(e, A, imax) { return [[e.a * A, 0], [e.a * (A - e.d2 * imax / 100), imax]]; }

  /* =====================================================================
     5 · Mercado de dinero y precio de los bonos
     ===================================================================== */
  MP.registrar('epd2', {
    id: 'dinero-bonos', icono: '💶', sesion: 'S4',
    titulo: 'Dinero, bonos y tipo de interés',
    resumen: 'Equilibrio del mercado de dinero, precio de un bono y operaciones de mercado abierto.',
    generar: function (R) {
      var a = R.elegir([0.3, 0.4, 0.5]), b = R.elegir([1, 2, 2.5, 3]);
      var $Y = R.paso(1000, 5000, 500), is = R.paso(0.02, 0.08, 0.01);
      if (a - b * is <= 0.05) return null;
      var Ms = R2($Y * (a - b * is), 4), F = R.elegir([100, 100, 1000]);
      var P0 = F / (1 + is);
      var esc = R.prob(0.6) ? 'renta' : 'oma';
      var enun = '<p>Los mercados financieros de una economía se describen con:</p>' +
        '<div class="datos">Renta nominal: $Y = ' + e0($Y) + ' M€<br>Demanda de dinero: M<sup>d</sup> = $Y·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·i)<br>Oferta monetaria: M<sup>s</sup> = ' + fmt(Ms, 2) + ' M€</div>' +
        '<p>Los bonos son a un año y pagan ' + e0(F) + ' € al vencimiento.</p>';
      var preg = [
        num('a', 'Tipo de interés de equilibrio (i*), en %.', is * 100, {
          unidad: '%',
          errores: [{ v: (a - Ms / $Y) * 100, msg: 'Falta dividir entre ' + fmt(b, 1) + ', el coeficiente que acompaña a i.' }, { v: (Ms / $Y) * 100, msg: 'M/$Y es el paréntesis completo (' + fmt(a, 2) + ' − ' + fmt(b, 1) + 'i), no el tipo.' }],
          pista: 'Iguala M<sup>s</sup> = M<sup>d</sup> y despeja i.',
          explica: eq(fmt(Ms, 2) + ' = ' + e0($Y) + '·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + 'i) → ' + fr(fmt(Ms, 2), e0($Y)) + ' = ' + fmt(Ms / $Y, 4) + ' = ' + fmt(a, 2) + ' − ' + fmt(b, 1) + 'i') +
            eq('i* = ' + fr(fmt(a, 2) + ' − ' + fmt(Ms / $Y, 4), fmt(b, 1)) + ' = ' + fmt(is, 4) + ' = <b>' + pc(is) + '</b>')
        }),
        num('b', 'Precio de mercado del bono (P<sub>B</sub>), en €.', P0, {
          unidad: '€',
          errores: [{ v: F * (1 - is), msg: 'P = F·(1 − i) es solo una aproximación. El precio exacto es F/(1 + i).' }, { v: F / is, msg: 'Eso sería el precio de una renta perpetua. El bono es a un año: P = F/(1 + i).' }],
          pista: 'P<sub>B</sub> = ' + e0(F) + ' / (1 + i).',
          explica: eq('P<sub>B</sub> = ' + fr(e0(F), '1 + ' + fmt(is, 2)) + ' = <b>' + fmt(P0, 2, true) + ' €</b>')
        })
      ];
      var resto, p2 = [], g = {};
      if (esc === 'renta') {
        var dY = R.paso(250, 1500, 250) * R.signo(), $Y1 = $Y + dY;
        if ($Y1 < 500) return null;
        var i1 = (a - Ms / $Y1) / b;
        if (i1 <= 0.002 || i1 > 0.15) return null;
        var P1 = F / (1 + i1), M2 = $Y1 * (a - b * is), dM = M2 - Ms;
        resto = '<p>La renta nominal pasa a <b>$Y′ = ' + e0($Y1) + ' M€</b>. Al principio el banco central no interviene (M<sup>s</sup> = ' + fmt(Ms, 2) + ').</p>';
        p2 = [
          num('c', 'Nuevo tipo de interés de equilibrio, en %.', i1 * 100, {
            unidad: '%', pista: 'Repite el equilibrio con la nueva renta nominal.',
            explica: eq(fr(fmt(Ms, 2), e0($Y1)) + ' = ' + fmt(Ms / $Y1, 4) + ' = ' + fmt(a, 2) + ' − ' + fmt(b, 1) + 'i → i′ = <b>' + pc(i1) + '</b>') +
              '<p>' + (dY > 0 ? 'Con más actividad se demanda más dinero para transacciones; con la misma oferta, el tipo sube.' : 'Con menos actividad se demanda menos dinero; con la misma oferta, el tipo baja.') + '</p>'
          }),
          num('d', 'Nuevo precio del bono, en €.', P1, { unidad: '€', pista: 'P = F / (1 + i′).',
            explica: eq('P′<sub>B</sub> = ' + fr(e0(F), '1 + ' + fmt(i1, 4)) + ' = <b>' + fmt(P1, 2, true) + ' €</b>') + '<p>Precio y tipo se mueven en sentido contrario.</p>' }),
          num('e', '¿Cuánto debe variar la oferta monetaria (ΔM) para devolver el tipo a ' + pc(is) + '?', dM, {
            pista: 'Calcula M′ = $Y′·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·i*) y réstale la oferta actual.',
            explica: eq('M′ = ' + e0($Y1) + '·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·' + fmt(is, 2) + ') = ' + e2(M2)) + eq('ΔM = ' + e2(M2) + ' − ' + e2(Ms) + ' = <b>' + e2(dM) + ' M€</b>')
          }),
          opc(R, 'f', '¿Qué operación de mercado abierto debe hacer el banco central?',
            dM > 0 ? 'Comprar bonos por ' + e2(Math.abs(dM)) + ' M€ (OMA expansiva)' : 'Vender bonos por ' + e2(Math.abs(dM)) + ' M€ (OMA contractiva)',
            [dM > 0 ? { t: 'Vender bonos por ' + e2(Math.abs(dM)) + ' M€ (OMA contractiva)', msg: 'Vender bonos retira dinero de la economía. Aquí hace falta más dinero.' } : { t: 'Comprar bonos por ' + e2(Math.abs(dM)) + ' M€ (OMA expansiva)', msg: 'Comprar bonos inyecta dinero. Aquí sobra dinero.' },
              { t: 'Ninguna: el tipo vuelve solo a su nivel', msg: 'Sin intervención el tipo se queda en el nuevo equilibrio.' }],
            { explica: '<p>' + (dM > 0 ? 'Para aumentar la oferta monetaria el banco central compra bonos y paga con dinero nuevo; al demandar bonos, su precio sube hasta ' + fmt(P0, 2, true) + ' €.' : 'Para reducir la oferta monetaria el banco central vende bonos y retira el dinero que recibe; su precio baja hasta ' + fmt(P0, 2, true) + ' €.') + '</p>' })
        ];
        g = { Md: [{ y: $Y, c: C.cobalt, l: 'Md' }, { y: $Y1, c: C.gold, l: 'Md′' }], Ms: [Ms, M2], pts: [[Ms, is], [Ms, i1], [M2, is]] };
      } else {
        var dI = R.paso(0.01, 0.02, 0.005) * R.signo(), it = R2(is + dI, 4);
        if (it < 0.005 || a - b * it <= 0.05) return null;
        var Mt = $Y * (a - b * it), dM2 = Mt - Ms, Pt = F / (1 + it);
        resto = '<p>El banco central quiere situar el tipo de interés en <b>' + pc(it) + '</b> sin que cambie la renta nominal.</p>';
        p2 = [
          num('c', 'Oferta monetaria necesaria (M′), en M€.', Mt, {
            errores: [{ v: $Y * (a - b * it * 100), msg: 'El tipo va en tanto por uno (' + fmt(it, 3) + ').' }],
            pista: 'M′ = $Y·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·i<sub>objetivo</sub>).',
            explica: eq('M′ = ' + e0($Y) + '·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·' + fmt(it, 3) + ') = <b>' + e2(Mt) + ' M€</b>')
          }),
          num('d', 'Variación de la oferta monetaria (ΔM).', dM2, { pista: 'ΔM = M′ − M.', explica: eq('ΔM = ' + e2(Mt) + ' − ' + e2(Ms) + ' = <b>' + e2(dM2) + ' M€</b>') }),
          opc(R, 'e', '¿Qué operación debe realizar?',
            dI < 0 ? 'Comprar bonos (OMA expansiva)' : 'Vender bonos (OMA contractiva)',
            [dI < 0 ? { t: 'Vender bonos (OMA contractiva)', msg: 'Para bajar el tipo hay que aumentar la cantidad de dinero.' } : { t: 'Comprar bonos (OMA expansiva)', msg: 'Para subir el tipo hay que reducir la cantidad de dinero.' }, 'Imprimir billetes y repartirlos a las familias'],
            { explica: '<p>' + (dI < 0 ? 'Bajar el tipo exige más dinero: el banco central compra bonos.' : 'Subir el tipo exige menos dinero: el banco central vende bonos.') + '</p>' }),
          num('f', 'Precio del bono tras la operación, en €.', Pt, { unidad: '€', pista: 'P = F / (1 + i<sub>objetivo</sub>).',
            explica: eq('P<sub>B</sub> = ' + fr(e0(F), '1 + ' + fmt(it, 3)) + ' = <b>' + fmt(Pt, 2, true) + ' €</b>') })
        ];
        g = { Md: [{ y: $Y, c: C.cobalt, l: 'Md' }], Ms: [Ms, Mt], pts: [[Ms, is], [Mt, it]] };
      }
      return {
        enunciado: enun, preguntas: preg.concat([{ tipo: 'sep', html: resto }]).concat(p2),
        grafico: {
          titulo: 'Mercado de dinero',
          render: function () {
            var imax = Math.max.apply(null, g.pts.map(function (p) { return p[1]; })) * 100 * 1.8 + 1;
            var mmax = Math.max.apply(null, g.Ms) * 1.6;
            var lin = g.Md.map(function (m) {
              // i = (a − M/$Y)/b
              return { pts: [[0, a / b * 100], [m.y * a, 0]], color: m.c, etiqueta: m.l, etqPt: [m.y * (a - b * imax * 0.7 / 100), imax * 0.7] };
            });
            g.Ms.forEach(function (M, k) {
              lin.push({ pts: [[M, 0], [M, imax]], color: k ? C.gold : C.crimson, w: 2, dash: k ? '7 5' : null, etiqueta: k ? 'Ms′' : 'Ms', etqPt: [M, imax * 0.95] });
            });
            return MP.grafico({
              titulo: 'Mercado de dinero', x: [0, mmax], y: [0, imax], xlab: 'Dinero, M (M€)', ylab: 'i (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); }, lineas: lin,
              puntos: g.pts.map(function (p, k) { return { x: p[0], y: p[1] * 100, etiqueta: ['A', 'B', 'C'][k], color: [C.navy, C.gold, C.teal][k] }; })
            });
          },
          nota: esc === 'renta' ? 'A: equilibrio inicial. B: más (o menos) renta desplaza la demanda de dinero y mueve el tipo. C: el banco central ajusta la oferta para volver al tipo inicial.' : 'El banco central elige el tipo moviendo la oferta monetaria vertical a lo largo de la demanda de dinero.'
        }
      };
    }
  });

  /* =====================================================================
     6 · Creación de dinero bancario y multiplicador monetario
     ===================================================================== */
  MP.registrar('epd2', {
    id: 'multiplicador-monetario', icono: '🏦', sesion: 'S5',
    titulo: 'Dinero bancario y multiplicador monetario',
    resumen: 'Base monetaria, efectivo, depósitos, reservas y préstamos. Qué pasa si cambian c o θ.',
    generar: function (R) {
      var c = R.elegir([0.1, 0.2, 0.25, 0.4, 0.5]), th = R.elegir([0.05, 0.1, 0.2, 0.25]);
      var H = R.paso(100, 500, 50);
      var den = c + th * (1 - c), m = 1 / den, M = m * H, CU = c * M, D = (1 - c) * M, Rv = th * D, P = D - Rv;
      var esc = R.elegir(['c', 'theta', 'renta']);
      var enun = '<p>La base monetaria de una economía es <b>H = ' + e0(H) + ' M€</b>. El público mantiene en efectivo una proporción <b>c = ' + fmt(c, 2) + '</b> de su dinero y los bancos aplican un coeficiente de reservas <b>θ = ' + fmt(th, 2) + '</b> sobre los depósitos.</p>';
      var preg = [
        num('a', 'Multiplicador monetario (m).', m, {
          dec: 3,
          errores: [{ v: 1 / th, msg: '1/θ sería el multiplicador si nadie guardara efectivo. Con efectivo: m = 1/[c + θ(1 − c)].' }, { v: 1 / (c + th), msg: 'El coeficiente de reservas se aplica solo a los depósitos: θ(1 − c).' }],
          pista: 'm = 1 / [c + θ·(1 − c)].',
          explica: eq('c + θ(1 − c) = ' + fmt(c, 2) + ' + ' + fmt(th, 2) + '·' + fmt(1 - c, 2) + ' = ' + fmt(den, 4)) + eq('m = ' + fr('1', fmt(den, 4)) + ' = <b>' + fmt(m, 3) + '</b>')
        }),
        num('b', 'Oferta monetaria (M = m·H), en M€.', M, { pista: 'M = m · H.', explica: eq('M = ' + fmt(m, 4) + ' × ' + e0(H) + ' = <b>' + e2(M) + ' M€</b>') }),
        num('c', 'Efectivo en manos del público (CU).', CU, { pista: 'CU = c · M.', explica: eq('CU = ' + fmt(c, 2) + ' × ' + e2(M) + ' = <b>' + e2(CU) + '</b>') }),
        num('d', 'Depósitos bancarios (D).', D, { pista: 'D = (1 − c) · M.', explica: eq('D = ' + fmt(1 - c, 2) + ' × ' + e2(M) + ' = <b>' + e2(D) + '</b>') }),
        num('e', 'Reservas bancarias (R).', Rv, {
          errores: [{ v: th * M, msg: 'Las reservas se calculan sobre los depósitos, no sobre M.' }],
          pista: 'R = θ · D.',
          explica: eq('R = ' + fmt(th, 2) + ' × ' + e2(D) + ' = <b>' + e2(Rv) + '</b>') + '<p>Comprobación: CU + R = ' + e2(CU) + ' + ' + e2(Rv) + ' = ' + e2(CU + Rv) + ' = H.</p>'
        }),
        num('f', 'Préstamos concedidos por los bancos.', P, { pista: 'Préstamos = D − R.', explica: eq('Préstamos = ' + e2(D) + ' − ' + e2(Rv) + ' = <b>' + e2(P) + '</b>') })
      ];
      var resto, p2, M2 = M, CU2 = CU, D2 = D, Rv2 = Rv, etq2 = '';
      if (esc === 'c' || esc === 'theta') {
        var c2 = c, th2 = th;
        if (esc === 'c') { c2 = R.elegir([0.05, 0.1, 0.2, 0.3, 0.4].filter(function (x) { return x !== c; })); }
        else { th2 = R.elegir([0.02, 0.05, 0.1, 0.15, 0.2].filter(function (x) { return x !== th; })); }
        var den2 = c2 + th2 * (1 - c2), m2 = 1 / den2;
        M2 = m2 * H; CU2 = c2 * M2; D2 = (1 - c2) * M2; Rv2 = th2 * D2;
        etq2 = esc === 'c' ? 'c′ = ' + fmt(c2, 2) : 'θ′ = ' + fmt(th2, 2);
        resto = esc === 'c'
          ? '<p>Los pagos digitales ' + (c2 < c ? 'se generalizan' : 'pierden peso') + ' y el coeficiente de efectivo pasa a <b>c′ = ' + fmt(c2, 2) + '</b>. La base monetaria no cambia.</p>'
          : '<p>Los bancos ' + (th2 < th ? 'reducen' : 'aumentan') + ' su colchón de reservas hasta <b>θ′ = ' + fmt(th2, 2) + '</b>. La base monetaria no cambia.</p>';
        p2 = [
          num('g', 'Nuevo multiplicador monetario.', m2, { dec: 3, pista: 'Repite la fórmula con el nuevo coeficiente.',
            explica: eq('m′ = ' + fr('1', fmt(c2, 2) + ' + ' + fmt(th2, 2) + '·' + fmt(1 - c2, 2)) + ' = ' + fr('1', fmt(den2, 4)) + ' = <b>' + fmt(m2, 3) + '</b>') }),
          num('h', 'Nueva oferta monetaria, en M€.', M2, { pista: 'M′ = m′ · H.',
            explica: eq('M′ = ' + fmt(m2, 4) + ' × ' + e0(H) + ' = <b>' + e2(M2) + ' M€</b>') + '<p>Variación: ' + e2(M2 - M) + ' M€ (' + fmt((M2 / M - 1) * 100, 1) + '%) con la misma base monetaria.</p>' })
        ];
      } else {
        var a = R.elegir([0.3, 0.4, 0.5]), b = R.elegir([1, 2, 2.5]), it = R.paso(0.01, 0.05, 0.005);
        if (a - b * it <= 0.05) return null;
        var $Y = M / (a - b * it);
        resto = '<p>La demanda de dinero es <b>M<sup>d</sup> = $Y·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·i)</b> y el banco central fija el tipo en <b>' + pc(it) + '</b>.</p>';
        p2 = [
          num('g', 'Renta nominal ($Y) compatible con el equilibrio del mercado de dinero, en M€.', $Y, {
            errores: [{ v: M / (a - b * it * 100), msg: 'El tipo va en tanto por uno (' + fmt(it, 3) + ').' }],
            pista: 'Iguala M = $Y·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·i) y despeja $Y.',
            explica: eq(e2(M) + ' = $Y·(' + fmt(a, 2) + ' − ' + fmt(b, 1) + '·' + fmt(it, 3) + ') = $Y·' + fmt(a - b * it, 4)) + eq('$Y = ' + fr(e2(M), fmt(a - b * it, 4)) + ' = <b>' + e2($Y) + ' M€</b>')
          })
        ];
      }
      return {
        enunciado: enun, preguntas: preg.concat([{ tipo: 'sep', html: resto }]).concat(p2),
        grafico: {
          titulo: 'Base monetaria y oferta de dinero',
          render: function () {
            var gr = [
              { etiqueta: 'Base H', sub: 'CU + R', pilas: [{ v: CU, color: C.teal, etiqueta: 'CU' }, { v: Rv, color: C.gold, etiqueta: 'R' }] },
              { etiqueta: 'Dinero M', sub: 'CU + D', pilas: [{ v: CU, color: C.teal, etiqueta: 'CU' }, { v: D, color: C.cobalt, etiqueta: 'D' }] }
            ];
            if (etq2) {
              gr.push({ etiqueta: 'Base H', sub: etq2, pilas: [{ v: CU2, color: C.teal, etiqueta: 'CU' }, { v: Rv2, color: C.gold, etiqueta: 'R' }] });
              gr.push({ etiqueta: 'Dinero M′', sub: etq2, pilas: [{ v: CU2, color: C.teal, etiqueta: 'CU' }, { v: D2, color: C.cobalt, etiqueta: 'D' }] });
            }
            return MP.barras({ titulo: 'Base monetaria y oferta de dinero', ylab: 'M€', fmt: function (t) { return fmt(t, 0); }, grupos: gr,
              leyenda: [{ color: C.teal, etiqueta: 'Efectivo (CU)' }, { color: C.gold, etiqueta: 'Reservas (R)' }, { color: C.cobalt, etiqueta: 'Depósitos (D)' }] });
          },
          nota: 'La base monetaria es la misma; lo que cambia es cuánto dinero bancario se construye encima de ella.'
        }
      };
    }
  });

  /* =====================================================================
     7 · Equilibrio IS-LM e inventarios
     ===================================================================== */
  MP.registrar('epd2', {
    id: 'islm-inventarios', icono: '📦', sesion: 'S6',
    titulo: 'Equilibrio IS-LM e inventarios',
    resumen: 'Equilibrio conjunto con la LM horizontal y ajuste de la producción vía existencias no deseadas.',
    generar: function (R) {
      var e = economia(R), i = e.i;
      var Y = e.Y(i);
      if (e.A <= 0 || !ok(e, Y, i)) return null;
      var Cc = e.Cn(Y), I = e.I(Y, i);
      var dev = R.paso(100, 400, 20) * R.signo(), Y1 = Y + dev;
      if (Y1 <= e.T) return null;
      var Z1 = e.A + (e.c1 + e.d1) * Y1 - e.d2 * i, Is = Y1 - Z1;
      var enun = '<p>Una economía cerrada se describe con:</p>' + e.datos + '<p>El banco central fija el tipo de interés en <b>ī = ' + pc(i) + '</b> (LM horizontal).</p>';
      var preg = [
        num('a', 'Multiplicador de bienes (m<sub>IS</sub>).', e.a, {
          errores: [{ v: 1 / (1 - e.c1), msg: 'Incluye también d₁: m<sub>IS</sub> = 1/(1 − c₁ − d₁).' }],
          pista: 'm<sub>IS</sub> = 1/(1 − c₁ − d₁).',
          explica: eq('m<sub>IS</sub> = ' + fr('1', '1 − ' + fmt(e.c1, 2) + ' − ' + fmt(e.d1, 2)) + ' = <b>' + e2(e.a) + '</b>')
        }),
        num('b', 'Gasto autónomo (A₀).', e.A, { errores: [{ v: e.c0 + e.d0 + e.G, msg: 'Falta restar c₁·T.' }], pista: 'A₀ = c₀ − c₁T + d₀ + G.',
          explica: eq('A₀ = ' + e0(e.c0) + ' − ' + fmt(e.c1, 2) + '·' + e0(e.T) + ' + ' + e0(e.d0) + ' + ' + e0(e.G) + ' = <b>' + e2(e.A) + '</b>') + eq('IS: Y = ' + e2(e.a * e.A) + ' − ' + e2(e.a * e.d2) + '·i') }),
        num('c', 'Producción de equilibrio (Y*).', Y, {
          errores: [{ v: e.Y(i * 100), msg: 'El tipo va en tanto por uno (' + fmt(i, 3) + ').' }],
          pista: 'Sustituye ī en la IS: Y* = m<sub>IS</sub>·(A₀ − d₂·ī).',
          explica: eq('Y* = ' + e2(e.a) + '·(' + e2(e.A) + ' − ' + e0(e.d2) + '·' + fmt(i, 3) + ') = <b>' + e2(Y) + '</b>')
        }),
        num('d', 'Consumo de equilibrio (C*).', Cc, { pista: 'C* = c₀ + c₁(Y* − T).', explica: eq('C* = ' + e0(e.c0) + ' + ' + fmt(e.c1, 2) + '·' + e2(Y - e.T) + ' = <b>' + e2(Cc) + '</b>') }),
        num('e', 'Inversión de equilibrio (I*).', I, { pista: 'I* = d₀ + d₁Y* − d₂ī.',
          explica: eq('I* = ' + e0(e.d0) + ' + ' + fmt(e.d1, 2) + '·' + e2(Y) + ' − ' + e0(e.d2) + '·' + fmt(i, 3) + ' = <b>' + e2(I) + '</b>') + '<p>Comprobación: ' + e2(Cc) + ' + ' + e2(I) + ' + ' + e0(e.G) + ' = ' + e2(Cc + I + e.G) + ' = Y*.</p>' }),
        { tipo: 'sep', html: '<p>Supón ahora que, de forma transitoria, las empresas producen <b>Y₁ = ' + e2(Y1) + '</b> con el tipo en ' + pc(i) + '.</p>' },
        num('f', 'Demanda de bienes a ese nivel de producción (Z₁).', Z1, {
          errores: [{ v: e.A + e.c1 * Y1 - e.d2 * i, msg: 'La inversión también depende de las ventas: incluye d₁·Y₁.' }],
          pista: 'Z₁ = A₀ + (c₁ + d₁)·Y₁ − d₂·ī.',
          explica: eq('Z₁ = ' + e2(e.A) + ' + ' + fmt(e.c1 + e.d1, 2) + '·' + e2(Y1) + ' − ' + e0(e.d2) + '·' + fmt(i, 3) + ' = <b>' + e2(Z1) + '</b>')
        }),
        num('g', 'Variación no deseada de existencias (I<sub>s</sub> = Y₁ − Z₁).', Is, {
          errores: [{ v: Z1 - Y1, msg: 'Revisa el orden: I<sub>s</sub> = Y − Z (producción menos demanda).' }],
          pista: 'Lo que se produce y no se vende se acumula en el almacén.',
          explica: eq('I<sub>s</sub> = ' + e2(Y1) + ' − ' + e2(Z1) + ' = <b>' + e2(Is) + '</b>') + '<p>Fíjate: I<sub>s</sub> = (1 − c₁ − d₁)·(Y₁ − Y*) = ' + fmt(1 - e.c1 - e.d1, 2) + '·' + e2(dev) + '.</p>'
        }),
        opc(R, 'h', '¿Cómo reaccionan las empresas?',
          Is > 0 ? 'Reducen la producción hasta Y*, porque se les acumulan existencias' : 'Aumentan la producción hasta Y*, porque se vacían sus almacenes',
          [Is > 0 ? { t: 'Aumentan la producción, porque la demanda es alta', msg: 'Si I<sub>s</sub> > 0 la demanda es menor que la producción.' } : { t: 'Reducen la producción, porque sobran existencias', msg: 'Si I<sub>s</sub> < 0 la demanda supera a la producción.' },
            { t: 'El banco central sube el tipo para corregir el desequilibrio', msg: 'Con la LM horizontal el tipo no cambia; el ajuste lo hacen las cantidades.' }],
          { explica: '<p>La economía se mueve en horizontal, a lo largo de la LM, desde Y₁ = ' + e2(Y1) + ' hasta Y* = ' + e2(Y) + ': un ajuste de ' + e2(Y - Y1) + '.</p>' })
      ];
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'IS-LM y ajuste por inventarios',
          render: function () {
            var imax = i * 100 * 1.7 + 1, xr = MP.rango([Y, Y1, e.a * e.A, e.a * (e.A - e.d2 * imax / 100)], 0.08), xmax = xr[1];
            return MP.grafico({
              titulo: 'IS-LM', x: xr, y: [0, imax], xlab: 'Producción, Y', ylab: 'i (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: lineaIS(e, e.A, imax), color: C.cobalt, etiqueta: 'IS', etqPt: [e.a * (e.A - e.d2 * imax * 0.85 / 100), imax * 0.85] },
                { pts: [[0, i * 100], [xmax, i * 100]], color: C.crimson, w: 2, etiqueta: 'LM', etqPt: [-1e9, i * 100] }
              ],
              flechas: [{ de: [Y1, i * 100 + imax * 0.06], a: [Y + (Y1 - Y) * 0.15, i * 100 + imax * 0.06], color: C.gold }],
              puntos: [{ x: Y, y: i * 100, etiqueta: 'E', color: C.navy }, { x: Y1, y: i * 100, etiqueta: 'Y₁', color: C.gold, guias: false }]
            });
          },
          nota: (Is > 0 ? 'A la derecha de la IS la producción supera a la demanda: se acumulan existencias y las empresas producen menos.' : 'A la izquierda de la IS la demanda supera a la producción: caen las existencias y las empresas producen más.')
        }
      };
    }
  });

  /* =====================================================================
     8 · Policy mix
     ===================================================================== */
  MP.registrar('epd2', {
    id: 'policy-mix', icono: '⚖️', sesion: 'S7',
    titulo: 'Combinación de políticas (policy mix)',
    resumen: 'Efectos de la política fiscal con el tipo fijo y el ajuste monetario que neutraliza el impacto sobre la producción.',
    generar: function (R) {
      var e = economia(R), i1 = e.i;
      var Y1 = e.Y(i1);
      if (e.A <= 0 || !ok(e, Y1, i1)) return null;
      var I1 = e.I(Y1, i1), C1 = e.Cn(Y1), SP1 = e.T - e.G;
      var esc = R.prob(0.6) ? 'austeridad' : 'expansion';
      var dG = R.paso(10, 60, 10) * (esc === 'austeridad' ? -1 : 1);
      var dY = e.a * dG, Yp = Y1 + dY, Ip = I1 + e.d1 * dY;
      var di = dG / e.d2, i2 = i1 + di;
      if (i2 < 0.0025 || Math.abs(di) > 0.03 || !ok(e, Yp, i1)) return null;
      var I2 = I1 - e.d2 * di, SP2 = e.T - (e.G + dG);
      if (I2 <= 25) return null;
      var enun = '<p>Una economía cerrada (en M€) se describe con:</p>' + e.datos + '<p>El banco central fija el tipo de interés oficial en <b>ī = ' + pc(i1) + '</b>.</p>';
      var preg = [
        num('a', 'Producción de equilibrio inicial (Y₁*).', Y1, {
          errores: [{ v: e.Y(i1 * 100), msg: 'El tipo va en tanto por uno (' + fmt(i1, 3) + ').' }, { v: (e.A - e.d2 * i1) / (1 - e.c1), msg: 'Usa m<sub>IS</sub> = 1/(1 − c₁ − d₁).' }],
          pista: 'Y = m<sub>IS</sub>·(A₀ − d₂·ī), con A₀ = c₀ − c₁T + d₀ + G.',
          explica: eq('m<sub>IS</sub> = ' + fr('1', fmt(1 - e.c1 - e.d1, 2)) + ' = ' + e2(e.a) + ' &nbsp;·&nbsp; A₀ = ' + e2(e.A)) + eq('Y₁* = ' + e2(e.a) + '·(' + e2(e.A) + ' − ' + e0(e.d2) + '·' + fmt(i1, 3) + ') = <b>' + e2(Y1) + '</b>')
        }),
        num('b', 'Inversión inicial (I₁).', I1, { pista: 'I = d₀ + d₁Y − d₂ī.', explica: eq('I₁ = ' + e0(e.d0) + ' + ' + fmt(e.d1, 2) + '·' + e2(Y1) + ' − ' + e0(e.d2) + '·' + fmt(i1, 3) + ' = <b>' + e2(I1) + '</b>') + '<p>Consumo: C₁ = ' + e2(C1) + '. Saldo público: T − G = ' + e0(SP1) + '.</p>' }),
        { tipo: 'sep', html: esc === 'austeridad'
          ? '<p>Para cumplir las reglas fiscales, el Gobierno recorta el gasto: <b>ΔG = ' + e0(dG) + '</b>. De momento el banco central no toca el tipo.</p>'
          : '<p>El Gobierno aprueba un plan de gasto: <b>ΔG = +' + e0(dG) + '</b>. De momento el banco central no toca el tipo.</p>' },
        num('c', 'Nueva producción (Y′) con el tipo sin cambios.', Yp, {
          errores: [{ v: Y1 + dG, msg: 'Falta el efecto multiplicador: ΔY = m<sub>IS</sub>·ΔG.' }],
          pista: 'ΔY = m<sub>IS</sub>·ΔG.',
          explica: eq('ΔY = ' + e2(e.a) + '·(' + e0(dG) + ') = ' + e2(dY)) + eq("Y′ = <b>" + e2(Yp) + '</b>')
        }),
        num('d', 'Nueva inversión (I′) con el tipo sin cambios.', Ip, {
          errores: [{ v: I1, msg: 'Aunque el tipo no cambie, la inversión responde a las ventas: ΔI = d₁·ΔY.' }],
          pista: 'ΔI = d₁·ΔY − d₂·Δi, con Δi = 0.',
          explica: eq('ΔI = ' + fmt(e.d1, 2) + '·(' + e2(dY) + ') = ' + e2(e.d1 * dY)) + eq("I′ = <b>" + e2(Ip) + '</b>') +
            '<p>' + (esc === 'austeridad' ? 'La austeridad sin apoyo monetario reduce las ventas y la inversión.' : 'Con el tipo fijo, el gasto público arrastra a la inversión: no hay expulsión.') + '</p>'
        }),
        { tipo: 'sep', html: '<p>El banco central decide ajustar el tipo para que la producción se mantenga en su nivel inicial (Y = Y₁*).</p>' },
        num('e', 'Variación necesaria del tipo de interés (Δi), en puntos porcentuales.', di * 100, {
          unidad: 'pp',
          errores: [{ v: -di * 100, msg: 'Revisa el sentido: ' + (dG < 0 ? 'para compensar un recorte hay que abaratar el crédito.' : 'para compensar un aumento del gasto hay que encarecer el crédito.') }, { v: di * 100 * e.a, msg: 'El multiplicador afecta igual a G y a d₂·i, así que se cancela: Δi = ΔG/d₂.' }],
          pista: 'ΔY = m<sub>IS</sub>·(ΔG − d₂·Δi) = 0 → Δi = ΔG/d₂.',
          explica: eq('Δi = ' + fr(e0(dG), e0(e.d2)) + ' = ' + fmt(di, 4) + ' = <b>' + fmt(di * 100, 2) + ' pp</b> (' + fmt(di * 10000, 0) + ' pb)') + '<p>Nuevo tipo oficial: ' + pc(i2) + '.</p>'
        }),
        num('f', 'Inversión final (I₂).', I2, {
          errores: [{ v: Ip, msg: 'Con Y constante, la inversión solo cambia por el tipo: ΔI = −d₂·Δi.' }],
          pista: 'Como ΔY = 0, ΔI = −d₂·Δi.',
          explica: eq('ΔI = −' + e0(e.d2) + '·(' + fmt(di, 4) + ') = ' + e2(-e.d2 * di)) + eq('I₂ = <b>' + e2(I2) + '</b>')
        }),
        num('g', 'Saldo presupuestario final (T − G).', SP2, { dec: 0, pista: 'T − (G + ΔG).', explica: eq('T − G₂ = ' + e0(e.T) + ' − ' + e0(e.G + dG) + ' = <b>' + e0(SP2) + '</b>') }),
        opc(R, 'h', '¿Qué ha ocurrido con la composición de la demanda?',
          esc === 'austeridad' ? 'Menos gasto público y más inversión privada con la misma producción' : 'Más gasto público y menos inversión privada con la misma producción (expulsión)',
          [esc === 'austeridad' ? { t: 'Ha caído la producción porque el recorte domina', msg: 'El banco central compensa justo lo necesario para que Y no cambie.' } : { t: 'Ha aumentado la producción gracias al gasto', msg: 'El banco central sube el tipo justo lo necesario para que Y no cambie.' },
            { t: 'Nada: G e I no varían', msg: 'G cambia por la decisión del Gobierno, e I por el nuevo tipo.' }],
          { explica: '<p>' + (esc === 'austeridad' ? 'El policy mix reduce el déficit (de ' + e0(SP1) + ' a ' + e0(SP2) + ') sin perder producción y desplaza la demanda hacia la inversión (+' + e2(I2 - I1) + ').' : 'La inversión cae exactamente lo que sube el gasto (' + e2(I2 - I1) + '): expulsión completa porque el banco central impide que crezca la producción.') + '</p>' })
      ];
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'Policy mix en el plano IS-LM',
          render: function () {
            var imax = Math.max(i1, i2) * 100 * 1.9 + 1, A2 = e.A + dG;
            var xr = MP.rango([e.a * e.A, e.a * A2, Y1, Yp, e.a * (e.A - e.d2 * imax / 100), e.a * (A2 - e.d2 * imax / 100)], 0.06), xmax = xr[1];
            return MP.grafico({
              titulo: 'Policy mix', x: xr, y: [0, imax], xlab: 'Producción, Y', ylab: 'i (%)',
              fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 1); },
              lineas: [
                { pts: lineaIS(e, e.A, imax), color: C.cobalt, etiqueta: 'IS', etqPt: [e.a * (e.A - e.d2 * imax * 0.9 / 100), imax * 0.9] },
                { pts: lineaIS(e, A2, imax), color: C.gold, etiqueta: 'IS′', etqPt: [e.a * (A2 - e.d2 * imax * 0.75 / 100), imax * 0.75] },
                { pts: [[0, i1 * 100], [xmax, i1 * 100]], color: C.crimson, w: 2, etiqueta: 'LM', etqPt: [xmax, i1 * 100] },
                { pts: [[0, i2 * 100], [xmax, i2 * 100]], color: C.teal, w: 2, dash: '7 5', etiqueta: 'LM′', etqPt: [xmax, i2 * 100] }
              ],
              puntos: [{ x: Y1, y: i1 * 100, etiqueta: 'E₁', color: C.navy }, { x: Yp, y: i1 * 100, etiqueta: "E′", color: C.gold }, { x: Y1, y: i2 * 100, etiqueta: 'E₂', color: C.teal }]
            });
          },
          nota: 'E₁ → E′: la política fiscal desplaza la IS con el tipo fijo. E′ → E₂: el banco central mueve la LM y la producción vuelve a Y₁*.'
        }
      };
    }
  });

  /* =====================================================================
     9 · Sostenibilidad de la deuda pública
     ===================================================================== */
  MP.registrar('epd2', {
    id: 'deuda', icono: '🧾', sesion: 'S8',
    titulo: 'Sostenibilidad de la deuda pública',
    resumen: 'Déficit primario, efecto bola de nieve (r − g)·b y superávit que estabiliza la ratio de deuda.',
    generar: function (R) {
      var b0 = R.paso(0.6, 1.2, 0.05), g = R.paso(0, 0.03, 0.005), Y = R.elegir([1000, 1000, 1500, 2000]);
      var nominal = R.prob(0.35), i = 0, pi = 0, r;
      if (nominal) { i = R.paso(0.02, 0.06, 0.005); pi = R.paso(0.01, 0.03, 0.005); r = R2(i - pi, 4); }
      else r = R.paso(0.01, 0.05, 0.005);
      var tasaT = R.paso(0.35, 0.45, 0.01), dd = R.paso(-0.015, 0.04, 0.005);
      if (dd === 0) return null;
      var T = R2(tasaT * Y, 0), Gp = T + dd * Y, d = (Gp - T) / Y;
      if (Math.abs(r - g) < 0.001) return null;
      var bola = (r - g) * b0, db = bola + d, b1 = b0 + db, s = (r - g) * b0, ajuste = s + d;
      var enun = '<p>Un país europeo presenta los siguientes datos (cifras en M€):</p><div class="datos">Deuda pública inicial: b₀ = ' + pc(b0, 0) + ' del PIB<br>' +
        (nominal ? 'Tipo de interés nominal medio de la deuda: i = ' + pc(i, 1) + ' &nbsp;·&nbsp; Inflación: π = ' + pc(pi, 1) : 'Tipo de interés real medio de la deuda: r = ' + pc(r, 1)) +
        '<br>Crecimiento del PIB real: g = ' + pc(g, 1) + '<br>Gasto público (sin intereses): G = ' + e0(Gp) + ' &nbsp;·&nbsp; Impuestos: T = ' + e0(T) + ' &nbsp;·&nbsp; PIB: Y = ' + e0(Y) + '</div>' +
        '<p>Expresa los ratios en % del PIB. Un superávit primario es un déficit negativo.</p>';
      var preg = [];
      if (nominal) preg.push(num('r', 'Tipo de interés real (r), en %.', r * 100, {
        unidad: '%', errores: [{ v: (i + pi) * 100, msg: 'El tipo real descuenta la inflación: r ≈ i − π.' }], pista: 'Ecuación de Fisher: r ≈ i − π.',
        explica: eq('r ≈ ' + pc(i, 1) + ' − ' + pc(pi, 1) + ' = <b>' + pc(r, 1) + '</b>')
      }));
      preg = preg.concat([
        num('a', 'Déficit primario en M€ (G − T).', Gp - T, { dec: 0, pista: 'Déficit primario = gasto sin intereses − impuestos.',
          explica: eq('G − T = ' + e0(Gp) + ' − ' + e0(T) + ' = <b>' + e0(Gp - T) + ' M€</b>') + (Gp < T ? '<p>Es negativo: hay superávit primario.</p>' : '') }),
        num('b', 'Déficit primario en % del PIB (d).', d * 100, { unidad: '%', pista: 'd = (G − T)/Y.',
          explica: eq('d = ' + fr(e0(Gp - T), e0(Y)) + ' = <b>' + pc(d) + '</b>') }),
        num('c', 'Efecto bola de nieve (r − g)·b₀, en puntos del PIB.', bola * 100, {
          unidad: 'pp', errores: [{ v: (r - g) * 100, msg: 'El diferencial r − g actúa sobre la deuda acumulada: multiplícalo por b₀.' }],
          pista: '(r − g)·b₀.',
          explica: eq('(r − g)·b₀ = (' + pc(r, 1) + ' − ' + pc(g, 1) + ')·' + fmt(b0, 2) + ' = <b>' + fmt(bola * 100, 2) + ' pp</b>') +
            '<p>' + (r > g ? 'Los intereses reales superan al crecimiento: la deuda tiende a crecer por inercia.' : 'El crecimiento supera al tipo real: la ratio tiende a bajar por inercia.') + '</p>'
        }),
        num('d', 'Variación de la ratio de deuda en un año (Δb), en puntos del PIB.', db * 100, {
          unidad: 'pp', errores: [{ v: (r - g + d) * 100, msg: 'Multiplica (r − g) por b₀ antes de sumar el déficit primario.' }, { v: (bola - d) * 100, msg: 'El déficit primario suma deuda: Δb = (r − g)b₀ + d.' }],
          pista: 'Δb = (r − g)·b₀ + d.',
          explica: eq('Δb = ' + fmt(bola * 100, 2) + ' + ' + fmt(d * 100, 2) + ' = <b>' + fmt(db * 100, 2) + ' pp</b>')
        }),
        num('e', 'Ratio de deuda al final del año (b₁), en % del PIB.', b1 * 100, { unidad: '%', pista: 'b₁ = b₀ + Δb.',
          explica: eq('b₁ = ' + pc(b0, 0) + ' + ' + fmt(db * 100, 2) + ' = <b>' + pc(b1) + '</b>') }),
        num('f', 'Superávit primario que estabiliza la deuda en ' + pc(b0, 0) + ' (s*), en % del PIB.', s * 100, {
          unidad: '%', errores: [{ v: (r - g) * 100, msg: 'Falta multiplicar por la ratio de deuda: s* = (r − g)·b.' }],
          pista: 'Δb = 0 ⇔ s* = (r − g)·b.',
          explica: eq('s* = (' + pc(r, 1) + ' − ' + pc(g, 1) + ')·' + fmt(b0, 2) + ' = <b>' + pc(s) + '</b>') + (s < 0 ? '<p>Es negativo: con r &lt; g el país podría mantener un déficit primario de ' + pc(-s) + ' sin que suba la ratio.</p>' : '')
        }),
        num('g', 'Superávit primario de estabilización en M€.', s * Y, { pista: 's* · Y.', explica: eq(fmt(s, 4) + ' × ' + e0(Y) + ' = <b>' + e2(s * Y) + ' M€</b>') }),
        num('h', 'Ajuste fiscal necesario respecto a la situación actual, en puntos del PIB.', ajuste * 100, {
          unidad: 'pp', errores: [{ v: (s - d) * 100, msg: 'Partes de un déficit (superávit negativo): ajuste = s* − (−d) = s* + d.' }],
          pista: 'Pasa de un saldo primario de −d a uno de s*: ajuste = s* + d.',
          explica: eq('Ajuste = ' + pc(s) + ' − (' + pc(-d) + ') = <b>' + fmt(ajuste * 100, 2) + ' pp</b> ≈ ' + e2(ajuste * Y) + ' M€') +
            '<p>' + (ajuste > 0 ? 'Hace falta una consolidación (menos gasto o más ingresos).' : 'La política actual ya basta para que la deuda no suba.') + '</p>'
        })
      ]);
      return {
        enunciado: enun, preguntas: preg,
        grafico: {
          titulo: 'Trayectoria de la deuda a 10 años',
          render: function () {
            var p1 = [], p2 = [], bt = b0;
            for (var t = 0; t <= 10; t++) { p1.push([t, bt * 100]); p2.push([t, b0 * 100]); bt = bt + (r - g) * bt + d; }
            var vals = p1.map(function (p) { return p[1]; }).concat([b0 * 100]);
            var yr = MP.rango(vals, 0.25);
            return MP.grafico({
              titulo: 'Trayectoria de la deuda', x: [0, 10], y: [Math.max(0, yr[0]), yr[1]], xlab: 'Años', ylab: 'Deuda (% PIB)',
              ticksX: [0, 2, 4, 6, 8, 10], fmtX: function (t) { return fmt(t, 0); }, fmtY: function (t) { return fmt(t, 0) + '%'; },
              lineas: [
                { pts: p1, color: C.crimson, etiqueta: 'Política actual' },
                { pts: p2, color: C.teal, dash: '7 5', etiqueta: 'Con s* = ' + pc(s, 1) }
              ],
              puntos: [{ x: 1, y: b1 * 100, etiqueta: 'b₁', color: C.crimson, guias: false }]
            });
          },
          nota: 'Roja: si se mantienen d, r y g. Verde: con el superávit primario que congela la ratio.'
        }
      };
    }
  });
})();
