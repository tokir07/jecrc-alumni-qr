import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registrationService, RegisterPayload } from '../services/registration.service';
import { SearchableSelect } from '../components/SearchableSelect';
import {
  JECRC_DEGREES,
  getCoursesForDegree,
  OTHER_OPTION,
} from '../data/academicStructure';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building,
  Briefcase,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

const GAME_OPTIONS = [
  'Musical Chair',
  'Dumb Charades',
  'Cricket',
  'Pickle Ball',
] as const;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterPayload>({
    fullName: '',
    email: '',
    mobile: '',
    currentCity: '',
    graduationYear: 2020,
    degree: 'B.Tech',
    course: 'Computer Science & Engineering (CSE)',
    otherDegree: '',
    otherCourse: '',
    companyName: '',
    designation: '',
    games: [],
  });

  const [selectedGame, setSelectedGame] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const currentYear = 2026;
  const years = Array.from({ length: 26 }, (_, i) => currentYear - i); // 2026 down to 2001

  const availableCourses = getCoursesForDegree(formData.degree);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'graduationYear' ? parseInt(value, 10) : value,
    }));
  };

  const handleDegreeChange = (selectedDegree: string) => {
    setFormData((prev) => {
      if (selectedDegree === OTHER_OPTION) {
        return {
          ...prev,
          degree: selectedDegree,
          course: OTHER_OPTION,
          otherDegree: '',
          otherCourse: '',
        };
      }
      return {
        ...prev,
        degree: selectedDegree,
        course: '', // Reset dependent course
        otherDegree: '',
        otherCourse: '',
      };
    });
  };

  const handleCourseChange = (selectedCourse: string) => {
    setFormData((prev) => ({
      ...prev,
      course: selectedCourse,
      otherCourse: selectedCourse === OTHER_OPTION ? prev.otherCourse : '',
    }));
  };

  const handleGameSelect = (game: string) => {
    setSelectedGame((prev) => (prev === game ? '' : game));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Personal & Contact Validation
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

    // Academic Validation (ONLY TWO FIELDS: Degree and Course)
    if (!formData.degree) {
      setErrorMessage('Please select your Degree.');
      return;
    }
    if (formData.degree === OTHER_OPTION && (!formData.otherDegree || !formData.otherDegree.trim())) {
      setErrorMessage('Please specify your Degree name.');
      return;
    }
    if (!formData.course) {
      setErrorMessage('Please select your Course.');
      return;
    }
    if (formData.course === OTHER_OPTION && (!formData.otherCourse || !formData.otherCourse.trim())) {
      setErrorMessage('Please specify your Course / Specialization name.');
      return;
    }

    // Professional Validation
    if (!formData.companyName.trim()) {
      setErrorMessage('Current Company / Organization is required.');
      return;
    }
    if (!formData.designation.trim()) {
      setErrorMessage('Current Designation is required.');
      return;
    }

    // Construct games array (at most 1 game selected)
    const finalGames: string[] = selectedGame ? [selectedGame] : [];

    setLoading(true);
    try {
      // Send validated payload
      const payload: RegisterPayload = {
        ...formData,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        currentCity: formData.currentCity?.trim() || undefined,
        degree: formData.degree,
        course: formData.course,
        otherDegree: formData.degree === OTHER_OPTION ? formData.otherDegree?.trim() : undefined,
        otherCourse: formData.course === OTHER_OPTION ? formData.otherCourse?.trim() : undefined,
        branch: formData.course === OTHER_OPTION ? (formData.otherCourse?.trim() || formData.course) : formData.course,
        companyName: formData.companyName.trim(),
        designation: formData.designation.trim(),
        games: finalGames,
      };

      const result = await registrationService.register(payload);
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
      {/* Event Header & Hero Section (Clean Institutional Design) */}
      <section className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-10 shadow-xs text-center space-y-6">
        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-[#FEF2F2] text-[#E31827] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
            JECRC University • Alumni Association
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#172033] tracking-tight">
            Diwali Get-Together <span className="text-[#E31827]">2026</span>
          </h1>

          <p className="text-xs sm:text-sm text-[#64748B] max-w-xl mx-auto leading-relaxed">
            Welcome home, Alumni! Join fellow graduates and faculty for an evening of celebration, nostalgia, and community. Register below to receive your official digital entry pass.
          </p>
        </div>

        {/* Important Event Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-gray-100 text-left">
          <div className="p-3.5 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] flex items-start gap-3">
            <Calendar className="w-4 h-4 text-[#E31827] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Date & Time</p>
              <p className="text-xs font-semibold text-[#172033] mt-0.5">Wed, 4 Nov 2026</p>
              <p className="text-[11px] text-[#64748B]">From 11:00 AM IST</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] flex items-start gap-3">
            <MapPin className="w-4 h-4 text-[#E31827] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Venue</p>
              <p className="text-xs font-semibold text-[#172033] mt-0.5">JECRC Campus</p>
              <p className="text-[11px] text-[#64748B]">Ramchandrapura, Sitapura</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#FAFAFB] border border-[#E5E7EB] flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-[#16845B] shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Gate Admission</p>
              <p className="text-xs font-semibold text-[#172033] mt-0.5">Gate 01 (Main Gate)</p>
              <p className="text-[11px] text-[#64748B]">Digital QR Pass Entry</p>
            </div>
          </div>
        </div>
      </section>

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
      <div id="registration-form" className="bg-white rounded-2xl border border-[#E5E7EB] shadow-xs overflow-hidden scroll-mt-20">
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    placeholder="e.g. Jaipur, Bengaluru, Gurgaon"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: ACADEMIC INFORMATION (ONLY TWO FIELDS: Degree and Course) */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-[#E31827] uppercase tracking-wider">
                2. Academic Information
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Graduation Year */}
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-[#172033] mb-1">
                  Graduation Year <span className="text-[#E31827]">*</span>
                </label>
                <select
                  name="graduationYear"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none bg-white text-[#172033]"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      Class of {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* FIELD 1: DEGREE (Searchable & Mobile-friendly) */}
              <div className="sm:col-span-2">
                <SearchableSelect
                  id="degree-select"
                  name="degree"
                  label="Degree"
                  required
                  value={formData.degree}
                  options={JECRC_DEGREES}
                  placeholder="Select Degree..."
                  onChange={handleDegreeChange}
                  helperText="Select your official graduated degree"
                />
              </div>

              {/* Conditional: Custom Degree Input if 'Other / Not Listed' is chosen */}
              {formData.degree === OTHER_OPTION && (
                <div className="sm:col-span-3 bg-red-50/50 p-3.5 rounded-xl border border-red-100 space-y-1">
                  <label className="block text-xs font-semibold text-[#E31827]">
                    Specify Degree Name <span className="text-[#E31827]">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherDegree"
                    value={formData.otherDegree || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your exact degree title (e.g. B.Voc, Diploma, Executive MBA)"
                    className="w-full px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] bg-white text-[#172033] outline-none"
                  />
                </div>
              )}

              {/* FIELD 2: COURSE (Dependent on Degree, Searchable & Mobile-friendly) */}
              <div className="sm:col-span-3">
                <SearchableSelect
                  id="course-select"
                  name="course"
                  label="Course / Programme"
                  required
                  disabled={!formData.degree}
                  value={formData.course}
                  options={availableCourses}
                  placeholder={
                    !formData.degree
                      ? 'Select a Degree above first...'
                      : 'Select Course / Specialization...'
                  }
                  onChange={handleCourseChange}
                  helperText={
                    !formData.degree
                      ? 'Course options unlock after selecting a degree'
                      : `Programmes available under ${formData.degree}`
                  }
                />
              </div>

              {/* Conditional: Custom Course Input if 'Other / Not Listed' is chosen */}
              {formData.course === OTHER_OPTION && (
                <div className="sm:col-span-3 bg-red-50/50 p-3.5 rounded-xl border border-red-100 space-y-1">
                  <label className="block text-xs font-semibold text-[#E31827]">
                    Specify Course / Specialization Name <span className="text-[#E31827]">*</span>
                  </label>
                  <input
                    type="text"
                    name="otherCourse"
                    value={formData.otherCourse || ''}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your course / branch specialization (e.g. Robotics, Marketing Analytics)"
                    className="w-full px-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] bg-white text-[#172033] outline-none"
                  />
                </div>
              )}
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
                    onChange={handleInputChange}
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
                    onChange={handleInputChange}
                    required
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full pl-10 pr-3.5 py-2.5 sm:py-2 text-sm sm:text-xs min-h-[44px] rounded-xl border border-[#E5E7EB] focus:border-[#E31827] outline-none text-[#172033] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: GAMES & ACTIVITIES PARTICIPATION */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#E31827] uppercase tracking-wider">
                  4. Games & Activities Participation
                </span>
                <p className="text-xs text-[#64748B] mt-1">
                  Select one game or activity you would like to participate in (optional).
                </p>
              </div>
              {selectedGame && (
                <button
                  type="button"
                  onClick={() => setSelectedGame('')}
                  className="text-[11px] font-semibold text-[#64748B] hover:text-[#E31827] cursor-pointer"
                >
                  Clear choice
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {GAME_OPTIONS.map((game) => {
                const isSelected = selectedGame === game;
                return (
                  <button
                    key={game}
                    type="button"
                    onClick={() => handleGameSelect(game)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer min-h-[48px] select-none touch-manipulation text-left ${
                      isSelected
                        ? 'border-[#E31827] bg-[#FEF2F2]/60 text-[#172033] ring-1 ring-[#E31827]'
                        : 'border-[#E5E7EB] bg-white text-[#64748B] hover:border-gray-300 hover:bg-[#FAFAFB]'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'border-[#E31827] bg-[#E31827]'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-xs font-semibold text-[#172033] flex-1">
                      {game}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-[#E31827] uppercase tracking-wider bg-white px-2 py-0.5 rounded-md border border-[#E31827]/20">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
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
