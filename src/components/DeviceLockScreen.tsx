import React, { useState } from 'react';
import {
  Lock,
  Smartphone,
  Laptop,
  Monitor,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import { DeviceAuthService } from '../lib/deviceAuth';
import { DeviceType } from '../types';

interface DeviceLockScreenProps {
  onAuthorized: () => void;
}

export const DeviceLockScreen: React.FC<DeviceLockScreenProps> = ({ onAuthorized }) => {
  const [deviceInfo] = useState(() => DeviceAuthService.getOrInitCurrentDeviceInfo());
  const [customName, setCustomName] = useState(deviceInfo.deviceName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(deviceInfo.deviceId);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Masukkan password rahasia pemilik.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await DeviceAuthService.authorizeCurrentDevice(pin, customName);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onAuthorized();
        }, 800);
      } else {
        setErrorMsg(res.error || 'Password tidak valid.');
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat memverifikasi perangkat.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'iphone':
      case 'android':
        return <Smartphone className="w-5 h-5 text-amber-700" />;
      case 'mac':
      case 'windows':
      case 'linux':
        return <Laptop className="w-5 h-5 text-amber-700" />;
      default:
        return <Monitor className="w-5 h-5 text-amber-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white border-2 border-slate-900 p-6 sm:p-8 shadow-[6px_6px_0px_#0f172a] space-y-6 relative overflow-hidden animate-scale-in">
        {/* Playful Top Strip in Saweria Style */}
        <div className="h-2 w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500 absolute top-0 left-0 border-b border-slate-900" />
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2 pt-1">
          <div className="relative inline-block">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] transition-all duration-300 ${
              isSuccess
                ? 'bg-emerald-300 text-slate-950 scale-105'
                : 'bg-[#FFC72C] text-slate-950'
            }`}>
              {isSuccess ? (
                <ShieldCheck className="w-8 h-8 animate-scale-in" />
              ) : (
                <Lock className="w-7 h-7" />
              )}
            </div>
            {!isSuccess && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-slate-900" />
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {isSuccess ? 'Perangkat Berhasil Didaftarkan!' : 'Perangkat Belum Terdaftar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto leading-relaxed font-medium">
            {isSuccess
              ? 'Membuka dashboard analitik TikTok Anda...'
              : 'Website ini diproteksi secara privat. Hanya perangkat terdaftar yang dapat melihat konten analitik.'}
          </p>
        </div>

        {/* Device Information Card */}
        <div className="bg-amber-50/70 border-2 border-slate-900 rounded-2xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3 shadow-[2px_2px_0px_#0f172a]">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white shadow-2xs border-2 border-slate-900 shrink-0">
                {renderDeviceIcon(deviceInfo.deviceType)}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-wider">
                  Identitas Perangkat
                </div>
                {isEditingName ? (
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    className="text-xs font-black text-slate-900 bg-white border-2 border-slate-900 rounded px-1.5 py-0.5 focus:outline-hidden w-full"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-black text-slate-900 hover:text-amber-700 cursor-pointer flex items-center space-x-1 truncate"
                    title="Klik untuk ubah nama perangkat"
                  >
                    <span className="truncate">{customName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">✏️</span>
                  </div>
                )}
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-rose-200 text-slate-950 border border-slate-900 text-[10px] font-black tracking-wide flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping shrink-0" />
              <span>Belum Izin</span>
            </span>
          </div>

          {/* Device ID with Copy Button */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border-2 border-slate-900">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-[10px] font-black text-slate-500 uppercase">ID:</span>
              <span className="font-mono text-xs font-black text-slate-900 tracking-wider truncate">
                {deviceInfo.deviceId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-slate-500 hover:text-slate-950 transition-colors p-1 cursor-pointer shrink-0"
              title="Salin Device ID"
            >
              {isCopied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Master Password Form */}
        {!isSuccess && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-black text-slate-800">
                Password Rahasia Pemilik
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan Password Pemilik"
                  className="w-full pl-9 pr-10 py-2.5 bg-white border-2 border-slate-900 rounded-2xl text-xs sm:text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-amber-400 focus:border-slate-900 transition-all text-slate-900"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-bold pt-1 animate-scale-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-amber-100/80 border-2 border-slate-900 text-[11px] text-slate-950 leading-relaxed flex items-start space-x-2 shadow-[2px_2px_0px_#0f172a]">
              <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Cukup 1x daftar per perangkat.</strong> Setelah didaftarkan, HP atau Laptop ini akan langsung diizinkan membuka dashboard tanpa harus mengetik password lagi.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-[#FFC72C] hover:bg-[#FFB800] text-slate-950 font-black text-xs sm:text-sm border-2 border-slate-900 shadow-[3px_3px_0px_#0f172a] hover:shadow-[4px_4px_0px_#0f172a] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi perangkat...</span>
              ) : (
                <>
                  <span>Daftarkan & Buka Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Hint */}
        <div className="text-center pt-2 border-t-2 border-slate-100">
          <p className="text-[11px] text-slate-500 font-bold">
            TikTok Monitor • Sistem Proteksi Perangkat Resmi
          </p>
        </div>
      </div>
    </div>
  );
};
