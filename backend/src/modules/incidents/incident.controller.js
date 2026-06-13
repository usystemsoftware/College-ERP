const Incident = require('./incident.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Simple keyword-based AI categorization (runs server-side, no external API needed)
function categorizeIncident(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  const categoryRules = [
    { category: 'Medical Emergency', keywords: ['medical', 'injury', 'hurt', 'blood', 'ambulance', 'faint', 'unconscious', 'breathing', 'chest pain', 'seizure', 'allergic', 'broken bone', 'accident', 'first aid', 'hospital', 'emergency'], urgencyBoost: 'Critical' },
    { category: 'Safety Issue', keywords: ['safety', 'fire', 'smoke', 'gas leak', 'electrical', 'dangerous', 'weapon', 'threat', 'unsafe', 'hazard', 'chemical', 'exposed wire', 'flood', 'collapse', 'evacuation'], urgencyBoost: 'Critical' },
    { category: 'Harassment Complaint', keywords: ['harass', 'bully', 'intimidat', 'abuse', 'stalk', 'discriminat', 'threat', 'assault', 'touch', 'inappropriate', 'verbal abuse', 'sexual', 'racist', 'hostile'], urgencyBoost: 'High' },
    { category: 'Bullying', keywords: ['bully', 'ragging', 'rag', 'teasing', 'mock', 'humiliat', 'isolat', 'exclusion', 'cyberbully', 'online harass', 'social media'], urgencyBoost: 'High' },
    { category: 'Theft', keywords: ['theft', 'stolen', 'steal', 'missing', 'lost', 'robbed', 'broke into', 'locker', 'wallet', 'phone stolen', 'laptop stolen'], urgencyBoost: 'Medium' },
    { category: 'Infrastructure Problem', keywords: ['broken', 'leak', 'repair', 'maintenance', 'toilet', 'washroom', 'light', 'fan', 'ac', 'air condition', 'window', 'door', 'bench', 'roof', 'plumbing', 'electricity', 'wifi', 'internet', 'projector', 'furniture'], urgencyBoost: 'Low' },
  ];

  let bestMatch = { category: 'Other', urgency: 'Medium', confidence: 0.3, reasoning: 'No specific category matched. Manual review recommended.' };
  let highestScore = 0;

  for (const rule of categoryRules) {
    let score = 0;
    const matchedKeywords = [];
    for (const keyword of rule.keywords) {
      if (text.includes(keyword)) {
        score++;
        matchedKeywords.push(keyword);
      }
    }
    if (score > highestScore) {
      highestScore = score;
      const confidence = Math.min(0.95, 0.4 + (score * 0.12));
      bestMatch = {
        category: rule.category,
        urgency: rule.urgencyBoost,
        confidence: parseFloat(confidence.toFixed(2)),
        reasoning: `Matched keywords: ${matchedKeywords.join(', ')}. Assigned urgency: ${rule.urgencyBoost}.`
      };
    }
  }

  // Urgency escalation by certain alarm words
  const criticalWords = ['urgent', 'emergency', 'immediate', 'critical', 'life threatening', 'dying', 'help'];
  if (criticalWords.some(w => text.includes(w))) {
    bestMatch.urgency = 'Critical';
    bestMatch.reasoning += ' Escalated to Critical due to urgency keywords.';
  }

  return bestMatch;
}

// POST /incidents — Submit an incident (available to all authenticated users)
const createIncident = async (req, res, next) => {
  try {
    const { title, description, category, location, isAnonymous } = req.body;
    if (!title || !description) throw new ApiError(400, 'Title and description are required');

    // Handle file uploads from multer
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => {
        let fileType = 'document';
        if (file.mimetype.startsWith('image/')) fileType = 'image';
        else if (file.mimetype.startsWith('audio/')) fileType = 'audio';

        return {
          type: fileType,
          url: `/uploads/incidents/${file.filename}`,
          filename: file.originalname
        };
      });
    }

    // Also handle any attachments passed as JSON in the body
    if (req.body.attachments && typeof req.body.attachments === 'string') {
      try {
        const bodyAttachments = JSON.parse(req.body.attachments);
        attachments = [...attachments, ...bodyAttachments];
      } catch (e) { /* ignore parse errors */ }
    }

    // Run AI categorization
    const aiResult = categorizeIncident(title, description);

    const incident = await Incident.create({
      title,
      description,
      category: category || aiResult.category,
      urgency: aiResult.urgency,
      location: location || '',
      isAnonymous: isAnonymous !== false, // default true
      submittedBy: req.user._id,
      attachments,
      aiCategorization: aiResult,
      collegeId: req.user.collegeId
    });

    // If critical or high urgency, notify admins via socket
    if (['Critical', 'High'].includes(aiResult.urgency)) {
      try {
        const io = req.app.get('io');
        const Notification = require('../notifications/notification.model');
        const Role = require('../roles/role.model');
        const User = require('../users/user.model');

        const targetRoles = await Role.find({ name: { $in: ['College Admin', 'Super Admin', 'Principal'] } });
        const adminUsers = await User.find({ role: { $in: targetRoles.map(r => r._id) }, collegeId: req.user.collegeId });

        const notifOps = adminUsers.map(admin => ({
          insertOne: {
            document: {
              recipient: admin._id,
              title: `🚨 ${aiResult.urgency} Incident Report`,
              message: `New ${aiResult.category} reported: "${title.substring(0, 60)}..."`,
              type: 'Alert',
              category: 'Safety',
              metadata: { type: 'INCIDENT_REPORT', incidentId: incident._id, urgency: aiResult.urgency },
              collegeId: req.user.collegeId
            }
          }
        }));

        if (notifOps.length > 0) {
          await Notification.bulkWrite(notifOps);
          if (io) {
            adminUsers.forEach(admin => {
              io.to(admin._id.toString()).emit('new_notification', {
                title: `🚨 ${aiResult.urgency} Incident Report`,
                message: `New ${aiResult.category} reported: "${title.substring(0, 60)}..."`,
                metadata: { type: 'INCIDENT_REPORT', incidentId: incident._id, urgency: aiResult.urgency }
              });
            });
          }
        }
      } catch (notifErr) {
        console.error('Incident notification error:', notifErr.message);
      }
    }

    return res.status(201).json(new ApiResponse(201, {
      incident,
      aiCategorization: aiResult
    }, 'Incident reported successfully. Thank you for your report.'));
  } catch (error) { next(error); }
};

