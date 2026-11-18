'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Building, X, Loader2, MapPin, Users, DollarSign } from 'lucide-react';
import { triggerPushNotification } from '@/lib/api-resilience';

export function AddVenueModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState(200);
  const [basePrice, setBasePrice] = useState(32000);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          capacity: Number(capacity),
          basePrice: Number(basePrice),
          location: location || undefined,
          description: description || undefined,
          isActive: true,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar salón');
      }

      triggerPushNotification({
        title: `✨ Espacio "${name}" Configurado`,
        body: `Capacidad para ${capacity} invitados y ubicación GPS lista en Apple/Google Maps.`,
        category: 'SYSTEM',
        actionUrl: '/venues',
      });

      setOpen(false);
      setName('');
      setLocation('');
      setDescription('');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-sky-500 hover:from-indigo-500 hover:to-sky-400 text-white rounded-full text-xs font-extrabold shadow-md shadow-indigo-500/20 transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Agregar / Configurar Salón</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-apple-in">
          <div className="apple-glass-card bg-white rounded-[32px] max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Configurar Nuevo Salón o Jardín</h3>
                  <p className="text-[11px] text-slate-500">Agrega un espacio a tu empresa en cualquier momento</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del Salón / Terraza / Jardín *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Gran Salón Cristal o Jardín Los Olivos"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-500" /> Capacidad (Invitados)
                  </label>
                  <input
                    type="number"
                    min={20}
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Renta Base (MXN)
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" /> Dirección para GPS (Apple / Google Maps)
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ej. Av. Paseo de la Reforma 505, CDMX"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción y Amenidades</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej. Aire acondicionado, pista LED, estacionamiento valet..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-600 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold flex items-center gap-1.5 shadow-md"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Espacio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
