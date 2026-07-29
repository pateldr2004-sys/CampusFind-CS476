const Counter = require('../models/Counter');

async function generateReferenceNumber(date = new Date()) {
  const year = date.getFullYear();
  const counterId = `lostReport_${year}`;
  const result = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  const seq = String(result.seq).padStart(4, '0');
  return `CF-${year}-${seq}`;
}

module.exports = { generateReferenceNumber };
