import db from '../db.js';

// Get all issues with optional filters
export async function getAllIssues(req, res) {
  try {
    const { search, status, severity } = req.query;
    
    let query = 'SELECT * FROM issues WHERE 1=1';
    const params = [];

    // Add search filter (title search)
    if (search) {
      query += ' AND title LIKE ?';
      params.push(`%${search}%`);
    }

    // Add status filter
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    // Add severity filter
    if (severity) {
      query += ' AND severity = ?';
      params.push(severity);
    }

    // Sort by created_at descending (newest first)
    query += ' ORDER BY created_at DESC';

    const [rows] = await db.query(query, params);
    
    res.json({
      success: true,
      count: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch issues',
      message: error.message
    });
  }
}

// Get single issue by ID
export async function getIssueById(req, res) {
  try {
    const { id } = req.params;
    
    const [rows] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch issue',
      message: error.message
    });
  }
}

// Create new issue
export async function createIssue(req, res) {
  try {
    const { title, description, site, severity, status } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        error: 'Title and description are required'
      });
    }

    // Validate severity enum
    const validSeverities = ['minor', 'major', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity. Must be: minor, major, or critical'
      });
    }

    // Validate status enum
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: open, in_progress, or resolved'
      });
    }

    const [result] = await db.query(
      `INSERT INTO issues (title, description, site, severity, status) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        title,
        description,
        site || null,
        severity || 'minor',
        status || 'open'
      ]
    );

    // Fetch the created issue
    const [newIssue] = await db.query('SELECT * FROM issues WHERE id = ?', [result.insertId]);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: newIssue[0]
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create issue',
      message: error.message
    });
  }
}

// Update issue
export async function updateIssue(req, res) {
  try {
    const { id } = req.params;
    const { title, description, site, severity, status } = req.body;

    // Check if issue exists
    const [existing] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Validate severity if provided
    const validSeverities = ['minor', 'major', 'critical'];
    if (severity && !validSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid severity. Must be: minor, major, or critical'
      });
    }

    // Validate status if provided
    const validStatuses = ['open', 'in_progress', 'resolved'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: open, in_progress, or resolved'
      });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push('title = ?');
      params.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (site !== undefined) {
      updates.push('site = ?');
      params.push(site);
    }
    if (severity !== undefined) {
      updates.push('severity = ?');
      params.push(severity);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No fields to update'
      });
    }

    params.push(id);

    await db.query(
      `UPDATE issues SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Fetch updated issue
    const [updated] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update issue',
      message: error.message
    });
  }
}

// Delete issue
export async function deleteIssue(req, res) {
  try {
    const { id } = req.params;

    // Check if issue exists
    const [existing] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    await db.query('DELETE FROM issues WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete issue',
      message: error.message
    });
  }
}

// Quick resolve issue (just change status to resolved)
export async function resolveIssue(req, res) {
  try {
    const { id } = req.params;

    // Check if issue exists
    const [existing] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    await db.query('UPDATE issues SET status = ? WHERE id = ?', ['resolved', id]);

    // Fetch updated issue
    const [updated] = await db.query('SELECT * FROM issues WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Issue resolved successfully',
      data: updated[0]
    });
  } catch (error) {
    console.error('Error resolving issue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve issue',
      message: error.message
    });
  }
}

// Get dashboard statistics
export async function getDashboardStats(req, res) {
  try {
    // Get counts by status
    const [statusCounts] = await db.query(`
      SELECT 
        status,
        COUNT(*) as count
      FROM issues
      GROUP BY status
    `);

    // Get counts by severity
    const [severityCounts] = await db.query(`
      SELECT 
        severity,
        COUNT(*) as count
      FROM issues
      GROUP BY severity
    `);

    // Format the results
    const byStatus = {
      open: 0,
      in_progress: 0,
      resolved: 0
    };

    const bySeverity = {
      minor: 0,
      major: 0,
      critical: 0
    };

    statusCounts.forEach(row => {
      byStatus[row.status] = row.count;
    });

    severityCounts.forEach(row => {
      bySeverity[row.severity] = row.count;
    });

    res.json({
      success: true,
      data: {
        byStatus,
        bySeverity,
        total: Object.values(byStatus).reduce((sum, count) => sum + count, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard statistics',
      message: error.message
    });
  }
}