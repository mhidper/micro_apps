// Banco de Datos de Micro-Apps Docentes · Manuel Hidalgo (UPO)
// Contiene las micro-apps de preguntas/retos y las herramientas/simuladores interactivos de PSLL y Macroeconomía

window.DOCENCIA_APPS = {
  psll: {
    name: "Políticas Sociolaborales y de Empleo",
    shortName: "PSLL",
    degree: "Grado en RRLyRRHH & Doble Grado Derecho-RRLyRRHH",
    themeColor: "#113927",
    accentColor: "#E98F71",
    logo: "assets/logo_psll_upo.png",
    isotipo: "assets/isotipo_psll_upo.png",
    categories: [
      { id: "todas", name: "Todas" },
      { id: "mercado", name: "Mercado de trabajo" },
      { id: "pasivas", name: "Protección social" },
      { id: "activas", name: "Políticas activas" },
      { id: "simuladores", name: "Simuladores" }
    ],
    apps: [
      {
        id: "psll_pib_real_sim",
        type: "simulator",
        category: "simuladores",
        icon: "📈",
        iconBg: "#EAF4EE",
        iconColor: "#113927",
        title: "PIB Nominal vs. PIB Real y Deflactor",
        desc: "Economía de 2 bienes: calcula P×Q, elige precios constantes o corrientes y descompón crecimiento e inflación.",
        meta: "Simulador interactivo · 8 min",
        url: "simulador_pib_real.html"
      },
      {
        id: "psll_clu_sim",
        type: "simulator",
        category: "simuladores",
        icon: "📊",
        iconBg: "#EAF4EE",
        iconColor: "#113927",
        title: "Simulador de Costes Laborales Unitarios",
        desc: "Experimenta la sensibilidad del CLU ante variaciones en salarios, cotizaciones y productividad aparente.",
        meta: "Simulador interactivo · 10 min",
        url: "simulador_clu.html"
      },
      {
        id: "psll_mercado_1",
        type: "quiz",
        category: "mercado",
        icon: "👥",
        iconBg: "#EBF3FF",
        iconColor: "#2563EB",
        title: "Mercado de trabajo y desempleo",
        desc: "Conceptos clave sobre desempleo estructural, friccional, tasa de actividad y descomposición del CLU.",
        meta: "5 preguntas · 5 min",
        questions: [
          {
            tag: "Pregunta 1",
            text: "¿Cuál de las siguientes opciones define con mayor precisión el concepto de desempleo estructural?",
            options: [
              "El desempleo transitorio provocado por las fases recesivas del ciclo económico.",
              "El desempleo derivado de un desajuste persistente entre las cualificaciones de los trabajadores y las demandas del tejido productivo.",
              "El desempleo voluntario motivado por subsidios de cuantía excesivamente elevada.",
              "El desempleo de corta duración que experimentan los trabajadores mientras buscan su primer empleo."
            ],
            correct: 1,
            explanation: "El desempleo estructural obedece a desajustes cualitativos, geográficos o tecnológicos de carácter duradero entre la oferta y la demanda de trabajo, requiriendo políticas activas y reformas formativas para su corrección."
          },
          {
            tag: "Pregunta 2",
            text: "Si los salarios nominales por trabajador aumentan un 4% y la productividad aparente del trabajo aumenta un 1%, ¿qué ocurre con el Coste Laboral Unitario (CLU)?",
            options: [
              "El CLU disminuye un 3%, mejorando la competitividad.",
              "El CLU permanece invariable porque los salarios se compensan con la productividad.",
              "El CLU aumenta aproximadamente un 3%, deteriorando la competitividad en costes si la inflación exterior es inferior.",
              "El CLU aumenta un 5% debido al efecto multiplicador de las cotizaciones sociales."
            ],
            correct: 2,
            explanation: "La tasa de variación del CLU equivale aproximadamente al crecimiento de la remuneración por asalariado menos el crecimiento de la productividad: Δ%CLU ≈ Δ%W - Δ%Prod = 4% - 1% = +3%."
          },
          {
            tag: "Pregunta 3",
            text: "La 'población activa' en la Encuesta de Población Activa (EPA) está integrada por:",
            options: [
              "La suma de todas las personas de 16 o más años residentes en viviendas familiares en España.",
              "Exclusivamente los trabajadores que tienen un contrato de trabajo vigente y cotizan a la Seguridad Social.",
              "La suma de las personas ocupadas y las personas desempleadas que buscan activamente empleo y están disponibles para trabajar.",
              "Todos los ciudadanos en edad de trabajar que perciben rentas salariales o prestaciones públicas."
            ],
            correct: 2,
            explanation: "Población Activa = Ocupados + Parados. Quedan excluidos los inactivos (estudiantes, jubilados, personas dedicadas en exclusiva a labores del hogar o desanimados que no buscan activamente empleo)."
          },
          {
            tag: "Pregunta 4",
            text: "El fenómeno de los 'trabajadores desanimados' produce sobre las estadísticas oficiales del mercado laboral:",
            options: [
              "Un aumento simultáneo de la tasa de paro y de la tasa de actividad.",
              "Una caída ficticia de la tasa de paro, ya que abandonan la búsqueda activa y pasan estadísticamente a la inactividad.",
              "Un incremento directo del número de personas ocupadas a tiempo parcial.",
              "No tiene ningún impacto sobre la tasa de paro oficial de la EPA."
            ],
            correct: 1,
            explanation: "Al dejar de buscar activamente empleo por considerar que no lo van a encontrar, dejan de cumplir los criterios de parado de la OIT y pasan a ser inactivos, reduciendo tanto el numerador (parados) como el denominador (activos), lo que modera artificialmente la tasa de paro."
          },
          {
            tag: "Pregunta 5",
            text: "¿Qué mide la 'tasa de empleo' de una economía?",
            options: [
              "El porcentaje de parados que consigue encontrar empleo a lo largo de un trimestre.",
              "La proporción de personas ocupadas respecto a la población total de 16 o más años (población en edad de trabajar).",
              "La ratio entre el número de asalariados con contrato indefinido y el total de trabajadores.",
              "El porcentaje de ocupados en relación exclusiva con la población activa."
            ],
            correct: 1,
            explanation: "Tasa de empleo = (Ocupados / Población de 16 o más años) × 100. Refleja la capacidad real de una sociedad para movilizar laboralmente a su población en edad de trabajar."
          }
        ]
      },
      {
        id: "psll_pasivas_1",
        type: "quiz",
        category: "pasivas",
        icon: "🛡️",
        iconBg: "#EAF4EE",
        iconColor: "#113927",
        title: "Protección social y desempleo",
        desc: "Dilemas de cobertura, tasa de sustitución, incentivos a la búsqueda y el riesgo moral.",
        meta: "5 preguntas · 5 min",
        questions: [
          {
            tag: "Pregunta 1",
            text: "¿Qué diferencia fundamental existe entre la prestación contributiva por desempleo y el subsidio asistencial?",
            options: [
              "La contributiva exige un mínimo de cotización previa (360 días en los últimos 6 años) y depende del salario anterior; el subsidio atiende a carencia de rentas y cargas familiares.",
              "La contributiva se financia con impuestos generales del Estado y el subsidio con las cuotas de los trabajadores.",
              "La contributiva tiene una duración indefinida mientras que el subsidio dura un máximo de tres meses.",
              "No existe ninguna diferencia económica, ambas figuras son denominaciones sinónimas en la LGSS."
            ],
            correct: 0,
            explanation: "La prestación contributiva se devenga en función de cotizaciones previas (mínimo 360 días) y su cuantía es un porcentaje de la base reguladora. El subsidio tiene naturaleza asistencial y requiere acreditar carencia de rentas."
          },
          {
            tag: "Pregunta 2",
            text: "El concepto económico de 'riesgo moral' (moral hazard) en el diseño de las prestaciones por desempleo hace referencia a:",
            options: [
              "La posibilidad de que las empresas despidan a trabajadores cualificados sin abonar indemnización.",
              "El riesgo de que una alta tasa de reemplazo o excesiva duración desincentive el esfuerzo de búsqueda activa y prolongue innecesariamente el paro.",
              "La discriminación por razón de edad que sufren los parados de larga duración.",
              "El déficit financiero del Servicio Público de Empleo derivado de la inflación."
            ],
            correct: 1,
            explanation: "El riesgo moral surge por asimetría de información: el asegurador público no puede monitorizar perfectamente el esfuerzo de búsqueda del desempleado, por lo que subsidios excesivamente generosos pueden desincentivar la reinserción."
          },
          {
            tag: "Pregunta 3",
            text: "¿Qué expresa la 'tasa de reemplazo' (o tasa de sustitución) de una prestación?",
            options: [
              "El porcentaje de desempleados que sustituye a trabajadores jubilados en las empresas.",
              "La relación porcentual entre el importe neto de la prestación por desempleo y el salario neto percibido antes de perder el empleo.",
              "La proporción de contratos temporales que se transforman en indefinidos.",
              "El número de vacantes que se cubren con trabajadores extranjeros."
            ],
            correct: 1,
            explanation: "La tasa de reemplazo mide en qué medida el subsidio protege el nivel de vida previo del trabajador: (Prestación / Salario previo) × 100."
          },
          {
            tag: "Pregunta 4",
            text: "En el marco de las políticas pasivas, el perfil temporal de la prestación (reducción progresiva de la cuantía con el tiempo) tiene como objetivo económico:",
            options: [
              "Reducir el gasto del Estado para cumplir con el pacto de estabilidad sin considerar al desempleado.",
              "Proporcionar un seguro elevado en el momento del despido y elevar el incentivo a la búsqueda a medida que transcurre el tiempo en desempleo.",
              "Obligar al trabajador a aceptar exclusivamente contratos a tiempo parcial.",
              "Penalizar a los trabajadores con menores cargas familiares."
            ],
            correct: 1,
            explanation: "El perfil decreciente combina aseguramiento inicial (cuando el shock del despido es más severo) con incentivos crecientes a la aceptación de ofertas conforme aumenta el riesgo de histéresis y pérdida de empleabilidad."
          },
          {
            tag: "Pregunta 5",
            text: "El concepto legal y económico de 'colocación adecuada' establece que:",
            options: [
              "El desempleado solo está obligado a aceptar ofertas de trabajo en su misma empresa anterior.",
              "El perceptor de prestaciones debe aceptar ofertas congruentes con su perfil profesional, cualificación y distancia geográfica razonable para mantener el derecho al subsidio.",
              "El Estado garantiza un puesto de trabajo en la función pública a todo graduado universitario.",
              "Las ofertas de empleo deben garantizar un salario como mínimo un 20% superior al salario anterior."
            ],
            correct: 1,
            explanation: "La colocación adecuada equilibra la protección del capital humano del trabajador con la condicionalidad activa: rechazar una oferta adecuada injustificadamente conlleva la pérdida de la prestación."
          }
        ]
      },
      {
        id: "psll_pasivas_sim",
        interactive: false,
        type: "simulator",
        category: "pasivas",
        icon: "⚖️",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        title: "La Balanza de la Protección Social",
        desc: "Dilemas éticos y económicos: ajusta el nivel de protección y evalúa el impacto sobre el déficit y el tiempo de paro.",
        meta: "Herramienta interactiva · 8 min",
        url: "balanza_proteccion.html"
      },
      {
        id: "psll_itinerario_sim",
        interactive: false,
        type: "simulator",
        category: "activas",
        icon: "🧭",
        iconBg: "#F0FDF4",
        iconColor: "#16A34A",
        title: "El Viaje del Desempleado",
        desc: "Toma de decisiones en el itinerario de inserción laboral: formación, búsqueda y ofertas de empleo.",
        meta: "Simulación de caso · 10 min",
        url: "viaje_desempleado.html"
      },
      {
        id: "psll_mitos_sim",
        interactive: false,
        type: "simulator",
        category: "mercado",
        icon: "🔍",
        iconBg: "#FEF2F2",
        iconColor: "#DC2626",
        title: "Mitos y Realidades del Empleo",
        desc: "Pon a prueba tus intuiciones empíricas confrontándolas con los datos reales de la EPA y Eurostat.",
        meta: "Choque empírico · 6 min",
        url: "mitos_realidades.html"
      },
      {
        id: "psll_colocacion_sim",
        interactive: false,
        type: "simulator",
        category: "pasivas",
        icon: "💼",
        iconBg: "#EFF6FF",
        iconColor: "#2563EB",
        title: "La Colocación Adecuada",
        desc: "Analiza ofertas de empleo reales y determina si un perceptor de prestaciones puede rechazarlas legalmente.",
        meta: "Taller práctico · 8 min",
        url: "colocacion_adecuada.html"
      },
      {
        id: "psll_caso_despido",
        interactive: false,
        type: "simulator",
        category: "pasivas",
        icon: "📑",
        iconBg: "#F3E8FF",
        iconColor: "#9333EA",
        title: "Caso Práctico: Despido y Prestaciones",
        desc: "Calcula e interpreta el derecho a prestaciones, bases de cotización e indemnizaciones de un caso real.",
        meta: "Caso práctico EPD · 10 min",
        url: "caso_1.html"
      }
    ]
  },

  macro: {
    name: "Macroeconomía",
    shortName: "Macro",
    degree: "Grado en Administración y Dirección de Empresas (ADE)",
    themeColor: "#0B1C36",
    accentColor: "#056CAA",
    logo: "assets/logo_macro_upo.png",
    isotipo: "assets/isotipo_macro_upo.png",
    categories: [
      { id: "todas", name: "Todas" },
      { id: "simuladores", name: "Simuladores" },
      { id: "real", name: "Sector Real (IS)" },
      { id: "monetario", name: "Sector Monetario (LM)" },
      { id: "equilibrio", name: "Equilibrio IS-LM" }
    ],
    apps: [
      {
        id: "macro_lab_sesion01",
        type: "simulator",
        category: "simuladores",
        icon: "🌍",
        iconBg: "#EBF8FF",
        iconColor: "#056CAA",
        title: "Laboratorio Macroeconómico • Sesión 1",
        desc: "El Tablero del Mundo: Las 3 vías del PIB, el espejismo nominal vs. real y el impacto del petróleo (Deflactor vs IPC).",
        meta: "Laboratorio interactivo · 15 min",
        url: "macro_simulador_sesion_01.html"
      },
      {
        id: "macro_sim_sesion02",
        type: "simulator",
        category: "simuladores",
        icon: "⚡",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        title: "Simulador de la Cruz Keynesiana y el Multiplicador",
        desc: "Equilibrio en el mercado de bienes, la cascada del multiplicador del gasto y la paradoja del ahorro.",
        meta: "Simulador dinámico · 12 min",
        url: "macro_simulador_sesion_02.html"
      },
      {
        id: "macro_real_1",
        type: "quiz",
        category: "real",
        icon: "📈",
        iconBg: "#EFF6FF",
        iconColor: "#1D4ED8",
        title: "El Mercado de Bienes y la Curva IS",
        desc: "Componentes del PIB por la vía del gasto, propensión marginal a consumir y el multiplicador del gasto.",
        meta: "5 preguntas · 5 min",
        questions: [
          {
            tag: "Pregunta 1",
            text: "En el modelo del multiplicador keynesiano, si la propensión marginal a consumir (c₁) es 0,8 y el tipo impositivo sobre la renta es cero, ¿cuál es el valor del multiplicador del gasto autónomo?",
            options: [
              "1,25",
              "2,5",
              "5",
              "8"
            ],
            correct: 2,
            explanation: "Multiplicador = 1 / (1 - c₁) = 1 / (1 - 0,8) = 1 / 0,2 = 5. Cada euro adicional de gasto autónomo genera 5 euros de producción de equilibrio."
          },
          {
            tag: "Pregunta 2",
            text: "¿Por qué la curva IS tiene pendiente negativa en el plano (Producción Y, Tipo de interés i)?",
            options: [
              "Porque un tipo de interés más alto desincentiva el consumo privado pero multiplica las exportaciones netas.",
              "Porque un incremento del tipo de interés encarece el coste del capital, reduciendo la inversión empresarial y, vía multiplicador, el nivel de producción de equilibrio.",
              "Porque el Banco Central siempre sube el tipo de interés cuando el desempleo se dispara.",
              "Porque la curva IS representa el equilibrio monetario y la oferta de dinero es fija."
            ],
            correct: 1,
            explanation: "El mecanismo de transmisión es: ↑i → ↓Inversión (I) → ↓Demanda Agregada (Z) → ↓Producción de equilibrio (Y)."
          },
          {
            tag: "Pregunta 3",
            text: "Una política fiscal expansiva consistente en un incremento del gasto público (ΔG > 0) financiado íntegramente con un aumento idéntico de impuestos (ΔT = ΔG):",
            options: [
              "Tiene un impacto nulo sobre la producción porque el balance presupuestario permanece neutral.",
              "Aumenta la producción de equilibrio en una cuantía exactamente igual a ΔG (teorema del presupuesto equilibrado).",
              "Reduce la producción de equilibrio debido a que los impuestos deprimen fuertemente la confianza empresarial.",
              "Genera un efecto expulsión total de la inversión privada en el mercado de bienes."
            ],
            correct: 1,
            explanation: "Por el teorema de Haavelmo (presupuesto equilibrado), el multiplicador del gasto es 1/(1-c1) y el de los impuestos es -c1/(1-c1). La suma de ambos es (1-c1)/(1-c1) = 1. Por tanto, ΔY = ΔG."
          },
          {
            tag: "Pregunta 4",
            text: "¿Qué variable económica representa una 'fuga' del flujo circular de la renta en una economía abierta?",
            options: [
              "El consumo privado nacional de bienes producidos en el país.",
              "La inversión en bienes de equipo de producción nacional.",
              "Las importaciones de bienes y servicios procedentes del exterior.",
              "Las transferencias públicas recibidas por las familias."
            ],
            correct: 2,
            explanation: "Las fugas del flujo circular son el ahorro (S), los impuestos netos (T) y las importaciones (M), ya que desvían gasto fuera de la corriente de producción interna."
          },
          {
            tag: "Pregunta 5",
            text: "Si la confianza de los consumidores se desploma, reduciendo el consumo autónomo (c₀), la curva IS:",
            options: [
              "Se desplaza paralelamente hacia la izquierda, reduciendo la producción para cualquier tipo de interés dado.",
              "Se desplaza hacia la derecha impulsada por el ahorro preventivo.",
              "Gira en el sentido de las agujas del reloj volviéndose totalmente vertical.",
              "No se desplaza, simplemente se produce un movimiento a lo largo de la curva existente."
            ],
            correct: 0,
            explanation: "Cualquier shock negativo en un componente autónomo del gasto (c₀, I₀, G, X) desplaza la curva IS hacia la izquierda, reflejando menor demanda para todo nivel del tipo de interés."
          }
        ]
      },
      {
        id: "macro_monetario_1",
        type: "quiz",
        category: "monetario",
        icon: "🏛️",
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        title: "Dinero, Tipos de Interés y la Curva LM",
        desc: "Demanda de dinero para transacciones y especulación, oferta monetaria y la regla de política monetaria.",
        meta: "5 preguntas · 5 min",
        questions: [
          {
            tag: "Pregunta 1",
            text: "La demanda de saldos monetarios reales (M/P) depende positivamente del nivel de renta (Y) y negativamente del tipo de interés nominal (i) porque:",
            options: [
              "A mayor renta se realizan más transacciones (motivo transacción) y a mayor tipo de interés aumenta el coste de oportunidad de mantener dinero líquido en lugar de bonos.",
              "A mayor tipo de interés el dinero en efectivo produce un dividendo directo mayor que las acciones.",
              "El Banco Central obliga a los ciudadanos a depositar todo su sueldo en cuentas a plazo fijo cuando suben los tipos.",
              "La inflación deprime la velocidad de circulación del dinero obligando a acumular billetes."
            ],
            correct: 0,
            explanation: "El dinero facilita las transacciones (demanda por motivo transacción que crece con Y), pero no rinde intereses: el tipo de interés i es el coste de oportunidad de tener dinero en el bolsillo en lugar de activos rentables."
          },
          {
            tag: "Pregunta 2",
            text: "Cuando el Banco Central Europeo (BCE) lleva a cabo una 'operación de mercado abierto' consistente en la compra de bonos soberanos:",
            options: [
              "Reduce la base monetaria y eleva los tipos de interés interbancarios.",
              "Inyecta liquidez al sistema bancario, incrementando la base monetaria y presionando los tipos a la baja.",
              "Obliga a los gobiernos a emitir más deuda para compensar la compra.",
              "Destruye dinero fiduciario retirando monedas de la circulación."
            ],
            correct: 1,
            explanation: "Al comprar bonos, el Banco Central entrega efectivo/reservas bancarias a cambio, expandiendo el balance y aumentando la oferta monetaria, lo que abarata el crédito (bajada de tipos)."
          },
          {
            tag: "Pregunta 3",
            text: "En un marco contemporáneo donde el Banco Central fija un tipo de interés objetivo (regla de Taylor / LM horizontal):",
            options: [
              "La oferta monetaria se ajusta de forma pasiva y endógena para satisfacer la demanda de dinero al tipo de interés fijado.",
              "La oferta de dinero es totalmente inelástica y vertical.",
              "La curva IS deja de tener relevancia para determinar la producción.",
              "El tipo de interés fluctúa libremente según la demanda de los consumidores."
            ],
            correct: 0,
            explanation: "En la práctica macroeconómica moderna, los bancos centrales no controlan agregados monetarios fijos sino que establecen el tipo de interés oficial, proveyendo toda la liquidez que demande el mercado a ese precio."
          },
          {
            tag: "Pregunta 4",
            text: "¿Qué define a la 'trampa de la liquidez' (Zero Lower Bound)?",
            options: [
              "Una situación donde los bancos comerciales carecen de liquidez para operar.",
              "Un escenario donde el tipo de interés nominal se sitúa en su límite inferior cero y la política monetaria convencional no logra bajarlo más para estimular la demanda.",
              "El momento en que todos los ciudadanos deciden gastar sus ahorros provocando hiperinflación.",
              "Una prohibición regulatoria de emitir crédito a empresas exportadoras."
            ],
            correct: 1,
            explanation: "En la trampa de la liquidez, al situarse los tipos en cero o casi cero, el dinero y los bonos se vuelven sustitutos perfectos; inyecciones adicionales de dinero son atesoradas sin abaratar el crédito."
          },
          {
            tag: "Pregunta 5",
            text: "¿Cuál es el efecto de una perturbación positiva de demanda en el modelo IS-LM bajo tipo de interés fijo del Banco Central?",
            options: [
              "La producción permanece inalterada y sube el tipo de interés.",
              "La producción aumenta en toda la magnitud del multiplicador keynesiano sin efecto expulsión sobre la inversión inducido por tipos.",
              "La inversión privada se contrae fuertemente debido al endurecimiento monetario automático.",
              "La renta disminuye por saturación del mercado de bienes."
            ],
            correct: 1,
            explanation: "Si el banco central mantiene el tipo de interés constante, no hay subida de tipos que desincentive la inversión privada; por tanto, no hay efecto expulsión (crowding-out) y la expansión de la renta es máxima."
          }
        ]
      }
    ]
  }
};
