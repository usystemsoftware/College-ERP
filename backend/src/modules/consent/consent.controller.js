const Consent = require('./consent.model');
const Parent = require('../parents/parent.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Grant consent for a specific type
const grantConsent = async (req, res, next) => {
  try {
    const { studentId, consentType } = req.body;
    if (!studentId || !consentType) throw new ApiError(400, 'studentId and consentType are required');

    // Verify parent owns this student
    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) throw new ApiError(404, 'Parent profile not found');
    if (!parent.students.map(s => s.toString()).includes(studentId)) {
      throw new ApiError(403, 'You are not authorized to manage consent for this student');
    }

    const existing = await Consent.findOne({ parent: req.user._id, student: studentId, consentType });

    if (existing) {
      existing.status = 'granted';
      existing.grantedAt = new Date();
      existing.revokedAt = null;
      existing.ipAddress = req.ip;
      existing.userAgent = req.headers['user-agent'];
      await existing.save();
      return res.json(new ApiResponse(200, existing, 'Consent granted successfully'));
    }

    const consent = await Consent.create({
      parent: req.user._id,
      student: studentId,
      consentType,
      status: 'granted',
      grantedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, consent, 'Consent granted successfully'));
  } catch (error) { next(error); }
};

// Revoke consent
const revokeConsent = async (req, res, next) => {
  try {
    const { studentId, consentType } = req.body;
    if (!studentId || !consentType) throw new ApiError(400, 'studentId and consentType are required');

    const parent = await Parent.findOne({ user: req.user._id });
    if (!parent) throw new ApiError(404, 'Parent profile not found');
    if (!parent.students.map(s => s.toString()).includes(studentId)) {
      throw new ApiError(403, 'You are not authorized to manage consent for this student');
    }

    const consent = await Consent.findOne({ parent: req.user._id, student: studentId, consentType });
    if (!consent) throw new ApiError(404, 'Consent record not found');

    consent.status = 'revoked';
    consent.revokedAt = new Date();
    await consent.save();

    return res.json(new ApiResponse(200, consent, 'Consent revoked successfully'));
  } catch (error) { next(error); }
};

// Get all consent status for the logged-in parent's children
const getConsentStatus = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id }).populate('students', 'personalDetails.fullName rollNumber');
    if (!parent) throw new ApiError(404, 'Parent profile not found');

    const consents = await Consent.find({ parent: req.user._id });

    // Build a map of student -> consentType -> status
    const consentMap = {};
    for (const student of parent.students) {
      consentMap[student._id.toString()] = {
        student: {
          _id: student._id,
          name: student.personalDetails?.fullName || 'Unknown',
          rollNumber: student.rollNumber
        },
        consents: {
          location_tracking: 'not_set',
          sms_alerts: 'not_set',
          photo_sharing: 'not_set',
          bus_tracking: 'not_set'
        }
      };
    }

    for (const consent of consents) {
      const sid = consent.student.toString();
      if (consentMap[sid]) {
        consentMap[sid].consents[consent.consentType] = consent.status;
      }
    }

    return res.json(new ApiResponse(200, Object.values(consentMap), 'Consent status fetched'));
  } catch (error) { next(error); }
};

// Check if consent exists (utility for other modules)
const checkConsent = async (studentId, consentType) => {
  const consent = await Consent.findOne({ student: studentId, consentType, status: 'granted' });
  return !!consent;
};

module.exports = { grantConsent, revokeConsent, getConsentStatus, checkConsent };
