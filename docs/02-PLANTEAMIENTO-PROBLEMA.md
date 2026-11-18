# 02. PLANTEAMIENTO DEL PROBLEMA

## Análisis del Escenario Tradicional de Operación
En la operación cotidiana de salones de fiestas y eventos sociales, coexisten múltiples fuentes de fricción operativa derivadas del uso de libretas de agenda y archivos dispersos de Excel.

### 1. Conflictos de Horario y Doble Reserva (Double Booking)
El problema de mayor gravedad en el negocio de los salones es la sobreventa o doble apartado de un salón. Cuando dos ejecutivos de ventas ofrecen la misma fecha a distintos prospectos de forma simultánea, o cuando se cambia una fecha en una libreta sin notificar al resto del equipo, se generan cancelaciones de última hora, multas legales y daño irreversible al prestigio del negocio.

### 2. Dificultad y Lentitud en el Proceso de Cotización
Cotizar una fiesta para 100 personas no es lineal. Requiere sumar:
- Renta base del salón.
- Costo por menú de adulto ($300 x 100).
- Descuentos o paquetes especiales.
- Entretenimiento seleccionado (DJ profesional, banda en vivo, mariachi).
- Servicios adicionales (decoración temática, mesas de dulces, letras gigantes).
- Horas adicionales de salón ($1,500/hora).
El asesor comercial suele tardar horas o días en enviar una propuesta formal por escrito, lo que ocasiona la pérdida de clientes frente a competidores más ágiles.

### 3. Falta de Inmutabilidad en los Precios (Pérdida de Snapshots)
Una boda suele contratarse con 6 a 12 meses de anticipación. En ese lapso, la inflación obliga al salón a subir el precio del menú de $300 a $350. Si el software almacena una simple relación por clave foránea al catálogo sin guardar una copia congelada (snapshot) del precio en el momento de la firma, el sistema mostrará saldos incorrectos y provocará controversias legales con el cliente.

### 4. Control Deficiente de Anticipos y Saldos por Cobrar
Los clientes suelen apartar con un 30% de anticipo y liquidar en varios abonos antes del evento. Si los registros se llevan manualmente, no existe certeza de:
- Cuánto dinero real ha entrado en caja vs. transferencias SPEI.
- Cuánto resta exactamente por cobrar antes de permitir la entrada al evento.
- Quién recibió cada importe y cuál es la referencia bancaria del comprobante.

### 5. Inexistencia de Métricas de Rentabilidad Real
Muchos administradores confunden facturación bruta con utilidad. Un evento puede generar $52,000 MXN en ventas, pero si la compra de carne fresca para el banquete costó $16,000, los honorarios de DJ y meseros $8,000 y los insumos $5,000, la utilidad neta real es de $23,000 MXN. Sin un registro de gastos directos por evento, el salón desconoce qué paquetes y menús son verdaderamente rentables.
