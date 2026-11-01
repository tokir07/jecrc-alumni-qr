import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrationService, RegisterPayload } from '../services/registration.service';
import { JecrcLogo, JecrcCrest, JecrcUniversityLogo, JecrcAlumniLogo } from '../components/JecrcLogo';
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
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calendar,
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

  const currentYear = 2026;
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
    <div className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
      {/* Institutional Top Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-5 sm:p-8 shadow-xs text-center">
        <div className="flex items-center justify-center gap-2.5 sm:gap-4 mb-3 sm:mb-4">
          <JecrcUniversityLogo height={32} className="sm:h-[42px]" />
          <div className="h-6 sm:h-8 w-[1px] bg-gray-200" />
          <JecrcAlumniLogo size={34} className="sm:w-[44px] sm:h-[44px]" />
        </div>

        <p className="text-[10px] sm:text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
          JECRC UNIVERSITY • ALUMNI ASSOCIATION
        </p>

        <h1 className="text-xl sm:text-3xl font-extrabold text-[#172033] tracking-tight mt-1">
          Diwali Get-Together <span className="text-[#E31827]">2026 Registration</span>
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-[#64748B] max-w-lg mx-auto leading-relaxed">
          Official alumni entry registration. Submit your verified details to generate your digital gate pass with a unique secure QR code.
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-[#172033] font-medium pt-4 border-t border-gray-100">
          <span className="inline-flex items-center gap-1.5 text-[#16845B]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Verified Alumni Pass</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#16845B]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Instant Digital Download</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#16845B]">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Zero Fee Admission</span>
          </span>
        </div>
      </div>

      {/* Error Alert Banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 shadow-xs animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 shrink-0" />
          <div className="text-xs">
            <p className="font-bold">Registration Alert</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form Card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 sm:px-6 sm:py-4 border-b border-[#E5E7EB] bg-[#FAFAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs sm:text-sm font-bold text-[#172033] uppercase tracking-wider">
            Alumni Registration Form
          </h2>
          <span className="text-[10px] sm:text-[11px] text-[#64748B] font-mono">Academic Cohort 2001–2026</span>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-6 sm:space-y-7">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#E31827] uppercase tracking-wider">
                1. Personal Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Full Name <span className="text-[#E31827]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Email Address <span className="text-[#E31827]">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="email"
                    inputMode="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="rahul.sharma@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Mobile Number (India) <span className="text-[#E31827]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    placeholder="9876543210"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] font-mono transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Current City (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    name="currentCity"
                    value={formData.currentCity}
                    onChange={handleChange}
                    placeholder="e.g. Jaipur, Bengaluru, Gurgaon"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC INFORMATION */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#E31827] uppercase tracking-wider">
                2. Academic Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Graduation Year <span className="text-[#E31827]">*</span>
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Course / Degree <span className="text-[#E31827]">*</span>
                </label>
                <select
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
                >
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Branch / Department <span className="text-[#E31827]">*</span>
                </label>
                <select
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
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
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#E31827] uppercase tracking-wider">
                3. Professional Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Company / Organization <span className="text-[#E31827]">*</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Google, Infosys, Self-Employed"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Current Designation <span className="text-[#E31827]">*</span>
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-gray-400 absolute left-3.5 top-3 sm:top-2.5" />
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 sm:py-3 min-h-[48px] rounded-xl bg-[#E31827] hover:bg-[#C81020] text-white font-bold text-xs uppercase tracking-wider shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-manipulation"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Registration...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration & Generate QR Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-[#64748B] mt-2.5 leading-relaxed">
              Registration is verified directly in university alumni records. No password required.
            </p>
          </div>
        </form>
      </div>

      {/* Staff Login Link */}
      <div className="text-center pt-2">
        <Link
          to="/admin/login"
          className="text-xs text-[#64748B] hover:text-[#E31827] font-medium transition-colors inline-block py-2"
        >
          Staff & Volunteer Gate Access Portal →
        </Link>
      </div>
    </div>
  );
};
