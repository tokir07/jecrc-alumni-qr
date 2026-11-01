import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scannerService } from '../services/scanner.service';
import { VerificationResult } from '../types';
import { soundFeedback } from '../utils/audio';
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
  Building,
  GraduationCap,
  MapPin,
  Clock,
  FlipHorizontal,
  Upload,
  Zap,
  ZapOff,
  ShieldAlert,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [selectedCameraId, setSelectedCameraId] = useState<string>('environment');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannerLoading, setScannerLoading] = useState<boolean>(false);
  const [fileScanning, setFileScanning] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [manualId, setManualId] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [gateName, setGateName] = useState<string>('Gate 01 (Main Gate)');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if browser context is secure for camera access
  const isSecureContext =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // Enumerate cameras once permission is available
  const enumerateCameras = useCallback(async () => {
    try {
      if (Html5Qrcode && typeof Html5Qrcode.getCameras === 'function') {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          const formatted = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(formatted);
        }
      }
    } catch (err) {
      console.warn('Camera enumeration note:', err);
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => {
              try {
                scannerRef.current?.clear();
              } catch {}
            }).catch(() => {});
          } else {
            try {
              scannerRef.current.clear();
            } catch {}
          }
        } catch {}
      }
    };
  }, []);

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        console.warn('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
    setTorchEnabled(false);
    setHasTorch(false);
  };

  const startScanning = async (overrideFacing?: 'environment' | 'user', overrideCamId?: string) => {
    setCameraError(null);
    setScannerLoading(true);
    setResult(null);
    isProcessingRef.current = false;

    // 1. Guard check for Secure Context (required on phones for getUserMedia)
    if (!isSecureContext && !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Mobile browsers require HTTPS to open live camera video stream. If testing over local Wi-Fi, either use HTTPS or use the "Snap Photo / Gallery" button below to scan directly!'
      );
      setScannerLoading(false);
      return;
    }

    try {
      // 2. Safely ensure clean instance
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          try {
            await scannerRef.current.stop();
          } catch {}
        }
      } else {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      // 3. Responsive qrbox configuration
      const config = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight) || 280;
          const size = Math.max(160, Math.floor(minEdge * 0.72));
          return { width: size, height: size };
        },
        aspectRatio: 1.0,
      };

      // 4. Resolve camera constraint for mobile
      // On mobile devices, passing `{ facingMode: 'environment' }` works far better than arbitrary device IDs
      const activeFacing = overrideFacing || facingMode;
      const activeCamId = overrideCamId !== undefined ? overrideCamId : selectedCameraId;

      let cameraConstraint: string | { facingMode: string };
      if (activeCamId && activeCamId !== 'environment' && activeCamId !== 'user') {
        cameraConstraint = activeCamId;
      } else {
        cameraConstraint = { facingMode: activeFacing };
      }

      await scannerRef.current.start(
        cameraConstraint,
        config,
        handleScanSuccess,
        () => {}
      );

      setIsScanning(true);

      // Check torch capabilities
      try {
        const capabilities: any = scannerRef.current.getRunningTrackCapabilities();
        if (capabilities && capabilities.torch) {
          setHasTorch(true);
        }
      } catch {}

      // Refresh camera labels now that permission has been granted
      enumerateCameras();
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      const errMsg = err?.message || String(err);

      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
        setCameraError(
          'Camera access was denied. Please allow camera permissions in your mobile browser settings and try again.'
        );
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No camera device found on this device.');
      } else if (errMsg.includes('NotReadableError') || errMsg.includes('TrackStartError')) {
        setCameraError(
          'Camera is currently in use by another app or browser tab. Please close other camera apps and retry.'
        );
      } else {
        setCameraError(
          errMsg ||
            'Could not initialize mobile camera. Please verify camera permissions or use "Snap Photo" below.'
        );
      }
      setIsScanning(false);
    } finally {
      setScannerLoading(false);
    }
  };

  const handleScanSuccess = useCallback(
    async (decodedText: string) => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Stop camera stream cleanly before rendering verified card
      try {
        if (scannerRef.current && scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn('Error stopping camera after scan:', e);
      }
      setIsScanning(false);
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
          message: 'No valid registration found. Please direct attendee to the registration desk.',
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

  // Flip Camera (Rear <-> Front)
  const handleFlipCamera = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    setSelectedCameraId(newFacing);
    if (isScanning) {
      await stopScanning();
      await startScanning(newFacing, newFacing);
    }
  };

  // Toggle Torch/Flashlight
  const handleToggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    try {
      const newTorchState = !torchEnabled;
      await scannerRef.current.applyVideoConstraints({
        // @ts-ignore
        advanced: [{ torch: newTorchState }],
      });
      setTorchEnabled(newTorchState);
    } catch (e) {
      console.warn('Torch toggle not supported:', e);
    }
  };

  // Native Mobile Photo / File Scan
  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileScanning(true);
    setCameraError(null);

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader');
      }

      if (scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }

      const decodedText = await scannerRef.current.scanFile(file, false);
      await handleScanSuccess(decodedText);
    } catch (err: any) {
      console.warn('File scan failed:', err);
      setCameraError(
        'No QR code detected in the selected image. Please ensure the QR pass is clear and well-lit, or use live scanning.'
      );
    } finally {
      setFileScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;

    // Stop scanning if camera was active
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        setIsScanning(false);
      }
    } catch {}

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
    // Immediately restart camera for fast consecutive admissions
    startScanning();
  };

  return (
    <div className="space-y-5 sm:space-y-6 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-[#E5E7EB]">
        <div>
          <p className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-0.5">
            JECRC UNIVERSITY • GATE ENTRY
          </p>
          <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
            Gate Entry <span className="text-[#E31827]">QR Scanner</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5">
            Real-time verification & admission for Alumni Diwali Get-Together 2026
          </p>
        </div>

        {/* Gate Name and Sound Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-xs flex-1 sm:flex-initial">
            <span className="text-[#64748B] block text-[10px] uppercase font-bold">Active Gate</span>
            <select
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              className="w-full sm:w-auto bg-white border border-[#E5E7EB] rounded-xl px-3 py-2 text-xs font-semibold text-[#172033] focus:border-[#E31827] outline-none min-h-[44px]"
            >
              <option value="Gate 01 (Main Gate)">Gate 01 (Main Gate)</option>
              <option value="Gate 01 (Fast Track)">Gate 01 (Fast Track)</option>
              <option value="VIP / Faculty Gate">VIP / Faculty Gate</option>
            </select>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute Audio Chimes' : 'Enable Audio Chimes'}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 ${
              soundEnabled
                ? 'bg-white text-[#E31827] border-[#E5E7EB] hover:bg-gray-50'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
            aria-label="Toggle audio sound feedback"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* INSECURE CONTEXT WARNING BANNER (Shows only on mobile over plain HTTP) */}
      {!isSecureContext && (
        <div className="p-3.5 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold">Mobile Browser Security Notice</p>
            <p className="leading-relaxed">
              Mobile browsers require an HTTPS secure connection for live streaming. When running locally, tap{' '}
              <strong>"Snap Photo / Gallery"</strong> below to open your phone's native camera and scan passes instantly!
            </p>
          </div>
        </div>
      )}

      {/* SCAN RESULT SCREENS */}
      {result && (
        <div className="rounded-2xl overflow-hidden border shadow-sm transition-all animate-fadeIn">
          {/* CASE 1: SUCCESSFUL ENTRY */}
          {result.status === 'SUCCESS' && (
            <div className="bg-white border-[#16845B]">
              <div className="bg-[#16845B] text-white p-5 sm:p-6 text-center">
                <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 text-white animate-bounce" />
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

              <div className="p-4 sm:p-7 space-y-4 sm:space-y-5">
                <div className="text-center pb-4 border-b border-gray-100">
                  <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[#64748B] font-semibold">
                    Alumnus Full Name
                  </p>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-[#172033] mt-1 break-words">
                    {result.alumni?.fullName}
                  </h3>
                  <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-emerald-50 text-[#16845B] font-mono text-xs font-bold border border-emerald-200">
                    Pass ID: {result.alumni?.registrationId}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <GraduationCap className="w-4 h-4 text-[#E31827] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[#64748B] text-[10px] uppercase font-bold">Degree & Course</p>
                      <p className="font-bold text-[#172033] truncate">
                        {result.alumni?.degree ? `${result.alumni.degree} • ${result.alumni.course}` : result.alumni?.branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <Building className="w-4 h-4 text-[#172033] shrink-0" />
                    <div className="min-w-0">
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
                      <MapPin className="w-4 h-4 text-[#16845B] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-[#64748B] text-[10px] uppercase font-bold">Current City</p>
                        <p className="font-bold text-[#172033] truncate">{result.alumni?.currentCity}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB]">
                    <Clock className="w-4 h-4 text-[#172033] shrink-0" />
                    <div className="min-w-0">
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
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-[#16845B] hover:bg-[#126b49] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[50px] touch-manipulation"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 2: DUPLICATE ENTRY */}
          {result.status === 'ALREADY_CHECKED_IN' && (
            <div className="bg-white border-[#D98A22]">
              <div className="bg-[#D98A22] text-white p-5 sm:p-6 text-center">
                <AlertTriangle className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 text-white animate-pulse" />
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

              <div className="p-4 sm:p-7 space-y-4">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-xl font-bold text-[#172033] break-words">
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
                  <p className="text-[10px] sm:text-[11px] uppercase font-bold text-[#D98A22]">
                    Original Check-in Record
                  </p>
                  <p className="text-xs sm:text-sm font-bold font-mono text-[#172033] mt-1">
                    {result.checkedInAt
                      ? new Date(result.checkedInAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        }) + ' IST'
                      : 'Earlier Today'}
                  </p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Gate: {result.gateName || 'Gate 01 (Main Gate)'} • Verified By: {result.checkedInBy || 'Volunteer'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-[#D98A22] hover:bg-[#b87319] text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[50px] touch-manipulation"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: INVALID QR */}
          {result.status === 'INVALID' && (
            <div className="bg-white border-[#DC2626]">
              <div className="bg-[#DC2626] text-white p-5 sm:p-6 text-center">
                <XCircle className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-2 text-white" />
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

              <div className="p-4 sm:p-7 space-y-4 text-center">
                <p className="text-xs text-[#64748B] leading-relaxed">
                  No matching registration was found for this token. Direct attendee to the physical Registration & Help Desk.
                </p>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-3.5 sm:py-4 rounded-xl bg-[#172033] hover:bg-black text-white font-bold text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[50px] touch-manipulation"
                  >
                    <RotateCcw className="w-4 h-4 shrink-0" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CAMERA SCANNER INTERFACE (Always mounted to preserve hardware video pipeline) */}
      <div className={`bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden ${result ? 'hidden' : 'block'}`}>
        {/* Camera Selector and Controls */}
        <div className="p-4 sm:p-5 bg-[#FAFAFB] border-b border-[#E5E7EB] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1">
              Camera Mode / Device
            </label>
            <select
              value={selectedCameraId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedCameraId(val);
                if (val === 'environment' || val === 'user') {
                  setFacingMode(val);
                  if (isScanning) {
                    stopScanning().then(() => startScanning(val, val));
                  }
                } else {
                  if (isScanning) {
                    stopScanning().then(() => startScanning(undefined, val));
                  }
                }
              }}
              className="w-full sm:w-auto min-w-[240px] px-3 py-2.5 sm:py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold bg-white text-[#172033] focus:border-[#E31827] outline-none min-h-[44px]"
            >
              <option value="environment">Rear Camera (Recommended for Phones)</option>
              <option value="user">Front Camera (Selfie)</option>
              {cameras.length > 0 &&
                cameras
                  .filter((c) => c.label)
                  .map((cam) => (
                    <option key={cam.id} value={cam.id}>
                      {cam.label}
                    </option>
                  ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Quick Flip Camera Button */}
            <button
              onClick={handleFlipCamera}
              type="button"
              title="Flip between Rear and Front camera"
              className="px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#172033] font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation cursor-pointer"
            >
              <FlipHorizontal className="w-4 h-4 text-[#E31827]" />
              <span className="hidden sm:inline">Flip</span>
            </button>

            {/* Torch Button if supported */}
            {hasTorch && isScanning && (
              <button
                onClick={handleToggleTorch}
                type="button"
                title={torchEnabled ? 'Turn Off Flashlight' : 'Turn On Flashlight'}
                className={`px-3.5 py-2.5 rounded-xl border text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation cursor-pointer ${
                  torchEnabled
                    ? 'bg-yellow-400 text-yellow-950 border-yellow-500'
                    : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                }`}
              >
                {torchEnabled ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                <span className="hidden sm:inline">Flash</span>
              </button>
            )}

            {/* Native Mobile Camera Snap / Gallery Fallback */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={fileScanning}
              type="button"
              title="Open phone camera directly or choose image"
              className="px-3.5 py-2.5 rounded-xl border border-[#E5E7EB] bg-white hover:bg-gray-50 text-[#172033] font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 min-h-[44px] touch-manipulation cursor-pointer"
            >
              {fileScanning ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#E31827]" />
              ) : (
                <Upload className="w-4 h-4 text-[#16845B]" />
              )}
              <span>Snap / Image</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileScan}
            />

            {/* Live Camera Scanner Toggle */}
            {!isScanning ? (
              <button
                onClick={() => startScanning()}
                disabled={scannerLoading}
                className="px-5 py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px] touch-manipulation"
              >
                {scannerLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Camera className="w-4 h-4 text-white" />
                )}
                <span>Start Camera</span>
              </button>
            ) : (
              <button
                onClick={stopScanning}
                className="px-5 py-2.5 rounded-xl bg-gray-700 hover:bg-gray-800 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer min-h-[44px] touch-manipulation"
              >
                <CameraOff className="w-4 h-4 text-white" />
                <span>Stop Camera</span>
              </button>
            )}
          </div>
        </div>

        {/* Central Camera Viewport (Always kept in layout with non-zero dimensions) */}
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[300px] sm:min-h-[360px] bg-gray-900/95">
          {cameraError && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md w-full shadow-xs">
              <p className="font-bold mb-0.5">Camera Notice</p>
              <p>{cameraError}</p>
            </div>
          )}

          {/* Viewport Box (Always rendered so html5-qrcode always sees non-zero dimensions) */}
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square rounded-2xl overflow-hidden shadow-xl bg-black border-2 border-gray-800">
            {/* The html5-qrcode mount point */}
            <div id="qr-reader" className="w-full h-full"></div>

            {/* Inactive Overlay (Displayed when not scanning, without hiding the qr-reader div) */}
            {!isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-center p-6 space-y-3 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E31827]">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-white">Scanner Inactive</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Tap <strong>"Start Camera"</strong> for live video or <strong>"Snap / Image"</strong> to capture with your mobile camera.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                  <button
                    onClick={() => startScanning()}
                    disabled={scannerLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    {scannerLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                    <span>Start Camera</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={fileScanning}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    <Upload className="w-4 h-4 text-[#16845B]" />
                    <span>Snap Photo</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Verification in Progress Overlay */}
          {verificationLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center z-20">
              <Loader2 className="w-8 h-8 animate-spin text-[#E31827]" />
              <p className="text-xs font-bold text-[#172033] mt-2">
                Verifying Pass with University Database...
              </p>
            </div>
          )}
        </div>

        {/* Manual Registration ID Lookup */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#E5E7EB]">
          <div className="max-w-md mx-auto text-center">
            <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider block mb-2">
              Manual Registration ID Lookup
            </span>

            <form onSubmit={handleManualCheckIn} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                placeholder="e.g. JECRC-DIWALI-2026-0001"
                className="flex-1 px-3.5 py-2.5 sm:py-2 rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-xs text-[#172033] font-mono uppercase bg-[#FAFAFB] min-h-[44px]"
              />
              <button
                type="submit"
                disabled={verificationLoading || !manualId.trim()}
                className="px-5 py-2.5 rounded-xl bg-[#172033] hover:bg-black text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 min-h-[44px] touch-manipulation"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify ID</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
