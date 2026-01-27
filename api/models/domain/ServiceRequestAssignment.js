class ServiceRequestAssignment {
  constructor({
    requestId = null,
    providerId = null,
    assignmentStatus = 'PENDING',
    assignedAt = null,
  } = {}) {
    this.requestId = requestId;
    this.providerId = providerId;
    this.assignmentStatus = assignmentStatus || 'PENDING';
    this.assignedAt = assignedAt ? new Date(assignedAt) : new Date();
  }

  static get ALLOWED_STATUSES() {
    return ['PENDING', 'ACCEPTED', 'DECLINED', 'REMOVED'];
  }

  setStatus(status) {
    if (!ServiceRequestAssignment.ALLOWED_STATUSES.includes(status)) {
      throw new Error(`Invalid assignment status: ${status}`);
    }
    this.assignmentStatus = status;
    return this.assignmentStatus;
  }

  accept() {
    return this.setStatus('ACCEPTED');
  }

  decline() {
    return this.setStatus('DECLINED');
  }

  remove() {
    return this.setStatus('REMOVED');
  }

  touchAssignedAt(date = null) {
    this.assignedAt = date ? new Date(date) : new Date();
    return this.assignedAt;
  }

  toJSON() {
    return {
      requestId: this.requestId,
      providerId: this.providerId,
      assignmentStatus: this.assignmentStatus,
      assignedAt: this.assignedAt instanceof Date ? this.assignedAt.toISOString() : this.assignedAt,
    };
  }
}

module.exports = ServiceRequestAssignment;
