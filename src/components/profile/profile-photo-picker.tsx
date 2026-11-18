'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  RefreshCw,
  Check,
  Trash2,
  Sparkles,
  User,
  X,
} from 'lucide-react';

interface ProfilePhotoPickerProps {
  value?: string | null;
  onChange: (dataUrl: string | null) => void;
  userName?: string;
  label?: string;
}

export function ProfilePhotoPicker({
  value,
  onChange,
  userName = 'U',
  label = 'Foto de Perfil (Selfie o Galería)',
}: ProfilePhotoPickerProps) {
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [flashEffect, setFlashEffect] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartSelfieCamera = async () => {
    setCameraError(null);
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 480 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      setCameraError(
        'No se pudo acceder a la cámara. Verifica los permisos del navegador o sube una foto desde tu galería.'
      );
    }
  };

  const handleCaptureSelfie = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 220);

    const canvas = document.createElement('canvas');
    const size = 280;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Recorte cuadrado centrado + efecto espejo selfie
    const vw = video.videoWidth || 480;
    const vh = video.videoHeight || 480;
    const minDim = Math.min(vw, vh);
    const sx = (vw - minDim) / 2;
    const sy = (vh - minDim) / 2;

    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onChange(dataUrl);
    stopCamera();
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 280;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const compressed = canvas.toDataURL('image/jpeg', 0.85);
        onChange(compressed);
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
        {label}
      </label>

      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-3xl bg-white/90 border border-slate-200/80 shadow-sm">
        {/* Avatar Preview */}
        <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-gradient-to-tr from-indigo-600 via-purple-500 to-sky-400 text-white flex items-center justify-center font-black text-2xl shadow-lg flex-shrink-0 ring-4 ring-indigo-500/15">
          {value ? (
            <img
              src={value}
              alt="Foto de perfil"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{userName ? userName.charAt(0).toUpperCase() : <User className="w-8 h-8" />}</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <button
              type="button"
              onClick={handleStartSelfieCamera}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-sky-400" />
              <span>Tomar Selfie con Cámara</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/70 text-xs font-bold transition-all"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Subir de Galería</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                title="Quitar foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-400">
            Puedes usar la cámara frontal de tu teléfono/PC o elegir una imagen de tu galería.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleGalleryUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Modal de Cámara Selfie en Vivo (Apple Photo Booth Style) */}
      {cameraOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xl flex items-center justify-center p-4 animate-apple-in">
          <div className="max-w-sm w-full bg-slate-900 border border-white/15 rounded-[36px] p-6 text-white shadow-2xl space-y-5 text-center relative overflow-hidden">
            {flashEffect && (
              <div className="absolute inset-0 bg-white z-50 pointer-events-none transition-opacity" />
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Cámara Selfie en Vivo
              </span>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-slate-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {cameraError ? (
              <div className="p-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-200 space-y-3">
                <p>{cameraError}</p>
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    fileInputRef.current?.click();
                  }}
                  className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs"
                >
                  Abrir Galería en su lugar
                </button>
              </div>
            ) : (
              <>
                <div className="relative w-64 h-64 mx-auto rounded-[40px] overflow-hidden border-2 border-sky-400/50 shadow-2xl bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                </div>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-xs font-bold text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCaptureSelfie}
                    className="px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 hover:from-indigo-400 hover:to-sky-300 text-slate-950 font-black text-xs shadow-lg shadow-sky-400/30 flex items-center gap-2 transition-transform active:scale-95"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capturar Selfie</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
