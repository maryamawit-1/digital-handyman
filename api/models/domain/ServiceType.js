class ServiceType {
  constructor({ id = null, name = '', pricing_model = 'FLAT', unit_price = 0, unit_label = '', is_active = true } = {}) {
    this.id = id;
    this.name = name;
    this.pricing_model = pricing_model; // expected values: 'PER_SQM','PER_INCH','FLAT'
    this.unit_price = typeof unit_price === 'string' ? parseFloat(unit_price) : unit_price;
    this.unit_label = unit_label;
    this.is_active = Boolean(is_active);
  }

  isFlatRate() {
    if (!this.pricing_model) return false;
    const pm = String(this.pricing_model).toUpperCase();
    return pm === 'FLAT';
  }

  calculateCost(quantity = 1) {
    const qty = Number(quantity) || 0;
    const price = Number(this.unit_price) || 0;
    if (this.isFlatRate()) return price;
    return price * qty;
  }
}

module.exports = ServiceType;
