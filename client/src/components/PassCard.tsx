import React from 'react';
import { JecrcUniversityLogo, JecrcAlumniLogo } from './JecrcLogo';
import { AlumniRegistrationData } from '../types';
import { MapPin, Calendar, Award, Building, Briefcase, CheckCircle2 } from 'lucide-react';

interface PassCardProps {
  data: AlumniRegistrationData;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const PassCard: React.FC<PassCardProps> = ({ data, cardRef }) => {
  const displayDegree =
    data.degree === 'Other / Not Listed' && data.otherDegree
      ? data.otherDegree
      : data.degree || data.course;

  const displayCourse =
    data.course === 'Other / Not Listed' && data.otherCourse
      ? data.otherCourse
      : data.degree
      ? data.course
      : data.branch;

  return (
    <div
      ref={cardRef}
      className="pass-print-container w-full max-w-lg mx-auto bg-white rounded-2xl overflow-hidden border border-[#E5E7EB] shadow-xs"
    >
      {/* Top Institutional Header */}
      <div className="bg-white p-4 sm:p-6 border-b border-[#E5E7EB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <JecrcUniversityLogo height={28} className="sm:h-[34px] shrink-0" />
          <div className="h-7 w-[1px] bg-gray-200 shrink-0" />
          <JecrcAlumniLogo size={32} className="sm:w-[38px] sm:h-[38px] shrink-0" />
          <div className="min-w-0">
            <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-[#E31827]">
              JECRC UNIVERSITY • ALUMNI
            </p>
            <h1 className="text-xs sm:text-base font-bold text-[#172033] tracking-tight leading-snug">
              Diwali Get-Together 2026 • Official Pass
            </h1>
          </div>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
          <span className="text-[10px] font-mono font-bold text-[#64748B]">
            DATE: 31 OCT 2026
          </span>
          <span className="text-[9px] sm:text-[10px] font-bold text-[#16845B] bg-[#EBF7F2] px-2 py-0.5 rounded border border-[#16845B]/20 inline-block">
            VERIFIED PASS
          </span>
        </div>
      </div>

      {/* Main Pass Body */}
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        {/* Name and Pass ID */}
        <div className="text-center pb-4 border-b border-gray-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Registered Alumnus
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-[#172033] mt-0.5 break-words">
            {data.fullName}
          </h2>
          <div className="mt-2 inline-flex flex-wrap items-center justify-center gap-1.5 px-3 py-1 rounded-lg bg-[#FAFAFB] border border-[#E5E7EB] text-[#172033] font-mono text-[11px] sm:text-xs font-bold max-w-full">
            <span className="text-[#64748B]">Pass ID:</span>
            <span className="text-[#E31827] break-all">{data.registrationId}</span>
          </div>
        </div>

        {/* QR Code and Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 items-center">
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-3.5 rounded-xl border border-[#E5E7EB] bg-[#FAFAFB]">
            {data.qrCodeDataUrl ? (
              <img
                src={data.qrCodeDataUrl}
                alt={`QR Pass for ${data.registrationId}`}
                className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg bg-white p-1.5 shadow-2xs"
              />
            ) : (
              <div className="w-40 h-40 sm:w-44 sm:h-44 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">
                Generating QR...
              </div>
            )}
            <p className="text-[10px] text-center font-medium text-[#64748B] mt-2">
              Present at Gate for Verification
            </p>
          </div>

          {/* Academic & Corporate Details */}
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Academic Cohort</p>
              <p className="font-bold text-[#172033] mt-0.5">
                Class of {data.graduationYear}
              </p>
              <p className="text-[#64748B] text-[11px] break-words">
                {displayDegree} • {displayCourse}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase text-[#64748B]">Organization & Role</p>
              <p className="font-bold text-[#172033] mt-0.5 break-words">
                {data.companyName}
              </p>
              <p className="text-[#64748B] text-[11px] break-words">
                {data.designation}
              </p>
            </div>

            {data.currentCity && (
              <div>
                <p className="text-[10px] font-bold uppercase text-[#64748B]">Current City</p>
                <p className="font-medium text-[#172033] mt-0.5 break-words">
                  {data.currentCity}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Event Schedule Footer */}
        <div className="bg-[#FAFAFB] rounded-xl p-3 text-[11px] text-[#64748B] space-y-1.5 border border-[#E5E7EB]">
          <div className="flex items-start gap-1.5 font-medium text-[#172033]">
            <Calendar className="w-3.5 h-3.5 text-[#E31827] mt-0.5 shrink-0" />
            <span>Sunday, October 31, 2026 • Gates Open: 05:00 PM IST</span>
          </div>
          <div className="flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
            <span>JECRC University Campus, Ramchandrapura, Sitapura, Jaipur</span>
          </div>
        </div>
      </div>

      {/* Red Accent Bottom Bar */}
      <div className="h-1.5 bg-[#E31827]" />
    </div>
  );
};
