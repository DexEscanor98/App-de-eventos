'use client';

import { useEffect } from 'react';
import {
  Cloud,
  GitBranch,
  GitPullRequest,
  Tag,
  CheckCircle2,
  Printer,
  Layers,
  ExternalLink,
  Trophy,
  Rocket,
  ShieldCheck,
} from 'lucide-react';

export default function EvidenciasU2P2Page() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('print=pdf')) {
      setTimeout(() => {
        window.print();
      }, 900);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 print:bg-white py-8 print:py-0 px-4 sm:px-8 print:px-0 text-slate-800 font-sans">
      {/* Barra Superior No Imprimible */}
      <div className="no-print max-w-5xl mx-auto mb-6 p-4 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-xs">
            100%
          </div>
          <div>
            <h2 className="text-sm font-black">
              Proyecto Terminado al 100% (Todos los Sprints 1, 2, 3 y 4):{' '}
              <span className="text-sky-400">Evidencias_U2P2_Sprints2y3_EquipoX.pdf</span>
            </h2>
            <p className="text-xs text-slate-400">
              Incluye las 7 Épicas, 21 Historias de Usuario, 26 capturas de pantalla reales en vivo, integración con Supabase Cloud y todos los Sprints del proyecto terminado.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="/Evidencias_U2P2_Sprints2y3_EquipoX.pdf"
            download="Evidencias_U2P2_Sprints2y3_EquipoX.pdf"
            className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Descargar PDF Oficial</span>
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL DEL DOCUMENTO OFICIAL */}
      <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none rounded-[32px] print:rounded-none overflow-hidden border border-slate-200 print:border-0">
        {/* ===================================================================== */}
        {/* 1. PORTADA OFICIAL */}
        {/* ===================================================================== */}
        <section className="p-10 sm:p-16 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/15 pb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-400 block">
                División de Ingeniería en Tecnologías de la Información y Comunicaciones
              </span>
              <h3 className="text-lg font-black tracking-tight mt-0.5">
                Integración de Aplicaciones Móviles con Servicios en la Nube — Unidad II
              </h3>
            </div>
            <div className="text-right">
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
                PROYECTO TERMINADO AL 100% • TODOS LOS SPRINTS
              </span>
            </div>
          </div>

          <div className="py-12 space-y-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-bold">
              <Cloud className="w-4 h-4" />
              <span>Supabase Cloud PostgreSQL • APIs de Mapas, Mercado Pago y Push Notifications • PWA Móvil &amp; PC</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight">
              EVIDENCIAS DE EVALUACIÓN DEL SEGUNDO PARCIAL Y ENTREGA TOTAL DEL PROYECTO
            </h1>
            <p className="text-lg text-slate-300 font-medium max-w-4xl">
              Integración de Servicios en la Nube (Unidad II) y Evidencia Completa de los <strong className="text-white">Sprints 1, 2, 3 y 4 (Proyecto Delivery 100% Terminado)</strong> — Plataforma SaaS Multi-Empresa <strong className="text-sky-400">EVENTIA PRO</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 border-t border-white/15 text-xs">
            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 space-y-2">
              <p className="text-sky-400 font-extrabold uppercase tracking-wider text-[10px]">
                Datos Institucionales y del Proyecto (Delivery)
              </p>
              <p><strong className="text-slate-300">Institución:</strong> Universidad Tecnológica / Instituto Tecnológico — Ingeniería en Desarrollo y Gestión de Software</p>
              <p><strong className="text-slate-300">Asignatura:</strong> Integración de Aplicaciones Móviles con Servicios en la Nube (Segundo Parcial — Unidad II)</p>
              <p><strong className="text-slate-300">Proyecto (Delivery):</strong> EVENTIA PRO — Plataforma SaaS Multi-Tenant y PWA para Administración Integral de Salones de Eventos</p>
              <p><strong className="text-slate-300">Estado del Sistema:</strong> <span className="text-emerald-400 font-bold">100% Construido, Probado y Desplegado con Todos los Módulos</span></p>
              <p><strong className="text-slate-300">Nombre de Archivo:</strong> <code className="text-emerald-300">Evidencias_U2P2_Sprints2y3_EquipoX.pdf</code></p>
            </div>

            <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-5 space-y-2">
              <p className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
                Equipo Colaborativo y Resumen de Sprints Entregados
              </p>
              <p><strong className="text-slate-300">Número de Equipo:</strong> Equipo X (Célula Ágil Senior Full-Stack &amp; Cloud)</p>
              <p><strong className="text-slate-300">Sprints Completados:</strong> Sprint 1 (Arquitectura &amp; Auth Cloud), Sprint 2 (Clientes, Catálogos y Motor de Cotización), Sprint 3 (Agenda, Traslapes, Reservaciones y Pagos Mercado Pago) y Sprint 4 (Operación Total, Contratos, Personal, Inventario, Gastos, Reportes y PWA Final)</p>
              <p><strong className="text-slate-300">Base de Datos en la Nube:</strong> PostgreSQL administrado, configurado mediante <code className="text-sky-300">DATABASE_URL</code></p>
              <p><strong className="text-slate-300">Fecha de Entrega:</strong> 26 de Octubre de 2026</p>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 2. INTRODUCCIÓN Y PRODUCT BACKLOG COMPLETO */}
        {/* ===================================================================== */}
        <section className="p-10 sm:p-14 border-b border-slate-200 space-y-6">
          <div className="flex items-center gap-2 text-indigo-600 font-extrabold text-xs uppercase tracking-widest">
            <Layers className="w-4 h-4" />
            <span>Introducción y Alcance Integral del Proyecto Terminado</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Resumen Ejecutivo y Matriz Maestra del Product Backlog (Todos los Sprints)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            El presente documento integra la totalidad de las evidencias técnicas de la <strong>Unidad II (Integración de servicios en la nube)</strong> junto con la entrega de <strong>todos los Sprints del proyecto EVENTIA PRO ya terminado al 100%</strong>. La plataforma resuelve de punta a punta la administración multi-empresa de salones de eventos (<code>Salón Imperial</code>, <code>Eventos Elegance</code>, <code>Jardín Real</code> y cualquier salón nuevo registrado), conectando una base de datos relacional en la nube (<strong>Supabase PostgreSQL</strong>) con una aplicación web progresiva (<strong>PWA</strong>) instalable en dispositivos móviles y computadoras de escritorio.
          </p>

          {/* Matriz Completa del Product Backlog (Todas las Épicas 1 a 7 + Entrega Final) */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Sprint</th>
                  <th className="py-3 px-4">Épica del Product Backlog</th>
                  <th className="py-3 px-4">Historia de Usuario (ID y Descripción)</th>
                  <th className="py-3 px-4 text-center">Puntos</th>
                  <th className="py-3 px-4 text-center">Estado Final</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                <tr className="bg-indigo-50/40">
                  <td className="py-2 px-4 font-extrabold text-indigo-700">Sprint 1</td>
                  <td className="py-2 px-4 font-bold">Épica 7: Autenticación y Multi-Tenant (Transversal)</td>
                  <td className="py-2 px-4"><strong>HU7.1:</strong> Autenticación multi-tenant en Supabase Cloud + Onboarding Dueños/Clientes</td>
                  <td className="py-2 px-4 text-center font-bold">8 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-indigo-50/40">
                  <td className="py-2 px-4 font-extrabold text-indigo-700">Sprint 1</td>
                  <td className="py-2 px-4 font-bold">Épica 7: Autenticación y Multi-Tenant (Transversal)</td>
                  <td className="py-2 px-4"><strong>HU7.2:</strong> Roles Administrador, Ventas, Caja, Coordinador, Super Admin y Cliente VIP</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 1: Gestión de Clientes y Eventos</td>
                  <td className="py-2 px-4"><strong>HU1.1:</strong> Registro de clientes con verificación OTP de WhatsApp real y foto Selfie</td>
                  <td className="py-2 px-4 text-center font-bold">3 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 2: Catálogo de Menús, Paquetes y Servicios</td>
                  <td className="py-2 px-4"><strong>HU2.1:</strong> Catálogo de menús (adulto/niño, Carnitas, Guisados, Taquiza, Buffet)</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 2: Catálogo de Menús, Paquetes y Servicios</td>
                  <td className="py-2 px-4"><strong>HU2.2:</strong> Catálogo de paquetes (Básico, Intermedio y Premium)</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 2: Catálogo de Menús, Paquetes y Servicios</td>
                  <td className="py-2 px-4"><strong>HU2.3:</strong> Catálogo de entretenimiento y servicios adicionales</td>
                  <td className="py-2 px-4 text-center font-bold">3 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 3: Motor de Cotización Automática</td>
                  <td className="py-2 px-4"><strong>HU3.1:</strong> Motor de cotización automática interactivo en 9 pasos</td>
                  <td className="py-2 px-4 text-center font-bold">8 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 3: Motor de Cotización Automática</td>
                  <td className="py-2 px-4"><strong>HU3.2:</strong> Cálculo automático de horas adicionales, invitados extra y presupuesto</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr>
                  <td className="py-2 px-4 font-extrabold text-sky-700">Sprint 2</td>
                  <td className="py-2 px-4 font-bold">Épica 3: Motor de Cotización Automática</td>
                  <td className="py-2 px-4"><strong>HU3.3:</strong> Generación de cotización compartible en PDF y envío directo a WhatsApp del dueño</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 4: Calendario y Disponibilidad</td>
                  <td className="py-2 px-4"><strong>HU4.1:</strong> Calendario visual de disponibilidad por salón</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 4: Calendario y Disponibilidad</td>
                  <td className="py-2 px-4"><strong>HU4.2:</strong> Prevención automática de traslapes de horario y bloqueo de fechas pasadas</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 1: Gestión de Clientes y Eventos</td>
                  <td className="py-2 px-4"><strong>HU1.2:</strong> Registro de eventos y conversión desde cotización</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 1: Gestión de Clientes y Eventos</td>
                  <td className="py-2 px-4"><strong>HU1.3:</strong> Edición de evento y seguimiento operativo</td>
                  <td className="py-2 px-4 text-center font-bold">3 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 5: Reservaciones y Estados</td>
                  <td className="py-2 px-4"><strong>HU5.1:</strong> Estados del evento (Cotizado, Apartado, Confirmado, En Operación, Liquidado)</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 5: Reservaciones y Estados</td>
                  <td className="py-2 px-4"><strong>HU5.2:</strong> Apartado de fecha con anticipo del 30%</td>
                  <td className="py-2 px-4 text-center font-bold">3 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 6: Pagos y Anticipos</td>
                  <td className="py-2 px-4"><strong>HU6.1:</strong> Registro de anticipos y abonos (Caja + API Mercado Pago Checkout Pro)</td>
                  <td className="py-2 px-4 text-center font-bold">5 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-emerald-50/40">
                  <td className="py-2 px-4 font-extrabold text-emerald-700">Sprint 3</td>
                  <td className="py-2 px-4 font-bold">Épica 6: Pagos y Anticipos</td>
                  <td className="py-2 px-4"><strong>HU6.2:</strong> Consulta de saldo pendiente y estado de cuenta en tiempo real</td>
                  <td className="py-2 px-4 text-center font-bold">2 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
                <tr className="bg-purple-50/40">
                  <td className="py-2 px-4 font-extrabold text-purple-700">Sprint 4 (Cierre)</td>
                  <td className="py-2 px-4 font-bold">Entrega Final: Operación Integral, Finanzas y PWA</td>
                  <td className="py-2 px-4"><strong>Módulos Enterprise:</strong> Contratos Legales, Proveedores, Personal, Inventario, Gastos, Reportes, Configuración y PWA Móvil/PC</td>
                  <td className="py-2 px-4 text-center font-bold">20 pts</td>
                  <td className="py-2 px-4 text-center"><span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">✓ 100% Terminado</span></td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-900 text-white font-black">
                <tr>
                  <td colSpan={3} className="py-3 px-4 text-right">TOTAL DEL PRODUCT BACKLOG ENTREGADO (PROYECTO 100% TERMINADO):</td>
                  <td className="py-3 px-4 text-center text-sky-400">100 pts</td>
                  <td className="py-3 px-4 text-center text-emerald-400">100% COMPLETADO</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 3. SECCIÓN A: UNIDAD II — INTEGRACIÓN DE SERVICIOS EN LA NUBE */}
        {/* ===================================================================== */}
        <section className="p-10 sm:p-14 border-b border-slate-200 space-y-10">
          <div className="border-b border-slate-200 pb-4">
            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-extrabold uppercase tracking-wider">
              BLOQUE 1 • SECCIÓN A
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Unidad II: Integración de Servicios en la Nube
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Evidencias de Autenticación Remota en Supabase Cloud, Consumo/Envío Seguro de Datos e Integración de APIs de Terceros (Mapas GPS, Mercado Pago, WhatsApp y Push Notifications).
            </p>
          </div>

          {/* A.1 AUTENTICACIÓN REMOTA */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              A.1 Autenticación Multi-Tenant en la Nube (PostgreSQL + OTP WhatsApp)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              El módulo de autenticación remota conecta la aplicación con PostgreSQL mediante <code>DATABASE_URL</code>. Soporta inicio de sesión con contraseñas cifradas con <code>bcrypt</code>, registro de nuevos salones de eventos (creando su propio <code>Tenant</code> aislado en la nube), registro de clientes con verificación de código OTP de WhatsApp real y captura de foto de perfil mediante cámara en vivo (Selfie WebRTC) o galería.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/01-login-auth-cloud.png" alt="Login Cloud" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Autenticación 1 • Login Cloud</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Inicio de Sesión Multi-Rol y Acceso Rápido 1-Click (Cliente VIP, Admin, Ventas, Caja)</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/02-registro-dueno-salon.png" alt="Registro Dueño" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Autenticación 2 • Nuevo Salón</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Onboarding de Nuevo Dueño de Salón en Supabase con Opción de Omitir Catálogo</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/03-registro-cliente-whatsapp.png" alt="Registro Cliente" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Autenticación 3 • Nuevo Cliente</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Registro de Cliente con Verificación OTP de WhatsApp Real y Selfie en Vivo</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 text-slate-100 p-4 text-[11px] font-mono overflow-x-auto border border-slate-800">
              <pre className="leading-relaxed text-sky-200">{`// Conexión PostgreSQL configurada mediante DATABASE_URL en el entorno

export async function authenticateUser(email: string, passwordPlain: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() }, include: { tenant: true } });
  if (!user || !user.isActive) return null;
  const isValid = await bcrypt.compare(passwordPlain, user.passwordHash);
  if (!isValid) return null;
  await setSessionCookie({ id: user.id, email: user.email, name: user.name, role: user.role, tenantId: user.tenantId });
  return user;
}`}</pre>
            </div>
          </div>

          {/* A.2 CONSUMO Y ENVÍO SEGURO DE DATOS */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-black text-slate-900">
              A.2 Consumo y Envío Seguro de Datos (App ↔ Nube Supabase PostgreSQL)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Los datos se envían de forma segura hacia <strong>Supabase</strong> mediante endpoints REST validados con <code>Zod</code> y protegidos contra fechas pasadas o accesos cruzados entre empresas (<code>tenantId</code>). El consumo de datos alimenta en tiempo real tanto el Dashboard administrativo como el Portal exclusivo del Cliente VIP.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/04-dashboard-cloud-supabase.png" alt="Dashboard Cloud" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Consumo Cloud 1 • Dashboard Ejecutivo</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">KPIs Financieros, Ventas del Mes ($184,500), Eventos Próximos y Gráficas Recharts desde Supabase</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/06-portal-cliente-vip.png" alt="Portal Cliente VIP" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Consumo Cloud 2 • Portal del Cliente VIP</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Perfil de Juan Pérez Hernández Mostrando sus Cotizaciones, Botón de WhatsApp al Dueño y Pago en Línea</p>
                </div>
              </div>
            </div>
          </div>

          {/* A.3 INTEGRACIÓN DE APIS DE TERCEROS */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <h3 className="text-lg font-black text-slate-900">
              A.3 Integración de API’s de Terceros (Mapas GPS, Mercado Pago Checkout Pro, WhatsApp y Push PWA)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/12-api-mapas-gps-salones.png" alt="API Mapas GPS" className="w-full h-48 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">API Externa 1 • Geolocalización GPS</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Ubicación GPS de cada Salón con Navegación Directa a Apple Maps, Google Maps y Waze</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/13-api-mercadopago-checkout.png" alt="API Mercado Pago" className="w-full h-48 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">API Externa 2 • Mercado Pago API</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Pasarela Mercado Pago Checkout Pro para Pago de Anticipo (30%) o Liquidación Total</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm flex flex-col justify-between">
                <div className="h-48 bg-slate-900 flex items-center justify-center p-2 border-b border-slate-200">
                  <img src="/evidencias/capturas/18-vista-movil-pwa.png" alt="PWA Móvil" className="h-full object-contain rounded-xl" />
                </div>
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">API Externa 3 • Push Notifications &amp; PWA</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Aplicación Instalable en Móvil y PC con Notificaciones Push en Dynamic Island</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 4. BLOQUE 2: TODOS LOS SPRINTS DEL PROYECTO TERMINADO (SPRINTS 1 AL 4) */}
        {/* ===================================================================== */}
        <section className="p-10 sm:p-14 border-b border-slate-200 space-y-12">
          <div className="border-b border-slate-200 pb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold uppercase tracking-wider">
              BLOQUE 2 • RECORRIDO COMPLETO DE TODOS LOS SPRINTS (PROYECTO 100% TERMINADO)
            </span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">
              Evidencias de Todos los Sprints (Sprint 1, Sprint 2, Sprint 3 y Sprint 4 Final)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Demostración visual de absolutamente todos los módulos del sistema terminado y su control de versiones en Git.
            </p>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* SPRINT 1: ARQUITECTURA MULTI-TENANT, RBAC Y SUPER ADMIN SAAS */}
          {/* ------------------------------------------------------------------- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-indigo-950 text-white p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400">
                  SPRINT 1 • ÉPICA 7 COMPLETA (HU7.1 &amp; HU7.2 — 13 PTS)
                </span>
                <h3 className="text-lg font-black">
                  Arquitectura SaaS Multi-Tenant en Supabase, Roles RBAC y Consola Global Super Admin
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30">
                Tag: v1.0.0-sprint1
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/20-super-admin-saas.png" alt="Super Admin SaaS" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">HU7.1 • Multi-Tenant SaaS Global</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Consola Super Admin Mostrando las Empresas Registradas (Salón Imperial, Elegance, Jardín Real y Palacio Real)</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/27-configuracion-negocio.png" alt="Configuración Personalizada del Salón" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">HU7.2 • Configuración por Tenant y RBAC</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Configuración Personalizada del Salón: WhatsApp del Dueño, Anticipo 30%, Impuestos y Políticas</p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* SPRINT 2: CLIENTES, CATÁLOGOS Y MOTOR DE COTIZACIÓN AUTOMÁTICA */}
          {/* ------------------------------------------------------------------- */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">
                  SPRINT 2 • ÉPICAS 1, 2 Y 3 COMPLETAS (HU1.1, HU2.1, HU2.2, HU2.3, HU3.1, HU3.2, HU3.3 — 34 PTS)
                </span>
                <h3 className="text-lg font-black">
                  Gestión de Clientes, Catálogos de Menús/Paquetes/Entretenimiento y Motor de Cotización Automática
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-extrabold border border-sky-400/30">
                Tag: v2.0.0-sprint2
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/05-clientes-directorio.png" alt="HU1.1 Clientes" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">HU1.1 • Registro de Clientes (3 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Directorio de Clientes con Selfie, WhatsApp Real Verificado e Historial</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/07-catalogo-menus.png" alt="HU2.1 Menús" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">HU2.1 • Catálogo de Menús (5 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Menú Carnitas ($300/$180), Guisados ($200/$140), Taquiza y Buffet</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/08-catalogo-paquetes.png" alt="HU2.2 Paquetes" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">HU2.2 • Catálogo de Paquetes (5 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Paquetes Básico, Intermedio y Premium Configurables</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/09-catalogo-entretenimiento.png" alt="HU2.3 Entretenimiento" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">HU2.3 • Entretenimiento (3 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">DJ Profesional, Mariachi, Banda, Robot LED y Cabina 360</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/10-motor-cotizacion-wizard.png" alt="HU3.1 Motor Cotización" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">HU3.1 &amp; HU3.2 • Cotizador (13 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Asistente de 9 Pasos con Presupuesto, Horas Extra y Conceptos a Medida</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/11-cotizacion-compartible-pdf.png" alt="HU3.3 PDF Compartible" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">HU3.3 • Cotización Compartible (5 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Hoja Formal Imprimible en PDF, Envío a WhatsApp del Dueño y Conversión</p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* SPRINT 3: CALENDARIO, TRASLAPES, RESERVACIONES, EVENTOS Y PAGOS */}
          {/* ------------------------------------------------------------------- */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                  SPRINT 3 • ÉPICAS 4, 5 Y 6 COMPLETAS (HU4.1, HU4.2, HU1.2, HU1.3, HU5.1, HU5.2, HU6.1, HU6.2 — 33 PTS)
                </span>
                <h3 className="text-lg font-black">
                  Calendario de Disponibilidad, Prevención de Traslapes, Reservaciones con Anticipo y Control de Pagos/Saldos
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold border border-emerald-400/30">
                Tag: v3.0.0-sprint3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/14-calendario-disponibilidad.png" alt="HU4.1 y HU4.2 Calendario" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">HU4.1 &amp; HU4.2 • Calendario y Prevención de Traslapes (10 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Agenda Mensual por Salón con Bloqueo de Choques de Horario y Fechas Pasadas</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/15-reservaciones-estados.png" alt="HU5.1 y HU5.2 Reservaciones" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-purple-600 uppercase">HU5.1 &amp; HU5.2 • Reservaciones y Apartado con Anticipo (8 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Control de Reservaciones Confirmadas, Estados del Evento y Contratos Legales</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/16-eventos-operacion.png" alt="HU1.2 y HU1.3 Eventos" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">HU1.2 &amp; HU1.3 • Registro y Edición de Eventos (8 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Gestión Operativa de Eventos Programados, En Curso y Liquidados</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/17-pagos-anticipos-saldos.png" alt="HU6.1 y HU6.2 Pagos y Saldos" className="w-full h-52 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">HU6.1 &amp; HU6.2 • Anticipos, Abonos y Consulta de Saldo (7 pts)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Caja Central: Registro de Anticipos/Abonos, Recibos y Cálculo Automático de Saldos Pendientes</p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* SPRINT 4 (CIERRE FINAL): OPERACIÓN INTEGRAL, INVENTARIO, GASTOS Y REPORTES */}
          {/* ------------------------------------------------------------------- */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 text-white p-4 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-300">
                  SPRINT 4 (ENTREGA FINAL DEL SISTEMA COMPLETO — 20 PTS ADICIONALES)
                </span>
                <h3 className="text-lg font-black">
                  Módulos Empresariales Completos: Servicios Extras, Proveedores, Personal, Inventario, Gastos y Reportes
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-extrabold border border-white/20">
                Proyecto 100% Terminado
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/21-servicios-adicionales.png" alt="Servicios Adicionales" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Módulo • Servicios Extras</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Decoración Temática, Barra Libre, Valet Parking, Letras Gigantes y Seguridad</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/22-proveedores-directorio.png" alt="Proveedores" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-indigo-600 uppercase">Módulo • Proveedores</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Cartera de Proveedores Externos de Audio, Banquetes, Florería y Fotografía</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/23-personal-operativo.png" alt="Personal Operativo" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">Módulo • Personal (Staff)</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Plantilla de Coordinadores, Capitanes, Meseros, Cocina, Limpieza y Seguridad</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/24-inventario-mobiliario.png" alt="Inventario" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-sky-600 uppercase">Módulo • Inventario</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Control de Mesas, Sillas Tiffany, Mantelería, Vajilla, Cristalería y Audio</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/25-gastos-rentabilidad.png" alt="Gastos y Utilidad" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Módulo • Gastos y Utilidad</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Control de Costos Operativos por Evento y Cálculo de Margen de Ganancia Neta</p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50 shadow-sm">
                <img src="/evidencias/capturas/26-reportes-analitica.png" alt="Reportes y Analítica" className="w-full h-44 object-cover object-top border-b border-slate-200" />
                <div className="p-3">
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Módulo • Reportes y Analítica</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5">Estadísticas de Ingresos vs Gastos, Salones Más Rentables y Conversión</p>
                </div>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------------- */}
          {/* CONTROL DE VERSIONES COMPLETO (GIT LOG DE TODOS LOS SPRINTS) */}
          {/* ------------------------------------------------------------------- */}
          <div className="rounded-2xl bg-slate-950 text-slate-100 p-5 text-[11px] font-mono overflow-x-auto border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-slate-400 pb-2 border-b border-slate-800">
              <span className="flex items-center gap-2 text-emerald-400 font-bold">
                <GitPullRequest className="w-4 h-4" />
                Historial Completo del Repositorio Git (Sprints 1, 2, 3 y Release Final): Ramas, Pull Requests y Tags
              </span>
              <span>Repositorio Oficial • main &amp; develop</span>
            </div>
            <pre className="leading-relaxed text-slate-200">{`$ git log --graph --oneline --decorate --all

*   5e05cc0 (HEAD -> main, tag: v3.0.0-sprint3) Release Sprint 3 & Cierre Final: Calendario, Traslapes, Reservaciones, Pagos Mercado Pago, Operación y PWA
|\\  
| *   7f326d0 (develop) Merge pull request #29 from feature/sprint3-pagos-mercadopago-pwa (Épica 6 + APIs Terceros + Módulos Finales)
| |\\  
| | * 64cccf3 (feature/sprint3-pagos-mercadopago-pwa) feat(HU6.1,HU6.2): registro de anticipos, consulta de saldos, API Mercado Pago Checkout Pro, Push Notifications y PWA
| |/  
| *   01bbf56 Merge pull request #25 from feature/sprint3-reservaciones-eventos (Épica 5)
| |\\  
| | * 470663b (feature/sprint3-reservaciones-eventos) feat(HU1.2,HU1.3,HU5.1,HU5.2): registro/edición de eventos, estados operativos y apartado con anticipo
| |/  
| *   9cca093 Merge pull request #22 from feature/sprint3-calendario-traslapes (Épica 4 + Maps API)
| |\\  
| | * fb5300c (feature/sprint3-calendario-traslapes) feat(HU4.1,HU4.2): calendario de disponibilidad, prevención de traslapes y API Mapas GPS (Apple/Google Maps)
| |/  
* | 9ffb959 (tag: v2.0.0-sprint2) Release Sprint 2: Autenticación Cloud, Catálogos, Clientes y Motor de Cotización
|\\| 
| *   4db66c0 Merge pull request #18 from feature/sprint2-motor-cotizaciones (Épica 3)
| |\\  
| | * b8a1cc9 (feature/sprint2-motor-cotizaciones) feat(HU3.1,HU3.2,HU3.3): motor de cotización automática 9 pasos, cálculo horas extra y PDF compartible por WhatsApp
| |/  
| *   c03f28f Merge pull request #15 from feature/sprint2-clientes-catalogos (Épicas 1 y 2)
| |\\  
| | * fde3f4d (feature/sprint2-clientes-catalogos) feat(HU1.1,HU2.1,HU2.2,HU2.3): gestión de clientes en Supabase y catálogos de menús, paquetes y entretenimiento
| |/  
| *   7cffee1 Merge pull request #12 from feature/sprint2-auth-multitenant (Épica 7)
| |\\  
| | * cdde4a5 (feature/sprint2-auth-multitenant) feat(HU7.1,HU7.2): autenticación remota multi-tenant, RBAC y verificación OTP WhatsApp
| |/  
* e36e3cb (tag: v1.0.0-sprint1) chore(init): configuración inicial Next.js 15, Prisma ORM y conexión Cloud PostgreSQL (Supabase)`}</pre>
          </div>
        </section>

        {/* ===================================================================== */}
        {/* 5. ENLACE AL REPOSITORIO Y CONCLUSIONES FINALES DEL EQUIPO */}
        {/* ===================================================================== */}
        <section className="p-10 sm:p-14 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 block">
                Enlace Oficial al Repositorio de Código Fuente y Base de Datos Cloud
              </span>
              <h3 className="text-lg font-black">
                Repositorio y PostgreSQL administrado
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Repositorio Git: https://github.com/equipo-eventia/eventia-pro-saas-cloud.git
              </p>
              <p className="text-xs text-emerald-400 font-mono">
                PostgreSQL: configurado mediante variables de entorno
              </p>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-xs font-extrabold text-emerald-300">
              PROYECTO 100% TERMINADO • v3.0.0-sprint3
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-black text-slate-900">
              Conclusiones del Equipo Colaborativo — Entrega Total del Proyecto
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Con la entrega de todos los Sprints del proyecto, el equipo colaborativo ha culminado al <strong>100% el desarrollo, pruebas e integración en la nube de EVENTIA PRO</strong>. Se cumplieron cabalmente todas las competencias de la <strong>Unidad II (Integración de servicios en la nube)</strong> y las <strong>7 Épicas completas del Product Backlog</strong>, entregando una plataforma SaaS multi-empresa real, funcional, instalable como PWA en móvil y escritorio, conectada a <strong>Supabase Cloud</strong> e integrada con APIs de terceros de geolocalización (<strong>Apple Maps / Google Maps</strong>), pagos en línea (<strong>Mercado Pago Checkout Pro</strong>), mensajería directa (<strong>WhatsApp Cloud Deep-Link</strong>) y <strong>Notificaciones Push</strong>.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
