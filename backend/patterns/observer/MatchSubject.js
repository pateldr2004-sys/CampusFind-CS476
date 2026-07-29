/**
 * Subject class for the Observer Pattern.
 * Matching logic calls notify(), and registered observers perform separate actions
 * such as email notification or audit logging.
 */
class MatchSubject {
  constructor() {
    this.observers = [];
  }

  attach(observer) {
    if (!this.observers.includes(observer)) this.observers.push(observer);
  }

  detach(observer) {
    this.observers = this.observers.filter((item) => item !== observer);
  }

  async notify(context) {
    for (const observer of this.observers) {
      await observer.update(context);
    }
  }
}

module.exports = MatchSubject;
