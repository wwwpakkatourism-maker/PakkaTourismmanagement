import { create } from 'zustand';

const DEFAULT_CONFIG = {
  room: { cost: 2000, sell: 3000, cap: 3 },
  jeep: { cost: 3500, sell: 4500, cap: 8 },
  food: { cost: 100,  sell: 150 },
  std:  { base: 1250, min_pax: 8, inc: 150 },
};

function calculatePricing(pax, days, config = DEFAULT_CONFIG) {
  const nights = days > 1 ? days - 1 : 0;
  const rooms = nights > 0 ? Math.ceil(pax / config.room.cap) : 0;
  const jeeps = Math.ceil(pax / config.jeep.cap);

  const roomSell  = rooms * nights * config.room.sell;
  const jeepSell  = jeeps * days  * config.jeep.sell;
  const foodSell  = pax   * days  * config.food.sell;
  const customTotal   = roomSell + jeepSell + foodSell;
  const customPerHead = Math.round(customTotal / pax);

  const stdBaseDays = config.std.base * days;
  const stdIncDays  = config.std.inc  * days;
  const missingPax  = Math.max(0, config.std.min_pax - pax);
  const stdPerHead  = stdBaseDays + (missingPax * stdIncDays);
  const stdTotal    = stdPerHead * pax;

  const roomCost = rooms * nights * config.room.cost;
  const jeepCost = jeeps * days  * config.jeep.cost;
  const foodCost = pax   * days  * config.food.cost;
  const totalCost = roomCost + jeepCost + foodCost;
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

function generateMatrix(days, config = DEFAULT_CONFIG) {
  return Array.from({ length: 50 }, (_, i) => calculatePricing(i + 1, days, config));
}

const usePricingStore = create((set, get) => ({
  config: DEFAULT_CONFIG,
  matrixDays: 2,
  matrix: generateMatrix(2, DEFAULT_CONFIG),

  setConfig: (config) => {
    const matrix = generateMatrix(get().matrixDays, config);
    set({ config, matrix });
  },

  setMatrixDays: (days) => {
    const matrix = generateMatrix(days, get().config);
    set({ matrixDays: days, matrix });
  },

  calculate: (pax, days) => calculatePricing(pax, days, get().config),

  fmt: (num) => '₹' + Number(num).toLocaleString('en-IN'),
}));

export default usePricingStore;
export { calculatePricing, generateMatrix, DEFAULT_CONFIG };
