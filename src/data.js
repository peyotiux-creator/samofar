// ─── DATOS DEL CUESTIONARIO ──────────────────────────────────────
// Terminología en español, sin anglicismos
// "entidad analizada" en lugar de "entidad mexicana"
// "partes relacionadas" en lugar de "entidad extranjera" (salvo EP)

export const SECCIONES = [
  {
    id: 's01', num: '01',
    titulo: 'Datos Generales',
    desc: 'Información corporativa y estructura del grupo multinacional',
    preguntas: [
      { id: 'razon',     label: 'Razón social de la entidad analizada',          tipo: 'texto',    ph: 'Ej. Empresa México S.A. de C.V.' },
      { id: 'rfc',       label: 'RFC',                                            tipo: 'texto',    ph: 'Ej. EME900101XXX' },
      { id: 'sector',    label: 'Sector económico / industria',                   tipo: 'texto',    ph: 'Ej. Manufactura automotriz' },
      { id: 'grupo',     label: 'Nombre del grupo multinacional al que pertenece',tipo: 'texto',    ph: 'Ej. Grupo ABC International' },
      { id: 'pais',      label: 'País de residencia de la casa matriz',           tipo: 'texto',    ph: 'Ej. Estados Unidos' },
      { id: 'ejercicio', label: 'Ejercicio fiscal bajo análisis',                 tipo: 'texto',    ph: 'Ej. 2025' },
      { id: 'org',       label: 'Organigrama del grupo con porcentajes de participación',
        tipo: 'radio', opts: ['Disponible y actualizado', 'Disponible pero desactualizado', 'No existe'] },
      { id: 'partes',    label: 'Número aproximado de partes relacionadas con las que se tienen operaciones',
        tipo: 'select', opts: ['1–3', '4–10', '11–20', 'Más de 20'] },
      { id: 'acuerdos',  label: 'Acuerdos Anticipados de Precios (AAP) vigentes — convenios firmados con la autoridad que fijan el método y precio de las operaciones',
        tipo: 'radio', opts: ['Sí, en México', 'Sí, en el extranjero', 'No cuenta con AAP', 'En proceso de negociación'] },
    ],
  },
  {
    id: 's02', num: '02',
    titulo: 'Análisis de Funciones',
    desc: 'El análisis funcional (FAR, por sus siglas en inglés: Functions, Assets, Risks) identifica qué hace realmente cada entidad del grupo — quién toma las decisiones, quién controla los activos y quién asume los riesgos económicos significativos.',
    preguntas: [
      { id: 'actividad', label: 'Describe brevemente la actividad principal de la entidad analizada',
        tipo: 'textarea', ph: 'Ej. Manufactura de componentes electrónicos por cuenta de partes relacionadas del extranjero...' },
      { id: 'dec', label: 'Matriz de decisiones estratégicas — ¿Qué entidad toma cada decisión en la práctica?',
        tipo: 'matriz',
        filas: [
          'Definición de precios de venta al cliente final',
          'Aprobación del presupuesto anual de operación',
          'Selección y negociación con proveedores clave',
          'Contratación y despido de personal directivo',
          'Lanzamiento de nuevos productos o servicios',
          'Aprobación de inversiones de capital (CAPEX)',
          'Estrategia de expansión geográfica',
          'Gestión de clientes estratégicos y contratos clave',
        ],
        cols: ['Entidad analizada', 'Partes relacionadas nacionales', 'Partes relacionadas extranjeras', 'Decisión compartida'],
      },
      { id: 'personal_dir', label: '¿Cuántas personas en la entidad analizada tienen nivel directivo con poder de decisión real?',
        tipo: 'select', opts: ['Ninguno — los directivos son de partes relacionadas', '1 a 5 directivos propios', '6 a 15 directivos propios', 'Más de 15 directivos propios'] },
      { id: 'autonomia', label: 'Grado de autonomía de la entidad analizada para decisiones operativas del día a día',
        tipo: 'radio', opts: ['Totalmente autónoma', 'Autónoma en operaciones, no en estrategia', 'Requiere aprobación de partes relacionadas para la mayoría de decisiones', 'Casi sin autonomía — ejecuta instrucciones de partes relacionadas'] },
      { id: 'conducta', label: '¿La forma en que opera la entidad en la práctica es consistente con lo que establecen los contratos con partes relacionadas?',
        tipo: 'radio', opts: ['Sí, completamente consistente', 'Parcialmente — hay algunas diferencias menores', 'No — la operación real difiere significativamente de los contratos'] },
    ],
  },
  {
    id: 's03', num: '03',
    titulo: 'Activos e Intangibles — Criterio DEMPE',
    desc: 'El criterio DEMPE (Desarrollo, Mejora, Mantenimiento, Protección y Explotación) determina quién debe recibir la renta de los intangibles según las Directrices de la OCDE 2017. La titularidad legal ya no es suficiente — lo que importa es quién realiza y controla cada función.',
    preguntas: [
      { id: 'activos_tang', label: 'Activos tangibles relevantes que posee o usa la entidad analizada (selecciona todos los que apliquen)',
        tipo: 'multi', opts: ['Inmuebles propios', 'Inmuebles arrendados', 'Maquinaria y equipo propio', 'Maquinaria y equipo arrendado', 'Inventarios', 'Equipo de cómputo y tecnología', 'Sin activos propios — son de partes relacionadas'] },
      { id: 'usa_intang', label: '¿La entidad analizada usa intangibles propiedad de partes relacionadas?',
        tipo: 'radio', opts: ['Sí — paga regalías formalmente', 'Sí — sin pago formal de regalía', 'No usa intangibles del grupo'] },
      { id: 'tipo_intang', label: 'Tipos de intangibles que usa (selecciona todos los que apliquen)',
        tipo: 'multi', opts: ['Marca / nombre comercial', 'Patentes', 'Conocimiento técnico / secretos industriales', 'Plataformas de software o sistemas tecnológicos', 'Listas de clientes / bases de datos', 'Metodologías y procesos de negocio', 'Licencias regulatorias', 'Ninguno'] },
      { id: 'dempe_d', label: 'D — Desarrollar: ¿Quién financia e impulsa el desarrollo inicial de los intangibles (I&D, diseño, ingeniería)?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'De forma compartida', 'No aplica'] },
      { id: 'dempe_e1', label: 'E — Mejorar: ¿Quién aprueba las mejoras continuas, actualizaciones y nuevas versiones de los intangibles?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'De forma compartida', 'No aplica'] },
      { id: 'dempe_m', label: 'M — Mantener: ¿Quién gestiona el equipo técnico que soporta y mantiene los intangibles en operación?',
        tipo: 'radio', opts: ['La entidad analizada con personal propio', 'Personal de partes relacionadas', 'Personal compartido', 'No aplica'] },
      { id: 'dempe_p', label: 'P — Proteger: ¿Quién gestiona los registros, patentes y litigios relacionados con los intangibles del grupo?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'De forma compartida', 'No aplica'] },
      { id: 'dempe_e2', label: 'E — Explotar: ¿Quién toma las decisiones sobre cómo monetizar o licenciar los intangibles del grupo?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'De forma compartida', 'No aplica'] },
      { id: 'titularidad', label: '¿Coincide el propietario legal de los intangibles con quien realiza las funciones DEMPE principales?',
        tipo: 'radio', opts: ['Sí — son la misma entidad', 'Parcialmente — hay divergencia en algunas funciones', 'No — el propietario legal no realiza las funciones DEMPE principales'] },
    ],
  },
  {
    id: 's04', num: '04',
    titulo: 'Análisis de Riesgos',
    desc: 'Las Directrices OCDE 2017 establecen que el riesgo sigue a quien lo controla y tiene la capacidad financiera de absorberlo — no a quien lo dice asumir en un contrato. Este análisis aplica a operaciones con partes relacionadas tanto nacionales como extranjeras.',
    preguntas: [
      { id: 'r_inv',   label: 'Riesgo de inventario — ¿Quién asume pérdidas si el inventario se deprecia, cae en obsolescencia o no puede venderse?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'Compartido entre ambas', 'No aplica'] },
      { id: 'r_cred',  label: 'Riesgo de crédito — ¿Quién absorbe la pérdida si un cliente no paga?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'Compartido entre ambas', 'No aplica — no tiene cuentas por cobrar propias'] },
      { id: 'r_mkt',   label: 'Riesgo de mercado — ¿Quién asume la pérdida si los precios de mercado caen por debajo del costo?',
        tipo: 'radio', opts: ['La entidad analizada', 'Partes relacionadas', 'Compartido entre ambas', 'No aplica'] },
      { id: 'r_fx',    label: 'Riesgo cambiario — ¿La entidad analizada está expuesta a fluctuaciones en tipo de cambio en sus operaciones con partes relacionadas?',
        tipo: 'radio', opts: ['Sí — asume el riesgo cambiario directamente', 'Parcialmente — hay cobertura parcial con el grupo', 'No — el riesgo lo asume la parte relacionada'] },
      { id: 'control', label: '¿Quién toma las decisiones para mitigar, transferir o aceptar estos riesgos en la práctica?',
        tipo: 'radio', opts: ['La entidad analizada con plena autonomía', 'La entidad analizada con aprobación del grupo', 'Las partes relacionadas — la entidad analizada solo implementa', 'Un comité regional o corporativo'] },
      { id: 'cap_fin', label: '¿Tiene la entidad analizada el capital o acceso a financiamiento suficiente para absorber pérdidas si los riesgos asignados se materializan?',
        tipo: 'radio', opts: ['Sí — capital propio suficiente', 'Parcialmente — requeriría apoyo del grupo', 'No — dependería totalmente del grupo para absorber pérdidas'] },
      { id: 'perdidas', label: '¿La entidad analizada ha registrado pérdidas en los últimos 3 ejercicios fiscales?',
        tipo: 'radio', opts: ['No — resultados positivos consistentes', 'Pérdidas en 1 ejercicio', 'Pérdidas en 2 o más ejercicios', 'Pérdidas recurrentes con justificación documentada'] },
      { id: 'ep', label: 'Riesgo de Establecimiento Permanente — ¿Algún ejecutivo o empleado de una parte relacionada extranjera opera habitualmente en México con facultades para concluir contratos a nombre de esa entidad extranjera?',
        tipo: 'radio', opts: ['No', 'Sí — pero sin poder para concluir contratos en nombre de la entidad extranjera', 'Sí — con poderes para concluir contratos (posible Establecimiento Permanente no reconocido)', 'No estoy seguro'] },
    ],
  },
  {
    id: 's05', num: '05',
    titulo: 'Operaciones con Partes Relacionadas',
    desc: 'Las partes relacionadas incluyen tanto empresas del mismo grupo residentes en México como en el extranjero. Todas las operaciones entre ellas deben ser pactadas a valor de mercado y documentadas.',
    preguntas: [
      { id: 'tipos', label: 'Tipos de operaciones con partes relacionadas en el ejercicio (selecciona todas las que apliquen)',
        tipo: 'multi', opts: ['Compra de bienes / materias primas', 'Venta de bienes / producto terminado', 'Prestación de servicios (la entidad recibe el servicio)', 'Prestación de servicios (la entidad otorga el servicio)', 'Pago de regalías', 'Cobro de regalías', 'Préstamo recibido (la entidad es la acreditada)', 'Préstamo otorgado (la entidad es la acreditante)', 'Participación en tesorería centralizada del grupo', 'Garantías otorgadas a partes relacionadas', 'Garantías recibidas de partes relacionadas', 'Asignación de gastos compartidos del grupo (prorrateo)', 'Reestructura corporativa reciente'] },
      { id: 'montos', label: 'Monto total aproximado de operaciones con partes relacionadas en el ejercicio',
        tipo: 'select', opts: ['Menos de $10 millones MXN', '$10 a $50 millones MXN', '$50 a $200 millones MXN', '$200 millones a $1,000 millones MXN', 'Más de $1,000 millones MXN'] },
      { id: 'contratos', label: '¿Existen contratos intercompañía vigentes que documenten cada tipo de operación?',
        tipo: 'radio', opts: ['Sí — todos los tipos de operación tienen contrato vigente', 'Parcialmente — algunos contratos existen, otros no', 'No — las operaciones se realizan sin contratos formales'] },
      { id: 'contratos_ok', label: '¿Los contratos vigentes reflejan la operación real actual?',
        tipo: 'radio', opts: ['Sí — completamente actualizados', 'Mayormente sí — con algunos desfases menores', 'No — los contratos están desactualizados respecto a la operación real'] },
      { id: 'ajustes', label: '¿La entidad realiza ajustes de precios de transferencia al cierre del ejercicio para cumplir con el rango intercuartil?',
        tipo: 'radio', opts: ['Sí — ajuste anual documentado', 'Sí — pero sin documentación formal suficiente', 'No se realizan ajustes', 'Se está evaluando implementarlos'] },
      { id: 'prorrata', label: '¿Existen cargos de gastos compartidos (prorrateo) con residentes en el extranjero conforme a la Regla 3.3.1.27 de la Resolución Miscelánea Fiscal?',
        tipo: 'radio', opts: ['Sí — con documentación y análisis de beneficio', 'Sí — pero sin análisis formal de beneficio', 'No'] },
      { id: 'tesoreria', label: '¿La entidad analizada participa en esquemas de tesorería centralizada del grupo?',
        tipo: 'radio', opts: ['Sí — como depositante neto (pone más de lo que toma)', 'Sí — como tomador neto (toma más de lo que pone)', 'Sí — con posición variable', 'No participa'] },
    ],
  },
  {
    id: 's06', num: '06',
    titulo: 'Documentación e Historial Fiscal',
    desc: 'El artículo 76-A de la Ley del ISR establece la obligación de presentar tres documentos informativos: la Declaración Informativa Local (antes conocida como Local File), la Declaración Informativa Maestra (antes conocida como Master File) y el Reporte País por País (antes conocido como CbC Report). La consistencia entre los tres es crítica.',
    preguntas: [
      { id: 'estudio',  label: 'Estudio de precios de transferencia del ejercicio anterior',
        tipo: 'radio', opts: ['Completo y presentado en tiempo', 'Presentado fuera de tiempo', 'Parcial — solo algunas secciones', 'No cuenta con estudio previo'] },
      { id: 'anexo9',   label: 'Presentación del Anexo 9 de la Declaración Informativa Múltiple (DIM) en el ejercicio anterior',
        tipo: 'radio', opts: ['Presentado en tiempo y forma', 'Presentado fuera de tiempo', 'No se presentó', 'No aplica — primer ejercicio'] },
      { id: 'inf_local', label: 'Declaración Informativa Local de partes relacionadas — documento que detalla las operaciones y el análisis funcional de la entidad en México',
        tipo: 'radio', opts: ['Completa y actualizada', 'Parcial', 'No existe'] },
      { id: 'inf_maestra', label: 'Declaración Informativa Maestra del grupo multinacional — documento con la visión global del grupo, su estructura y sus políticas de precios de transferencia',
        tipo: 'radio', opts: ['Disponible y actualizada', 'Disponible pero desactualizada', 'No disponible para México', 'El grupo no está obligado a presentarla'] },
      { id: 'rep_pais', label: 'Reporte País por País — informe que detalla la distribución de ingresos, impuestos y actividades económicas del grupo en cada país donde opera',
        tipo: 'radio', opts: ['Disponible para México', 'Existe pero sin acceso al contenido', 'No aplica — ingresos del grupo menores al umbral', 'Desconocido'] },
      { id: 'consistencia', label: '¿El perfil funcional de la entidad analizada es consistente entre la Declaración Informativa Local, la Maestra y el Reporte País por País?',
        tipo: 'radio', opts: ['Sí — revisado y consistente', 'No lo hemos verificado', 'Hay inconsistencias identificadas', 'No contamos con los tres documentos para comparar'] },
      { id: 'auditoria', label: '¿La entidad ha sido objeto de revisión por parte del Servicio de Administración Tributaria (SAT) en materia de precios de transferencia en los últimos 5 años?',
        tipo: 'radio', opts: ['No', 'Sí — revisión resuelta sin ajuste', 'Sí — con ajuste acordado', 'Sí — en proceso o litigio pendiente'] },
      { id: 'buzon', label: '¿La entidad ha recibido notificaciones del SAT relacionadas con tasas efectivas o precios de transferencia vía Buzón Tributario?',
        tipo: 'radio', opts: ['No', 'Sí — notificación de tasa efectiva por debajo del parámetro sectorial', 'Sí — invitación a corregir precios de transferencia', 'Sí — requerimiento formal de información'] },
      { id: 'tasa', label: 'Tasa efectiva de ISR de la entidad analizada vs. el parámetro sectorial publicado por el SAT (Art. 33 CFF)',
        tipo: 'radio', opts: ['Por encima del parámetro sectorial', 'Dentro del parámetro sectorial', 'Por debajo del parámetro sectorial — posible riesgo de notificación', 'No se ha calculado la tasa efectiva propia'] },
    ],
  },
  {
    id: 's07', num: '07',
    titulo: 'Reestructuras y Cambios de Modelo de Negocio',
    desc: 'Las reestructuras corporativas son uno de los principales focos de fiscalización del SAT 2025–2026. La autoridad exige documentar el "antes y después" de cada cambio significativo en funciones, activos o riesgos, tanto para ISR como para IVA.',
    preguntas: [
      { id: 'reestr', label: '¿Ha habido alguna reestructura corporativa o cambio de modelo de negocio en los últimos 3 años?',
        tipo: 'radio', opts: ['No', 'Sí — cambio menor de carácter administrativo', 'Sí — cambio significativo (conversión de modelo, transferencia de activos)', 'Sí — fusión, escisión o adquisición'] },
      { id: 'tipo_rs', label: 'Tipo de reestructura (selecciona todos los que apliquen)',
        tipo: 'multi', opts: ['Conversión de empresa con riesgo completo a empresa maquiladora', 'Conversión de empresa maquiladora a empresa con riesgo completo', 'Transferencia de intangibles al extranjero', 'Transferencia de intangibles desde el extranjero', 'Centralización de funciones en otra entidad del grupo', 'Cambio de distribuidor con riesgo completo a comisionista', 'Fusión o adquisición de entidad', 'Escisión de la entidad analizada', 'No aplica'] },
      { id: 'valuacion', label: '¿Se realizó una valuación independiente de los activos o funciones transferidas?',
        tipo: 'radio', opts: ['Sí — con valuador independiente externo', 'Sí — valuación interna del grupo', 'No se realizó ninguna valuación formal', 'No aplica'] },
      { id: 'doc_rs', label: '¿Existe documentación del análisis funcional del "antes y después" de la reestructura?',
        tipo: 'radio', opts: ['Sí — documentado con análisis comparativo', 'Parcialmente documentado', 'No existe documentación', 'No aplica'] },
    ],
  },
  {
    id: 's08', num: '08',
    titulo: 'Información Adicional',
    desc: 'Contexto adicional relevante para el análisis funcional.',
    preguntas: [
      { id: 'situacion', label: '¿Existe alguna situación especial o atípica del ejercicio que deba considerarse en el análisis?',
        tipo: 'textarea', ph: 'Ej. efectos de pandemia, huelga, pérdida de cliente principal, inicio de operaciones, impacto de aranceles, cambio de CEO...' },
      { id: 'estrategia', label: '¿Existe alguna estrategia de negocio del grupo que justifique resultados por debajo del mercado?',
        tipo: 'radio', opts: ['Sí — documentada y justificada económicamente (ej. penetración de mercado, fase de arranque)', 'Sí — pero no está documentada formalmente', 'No aplica'] },
      { id: 'nuevas_ops', label: '¿Hay nuevos tipos de operaciones con partes relacionadas que no existían en el ejercicio anterior?',
        tipo: 'radio', opts: ['No', 'Sí — favor de describir en las notas adicionales', 'En proceso de evaluación'] },
      { id: 'notas', label: 'Notas adicionales o comentarios relevantes para el análisis',
        tipo: 'textarea', ph: 'Cualquier información adicional que considere relevante...' },
      { id: 'contacto', label: 'Nombre y cargo del responsable de precios de transferencia en la empresa',
        tipo: 'texto', ph: 'Nombre y cargo' },
      { id: 'fecha', label: 'Fecha en que se completa este cuestionario',
        tipo: 'texto', ph: 'DD/MM/AAAA' },
    ],
  },
];

export const CATEGORIAS_DOCS = [
  {
    id: 'estados_financieros',
    label: 'Estados Financieros',
    desc: 'Balance General, Estado de Resultados, Flujo de Efectivo — preferentemente dictaminados o con notas',
    acepta: '.pdf,.xlsx,.xls,.csv',
  },
  {
    id: 'contratos',
    label: 'Contratos con Partes Relacionadas',
    desc: 'Contratos de servicios, licencias, regalías, préstamos, manufactura, distribución',
    acepta: '.pdf,.doc,.docx',
  },
  {
    id: 'otros',
    label: 'Documentación Adicional',
    desc: 'Organigramas corporativos, estudios previos, declaraciones informativas, cualquier documento de soporte',
    acepta: '.pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.zip',
  },
];

export function getRiesgos(respuestas) {
  const f = [];
  if (respuestas.s02?.conducta === 'No — la operación real difiere significativamente de los contratos')
    f.push({ nivel: 'alto', msg: 'Desalineación entre conducta real y contratos — riesgo de reclasificación del perfil funcional por el SAT' });
  if (respuestas.s04?.cap_fin === 'No — dependería totalmente del grupo para absorber pérdidas')
    f.push({ nivel: 'medio', msg: 'Capacidad financiera insuficiente para los riesgos asignados contractualmente' });
  if (respuestas.s06?.tasa === 'Por debajo del parámetro sectorial — posible riesgo de notificación')
    f.push({ nivel: 'alto', msg: 'Tasa efectiva por debajo del parámetro sectorial SAT — riesgo de notificación vía Buzón Tributario' });
  if (respuestas.s05?.contratos === 'No — las operaciones se realizan sin contratos formales')
    f.push({ nivel: 'alto', msg: 'Ausencia de contratos intercompañía formales — vulnerabilidad significativa ante revisión del SAT' });
  if (respuestas.s03?.titularidad === 'No — el propietario legal no realiza las funciones DEMPE principales')
    f.push({ nivel: 'medio', msg: 'Divergencia DEMPE — el propietario legal de los intangibles no es quien crea el valor' });
  if (respuestas.s04?.ep === 'Sí — con poderes para concluir contratos (posible Establecimiento Permanente no reconocido)')
    f.push({ nivel: 'alto', msg: 'Posible Establecimiento Permanente no reconocido de entidad extranjera en México — revisar con urgencia' });
  if (respuestas.s06?.auditoria === 'Sí — en proceso o litigio pendiente')
    f.push({ nivel: 'alto', msg: 'Revisión del SAT en proceso o litigio pendiente — coordinar estrategia de defensa documental' });
  if (respuestas.s06?.consistencia === 'Hay inconsistencias identificadas')
    f.push({ nivel: 'alto', msg: 'Inconsistencias entre Declaración Informativa Local, Maestra y Reporte País por País — el SAT cruza los tres documentos sistemáticamente' });
  return f;
}
