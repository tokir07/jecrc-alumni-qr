import React, { useRef, useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { AlumniRegistrationData } from '../types';
import { PassCard } from '../components/PassCard';
import { registrationService } from '../services/registration.service';
import { JecrcCrest, JecrcUniversityLogo, JecrcAlumniLogo } from '../components/JecrcLogo';
import {
  Printer,
  Download,
  CheckCircle2,
  ArrowLeft,
  Search,
  Loader2,
  Sparkles,
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
      const link = document.createElement('a');
      link.href = registration.qrCodeDataUrl;
      link.download = `${registration.registrationId}_QR_Pass.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } else {
      window.print();
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {!registration ? (
        <div className="bg-white rounded-2xl p-8 max-w-md mx-auto border border-[#E5E7EB] shadow-xs text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <JecrcUniversityLogo height={34} />
            <div className="h-6 w-[1px] bg-gray-200" />
            <JecrcAlumniLogo size={36} />
          </div>
          <h2 className="text-lg font-bold text-[#172033]">
            Retrieve Alumni QR Pass
          </h2>
          <p className="text-xs text-[#64748B] mt-1 mb-6">
            Enter your assigned Registration ID to view and download your verified entry pass.
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
              className="w-full px-4 py-2 rounded-xl border border-[#E5E7EB] text-center font-mono text-xs focus:border-[#E31827] outline-none text-[#172033]"
            />

            {lookupError && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg font-medium border border-red-200">
                {lookupError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <Search className="w-4 h-4 text-white" />
              )}
              <span>Retrieve Pass</span>
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <Link
              to="/register"
              className="text-xs font-semibold text-[#E31827] hover:underline"
            >
              Not registered yet? Register now →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Success Banner (Matches institutional theme) */}
          <div className="no-print bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs text-center">
            <div className="w-12 h-12 bg-emerald-50 text-[#16845B] border border-emerald-200 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#16845B] bg-[#EBF7F2] px-2.5 py-0.5 rounded-full border border-[#16845B]/20">
              Registration Confirmed
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-2">
              Registration Successful!
            </h1>

            <p className="mt-2 text-xs sm:text-sm text-[#172033] max-w-lg mx-auto font-medium">
              Your registration for <strong>JECRC University Alumni Diwali Get-Together 2026</strong> has been confirmed.
            </p>

            <p className="mt-1 text-xs text-[#64748B] max-w-md mx-auto">
              Please show your QR code at the university entry gate for verification. We look forward to welcoming you back!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-white" />
                <span>Download QR Pass</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-[#E5E7EB] hover:bg-gray-50 text-[#172033] font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-[#172033]" />
                <span>Print QR Pass</span>
              </button>
            </div>
          </div>

          {/* Official Pass Preview Card */}
          <div>
            <div className="no-print flex items-center justify-between mb-2.5 px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                Official Pass Preview
              </span>
              <span className="text-[11px] text-[#64748B]">
                High-resolution printable gate credential
              </span>
            </div>

            <PassCard data={registration} cardRef={cardRef} />
          </div>

          {/* Bottom Back Button */}
          <div className="no-print text-center pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#64748B] hover:text-[#172033] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Register another alumnus</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
