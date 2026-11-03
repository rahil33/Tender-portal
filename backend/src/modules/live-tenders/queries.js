const { SOURCE_PORTALS } = require('./constants');

/**
 * The single definition of "a live GeM tender". Used by the list API, the
 * facet/filter API and the statistics so they can never disagree.
 *  - not archived (legacy documents without the flag count as not archived)
 *  - active, published/open
 *  - submission deadline still in the future (or unknown)
 */
function liveTenderQuery(now = new Date()) {
  return {
    sourcePortal: SOURCE_PORTALS.GEM,
    isActive: true,
    isArchived: { $ne: true },
    status: { $in: ['published', 'open'] },
    $or: [{ submissionDeadline: { $gte: now } }, { submissionDeadline: { $exists: false } }],
  };
}

module.exports = { liveTenderQuery };
