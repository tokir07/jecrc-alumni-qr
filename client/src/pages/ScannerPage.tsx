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

  // Enumerate cameras using standard navigator.mediaDevices
  const enumerateCameras = useCallback(async (): Promise<{ id: string; label: string }[]> => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === 'videoinput');
        if (videoInputs.length > 0) {
          const formatted = videoInputs.map((d, index) => ({
            id: d.deviceId,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(formatted);
          return formatted;
        }
      }
    } catch (err) {
      console.warn('Camera enumeration note:', err);
    }
    return [];
  }, []);

  // Pre-populate cameras on mount if permissions were granted previously
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          if (videoInputs.length > 0 && videoInputs.some((d) => d.label)) {
            const formatted = videoInputs.map((d, index) => ({
              id: d.deviceId,
              label: d.label || `Camera ${index + 1}`,
            }));
            setCameras(formatted);
          }
        })
        .catch(() => {});
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

  // Helper to ensure video element on mobile Safari plays inline without blocking
  const ensureVideoInlinePlayback = () => {
    try {
      const container = document.getElementById('qr-reader');
      if (!container) return;
      const video = container.querySelector('video');
      if (video) {
        video.setAttribute('playsinline', 'true');
        video.setAttribute('webkit-playsinline', 'true');
        video.setAttribute('autoplay', 'true');
        video.muted = true;
        video.setAttribute('muted', 'true');
        video.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Video inline attributes note:', e);
    }
  };

  const startScanning = async (overrideFacing?: 'environment' | 'user', overrideCamId?: string) => {
    setCameraError(null);
    setScannerLoading(true);
    setResult(null);
    isProcessingRef.current = false;

    // 1. Guard check for Secure Context (required on phones for getUserMedia)
    if (!isSecureContext && !navigator.mediaDevices?.getUserMedia) {
      setCameraError(
        'Mobile browsers require HTTPS to stream live camera video. If testing over local Wi-Fi, tap "Snap Photo / Image" below to use your phone\'s camera directly without HTTPS!'
      );
      setScannerLoading(false);
      return;
    }

    const targetFacing = overrideFacing || facingMode;
    const targetCamId = overrideCamId !== undefined ? overrideCamId : selectedCameraId;
    const isCustomDevice = targetCamId && targetCamId !== 'environment' && targetCamId !== 'user';

    try {
      // 2. Clean up any existing scanner instance cleanly
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
          }
        } catch {}
        try {
          scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }

      // Small pause for mobile camera driver to release completely
      await new Promise((r) => setTimeout(r, 100));

      const readerElem = document.getElementById('qr-reader');
      if (!readerElem) {
        throw new Error('Camera container (#qr-reader) not found in DOM.');
      }
      readerElem.innerHTML = '';

      // Determine camera identifier: either device ID string or facingMode object
      const cameraIdOrConfig: any = isCustomDevice ? targetCamId : { facingMode: targetFacing };

      // Configure videoConstraints to strictly request 720p HD and the requested facingMode
      const scanConfig: any = {
        fps: 10,
        disableFlip: false,
        videoConstraints: isCustomDevice
          ? {
              deviceId: { exact: targetCamId },
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
            }
          : {
              facingMode: targetFacing,
              width: { ideal: 1280, max: 1920 },
              height: { ideal: 720, max: 1080 },
            },
      };

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      let started = false;
      try {
        await scanner.start(
          cameraIdOrConfig,
          scanConfig,
          handleScanSuccess,
          () => {}
        );
        started = true;
      } catch (firstErr: any) {
        console.warn('Primary scan start failed, retrying with raw facingMode...', firstErr);
        // Fallback: Re-create clean instance and try raw facingMode without custom videoConstraints
        try {
          if (scannerRef.current) {
            try { await scannerRef.current.stop(); } catch {}
            try { scannerRef.current.clear(); } catch {}
          }
          readerElem.innerHTML = '';
          await new Promise((r) => setTimeout(r, 120));

          const fallbackScanner = new Html5Qrcode('qr-reader');
          scannerRef.current = fallbackScanner;

          await fallbackScanner.start(
            { facingMode: targetFacing },
            { fps: 10, disableFlip: false },
            handleScanSuccess,
            () => {}
          );
          started = true;
        } catch (secondErr: any) {
          console.error('Secondary scan start also failed:', secondErr);
          throw firstErr || secondErr;
        }
      }

      if (started) {
        ensureVideoInlinePlayback();
        setIsScanning(true);
        setCameraError(null);
        setFacingMode(targetFacing);
        setSelectedCameraId(isCustomDevice ? targetCamId : targetFacing);

        // Check torch capabilities
        try {
          const capabilities: any = scanner.getRunningTrackCapabilities();
          if (capabilities && capabilities.torch) {
            setHasTorch(true);
          }
        } catch {}

        // Enumerate devices quietly in background while camera is already running
        if (navigator.mediaDevices?.enumerateDevices) {
          navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
              const videoInputs = devices.filter((d) => d.kind === 'videoinput');
              if (videoInputs.length > 0) {
                setCameras(
                  videoInputs.map((d, i) => ({
                    id: d.deviceId,
                    label: d.label || `Camera ${i + 1}`,
                  }))
                );
              }
            })
            .catch(() => {});
        }
      }
    } catch (err: any) {
      console.error('Failed to start scanner:', err);
      const errName = err?.name || '';
      const errMsg = err?.message || String(err);

      if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission denied')) {
        setCameraError('Camera access was denied. Please allow camera permissions in your mobile browser settings and try again.');
      } else if (errMsg.includes('NotFoundError') || errMsg.includes('DevicesNotFoundError')) {
        setCameraError('No camera device found on this phone.');
      } else if (errMsg.includes('NotReadableError') || errMsg.includes('TrackStartError')) {
        setCameraError('Camera is currently in use or busy. Please close other camera apps and retry.');
      } else {
        setCameraError(
          `Could not open ${targetFacing === 'environment' ? 'rear' : 'front'} camera (${errName || 'Error'}: ${errMsg}). You can tap "Switch to Front Camera" or use "Snap Photo / Image" below!`
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
      setTimeout(() => {
        startScanning(newFacing, newFacing);
      }, 100);
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
    // Allow React and DOM to unhide the camera viewport before re-initializing
    setTimeout(() => {
      startScanning();
    }, 120);
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
                    stopScanning().then(() => {
                      setTimeout(() => startScanning(val, val), 100);
                    });
                  }
                } else {
                  const matchingCam = cameras.find((c) => c.id === val);
                  const isFront = matchingCam && (matchingCam.label.toLowerCase().includes('front') || matchingCam.label.toLowerCase().includes('user'));
                  const newFacing = isFront ? 'user' : 'environment';
                  setFacingMode(newFacing);
                  if (isScanning) {
                    stopScanning().then(() => {
                      setTimeout(() => startScanning(newFacing, val), 100);
                    });
                  }
                }
              }}
              className="w-full sm:w-auto min-w-[240px] px-3 py-2.5 sm:py-2 rounded-xl border border-[#E5E7EB] text-xs font-semibold bg-white text-[#172033] focus:border-[#E31827] outline-none min-h-[44px]"
            >
              <option value="environment">Auto Rear Camera (Back Lens)</option>
              <option value="user">Auto Front Camera (Selfie)</option>
              {cameras.length > 0 &&
                cameras.map((cam, idx) => (
                  <option key={cam.id} value={cam.id}>
                    {cam.label || `Camera ${idx + 1}`}
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
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[320px] sm:min-h-[380px] bg-gray-900/95">
          {cameraError && (
            <div className="mb-4 p-3.5 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md w-full shadow-xs space-y-2">
              <div className="flex items-center justify-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Camera Notice</span>
              </div>
              <p className="leading-relaxed">{cameraError}</p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => startScanning(facingMode, selectedCameraId)}
                  className="px-3 py-1.5 rounded-lg bg-[#E31827] text-white font-bold text-xs hover:bg-[#C81020] cursor-pointer"
                >
                  Retry
                </button>
                <button
                  type="button"
                  onClick={handleFlipCamera}
                  className="px-3 py-1.5 rounded-lg bg-gray-700 text-white font-bold text-xs hover:bg-gray-800 cursor-pointer"
                >
                  Switch to {facingMode === 'environment' ? 'Front' : 'Rear'} Camera
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 text-gray-800 font-semibold text-xs hover:bg-gray-300 cursor-pointer"
                >
                  Snap Photo / Image
                </button>
              </div>
            </div>
          )}

          {/* Viewport Box (Always rendered so html5-qrcode always sees non-zero dimensions) */}
          <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square min-h-[280px] rounded-2xl overflow-hidden shadow-2xl bg-black border-2 border-gray-800">
            {/* The html5-qrcode mount point */}
            <div id="qr-reader" className="w-full h-full min-h-[280px]"></div>

            {/* Live Scanning Viewfinder & Laser Animation (Rendered when camera is streaming) */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
                {/* Red Laser Scanning Beam */}
                <div className="absolute left-6 right-6 h-0.5 bg-[#E31827] shadow-[0_0_12px_#E31827] animate-scan-laser"></div>

                {/* Viewfinder Target Frame with Red Corner Brackets */}
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 pointer-events-none">
                  {/* Top-Left Corner */}
                  <span className="absolute top-0 left-0 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-[#E31827] rounded-tl-lg"></span>
                  {/* Top-Right Corner */}
                  <span className="absolute top-0 right-0 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-[#E31827] rounded-tr-lg"></span>
                  {/* Bottom-Left Corner */}
                  <span className="absolute bottom-0 left-0 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-[#E31827] rounded-bl-lg"></span>
                  {/* Bottom-Right Corner */}
                  <span className="absolute bottom-0 right-0 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-[#E31827] rounded-br-lg"></span>
                </div>

                <p className="text-[10px] sm:text-[11px] font-semibold text-white/90 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-full mt-3 tracking-wide shadow-xs">
                  Center QR Pass within frame
                </p>
              </div>
            )}

            {/* Camera Loading Overlay (Shown while initializing / requesting permission) */}
            {scannerLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-center p-6 space-y-3 z-20">
                <Loader2 className="w-9 h-9 animate-spin text-[#E31827]" />
                <div>
                  <p className="text-sm font-bold text-white">Opening Camera Feed...</p>
                  <p className="text-xs text-gray-300 mt-1 max-w-xs mx-auto leading-relaxed">
                    Please tap <strong>"Allow"</strong> if your mobile browser asks for camera permission.
                  </p>
                </div>
              </div>
            )}

            {/* Inactive Overlay (Displayed only when not scanning and not loading) */}
            {!isScanning && !scannerLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-center p-6 space-y-3 z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-[#E31827]">
                  <Camera className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm sm:text-base font-bold text-white">Scanner Inactive</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto leading-relaxed">
                    Tap <strong>"Start Camera"</strong> for live video or <strong>"Snap Photo"</strong> to capture with your mobile camera.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                  <button
                    onClick={() => startScanning()}
                    disabled={scannerLoading}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 cursor-pointer touch-manipulation min-h-[44px]"
                  >
                    <Camera className="w-4 h-4" />
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
