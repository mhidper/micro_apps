/**
 * Práctica EPD · Macroeconomía UPO — telemetría y cuentas de alumnos
 *
 * Instalación (una sola vez):
 *  1. Crea una hoja de cálculo de Google nueva (p. ej. "Telemetría Práctica Macro").
 *  2. Menú Extensiones → Apps Script. Borra lo que haya y pega este archivo completo.
 *  3. Guarda y ejecuta la función `instalar` (botón ▶). Acepta los permisos.
 *     Se crean las pestañas Alumnos, Eventos y Resumen.
 *  4. Implementar → Nueva implementación → tipo "Aplicación web".
 *     Ejecutar como: Yo · Quién tiene acceso: Cualquier usuario. Implementar.
 *  5. Copia la URL que termina en /exec y pégala en practica_macro/config.js (endpoint).
 *
 * Si cambias este código: Implementar → Gestionar implementaciones → editar → Nueva versión
 * (así la URL /exec no cambia).
 */

var HOJA_ALUMNOS = 'Alumnos';
var HOJA_EVENTOS = 'Eventos';
var HOJA_RESUMEN = 'Resumen';
var PREFIJO = 'MACR-EPD-';
var CAB_ALUMNOS = ['Código', 'Nombre', 'Acrónimo UPO', 'Alta', 'Último acceso', 'Eventos'];
var CAB_EVENTOS = ['Fecha', 'Código', 'Nombre', 'Acrónimo', 'Acción', 'EPD', 'Tipo', 'Ejercicio', 'Aciertos', 'Total', '% acierto', 'Nota', 'Segundos', 'Ayudas', 'Detalle', 'ID', 'Dispositivo'];
// Acciones que forman el historial del alumno (se devuelven al entrar desde otro dispositivo)
var ACCIONES_HISTORIAL = ['ejercicio_terminado', 'examen_entregado', 'sesion'];

function libro_() { return SpreadsheetApp.getActiveSpreadsheet(); }

function hoja_(nombre, cab) {
  var h = libro_().getSheetByName(nombre);
  if (!h) {
    h = libro_().insertSheet(nombre);
    if (cab) {
      h.appendRow(cab);
      h.setFrozenRows(1);
      h.getRange(1, 1, 1, cab.length).setFontWeight('bold').setBackground('#0b1c36').setFontColor('#ffffff');
    }
  }
  return h;
}

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function texto_(s, max) { return String(s === undefined || s === null ? '' : s).replace(/[\r\n\t]+/g, ' ').slice(0, max || 120); }

/* ---------- Instalación ---------- */
function instalar() {
  hoja_(HOJA_ALUMNOS, CAB_ALUMNOS);
  var ev = hoja_(HOJA_EVENTOS, CAB_EVENTOS);
  ev.getRange('A:A').setNumberFormat('dd/mm/yyyy hh:mm:ss');
  var r = hoja_(HOJA_RESUMEN, null);
  r.clear();
  r.getRange('A1').setValue('Actividad por alumno').setFontWeight('bold').setFontSize(13);
  r.getRange('A2').setFormula(
    '=IFERROR(QUERY(Eventos!A2:Q,' +
    '"select B, C, D, count(A), sum(I), sum(J), sum(M), max(A) where B is not null group by B, C, D order by max(A) desc ' +
    'label B \'Código\', C \'Nombre\', D \'Acrónimo\', count(A) \'Eventos\', sum(I) \'Aciertos\', sum(J) \'Apartados\', sum(M) \'Segundos\', max(A) \'Última actividad\'",0),"Sin datos todavía")');
  r.getRange('K1').setValue('Ejercicios terminados por tipo').setFontWeight('bold').setFontSize(13);
  r.getRange('K2').setFormula(
    '=IFERROR(QUERY(Eventos!A2:Q,' +
    '"select G, count(A), sum(I), sum(J) where E = \'ejercicio_terminado\' or E = \'examen_entregado\' group by G order by count(A) desc ' +
    'label G \'Tipo\', count(A) \'Veces\', sum(I) \'Aciertos\', sum(J) \'Apartados\'",0),"Sin datos todavía")');
  r.getRange('K20').setValue('Actividad por día').setFontWeight('bold').setFontSize(13);
  r.getRange('K21').setFormula(
    '=IFERROR(QUERY({ARRAYFORMULA(IF(Eventos!A2:A="",,INT(Eventos!A2:A))),Eventos!B2:B,Eventos!E2:E},' +
    '"select Col1, count(Col2) where Col2 is not null group by Col1 order by Col1 desc label Col1 \'Día\', count(Col2) \'Eventos\'",0),"Sin datos todavía")');
  r.getRange('K22:K60').setNumberFormat('dd/mm/yyyy');
  r.getRange('H3:H').setNumberFormat('dd/mm/yyyy hh:mm');
  SpreadsheetApp.flush();
}

/* ---------- Web app ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  try {
    if (p.accion === 'registro') return json_(registrar_(p));
    if (p.accion === 'login') return json_(login_(p));
    return json_({ ok: true, pong: true, hora: new Date().toISOString() });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  try {
    var datos = JSON.parse((e && e.postData && e.postData.contents) || '[]');
    var lista = Array.isArray(datos) ? datos : [datos];
    guardarEventos_(lista);
    return json_({ ok: true, n: lista.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/* ---------- Registro: asigna un código único MACR-EPD-NNNN ---------- */
