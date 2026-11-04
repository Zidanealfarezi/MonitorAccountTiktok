import React, { useState } from 'react';
import { DeviceAuthService } from '../lib/deviceAuth';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Laptop,
  Monitor,
  KeyRound,
  Check,
  Copy,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { DeviceType } from '../types';

interface DeviceLockScreenProps {
  onAuthorized: () => void;
}

export const DeviceLockScreen: React.FC<DeviceLockScreenProps> = ({ onAuthorized }) => {
  const deviceInfo = DeviceAuthService.getOrInitCurrentDeviceInfo();
  const [pin, setPin] = useState('');
  const [customName, setCustomName] = useState(deviceInfo.deviceName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
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
      setErrorMsg('Silakan masukkan Master PIN keamanan.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await DeviceAuthService.authorizeCurrentDevice(pin, customName);
      if (res.success) {
        setIsSuccess(true);
        setTimeout(() => {
          onAuthorized();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Master PIN salah. Silakan coba lagi.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memverifikasi perangkat.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderDeviceIcon = (type: DeviceType) => {
    switch (type) {
      case 'iphone':
      case 'android':
        return <Smartphone className="w-6 h-6 text-indigo-600" />;
      case 'mac':
      case 'windows':
        return <Laptop className="w-6 h-6 text-blue-600" />;
      default:
        return <Monitor className="w-6 h-6 text-slate-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900 flex flex-col items-center justify-center p-3.5 sm:p-6 relative selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Background Parallax Lighting */}
      <div className="fixed top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="fixed bottom-1/4 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Lock Card */}
      <div className="w-full max-w-[440px] mx-auto bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-2xl shadow-indigo-500/10 rounded-3xl p-5 sm:p-8 space-y-5 sm:space-y-6 relative z-10 animate-scale-in">
        
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="relative inline-block">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto transition-all duration-500 ${
              isSuccess
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 scale-110'
                : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 animate-pulse-glow'
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
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white" />
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            {isSuccess ? 'Perangkat Berhasil Didaftarkan!' : 'Perangkat Belum Terdaftar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            {isSuccess
              ? 'Membuka dashboard analitik TikTok Anda...'
              : 'Website ini diproteksi secara privat. Hanya perangkat terdaftar yang dapat melihat konten analitik.'}
          </p>
        </div>

        {/* Device Information Card */}
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-white shadow-2xs border border-slate-200/70 shrink-0">
                {renderDeviceIcon(deviceInfo.deviceType)}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Identitas Perangkat
                </div>
                {isEditingName ? (
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    autoFocus
                    className="text-xs font-bold text-slate-800 bg-white border border-blue-300 rounded px-1.5 py-0.5 focus:outline-hidden w-full"
                  />
                ) : (
                  <div
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-bold text-slate-800 hover:text-blue-600 cursor-pointer flex items-center space-x-1 truncate"
                    title="Klik untuk ubah nama perangkat"
                  >
                    <span className="truncate">{customName}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">✏️</span>
                  </div>
                )}
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold tracking-wide flex items-center space-x-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping shrink-0" />
              <span>Belum Izin</span>
            </span>
          </div>

          {/* Device ID with Copy Button */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200/70">
            <div className="flex items-center space-x-1.5 truncate">
              <span className="text-[10px] font-bold text-slate-400 uppercase">ID:</span>
              <span className="font-mono text-xs font-extrabold text-indigo-700 tracking-wider truncate">
                {deviceInfo.deviceId}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="text-slate-400 hover:text-indigo-600 transition-colors p-1 cursor-pointer shrink-0"
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

        {/* Master PIN Form */}
        {!isSuccess && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Master PIN Rahasia Pemilik
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPin ? 'text' : 'password'}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Masukkan Master PIN (Default: 889922)"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200/90 rounded-2xl text-xs sm:text-sm font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-600 font-medium pt-1 animate-scale-in">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900 leading-relaxed flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Cukup 1x daftar per perangkat.</strong> Setelah didaftarkan, HP atau Laptop ini akan langsung diizinkan membuka dashboard tanpa harus mengetik PIN lagi.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer"
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
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-[11px] text-slate-400 font-medium">
            TikTok Monitor • Sistem Proteksi Perangkat Resmi
          </p>
        </div>
      </div>
    </div>
  );
};
