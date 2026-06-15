/**
 * Pakka Tourism Pricing Engine
 * Server-side mirror of the existing client CONFIG logic.
 * This is the authoritative calculation source.
 */

const DEFAULT_CONFIG = {
  room: { cost: 2000, sell: 3000, cap: 3 },
  jeep: { cost: 3500, sell: 4500, cap: 8 },
  food: { cost: 100,  sell: 150 },
  std:  { base: 1250, min_pax: 8, inc: 150 },
};

/**
 * Calculate pricing for a given pax count and duration.
 * @param {number} pax - number of people
 * @param {number} days - trip duration in days
 * @param {object} config - optional CONFIG override (from DB)
 * @returns {object} full pricing breakdown
 */
function calculatePricing(pax, days, config = DEFAULT_CONFIG) {
  const nights = days > 1 ? days - 1 : 0;

  // Logistics
  const rooms = nights > 0 ? Math.ceil(pax / config.room.cap) : 0;
  const jeeps = Math.ceil(pax / config.jeep.cap);

  // Custom pricing
  const roomSell  = rooms * nights * config.room.sell;
  const jeepSell  = jeeps * days  * config.jeep.sell;
  const foodSell  = pax   * days  * config.food.sell;
  const customTotal   = roomSell + jeepSell + foodSell;
  const customPerHead = Math.round(customTotal / pax);

  // Standard package pricing
  const stdBaseDays = config.std.base * days;
  const stdIncDays  = config.std.inc  * days;
  const missingPax  = Math.max(0, config.std.min_pax - pax);
  const stdPerHead  = stdBaseDays + (missingPax * stdIncDays);
  const stdTotal    = stdPerHead * pax;

  // Admin base cost
  const roomCost = rooms * nights * config.room.cost;
  const jeepCost = jeeps * days  * config.jeep.cost;
  const foodCost = pax   * days  * config.food.cost;
  const totalCost = roomCost + jeepCost + foodCost;

  // Profit
  const customProfit = customTotal - totalCost;
  const profitMargin = totalCost > 0 ? ((customProfit / customTotal) * 100).toFixed(1) : 0;

  return {
    pax, days, nights,
    logistics: { rooms, jeeps, roomSell, jeepSell, foodSell },
    custom: { total: customTotal, perHead: customPerHead },
    standard: { total: stdTotal, perHead: stdPerHead, missingPax },
    diff: { total: customTotal - stdTotal, perHead: customPerHead - stdPerHead },
    admin: { totalCost, customProfit, profitMargin: parseFloat(profitMargin) },
  };
}

/**
 * Generate full 1–50 pax matrix for a given duration.
 * @param {number} days
 * @param {object} config
 * @returns {Array} array of pricing rows
 */
function generateMatrix(days, config = DEFAULT_CONFIG) {
  const rows = [];
  for (let pax = 1; pax <= 50; pax++) {
    rows.push(calculatePricing(pax, days, config));
  }
  return rows;
}

module.exports = { calculatePricing, generateMatrix, DEFAULT_CONFIG };