function registrar_(p) {
  var nombre = texto_(p.nombre, 80).trim();
  var acr = texto_(p.acronimo, 20).trim().toLowerCase();
  if (nombre.length < 3 || acr.length < 3) return { ok: false, error: 'datos_incompletos' };
  var lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    var h = hoja_(HOJA_ALUMNOS, CAB_ALUMNOS);
    var filas = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 3).getValues() : [];
    for (var i = 0; i < filas.length; i++) {
      if (String(filas[i][2]).toLowerCase() === acr) return { ok: false, error: 'ya_registrado' };
    }
    var usados = {};
    filas.forEach(function (f) { usados[f[0]] = true; });
    var codigo;
    for (var k = 0; k < 500; k++) {
      codigo = PREFIJO + (1000 + Math.floor(Math.random() * 9000));
      if (!usados[codigo]) break;
    }
    if (usados[codigo]) return { ok: false, error: 'sin_codigos' };
    var ahora = new Date();
    h.appendRow([codigo, nombre, acr, ahora, ahora, 0]);
    return { ok: true, codigo: codigo, nombre: nombre, acronimo: acr };
  } finally {
    lock.releaseLock();
  }
}

/* ---------- Entrada con código: devuelve datos e historial ---------- */
function login_(p) {
  var codigo = texto_(p.codigo, 20).trim().toUpperCase();
  var h = hoja_(HOJA_ALUMNOS, CAB_ALUMNOS);
  if (h.getLastRow() < 2) return { ok: false, error: 'no_existe' };
  var filas = h.getRange(2, 1, h.getLastRow() - 1, 3).getValues();
  var alumno = null;
  for (var i = 0; i < filas.length; i++) {
    if (String(filas[i][0]).toUpperCase() === codigo) { alumno = { codigo: filas[i][0], nombre: filas[i][1], acronimo: filas[i][2] }; break; }
  }
  if (!alumno) return { ok: false, error: 'no_existe' };
  var ev = hoja_(HOJA_EVENTOS, CAB_EVENTOS);
  var historial = [];
  if (ev.getLastRow() > 1) {
    var datos = ev.getRange(2, 1, ev.getLastRow() - 1, CAB_EVENTOS.length).getValues();
    datos.forEach(function (f) {
      if (String(f[1]).toUpperCase() !== codigo || ACCIONES_HISTORIAL.indexOf(f[4]) < 0) return;
      historial.push({
        id: f[15], ts: (f[0] instanceof Date ? f[0] : new Date(f[0])).toISOString(), accion: f[4], epd: f[5], tipo: f[6],
        aciertos: Number(f[8]) || 0, total: Number(f[9]) || 0, nota: f[11] === '' ? null : Number(f[11]), segundos: Number(f[12]) || 0
      });
    });
  }
  return { ok: true, alumno: alumno, historial: historial };
}

/* ---------- Eventos ---------- */
function guardarEventos_(lista) {
  if (!lista.length) return;
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var ev = hoja_(HOJA_EVENTOS, CAB_EVENTOS);
    var filas = lista.slice(0, 200).map(function (x) {
      var tot = Number(x.total) || 0, ac = Number(x.aciertos) || 0;
      return [
        x.ts ? new Date(x.ts) : new Date(), texto_(x.codigo, 20), texto_(x.nombre, 80), texto_(x.acronimo, 20), texto_(x.accion, 40),
        texto_(x.epd, 10), texto_(x.tipo, 40), texto_(x.ejercicio, 20),
        x.aciertos === undefined ? '' : ac, x.total === undefined ? '' : tot, tot ? Math.round(ac / tot * 1000) / 10 : '',
        x.nota === undefined || x.nota === null ? '' : Number(x.nota), Number(x.segundos) || '', x.ayudas === undefined ? '' : (x.ayudas ? 'sí' : 'no'),
        texto_(x.detalle ? JSON.stringify(x.detalle) : '', 500), texto_(x.id, 40), texto_(x.dispositivo, 60)
      ];
    });
    ev.getRange(ev.getLastRow() + 1, 1, filas.length, CAB_EVENTOS.length).setValues(filas);
    // Altas hechas sin conexión al servidor (modo local): se añaden a Alumnos
    var h = hoja_(HOJA_ALUMNOS, CAB_ALUMNOS);
    var existentes = h.getLastRow() > 1 ? h.getRange(2, 1, h.getLastRow() - 1, 1).getValues().map(function (f) { return String(f[0]).toUpperCase(); }) : [];
    lista.forEach(function (x) {
      var c = String(x.codigo || '').toUpperCase();
      if (x.accion === 'registro' && c && existentes.indexOf(c) < 0) {
        h.appendRow([c, texto_(x.nombre, 80), texto_(x.acronimo, 20), x.ts ? new Date(x.ts) : new Date(), x.ts ? new Date(x.ts) : new Date(), 0]);
        existentes.push(c);
      }
    });
    // Último acceso y contador de eventos en Alumnos
    if (h.getLastRow() > 1) {
      var al = h.getRange(2, 1, h.getLastRow() - 1, 6).getValues();
      var cambios = false;
      lista.forEach(function (x) {
        for (var i = 0; i < al.length; i++) {
          if (String(al[i][0]).toUpperCase() === String(x.codigo).toUpperCase()) {
            al[i][4] = x.ts ? new Date(x.ts) : new Date();
            al[i][5] = (Number(al[i][5]) || 0) + 1;
            cambios = true;
            break;
          }
        }
      });
      if (cambios) h.getRange(2, 1, al.length, 6).setValues(al);
    }
  } finally {
    lock.releaseLock();
  }
}
