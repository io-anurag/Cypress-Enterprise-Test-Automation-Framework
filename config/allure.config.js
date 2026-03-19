/**
 * Allure Reporter Configuration
 * Defines test categories and environment metadata for trend reports.
 */

module.exports = {
  // ─── Report Metadata ───────────────────────────────────────────────────────
  projectName: 'Cypress Enterprise Framework',
  reportPath: './allure-report',
  resultsPath: './allure-results',

  // ─── Custom Categories ─────────────────────────────────────────────────────
  // Categories appear as sections in the Allure report for grouping failures.
  categories: [
    {
      name: '⚡ Flaky Tests',
      messageRegex: '.*flak.*',
      matchedStatuses: ['failed', 'broken'],
    },
    {
      name: '🔄 Product Defects',
      messageRegex: '.*AssertionError.*',
      matchedStatuses: ['failed'],
    },
    {
      name: '🔌 Network / API Failures',
      messageRegex: '.*(ECONNREFUSED|timeout|NetworkError|502|503|504).*',
      matchedStatuses: ['failed', 'broken'],
    },
    {
      name: '💥 Uncaught Exceptions',
      messageRegex: '.*uncaught exception.*',
      matchedStatuses: ['broken'],
    },
    {
      name: '⏱ Timeout Failures',
      messageRegex: '.*(timed out|Timed out|exceeded the timeout).*',
      matchedStatuses: ['failed', 'broken'],
    },
  ],

  // ─── Environment Info ──────────────────────────────────────────────────────
  // Displayed in the Allure report's "Environment" widget.
  environment: [
    { name: 'Framework', values: ['Cypress 13.x + TypeScript'] },
    { name: 'Browser', values: ['Chrome'] },
    { name: 'Execution Mode', values: ['Headless'] },
    { name: 'Node Version', values: [process.version] },
    { name: 'OS', values: [process.platform] },
  ],
};
