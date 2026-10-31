import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scannerService } from '../services/scanner.service';
import { VerificationResult } from '../types';
import { soundFeedback } from '../utils/audio';
import { JecrcCrest } from '../components/JecrcLogo';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Search,
  Loader2,
  Volume2,
  VolumeX,
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerLoading, setScannerLoading] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [manualId, setManualId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gateName, setGateName] = useState<string>('Main Gate');
  const [cameraError, setCameraError] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const formatted = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(formatted);
          const backCam = formatted.find(
            (c) =>
              c.label.toLowerCase().includes('back') ||
              c.label.toLowerCase().includes('rear') ||
              c.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : formatted[0].id);
        } else {
          setCameraError('No video cameras found on this device.');
        }
      })
      .catch((err) => {
        console.warn('Camera enumeration error:', err);
        setCameraError('Camera access requires permission. Please allow camera access in browser settings.');
      });

    return () => {
      stopScanning();
    };
  }, []);

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      setVerificationLoading(true);

      try {
        const verifyRes = await scannerService.verifyQr(decodedText, gateName);
        setResult(verifyRes);

        if (soundEnabled) {
          if (verifyRes.status === 'SUCCESS') {
            soundFeedback.playSuccess();
          } else if (verifyRes.status === 'ALREADY_CHECKED_IN') {
            soundFeedback.playDuplicate();
          } else {
            soundFeedback.playError();
          }
        }
      } catch (err: any) {
        const errorData: VerificationResult = err.response?.data || {
          status: 'INVALID',
          message: 'No valid registration found. Please contact the registration desk.',
        };
        setResult(errorData);
        if (soundEnabled) {
          soundFeedback.playError();
        }
      } finally {
        setVerificationLoading(false);
      }
    },
    [gateName, soundEnabled]
  );

  const startScanning = async () => {
    if (!selectedCameraId) {
      setCameraError('Please select a camera to start scanning.');
      return;
    }

    setCameraError(null);
    setScannerLoading(true);
    setResult(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      const config = {
        fps: 15,
        qrbox: { width: 260, height: 260 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        selectedCameraId,
        config,
        handleScanSuccess,
        () => {}
      );

      setIsScanning(true);
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      setCameraError(
        err.message || 'Could not start camera. Please ensure permissions are granted.'
      );
      setIsScanning(false);
    } finally {
      setScannerLoading(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    setVerificationLoading(true);
    setResult(null);

    try {
      const verifyRes = await scannerService.manualCheckIn(manualId.trim(), gateName);
      setResult(verifyRes);

      if (soundEnabled) {
        if (verifyRes.status === 'SUCCESS') soundFeedback.playSuccess();
        else if (verifyRes.status === 'ALREADY_CHECKED_IN') soundFeedback.playDuplicate();
        else soundFeedback.playError();
      }
    } catch (err: any) {
      const errorData: VerificationResult = err.response?.data || {
        status: 'INVALID',
        message: 'No valid registration found for this ID.',
      };
      setResult(errorData);
      if (soundEnabled) soundFeedback.playError();
    } finally {
      setVerificationLoading(false);
    }
  };

  const resetForNextScan = () => {
    setResult(null);
    setManualId('');
    isProcessingRef.current = false;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
            JECRC UNIVERSITY • GATE ENTRY
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Gate Entry <span className="text-[#E31827]">QR Scanner</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Real-time verification & admission for Alumni Diwali Get-Together 2026
          </p>
        </div>

        {/* Gate Name and Sound Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Active Gate</span>
            <select
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              className="bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#172033] focus:border-[#E31827] outline-none"
            >
              <option value="Main Gate">Main Gate</option>
              <option value="Gate 1 (North)">Gate 1 (North)</option>
              <option value="Gate 2 (South)">Gate 2 (South)</option>
              <option value="VIP / Faculty Gate">VIP / Faculty Gate</option>
            </select>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-white text-[#E31827] border-[#E5E7EB] hover:bg-gray-50'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RESULT SCREENS */}
      {result && (
        <div className="rounded-2xl overflow-hidden border shadow-sm transition-all animate-fadeIn">
          {/* CASE 1: SUCCESSFUL ENTRY */}
          {result.status === 'SUCCESS' && (
            <div className="bg-white border-[#16845B]">
              <div className="bg-[#16845B] text-white p-6 text-center">
                <CheckCircle2 className="w-14 h-14 mx-auto mb-2 text-white animate-bounce" />
                <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Admission Approved
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
                  ENTRY APPROVED
                </h2>
                <p className="text-xs sm:text-sm text-emerald-100 mt-1 font-medium">
                  Welcome Back! Enjoy the Diwali Get-Together.
                </p>
              </div>

              <div className="p-6 sm:p-7 space-y-5">
                <div className="text-center pb-4 border-b border-gray-100">
                  <p className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                    Alumnus Full Name
                  </p>
                  <h3 className="text-2xl font-extrabold text-[#172033] mt-1">
                    {result.alumni?.fullName}
                  </h3>
                  <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-emerald-50 text-[#16845B] font-mono text-xs font-bold border border-emerald-200">
                    Pass ID: {result.alumni?.registrationId}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <GraduationCap className="w-4 h-4 text-[#E31827]" />
                    <div>
                      <p className="text-[#64748B] text-[10px] uppercase font-bold">Batch & Branch</p>
                      <p className="font-bold text-[#172033]">
                        Class of {result.alumni?.graduationYear} • {result.alumni?.branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <Building className="w-4 h-4 text-[#172033]" />
                    <div>
                      <p className="text-[#64748B] text-[10px] uppercase font-bold">Company & Role</p>
                      <p className="font-bold text-[#172033] truncate">
                        {result.alumni?.companyName}
                      </p>
                      <p className="text-[#64748B] text-[11px] truncate">
                        {result.alumni?.designation}
                      </p>
                    </div>
                  </div>

                  {result.alumni?.currentCity && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                      <MapPin className="w-4 h-4 text-[#16845B]" />
                      <div>
                        <p className="text-[#64748B] text-[10px] uppercase font-bold">Current City</p>
                        <p className="font-bold text-[#172033]">{result.alumni?.currentCity}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <Clock className="w-4 h-4 text-[#172033]" />
                    <div>
                      <p className="text-[#64748B] text-[10px] uppercase font-bold">Check-in Timestamp</p>
                      <p className="font-mono font-bold text-[#172033]">
                        {new Date(result.checkedInAt || Date.now()).toLocaleTimeString()} IST
                      </p>
                      <p className="text-[10px] text-[#64748B]">Gate: {result.gateName || gateName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-3.5 rounded-xl bg-[#16845B] hover:bg-[#126b49] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: DUPLICATE ENTRY */}
          {result.status === 'ALREADY_CHECKED_IN' && (
            <div className="bg-white border-[#D98A22]">
              <div className="bg-[#D98A22] text-white p-6 text-center">
                <AlertTriangle className="w-14 h-14 mx-auto mb-2 text-white animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Duplicate Scan Warning
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
                  ALREADY CHECKED IN
                </h2>
                <p className="text-xs sm:text-sm text-orange-100 mt-1 font-medium">
                  {result.message}
                </p>
              </div>

              <div className="p-6 sm:p-7 space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-[#172033]">
                    {result.alumni?.fullName || 'Registered Alumnus'}
                  </h3>
                  <p className="font-mono text-xs text-[#64748B] mt-0.5">
                    ID: {result.alumni?.registrationId}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {result.alumni?.companyName}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FFF6EA] border border-[#D98A22]/20 text-center">
                  <p className="text-[11px] uppercase font-bold text-[#D98A22]">
                    Original Check-in Record
                  </p>
                  <p className="text-sm font-bold font-mono text-[#172033] mt-1">
                    {result.checkedInAt
                      ? new Date(result.checkedInAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        }) + ' IST'
                      : 'Earlier Today'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Gate: {result.gateName || 'Main Gate'} • Verified By: {result.checkedInBy || 'Volunteer'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-3.5 rounded-xl bg-[#D98A22] hover:bg-[#b87319] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: INVALID QR */}
          {result.status === 'INVALID' && (
            <div className="bg-white border-[#DC2626]">
              <div className="bg-[#DC2626] text-white p-6 text-center">
                <XCircle className="w-14 h-14 mx-auto mb-2 text-white" />
                <span className="text-[10px] font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Access Denied
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold mt-2 tracking-tight">
                  INVALID QR CODE
                </h2>
                <p className="text-xs sm:text-sm text-red-100 mt-1 font-medium">
                  {result.message}
                </p>
              </div>

              <div className="p-6 sm:p-7 space-y-4 text-center">
                <p className="text-xs text-[#64748B]">
                  No matching registration was found for this token. Direct the alumnus to the on-site Registration Desk.
                </p>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-3.5 rounded-xl bg-[#172033] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAMERA SCANNER INTERFACE */}
      {!result && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 bg-[#FAFAFB] border-b border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
                Select Active Camera
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={isScanning}
                className="w-full sm:w-auto min-w-[260px] px-3 py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold bg-white text-[#172033] focus:border-[#E31827] outline-none disabled:bg-gray-100"
              >
                {cameras.map((cam) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  disabled={scannerLoading || cameras.length === 0}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {scannerLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                  <span>Start Camera</span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Central Camera Viewport */}
          <div className="p-6 flex flex-col items-center justify-center relative min-h-[320px] bg-gray-50">
            {cameraError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md">
                {cameraError}
              </div>
            )}

            <div
              id="qr-reader"
              className="w-full max-w-sm rounded-xl overflow-hidden shadow-sm bg-black"
              style={{ minHeight: isScanning ? '300px' : '0px' }}
            ></div>

            {!isScanning && (
              <div className="py-12 text-center text-gray-400 space-y-3">
                <div className="w-14 h-14 rounded-full bg-white shadow-xs border border-[#E5E7EB] flex items-center justify-center mx-auto text-[#E31827]">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#172033]">Camera Scanner Paused</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Click "Start Camera" above to scan alumni QR passes.
                  </p>
                </div>
              </div>
            )}

            {verificationLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#E31827]" />
                <p className="text-xs font-bold text-[#172033] mt-2">
                  Verifying Token with Database...
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback */}
          <div className="p-5 bg-white border-t border-[#E5E7EB]">
            <div className="max-w-md mx-auto text-center">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
                Manual Registration ID Lookup
              </span>

              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter ID (e.g. JECRC-DIWALI-2026-0001)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-[#E5E7EB] text-xs font-mono focus:border-[#E31827] outline-none bg-[#FAFAFB] text-[#172033]"
                />
                <button
                  type="submit"
                  disabled={verificationLoading || !manualId.trim()}
                  className="px-4 py-2 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5 text-white" />
                  <span>Verify</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
