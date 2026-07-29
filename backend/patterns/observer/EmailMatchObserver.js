const emailService = require('../../services/emailService');

/**
 * Concrete Observer for sending an email when a possible match is created.
 */
class EmailMatchObserver {
  async update({ match, lostReport, foundItem }) {
    await emailService.sendMatchNotification({ match, lostReport, foundItem });
  }
}

module.exports = EmailMatchObserver;
