const DEFAULT_LOCALE = 'en-US';
const DEFAULT_CURRENCY = 'USD';

const toNumber = (value, fallback = 0) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return fallback;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
};

const formatCurrency = (
  value,
  { locale = DEFAULT_LOCALE, currency = DEFAULT_CURRENCY } = {},
) => {
  const amount = toNumber(value);
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
};

const resolveAddOnPrice = (addOn, addOnPricing = {}) => {
  if (typeof addOn === 'number') {
    return toNumber(addOn);
  }

  if (typeof addOn === 'string') {
    return toNumber(addOnPricing[addOn]);
  }

  if (!addOn || typeof addOn !== 'object') {
    return 0;
  }

  if (typeof addOn.price === 'number') {
    return toNumber(addOn.price);
  }

  if (typeof addOn.cost === 'number') {
    return toNumber(addOn.cost);
  }

  if (typeof addOn.amount === 'number') {
    return toNumber(addOn.amount);
  }

  if (typeof addOn.value === 'number') {
    return toNumber(addOn.value);
  }

  const key = typeof addOn.key === 'string' ? addOn.key : typeof addOn.id === 'string' ? addOn.id : null;
  const isEnabled =
    typeof addOn.enabled === 'boolean'
      ? addOn.enabled
      : typeof addOn.selected === 'boolean'
        ? addOn.selected
        : typeof addOn.active === 'boolean'
          ? addOn.active
          : false;

  if (key && isEnabled) {
    return toNumber(addOnPricing[key]);
  }

  return 0;
};

const collectAddOnTotal = (selectedAddOns, addOnPricing = {}) => {
  if (!selectedAddOns) {
    return 0;
  }

  if (Array.isArray(selectedAddOns)) {
    return selectedAddOns.reduce((total, addOn) => total + resolveAddOnPrice(addOn, addOnPricing), 0);
  }

  if (typeof selectedAddOns === 'object') {
    return Object.entries(selectedAddOns).reduce((total, [key, value]) => {
      if (typeof value === 'boolean') {
        return value ? total + toNumber(addOnPricing[key]) : total;
      }

      if (typeof value === 'number') {
        return total + toNumber(value);
      }

      if (value && typeof value === 'object') {
        return total + resolveAddOnPrice({ key, ...value }, addOnPricing);
      }

      return total;
    }, 0);
  }

  return 0;
};

const calculateMonthlyCost = (
  planOrOptions,
  maybeFrequencyWeeks,
  maybeSelectedAddOns,
  maybeAddOnPricing,
) => {
  let planPrice;
  let frequencyWeeks;
  let selectedAddOns = maybeSelectedAddOns;
  let addOnPricing = maybeAddOnPricing;

  if (
    typeof planOrOptions === 'object' &&
    planOrOptions !== null &&
    !Array.isArray(planOrOptions)
  ) {
    const options = planOrOptions;

    planPrice = toNumber(
      options.planPrice ?? options.basePrice ?? options.price ?? options.cost ?? 0,
    );

    frequencyWeeks = toNumber(
      options.frequencyWeeks ?? options.frequency ?? options.intervalWeeks ?? maybeFrequencyWeeks ?? 0,
    );

    selectedAddOns = options.selectedAddOns ?? options.addOns ?? selectedAddOns;
    addOnPricing = options.addOnPricing ?? options.addOnPrices ?? addOnPricing;
  } else {
    planPrice = toNumber(planOrOptions);
    frequencyWeeks = toNumber(maybeFrequencyWeeks);
  }

  const shipmentsPerMonth = frequencyWeeks > 0 ? Math.max(0, 4 / frequencyWeeks) : 0;
  const addOnTotal = collectAddOnTotal(selectedAddOns, addOnPricing);
  const pricePerShipment = planPrice + addOnTotal;
  const monthlyCost = shipmentsPerMonth * pricePerShipment;

  return Number.isFinite(monthlyCost) ? monthlyCost : 0;
};

if (typeof module !== 'undefined') {
  module.exports = {
    calculateMonthlyCost,
    formatCurrency,
  };
}

if (typeof window !== 'undefined') {
  window.calculateMonthlyCost = calculateMonthlyCost;
  window.formatCurrency = formatCurrency;
}
