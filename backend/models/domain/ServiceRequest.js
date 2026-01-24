class ServiceRequest {
  constructor({
    referenceId = null,
    customerId = null,
    providerId = null,
    service = null,
    serviceId = null,
    serviceQuantity = 1,
    description = '',
    // customer's preferred scheduling (provided by customer)
    preferredDate = null,
    preferredTime = null,
    scheduledAt = null,
    createdAt = null,
    updatedAt = null,
    name = null,
    email = null,
    phone = null,
    address = null,
    estimatedCost = null,
    negotiatedPrice = null,
    status = 'PENDING'
  } = {}) {
    this.referenceId = referenceId;
    this.customerId = customerId;
    this.providerId = providerId;
    this.service = service; // expected to be a ServiceType instance or null
    this.serviceId = serviceId;
    this.serviceQuantity = typeof serviceQuantity === 'string' ? parseFloat(serviceQuantity) : serviceQuantity;
    this.description = description;
    this.scheduledAt = scheduledAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    // optional contact/customer fields
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.address = address;

    // customer's preferred scheduling
    this.preferredDate = preferredDate;
    this.preferredTime = preferredTime;

    // price negotiated between customer and provider/admin (null until set)
    this.negotiatedPrice = negotiatedPrice;

    this.estimatedCost = estimatedCost;
    this.status = status; // should match ENUM: 'PENDING','ASSIGNED','IN_PROGRESS','COMPLETED','CANCELLED'
  }

  generateReferenceId() {
    if (this.referenceId) return this.referenceId;
    const time = Date.now().toString(36);
    const rand = Math.floor(Math.random() * 1e6).toString(36);
    this.referenceId = `SR-${time}-${rand}`.toUpperCase();
    return this.referenceId;
  }

  calculateEstimatedCost() {
    const qty = Number(this.serviceQuantity) || 0;
    if (this.service && typeof this.service.calculateCost === 'function') {
      this.estimatedCost = this.service.calculateCost(qty);
      return this.estimatedCost;
    }

    const unitPrice = this.service && (this.service.unit_price || this.service.unitPrice)
      ? Number(this.service.unit_price || this.service.unitPrice)
      : 0;
    this.estimatedCost = unitPrice * qty;
    return this.estimatedCost;
  }

  markAssigned() {
    this.status = 'ASSIGNED';
    return this.status;
  }
}

module.exports = ServiceRequest;
