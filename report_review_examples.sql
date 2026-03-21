-- Approve a report and create a violation
select public.admin_review_report(
  'PASTE-REPORT-UUID-HERE',
  'upheld',
  true,
  'warning',
  'This report is valid.',
  'medium'
);

-- Dismiss a report
select public.admin_review_report(
  'PASTE-REPORT-UUID-HERE',
  'dismissed',
  false,
  'none',
  'No policy breach found.',
  'low'
);
