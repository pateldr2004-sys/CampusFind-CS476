/**
 * Concrete Observer for demo/debugging. Shows the Observer Pattern behavior even
 * when SMTP is not configured.
 */
class ConsoleMatchObserver {
  async update({ match, lostReport, foundItem }) {
    console.log(`[Observer] Match ${match._id}: ${lostReport.referenceNumber} may match found item ${foundItem._id}`);
  }
}

module.exports = ConsoleMatchObserver;
