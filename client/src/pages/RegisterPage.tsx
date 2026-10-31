import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationService, RegisterPayload } from '../services/registration.service';
import { DiwaliLamp } from '../components/DiwaliLamp';
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  BookOpen,
  Building,
  Briefcase,
  AlertCircle,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const DEGREES = [
  'B.Tech - Computer Science & Engineering',
  'B.Tech - Information Technology',
  'B.Tech - Electronics & Communication',
  'B.Tech - Mechanical Engineering',
  'B.Tech - Civil Engineering',
  'B.Tech - Electrical Engineering',
  'B.Tech - AI & Data Science',
  'BCA (Bachelor of Computer Applications)',
  'MCA (Master of Computer Applications)',
  'M.Tech',
  'MBA (Master of Business Administration)',
  'BBA (Bachelor of Business Administration)',
  'B.Com / M.Com',
  'B.Sc / M.Sc',
  'Ph.D. / Doctorate',
  'Other Degree',
];

const BRANCHES = [
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Computer Applications',
  'School of Management',
  'School of Sciences',
  'School of Humanities',
  'Other Department',
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPayload>({
    fullName: '',
    email: '',
    mobile: '',
    currentCity: '',
    graduationYear: 2020,
    course: 'B.Tech - Computer Science & Engineering',
    branch: 'Computer Science & Engineering',
    companyName: '',
    designation: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 26 }, (_, i) => currentYear - i); // 2026 down to 2001

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend validation
    if (!formData.fullName.trim()) {
      setErrorMessage('Full Name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number.');
      return;
    }
    if (!formData.companyName.trim()) {
      setErrorMessage('Current Company / Organization is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Current Designation is required.');
      return;
    }

    setLoading(true);
    try {
      const result = await registrationService.register(formData);
      // Navigate to success page with generated pass data
      navigate('/registration/success', { state: { registration: result } });
    } catch (err: any) {
      const errorText =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Registration could not be completed. Please check your details and try again.';
      setErrorMessage(errorText);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF9EE] border border-[#D9AD56]/60 shadow-sm mb-4">
          <DiwaliLamp size={24} />
          <span className="text-xs font-bold uppercase tracking-widest text-[#493078]">
            Alumni Association Annual Fest
          </span>
          <DiwaliLamp size={24} />
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#101A32] font-serif tracking-tight">
          JECRC Alumni Diwali Get-Together 2026
        </h1>

        <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Reconnect, reminisce, and celebrate the festival of lights with your alma mater. Register below to receive your official QR Entry Pass.
        </p>

        {/* Quick Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 text-xs sm:text-sm text-[#101A32] font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            Free Alumni Entry
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            Instant Digital QR Pass
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#16845B]" />
            No Password Required
          </span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="mb-8 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 flex items-start gap-3 shadow-sm animate-shake">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Registration Alert</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-[#D9AD56]/40 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#101A32] via-[#493078] to-[#101A32] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#D9AD56]" />
            <h2 className="text-base sm:text-lg font-bold font-serif tracking-wide">
              Alumni Registration Form
            </h2>
          </div>
          <span className="text-xs text-[#E5C174] font-mono">Event Year: 2026</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div>
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 mb-5">
              <div className="p-1.5 rounded-lg bg-[#493078]/10 text-[#493078]">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#101A32] uppercase tracking-wider font-serif">
                1. Personal Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="rahul.sharma@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Mobile Number (India) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    maxLength={14}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  10-digit mobile number for pass confirmation
                </p>
              </div>

              {/* Current City */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Current City (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur, Bengaluru, Gurgaon"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC INFORMATION */}
          <div>
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 mb-5">
              <div className="p-1.5 rounded-lg bg-[#D9AD56]/20 text-[#B88F3B]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#101A32] uppercase tracking-wider font-serif">
                2. Academic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Graduation Year */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Passing Batch / Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none bg-white text-[#101A32]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Course / Degree */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Course / Degree <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none bg-white text-[#101A32]"
                  >
                    {DEGREES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Branch / Department */}
              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Branch / Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none bg-white text-[#101A32]"
                >
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: PROFESSIONAL INFORMATION */}
          <div>
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-100 mb-5">
              <div className="p-1.5 rounded-lg bg-[#16845B]/15 text-[#16845B]">
                <Building className="w-4 h-4" />
              </div>
              <h3 className="text-base font-bold text-[#101A32] uppercase tracking-wider font-serif">
                3. Professional Information
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Company / Organization */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Current Company / Organization <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Google, TCS, Self-Employed"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
              </div>

              {/* Designation / Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Current Designation / Job Role <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Senior Software Engineer, Founder"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#D9AD56] focus:ring-2 focus:ring-[#D9AD56]/20 transition-all text-sm outline-none text-[#101A32]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#101A32] via-[#493078] to-[#101A32] text-white font-serif font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:opacity-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 border border-[#D9AD56]/50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#D9AD56]" />
                  <span>Generating Your Secure Pass...</span>
                </>
              ) : (
                <>
                  <DiwaliLamp size={28} />
                  <span>Complete Registration & Generate QR Pass</span>
                  <DiwaliLamp size={28} />
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">
              By submitting, your details will be verified against the JECRC Alumni directory. No account creation is needed.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