// GET /incidents — List incidents (admin/security only)
const getIncidents = async (req, res, next) => {
  try {
    const { status, category, urgency, page = 1, limit = 20 } = req.query;
    const filter = {};

    const role = req.user.role.name;
    if (role !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [incidents, total] = await Promise.all([
      Incident.find(filter)
        .populate('assignedTo', 'email')
        .sort({ urgency: 1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Incident.countDocuments(filter)
    ]);

    // Compute stats
    const allForStats = await Incident.find(filter.collegeId ? { collegeId: filter.collegeId } : {});
    const stats = {
      total: allForStats.length,
      new: allForStats.filter(i => i.status === 'New').length,
      investigating: allForStats.filter(i => i.status === 'Investigating' || i.status === 'Under Review').length,
      resolved: allForStats.filter(i => i.status === 'Resolved').length,
      critical: allForStats.filter(i => i.urgency === 'Critical').length,
      high: allForStats.filter(i => i.urgency === 'High').length,
    };

    return res.json(new ApiResponse(200, {
      incidents,
      stats,
      pagination: { total, pages: Math.ceil(total / parseInt(limit)), page: parseInt(page) }
    }, 'Incidents fetched'));
  } catch (error) { next(error); }
};

// GET /incidents/my-incidents — Get incidents submitted by the logged-in user
const getMyIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ submittedBy: req.user._id })
      .sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, incidents, 'User incidents fetched'));
  } catch (error) { next(error); }
};

// GET /incidents/:id — Get single incident
const getIncidentById = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('assignedTo', 'email')
      .populate('reviewNotes.addedBy', 'email');
    if (!incident) throw new ApiError(404, 'Incident not found');
    return res.json(new ApiResponse(200, incident, 'Incident fetched'));
  } catch (error) { next(error); }
};

// PATCH /incidents/:id — Update incident status/assignment (admin only)
const updateIncident = async (req, res, next) => {
  try {
    const { status, assignedTo, reviewNote } = req.body;
    const incident = await Incident.findById(req.params.id);
    if (!incident) throw new ApiError(404, 'Incident not found');

    if (status) {
      incident.status = status;
      if (status === 'Resolved') incident.resolvedAt = new Date();
    }
    if (assignedTo) incident.assignedTo = assignedTo;
    if (reviewNote) {
      incident.reviewNotes.push({
        note: reviewNote,
        addedBy: req.user._id,
        addedAt: new Date()
      });
    }

    await incident.save();

    const populated = await Incident.findById(incident._id)
      .populate('assignedTo', 'email')
      .populate('reviewNotes.addedBy', 'email');

    return res.json(new ApiResponse(200, populated, 'Incident updated'));
  } catch (error) { next(error); }
};

module.exports = { createIncident, getIncidents, getMyIncidents, getIncidentById, updateIncident };
