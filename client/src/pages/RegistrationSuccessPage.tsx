import React, { useRef, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlumniRegistrationData } from '../types';
import { PassCard } from '../components/PassCard';
import { registrationService } from '../services/registration.service';
import { DiwaliLamp } from '../components/DiwaliLamp';
import {
  Printer,
  Download,
  CheckCircle2,
  ArrowLeft,
  Search,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const RegistrationSuccessPage: React.FC = () => {
  const location = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  const initialData: AlumniRegistrationData | undefined =
    location.state?.registration;

  const [registration, setRegistration] = useState<AlumniRegistrationData | null>(
    initialData || null
  );
  const [lookupId, setLookupId] = useState('');
  const [loading, setLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // If query string has ?id=JECRC-DIWALI-2026-XXXX
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id && !registration) {
      handleLookupById(id);
    }
  }, [location.search]);

  const handleLookupById = async (id: string) => {
    setLoading(true);
    setLookupError(null);
    try {
      const data = await registrationService.getById(id);
      setRegistration(data);
    } catch {
      setLookupError(`Registration ID "${id}" was not found. Please check and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!registration) return;

    if (registration.qrCodeDataUrl) {
      // Create download link for the QR image
      const link = document.createElement('a');
      link.href = registration.qrCodeDataUrl;
      link.download = `${registration.registrationId}_QR_Pass.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      // Fallback print
      window.print();
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* If no registration data available, show lookup form */}
      {!registration ? (
        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto border border-[#D9AD56]/40 shadow-xl text-center">
          <DiwaliLamp size={40} className="mx-auto mb-3" />
          <h2 className="text-xl font-bold font-serif text-[#101A32]">
            Find Your Diwali QR Pass
          </h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">
            Enter your Registration ID to view and download your verified entry pass.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (lookupId.trim()) handleLookupById(lookupId.trim());
            }}
            className="space-y-4"
          >
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="e.g. JECRC-DIWALI-2026-0001"
              required
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-center font-mono text-sm focus:border-[#D9AD56] outline-none"
            />

            {lookupError && (
              <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-medium">
                {lookupError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#101A32] text-white font-semibold text-sm hover:bg-[#1B2A50] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#D9AD56]" />
              ) : (
                <Search className="w-4 h-4 text-[#D9AD56]" />
              )}
              <span>Retrieve Pass</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              to="/register"
              className="text-xs font-semibold text-[#493078] hover:underline"
            >
              Not registered yet? Register now →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Success Banner */}
          <div className="no-print bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 rounded-3xl p-6 sm:p-8 text-center shadow-sm">
            <div className="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101A32] font-serif">
              Registration Successful!
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-700 max-w-xl mx-auto leading-relaxed">
              Your registration for <strong>JECRC University Alumni Diwali Get-Together 2026</strong> has been confirmed.
            </p>

            <p className="mt-1 text-sm text-gray-600 max-w-xl mx-auto">
              Please show your QR code at the university entry gate for verification. We look forward to welcoming you back!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#101A32] text-white font-semibold text-sm shadow hover:bg-[#1B2A50] transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#D9AD56]" />
                <span>Download QR Pass</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D9AD56] text-[#101A32] font-bold text-sm shadow hover:bg-[#E5C174] transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#101A32]" />
                <span>Print QR Pass</span>
              </button>
            </div>
          </div>

          {/* Printable Official Pass Card Component */}
          <div>
            <div className="no-print flex items-center justify-between mb-3 px-2">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-500 font-serif flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D9AD56]" />
                Official Pass Preview
              </span>
              <span className="text-xs text-gray-400">
                Print or keep on your phone screen
              </span>
            </div>

            <PassCard data={registration} cardRef={cardRef} />
          </div>

          {/* Bottom Back Button */}
          <div className="no-print text-center pt-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#101A32] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Register another alumnus</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
