const serviceRequestAssignmentModel = require('../models/serviceRequestAssignmentModel');
const serviceRequestModel = require('../models/serviceRequestModel');

async function assignProviderToRequest(req, res) {
  try {
    const requestId = parseInt(req.params.requestId, 10);
    const { providerId } = req.body;

    // Basic input validation
    if (!requestId || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'requestId and providerId are required',
      });
    }

    /* ============================
       VALIDATION RULES (MANDATORY)
       ============================ */

    // 1. Check request exists
    const requestRows = await serviceRequestAssignmentModel.checkRequestExists(requestId);
    if (!requestRows || requestRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service request not found',
      });
    }

    // 2. Check provider exists
    const providerRows = await serviceRequestAssignmentModel.checkProviderExists(providerId);
    if (!providerRows || providerRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found',
      });
    }

    // 3. Prevent duplicate assignment
    const alreadyAssigned =
      await serviceRequestAssignmentModel.checkProviderAlreadyAssigned(
        requestId,
        providerId
      );

    if (alreadyAssigned && alreadyAssigned.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Provider is already assigned to this request',
      });
    }

    /* ============================
       ASSIGNMENT RULES (MANDATORY)
       ============================ */

    // 4. Insert assignment
    await serviceRequestAssignmentModel.insertAssignment(requestId, providerId);

    // 5. Check if this is the FIRST assignment
    const countRows =
      await serviceRequestAssignmentModel.countAssignmentsForRequest(requestId);

    const assignmentCount = countRows[0]?.count || 0;

    // 6. If first provider → update request status
    if (assignmentCount === 1) {
      await serviceRequestModel.updateRequestByAdmin(requestId, {
        status: 'ASSIGNED',
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Provider assigned successfully',
      data: {
        requestId,
        providerId,
        assignmentStatus: 'PENDING',
      },
    });
  } catch (error) {
    console.error('Assign provider error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

module.exports = {
  assignProviderToRequest,
};
