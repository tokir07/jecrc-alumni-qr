import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { scannerService } from '../services/scanner.service';
import { VerificationResult } from '../types';
import { soundFeedback } from '../utils/audio';
import { DiwaliLamp } from '../components/DiwaliLamp';
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
  Briefcase,
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

  // Initialize camera list
  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          const formatted = devices.map((d, index) => ({
            id: d.id,
            label: d.label || `Camera ${index + 1}`,
          }));
          setCameras(formatted);
          // Prefer back camera if available
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
      // Prevent rapid duplicate scans while an API call is in-flight
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
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        selectedCameraId,
        config,
        handleScanSuccess,
        () => {
          // ignore scan frame errors
        }
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D9AD56]/30">
        <div>
          <div className="flex items-center gap-2">
            <DiwaliLamp size={28} />
            <span className="text-xs font-bold text-[#D9AD56] uppercase tracking-widest">
              Live Gate Entry System
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A32] font-serif mt-1">
            Official QR Scanner
          </h1>
          <p className="text-xs sm:text-sm text-gray-500">
            JECRC University • Diwali Get-Together 2026 Entry Verification
          </p>
        </div>

        {/* Gate Name and Sound Toggle */}
        <div className="flex items-center gap-3">
          <div className="text-xs">
            <span className="text-gray-400 block text-[10px] uppercase font-bold">Entry Gate</span>
            <select
              value={gateName}
              onChange={(e) => setGateName(e.target.value)}
              className="bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#101A32] focus:border-[#D9AD56] outline-none"
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
            className={`p-2.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-[#101A32] text-[#D9AD56] border-[#D9AD56]/40'
                : 'bg-gray-100 text-gray-400 border-gray-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* RESULT MODAL / SCREEN (Displayed over scanner when result arrives) */}
      {result && (
        <div className="rounded-3xl overflow-hidden border-2 shadow-2xl transition-all animate-fadeIn">
          {/* CASE 1: SUCCESSFUL ENTRY */}
          {result.status === 'SUCCESS' && (
            <div className="bg-white border-[#16845B]">
              <div className="bg-[#16845B] text-white p-6 text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-2 text-white animate-bounce" />
                <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Verified & Approved
                </span>
                <h2 className="text-3xl font-black mt-2 font-serif">
                  ENTRY APPROVED
                </h2>
                <p className="text-sm text-emerald-100 mt-1 font-medium">
                  Welcome Back! Enjoy the Diwali Get-Together.
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="text-center pb-4 border-b border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                    Alumnus Name
                  </p>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101A32] font-serif">
                    {result.alumni?.fullName}
                  </h3>
                  <div className="inline-block mt-2 px-3 py-1 rounded-lg bg-emerald-50 text-[#16845B] font-mono text-xs font-bold border border-emerald-200">
                    ID: {result.alumni?.registrationId}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <GraduationCap className="w-5 h-5 text-[#D9AD56]" />
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold">Batch & Branch</p>
                      <p className="font-bold text-[#101A32]">
                        Class of {result.alumni?.graduationYear} • {result.alumni?.branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <Building className="w-5 h-5 text-[#493078]" />
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold">Company & Role</p>
                      <p className="font-bold text-[#101A32] truncate">
                        {result.alumni?.companyName}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {result.alumni?.designation}
                      </p>
                    </div>
                  </div>

                  {result.alumni?.currentCity && (
                    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <MapPin className="w-5 h-5 text-[#16845B]" />
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold">Current City</p>
                        <p className="font-bold text-[#101A32]">{result.alumni?.currentCity}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                    <Clock className="w-5 h-5 text-[#101A32]" />
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold">Check-in Timestamp</p>
                      <p className="font-mono font-bold text-[#101A32]">
                        {new Date(result.checkedInAt || Date.now()).toLocaleTimeString()} IST
                      </p>
                      <p className="text-[10px] text-gray-400">Gate: {result.gateName || gateName}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-4 rounded-2xl bg-[#16845B] hover:bg-[#126b49] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
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
                <AlertTriangle className="w-16 h-16 mx-auto mb-2 text-white animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Duplicate Entry Warning
                </span>
                <h2 className="text-3xl font-black mt-2 font-serif">
                  ALREADY CHECKED IN
                </h2>
                <p className="text-sm text-orange-100 mt-1 font-medium">
                  {result.message}
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-5">
                <div className="text-center pb-4 border-b border-gray-100">
                  <h3 className="text-2xl font-bold text-[#101A32] font-serif">
                    {result.alumni?.fullName || 'Registered Alumnus'}
                  </h3>
                  <p className="font-mono text-sm text-gray-500 mt-1">
                    ID: {result.alumni?.registrationId}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {result.alumni?.companyName}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-center">
                  <p className="text-xs uppercase font-bold text-[#D98A22]">
                    Original Check-in Record
                  </p>
                  <p className="text-base font-bold font-mono text-[#101A32] mt-1">
                    {result.checkedInAt
                      ? new Date(result.checkedInAt).toLocaleString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                        }) + ' IST'
                      : 'Earlier Today'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Gate: {result.gateName || 'Main Gate'} • Verified By: {result.checkedInBy || 'Volunteer'}
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-4 rounded-2xl bg-[#D98A22] hover:bg-[#b87319] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Scan Next QR Code</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CASE 3: INVALID QR */}
          {result.status === 'INVALID' && (
            <div className="bg-white border-[#D94A4A]">
              <div className="bg-[#D94A4A] text-white p-6 text-center">
                <XCircle className="w-16 h-16 mx-auto mb-2 text-white" />
                <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
                  Access Denied
                </span>
                <h2 className="text-3xl font-black mt-2 font-serif">
                  INVALID QR CODE
                </h2>
                <p className="text-sm text-red-100 mt-1 font-medium">
                  {result.message}
                </p>
              </div>

              <div className="p-6 sm:p-8 space-y-4 text-center">
                <p className="text-sm text-gray-600">
                  This QR token is not recognized in the JECRC Diwali 2026 database. Please direct the alumnus to the Helpdesk / Registration Desk.
                </p>

                <div className="pt-4">
                  <button
                    onClick={resetForNextScan}
                    className="w-full py-4 rounded-2xl bg-[#101A32] hover:bg-[#1B2A50] text-white font-bold text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
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
        <div className="bg-white rounded-3xl border border-[#D9AD56]/40 shadow-xl overflow-hidden">
          {/* Camera Selection Controls */}
          <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                Select Camera
              </label>
              <select
                value={selectedCameraId}
                onChange={(e) => setSelectedCameraId(e.target.value)}
                disabled={isScanning}
                className="w-full sm:w-auto min-w-[240px] px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold bg-white text-[#101A32] focus:border-[#D9AD56] outline-none disabled:bg-gray-100"
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
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#16845B] hover:bg-[#126b49] text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CameraOff className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              )}
            </div>
          </div>

          {/* Camera Viewport */}
          <div className="p-4 sm:p-6 flex flex-col items-center justify-center relative min-h-[300px] bg-black/5">
            {cameraError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs text-center max-w-md">
                {cameraError}
              </div>
            )}

            {/* Html5Qrcode video canvas container */}
            <div
              id="qr-reader"
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-inner bg-black"
              style={{ minHeight: isScanning ? '280px' : '0px' }}
            ></div>

            {!isScanning && (
              <div className="py-12 text-center text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center mx-auto text-[#D9AD56]">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#101A32]">Camera Scanner is Paused</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Click "Start Camera" above to scan alumni QR passes.
                  </p>
                </div>
              </div>
            )}

            {/* Processing Indicator Overlay */}
            {verificationLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <Loader2 className="w-10 h-10 animate-spin text-[#493078]" />
                <p className="text-sm font-bold text-[#101A32] mt-3 font-serif">
                  Verifying Token with Database...
                </p>
              </div>
            )}
          </div>

          {/* Manual Entry Fallback */}
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <div className="max-w-md mx-auto text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                Camera Issue? Manual Lookup Fallback
              </span>

              <form onSubmit={handleManualCheckIn} className="flex gap-2">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="Enter ID (e.g. JECRC-DIWALI-2026-0001)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:border-[#D9AD56] outline-none bg-white text-[#101A32]"
                />
                <button
                  type="submit"
                  disabled={verificationLoading || !manualId.trim()}
                  className="px-4 py-2.5 rounded-xl bg-[#101A32] text-white font-bold text-xs hover:bg-[#1B2A50] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Search className="w-3.5 h-3.5 text-[#D9AD56]" />
                  <span>Verify</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Safety Notice for Volunteers */}
      <div className="p-4 rounded-2xl bg-[#FFF9EE] border border-[#D9AD56]/40 text-xs text-gray-600 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#B88F3B] mt-0.5 shrink-0" />
        <div>
          <span className="font-bold text-[#101A32]">Gate Volunteer Protocol:</span>
          <p className="mt-0.5">
            Check-ins are recorded once in PostgreSQL with atomic locks. Green indicates first-time approved entry. Orange alerts that the QR code was already presented.
          </p>
        </div>
      </div>
    </div>
  );
};
