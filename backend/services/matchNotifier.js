const MatchSubject = require('../patterns/observer/MatchSubject');
const EmailMatchObserver = require('../patterns/observer/EmailMatchObserver');
const ConsoleMatchObserver = require('../patterns/observer/ConsoleMatchObserver');

const matchSubject = new MatchSubject();
matchSubject.attach(new ConsoleMatchObserver());
matchSubject.attach(new EmailMatchObserver());

module.exports = matchSubject;
