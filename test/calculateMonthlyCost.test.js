const assert = require('assert');
const { calculateMonthlyCost, formatCurrency } = require('../assets/js/app.js');

const closeTo = (actual, expected, epsilon = 1e-10) => {
  assert.ok(Math.abs(actual - expected) < epsilon, `${actual} not within ${epsilon} of ${expected}`);
};

(() => {
  const result = calculateMonthlyCost(100, 1);
  assert.strictEqual(result, 400, 'Weekly plan should bill four shipments per month');
})();

(() => {
  const result = calculateMonthlyCost({ planPrice: 120, frequencyWeeks: 6 });
  closeTo(result, 80, 1e-9);
})();

(() => {
  const planPrice = 50;
  const frequencyWeeks = 2;
  const selectedAddOns = { cooler: true, organic: false };
  const addOnPricing = { cooler: 15, organic: 5 };
  const result = calculateMonthlyCost({ planPrice, frequencyWeeks, selectedAddOns, addOnPricing });
  assert.strictEqual(result, (4 / 2) * (50 + 15));
})();

(() => {
  const planPrice = '75';
  const frequencyWeeks = '3';
  const selectedAddOns = ['dessert'];
  const addOnPricing = { dessert: '12.5' };
  const monthlyCost = calculateMonthlyCost({ planPrice, frequencyWeeks, selectedAddOns, addOnPricing });
  closeTo(monthlyCost, (4 / 3) * (75 + 12.5));
  const formatted = formatCurrency(monthlyCost);
  assert.strictEqual(typeof formatted, 'string');
  assert.ok(/\$\d+/.test(formatted), 'Formatted value should include a dollar amount');
})();

console.log('All calculateMonthlyCost tests passed.');
