import React from 'react';
import { DiwaliLamp } from './DiwaliLamp';
import { AlumniRegistrationData } from '../types';
import { MapPin, Calendar, Award, Building, Briefcase } from 'lucide-react';

interface PassCardProps {
  data: AlumniRegistrationData;
  cardRef?: React.RefObject<HTMLDivElement>;
}

export const PassCard: React.FC<PassCardProps> = ({ data, cardRef }) => {
  return (
    <div
      ref={cardRef}
      className="pass-print-container w-full max-w-xl mx-auto bg-white rounded-3xl overflow-hidden border-2 border-[#D9AD56]/40 shadow-2xl relative"
    >
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-[#101A32] via-[#493078] to-[#101A32] text-white p-6 sm:p-8 text-center relative overflow-hidden">
        {/* Decorative corner glows */}
        <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-[#D9AD56]/20 blur-xl"></div>
        <div className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-[#D9AD56]/20 blur-xl"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-2">
            <DiwaliLamp size={36} />
            <span className="text-xs uppercase tracking-widest text-[#D9AD56] font-semibold border-b border-[#D9AD56]/40 pb-0.5">
              Alumni Association Presents
            </span>
            <DiwaliLamp size={36} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide font-serif text-white">
            JECRC UNIVERSITY
          </h1>

          <div className="inline-block mt-2 px-4 py-1 rounded-full bg-[#D9AD56]/20 border border-[#D9AD56]/50">
            <h2 className="text-sm sm:text-base font-bold text-[#E5C174] uppercase tracking-wider">
              Diwali Get-Together 2026 • Official Entry Pass
            </h2>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 space-y-6">
        {/* Name and Registration ID */}
        <div className="text-center pb-5 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            Registered Alumnus
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#101A32] mt-1 font-serif">
            {data.fullName}
          </h3>
          <div className="mt-2.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-[#FFF9EE] border border-[#D9AD56]/60 text-[#101A32] font-mono text-sm sm:text-base font-bold shadow-sm">
            <span>Pass ID:</span>
            <span className="text-[#493078]">{data.registrationId}</span>
          </div>
        </div>

        {/* QR Code and Key Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* QR Code Frame */}
          <div className="flex flex-col items-center justify-center p-4 bg-[#FFF9EE]/70 rounded-2xl border-2 border-dashed border-[#D9AD56]/60">
            {data.qrCodeDataUrl ? (
              <img
                src={data.qrCodeDataUrl}
                alt={`QR Pass for ${data.registrationId}`}
                className="w-48 h-48 object-contain rounded-xl shadow-sm bg-white p-2"
              />
            ) : (
              <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center text-xs text-gray-400">
                Generating QR...
              </div>
            )}
            <p className="text-xs text-center font-medium text-gray-500 mt-2">
              Scan at University Gate for Entry
            </p>
          </div>

          {/* Academic & Professional Info */}
          <div className="space-y-3.5 text-sm">
            <div className="flex items-start gap-2.5">
              <Award className="w-4 h-4 text-[#D9AD56] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Batch & Branch</p>
                <p className="font-bold text-[#101A32]">
                  Class of {data.graduationYear}
                </p>
                <p className="text-xs text-gray-600">
                  {data.course} • {data.branch}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Building className="w-4 h-4 text-[#493078] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Organization</p>
                <p className="font-bold text-[#101A32]">{data.companyName}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Briefcase className="w-4 h-4 text-[#493078] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-medium">Designation</p>
                <p className="font-semibold text-gray-700">{data.designation}</p>
              </div>
            </div>

            {data.currentCity && (
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#16845B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-medium">Current City</p>
                  <p className="font-semibold text-gray-700">{data.currentCity}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Event Schedule & Venue Footer within Pass */}
        <div className="bg-[#101A32]/5 rounded-xl p-4 text-xs text-gray-600 space-y-1.5 border border-gray-100">
          <div className="flex items-center gap-2 font-medium text-[#101A32]">
            <Calendar className="w-4 h-4 text-[#D9AD56]" />
            <span>Date: Sunday, October 31, 2026 | Gates Open: 05:00 PM IST</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#493078]" />
            <span>Venue: JECRC University Campus, Ramchandrapura, Sitapura, Jaipur</span>
          </div>
        </div>
      </div>

      {/* Decorative Gold Bottom Bar */}
      <div className="h-3 bg-gradient-to-r from-[#D9AD56] via-[#E5C174] to-[#B88F3B]" />
    </div>
  );
};
