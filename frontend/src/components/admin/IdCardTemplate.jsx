import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

// Premium Indian engineering departments mapping to accent colors
const deptColors = {
  'Computer Science': 'linear-gradient(135deg, #2563EB, #1D4ED8)', // Deep Blue
  'Information Technology': 'linear-gradient(135deg, #0284C7, #0369A1)', // Ocean Blue
  'Mechanical': 'linear-gradient(135deg, #DC2626, #B91C1C)', // Crimson Red
  'Civil': 'linear-gradient(135deg, #16A34A, #15803D)', // Emerald Green
  'Electronics': 'linear-gradient(135deg, #9333EA, #7E22CE)', // Royal Purple
  'Electrical': 'linear-gradient(135deg, #D97706, #B45309)', // Amber Gold
  'Default': 'linear-gradient(135deg, #475569, #334155)' // Slate
};

const getInitials = (name) => {
  if (!name) return 'ST';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

const IdCardTemplate = ({ student, collegeName, collegeLogo, collegeAddress }) => {
  const deptName = student.department?.name || 'Department';
  const colorBg = Object.keys(deptColors).find(k => deptName.includes(k)) 
                ? deptColors[Object.keys(deptColors).find(k => deptName.includes(k))] 
                : deptColors['Default'];

  const [imgError, setImgError] = useState(false);
  
  let photoUrl = student.user?.profileImage;
  if (photoUrl && photoUrl.startsWith('/uploads')) {
    photoUrl = `http://localhost:5050${photoUrl}`;
  }
  
  const hasValidPhoto = photoUrl && !imgError;

  return (
    <div className="flex flex-col sm:flex-row gap-6 mb-8 id-card-container">
      {/* FRONT OF CARD */}
      <div 
        className="relative bg-white shadow-xl rounded-xl overflow-hidden print-card flex flex-col"
        style={{ width: '2.125in', height: '3.375in', boxSizing: 'border-box' }}
      >
        {/* Dynamic Curved Header Banner */}
        <div 
          className="relative h-[32%] flex flex-col items-center pt-3 pb-8 text-white z-0"
          style={{ background: colorBg }}
        >
          {collegeLogo ? (
            <img src={collegeLogo} alt="Logo" className="h-7 object-contain mb-1" />
          ) : (
            <div className="h-6 font-extrabold text-[11px] tracking-widest drop-shadow-md">LOGO</div>
          )}
          <h2 className="text-[9px] font-bold text-center leading-tight uppercase px-2 drop-shadow-md">
            {collegeName || 'State Institute of Technology'}
          </h2>
          {/* Curve Overlay */}
          <div className="absolute -bottom-6 left-0 w-full h-12 bg-white" style={{ borderRadius: '50% 50% 0 0', transform: 'scaleX(1.5)' }}></div>
        </div>

        {/* Student Photo */}
        <div className="absolute top-[20%] left-1/2 transform -translate-x-1/2 z-10 w-[0.8in] h-[1in] rounded-xl overflow-hidden border-4 border-white shadow-lg bg-gray-50 flex items-center justify-center">
          {hasValidPhoto ? (
            <img 
              src={photoUrl} 
              alt={student.personalDetails?.fullName} 
              className="w-full h-full object-cover" 
              onError={() => setImgError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white text-2xl font-bold"
              style={{ background: colorBg }}
            >
              {getInitials(student.personalDetails?.fullName)}
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="mt-14 px-4 text-center flex-grow flex flex-col justify-start">
          <h1 className="text-[13px] font-extrabold text-gray-900 leading-tight mb-0.5 tracking-tight">
            {student.personalDetails?.fullName || 'Student Name'}
          </h1>
          <p className="text-[8px] font-bold text-indigo-600 mb-2 uppercase tracking-wide">
            {student.course?.name || 'B.Tech'} - {deptName}
          </p>

          <div className="mt-1 flex flex-col gap-[3px] text-left mx-auto w-full max-w-[1.6in]">
            <div className="flex justify-between items-end border-b border-gray-100 pb-[2px]">
              <span className="text-[7.5px] text-gray-500 font-semibold uppercase">ID No.</span>
              <span className="text-[9px] font-bold text-gray-900">{student.enrollmentNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-[2px]">
              <span className="text-[7.5px] text-gray-500 font-semibold uppercase">Roll No.</span>
              <span className="text-[9px] font-bold text-gray-900">{student.rollNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-end border-b border-gray-100 pb-[2px]">
              <span className="text-[7.5px] text-gray-500 font-semibold uppercase">D.O.B</span>
              <span className="text-[9px] font-bold text-gray-900">
                {student.personalDetails?.dob ? new Date(student.personalDetails.dob).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-[7.5px] text-gray-500 font-semibold uppercase">Blood</span>
              <span className="text-[9px] font-extrabold text-red-600">
                {student.personalDetails?.bloodGroup || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="absolute bottom-0 w-full h-[6%] text-center flex items-center justify-center text-white text-[7px] tracking-[0.2em] font-bold" style={{ background: colorBg }}>
          STUDENT
        </div>
      </div>

      {/* BACK OF CARD */}
      <div 
        className="relative bg-white shadow-xl rounded-xl p-4 flex flex-col justify-between print-card"
        style={{ width: '2.125in', height: '3.375in', boxSizing: 'border-box' }}
      >
        <div className="text-[7.5px] text-gray-800 leading-[1.3] text-center border-b border-gray-100 pb-2">
          <p className="font-extrabold uppercase mb-1 text-gray-900">Property of</p>
          <p className="font-bold">{collegeName || 'State Institute of Technology'}</p>
          <p className="text-gray-500 mt-0.5">{collegeAddress || '123 Campus Road, Tech City, ST 12345'}</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="p-1 bg-white border border-gray-200 rounded-lg shadow-sm">
            <QRCodeSVG 
              value={student.rollNumber || student.enrollmentNumber || 'UNKNOWN'} 
              size={70}
              level="H"
              includeMargin={false}
            />
          </div>
          <p className="text-[6.5px] font-semibold tracking-wider text-gray-400 mt-2 uppercase">Scan to Verify</p>
        </div>

        {/* Emergency Contact */}
        <div className="bg-red-50 rounded-md p-1.5 text-center mb-2 border border-red-100">
          <span className="text-[7px] font-extrabold text-red-700 uppercase block mb-[2px]">Emergency Contact</span>
          <span className="text-[8.5px] font-bold text-gray-900 block">{student.parent?.phone || 'N/A'}</span>
          <span className="text-[6.5px] text-gray-600 font-medium">({student.parent?.relation || 'Guardian'})</span>
        </div>

        <div className="text-[6.5px] text-center text-gray-500 leading-tight">
          If found, please return to the issuing authority immediately.
        </div>
      </div>
    </div>
  );
};

export default IdCardTemplate;
