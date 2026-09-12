'use strict';

const { collect, render } = require('../../../.enterprise/governance/hooks/handlers/governance-context.cjs');

module.exports = {
  command: 'governance-context',
  description: 'Resolve global governance before declaring standards or capabilities absent',
  options: [
    ['--directory <path>', 'Consumer directory (defaults to cwd)'],
    ['--json', 'Emit source hashes and explicit unverified layers'],
  ],
  action: async (options = {}) => {
    const report = collect({ directory: options.directory });
    console.log(options.json ? JSON.stringify(report, null, 2) : render(report));
    if (report.status !== 'resolved') process.exitCode = 2;
  },
};
