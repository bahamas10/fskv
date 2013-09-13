var stats = {
  requestmethods: {},
  totalrequests: 0,
  addrequest: addrequest
};

module.exports = stats;

function addrequest(method) {
  stats.requestmethods[method] = stats.requestmethods[method] || 0;
  stats.totalrequests++;
  return ++stats.requestmethods[method];
}
