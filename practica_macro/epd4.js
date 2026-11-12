/* EPD 4 · Bloque IV · Mercado de Trabajo y Modelo WS-PS (Sesiones 11–12) */
(function () {
  'use strict';
  var fmt = MP.fmt, fr = MP.fr, eq = MP.eq, C = MP.COL, R2 = MP.redondear;

  MP.registrarEPD({
    id: 'epd4', num: 4,
    titulo: 'Mercado de trabajo: modelo WS-PS',
    sesiones: 'Sesiones 11–12',
    resumen: 'Determinación de salarios y precios, tasa natural de desempleo, reformas en prestaciones, shocks de oferta y avance tecnológico.'
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
  function p(x) { return fmt(x, 2) + '%'; }

  /* =====================================================================
     11 · Modelo WS-PS: Instituciones, prestaciones (z) y margen (m)
     ===================================================================== */
  MP.registrar('epd4', {
    id: 'ws-ps-instituciones', icono: '👥', sesion: 'S11',
    titulo: 'Modelo WS-PS y shocks institucionales',
    resumen: 'Ecuación de salarios y fijación de precios, determinación de un, reforma en prestaciones por desempleo y crisis del petróleo.',
    generar: function (R) {
      var L = R.elegir([900, 1000, 1100, 1200]);
      var m0 = R.elegir([0.25, 0.30, 0.35, 0.40]);
      var z0 = R.elegir([7.0, 7.5, 8.0]);
      var z_shift = R.elegir([4, 5, 6]);
      var alpha = R.elegir([10, 12, 14]);
      
      var A0 = 1.0;
      var wp0 = A0 / (1 + m0);
      var un0 = (z0 - z_shift - wp0) / alpha;
      if (un0 <= 0.03 || un0 >= 0.28) return null;
      var un0_pct = un0 * 100;
      var Un0 = un0 * L;
      var Nn0 = L - Un0;

      // Shock 1: Reforma laboral (caída de z)
      var dz = R.elegir([1.0, 1.5]);
      var z1 = z0 - dz;
      var un1 = (z1 - z_shift - wp0) / alpha;
      var un1_pct = un1 * 100;

      // Shock 2: Crisis energética / Shock de petróleo (subida de m)
      var m1 = R.elegir([0.80, 1.00, 1.20, 1.50]);
      var wp_oil = A0 / (1 + m1);
      var un_oil = (z0 - z_shift - wp_oil) / alpha;
      var un_oil_pct = un_oil * 100;

      var enun = '<p>Considere el mercado de trabajo de una economía cerrada bajo el modelo WS-PS de medio plazo con tecnología agregada <b>Y = A · N</b> (donde <i>A = ' + fmt(A0, 1) + '</i>) y población activa <b>L = ' + e0(L) + '</b> miles de trabajadores:</p>' +
        '<div class="datos">' +
        'Ecuación de salarios (WS): <b>W = P<sup>e</sup> · (z − ' + z_shift + ' − ' + alpha + 'u)</b> &nbsp;con <b>z = ' + fmt(z0, 1) + '</b><br>' +
        'Ecuación de precios (PS): <b>P = (1 + m) · (W / A)</b> &nbsp;con margen empresarial <b>m = ' + fmt(m0, 2) + '</b>' +
        '</div>' +
        '<p>Se asume el equilibrio de medio plazo con expectativas de precios cumplidas (<b>P = P<sup>e</sup></b>).</p>';

      var preg = [
        num('a', 'Salario real fijado por las empresas (W / P), redondeado a 4 decimales.', wp0, {
          dec: 4, unidad: '',
          pista: 'Despeje W/P de la ecuación de fijación de precios: W/P = A / (1 + m). Recuerde que no depende de u.'
        }),
        num('b', 'Tasa natural de desempleo inicial (u<sub>n</sub>), en porcentaje (%).', un0_pct, {
          unidad: '%',
          pista: 'En el medio plazo P = P^e. Iguale la ecuación WS (W/P = z − ' + z_shift + ' − ' + alpha + 'u) con PS y despeje u_n.'
        }),
        num('c', 'Número natural de ocupados iniciales (N<sub>n</sub>), en miles de personas.', Nn0, {
          dec: 1, unidad: 'miles',
          pista: 'N_n = L · (1 − u_n). Los ocupados son el complemento al desempleo sobre la población activa L.'
        }),
        { sep: 'Reforma laboral: reducción de prestaciones por desempleo' },
        num('d', 'Suponga que una reforma reduce z a ' + fmt(z1, 1) + '. ¿Cuál es el nuevo salario real fijado por las empresas?', wp0, {
          dec: 4, unidad: '',
          pista: 'Las prestaciones z sólo entran en la ecuación WS. La curva PS depende únicamente de A y m, por lo que el salario real permanece constante.'
        }),
        num('e', 'Nueva tasa natural de paro (u<sub>n</sub>\') tras la reforma laboral, en %.', un1_pct, {
          unidad: '%',
          pista: 'Iguale la nueva ecuación WS (con z = ' + fmt(z1, 1) + ') a la regla PS y resuelva para u_n\'.'
        }),
        opc(R, 'f', '¿Cuál es el mecanismo de transmisión de la caída de prestaciones (Δz < 0)?',
          'Al empeorar la cobertura por desempleo, los trabajadores pierden poder de negociación y la curva WS se desplaza hacia abajo; para restablecer el salario real que exige PS, la tasa natural de desempleo debe reducirse.',
          [
            'La caída de prestaciones abarata los bienes de consumo y desplaza la curva PS hacia arriba, elevando el salario real de medio plazo.',
            'La reducción de subsidios hace que las empresas reduzcan su margen de beneficio m, provocando una caída simultánea de salarios y precios.',
            'La curva WS se desplaza hacia la derecha aumentando el desempleo involuntario porque las familias consumen menos.'
          ],
          { pista: 'Recuerde que en el medio plazo el salario real viene fijado exclusivamente por PS; cualquier cambio en z se absorbe ajustando la cantidad de empleo.' }
        ),
        { sep: 'Shock de oferta adverso: subida en el precio del petróleo' },
        num('g', 'Partiendo de la situación inicial, suponga que el encarecimiento de materias primas eleva el margen a m = ' + fmt(m1, 2) + '. Nuevo salario real (W / P):', wp_oil, {
          dec: 4, unidad: '',
          pista: 'Calcule W/P = A / (1 + m) con el nuevo valor de margen m = ' + fmt(m1, 2) + '.'
        }),
        num('h', 'Nueva tasa natural de desempleo tras el shock de oferta, en %.', un_oil_pct, {
          unidad: '%',
          pista: 'Iguale la curva WS inicial con el nuevo salario real deprimido dictado por PS.'
        }),
        opc(R, 'i', '¿Por qué un shock petrolero eleva la tasa natural de desempleo?',
          'Las empresas aumentan sus precios para compensar el sobrecoste no salarial, desplazando PS hacia abajo; para que los trabajadores acepten el menor salario real sin presionar al alza, se requiere un mayor desempleo disciplinador.',
          [
            'Porque el petróleo es consumido directamente por los trabajadores, lo que hace que aumenten sus demandas salariales desplazando WS hacia arriba.',
            'Porque el shock de oferta destruye directamente la población activa L, reduciendo el número total de trabajadores disponibles.',
            'Porque el Banco Central sube automáticamente los tipos de interés desplazando la curva WS hacia abajo.'
          ]
        )
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Mercado de Trabajo (WS-PS) en el plano (u, W/P)',
          render: function () {
            var uMin = 0.0, uMax = 0.30;
            var wMax = Math.max(z0 - z_shift, 1.3);

            return MP.grafico({
              titulo: 'Mercado de Trabajo (WS-PS)',
              x: [uMin * 100, uMax * 100], y: [0, wMax],
              xlab: 'Tasa de desempleo, u (%)', ylab: 'Salario real, W / P',
              fmtX: function (t) { return fmt(t, 1); },
              fmtY: function (t) { return fmt(t, 2); },
              lineas: [
                { pts: [[uMin * 100, z0 - z_shift - alpha * uMin], [uMax * 100, z0 - z_shift - alpha * uMax]], color: C.cobalt, w: 2.6, etiqueta: 'WS₀' },
                { pts: [[uMin * 100, z1 - z_shift - alpha * uMin], [uMax * 100, z1 - z_shift - alpha * uMax]], color: C.teal, w: 2, dash: '5 4', etiqueta: 'WS₁ (reforma)' },
                { pts: [[uMin * 100, wp0], [uMax * 100, wp0]], color: C.navy, w: 2.6, etiqueta: 'PS₀' },
                { pts: [[uMin * 100, wp_oil], [uMax * 100, wp_oil]], color: C.crimson, w: 2, dash: '5 4', etiqueta: 'PS₁ (petróleo)' }
              ],
              puntos: [
                { x: un0_pct, y: wp0, color: C.gold, etiqueta: 'E₀ (' + p(un0_pct) + ')', marcaX: p(un0_pct) },
                { x: un1_pct, y: wp0, color: C.teal, etiqueta: 'E₁ (' + p(un1_pct) + ')', marcaX: p(un1_pct) },
                { x: un_oil_pct, y: wp_oil, color: C.crimson, etiqueta: 'E₂ (' + p(un_oil_pct) + ')', marcaX: p(un_oil_pct) }
              ]
            });
          }
        }
      };
    }
  });

  /* =====================================================================
     12 · Progreso técnico, productividad A y producción potencial Yn
     ===================================================================== */
  MP.registrar('epd4', {
    id: 'ws-ps-productividad', icono: '⚙️', sesion: 'S12',
    titulo: 'Productividad del trabajo y niveles naturales',
    resumen: 'Impacto de la tecnología (A), determinación analítica de Nn e Yn, crecimiento potencial y neutralidad tecnológica.',
    generar: function (R) {
      var L = R.elegir([800, 850, 900, 1000]);
      var m = R.elegir([0.40, 0.50, 0.60]);
      var z = 7.5;
      var z_shift = R.elegir([5, 6]);
      var alpha = 10;
      var A0 = 1.0;

      // Situación inicial
      var wp0 = A0 / (1 + m);
      var un0 = (z - z_shift - wp0) / alpha;
      if (un0 <= 0.03 || un0 >= 0.25) return null;
      var un0_pct = un0 * 100;
      var Nn0 = L * (1 - un0);
      var Yn0 = A0 * Nn0;

      // Shock tecnológico: incremento en productividad A
      var crec_A = R.elegir([20, 25, 30, 40]);
      var factor_A = 1 + crec_A / 100;
      var A1 = A0 * factor_A;
      
      var wp1 = A1 / (1 + m);
      var un1 = (z - z_shift - wp1) / alpha;
      var un1_pct = un1 * 100;
      var Nn1 = L * (1 - un1);
      var Yn1 = A1 * Nn1;
      var crec_Yn_pct = ((Yn1 - Yn0) / Yn0) * 100;

      var enun = '<p>Considere una economía definida por las siguientes ecuaciones estructurales de medio plazo, donde <b>A</b> denota la productividad laboral agregada:</p>' +
        '<div class="datos">' +
        'Ecuación de salarios (WS): <b>W = P<sup>e</sup> · (z − ' + z_shift + ' − ' + alpha + 'u)</b> &nbsp;con <b>z = ' + fmt(z, 1) + '</b><br>' +
        'Regla de precios (PS): <b>P = (1 + m) · (W / A)</b> &nbsp;con <b>m = ' + fmt(m, 2) + '</b><br>' +
        'Función de producción: <b>Y = A · N</b> &nbsp;·&nbsp; Población activa: <b>L = ' + e0(L) + '</b> miles &nbsp;·&nbsp; Nivel inicial: <b>A = ' + fmt(A0, 1) + '</b>' +
        '</div>';

      var preg = [
        num('a', 'Salario real inicial fijado por las empresas (W / P):', wp0, {
          dec: 4, unidad: '',
          pista: 'W/P = A / (1 + m) con A = 1,0.'
        }),
        num('b', 'Tasa natural de desempleo inicial (u<sub>n</sub>), en %:', un0_pct, {
          unidad: '%',
          pista: 'Iguale WS (con P = P^e) a la regla PS y despeje u_n.'
        }),
        num('c', 'Nivel natural de empleo inicial (N<sub>n</sub>), en miles de personas:', Nn0, {
          dec: 1, unidad: 'miles',
          pista: 'N_n = L · (1 − u_n).'
        }),
        num('d', 'Nivel natural de producción agregada inicial (Y<sub>n</sub>):', Yn0, {
          dec: 1, unidad: 'unidades',
          pista: 'Y_n = A · N_n.'
        }),
        { sep: 'Choque tecnológico: la productividad A aumenta un +' + crec_A + '% (pasa a A = ' + fmt(A1, 2) + ')' },
        num('e', 'Nuevo salario real ofrecido por las empresas tras el avance técnico:', wp1, {
          dec: 4, unidad: '',
          pista: 'Con A = ' + fmt(A1, 2) + ', el nuevo salario real soportado por la regla de precios es (W/P) = A / (1 + m).'
        }),
        num('f', 'Nueva tasa natural de desempleo u<sub>n</sub>\' (suponiendo que WS mantiene su forma inicial), en %:', un1_pct, {
          unidad: '%',
          pista: 'Iguale la recta PS elevada al nuevo salario real con la curva WS inicial.'
        }),
        num('g', 'Nueva producción natural agregada (Y<sub>n</sub>\'):', Yn1, {
          dec: 1, unidad: 'unidades',
          pista: 'Y_n\' = A_1 · N_n\', donde N_n\' = L · (1 − u_n\').'
        }),
        num('h', 'Tasa de crecimiento porcentual de la producción potencial (%ΔY<sub>n</sub>), en %:', crec_Yn_pct, {
          unidad: '%',
          pista: '%ΔY_n = (Y_n\' − Y_n0) / Y_n0 · 100. Recuerde que crece más que la propia productividad debido al empleo adicional creado.'
        }),
        opc(R, 'i', '¿Qué sucedería con la tasa natural de paro si los convenios indexaran los salarios a la productividad: W = P<sup>e</sup>·A·(z − ' + z_shift + ' − ' + alpha + 'u)?',
          'La tasa natural de desempleo permanecería inalterada en el ' + p(un0_pct) + '%, ya que el factor A se cancelaría a ambos lados de la condición de equilibrio WS = PS, absorbiendo los salarios reales el 100% de la ganancia técnica.',
          [
            'La tasa natural de desempleo aumentaría drásticamente porque las máquinas sustituyen sistemáticamente a los trabajadores.',
            'La curva PS se desplazaría hacia abajo reduciendo el salario real de medio plazo.',
            'El nivel natural de producción se reduciría al contraerse el empleo de los asalariados.'
          ],
          { pista: 'Si los salarios exigen toda la ganancia de productividad, tanto WS como PS se trasladan hacia arriba en la misma proporción.' }
        )
      ];

      return {
        enunciado: enun,
        preguntas: preg,
        grafico: {
          titulo: 'Shock de Productividad en el Modelo WS-PS',
          render: function () {
            var uMin = 0.0, uMax = 0.25;
            var wMax = Math.max(wp1 * 1.3, 1.4);

            return MP.grafico({
              titulo: 'Shock de Productividad en el Modelo WS-PS',
              x: [uMin * 100, uMax * 100], y: [0, wMax],
              xlab: 'Tasa de desempleo, u (%)', ylab: 'Salario real, W / P',
              fmtX: function (t) { return fmt(t, 1); },
              fmtY: function (t) { return fmt(t, 2); },
              lineas: [
                { pts: [[uMin * 100, z - z_shift - alpha * uMin], [uMax * 100, z - z_shift - alpha * uMax]], color: C.cobalt, w: 2.6, etiqueta: 'WS' },
                { pts: [[uMin * 100, wp0], [uMax * 100, wp0]], color: C.navy, w: 2.6, etiqueta: 'PS₀ (A=' + fmt(A0, 1) + ')' },
                { pts: [[uMin * 100, wp1], [uMax * 100, wp1]], color: C.teal, w: 2.6, dash: '5 4', etiqueta: 'PS₁ (A=' + fmt(A1, 2) + ')' }
              ],
              puntos: [
                { x: un0_pct, y: wp0, color: C.gold, etiqueta: 'E₀ (' + p(un0_pct) + ')', marcaX: p(un0_pct) },
                { x: un1_pct, y: wp1, color: C.teal, etiqueta: 'E₁ (' + p(un1_pct) + ')', marcaX: p(un1_pct) }
              ]
            });
          }
        }
      };
    }
  });
})();
