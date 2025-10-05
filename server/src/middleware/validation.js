// server/src/middleware/validation.js
export function validateIssue(req, res, next) {
  const { title, description, site, severity, status } = req.body;
  const errors = [];

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  } else if (title.length > 255) {
    errors.push('Title must be 255 characters or less');
  }

  // Description validation
  if (!description || description.trim().length === 0) {
    errors.push('Description is required');
  } else if (description.length > 5000) {
    errors.push('Description must be 5000 characters or less');
  }

  // Site validation (if provided)
  if (site && site.length > 100) {
    errors.push('Site must be 100 characters or less');
  }

  // Severity validation
  const validSeverities = ['minor', 'major', 'critical'];
  if (severity && !validSeverities.includes(severity)) {
    errors.push(`Severity must be one of: ${validSeverities.join(', ')}`);
  }

  // Status validation
  const validStatuses = ['open', 'in_progress', 'resolved'];
  if (status && !validStatuses.includes(status)) {
    errors.push(`Status must be one of: ${validStatuses.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors
    });
  }

  next();
}