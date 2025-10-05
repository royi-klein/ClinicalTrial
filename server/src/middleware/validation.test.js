import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateIssue } from './validation.js';

describe('validateIssue middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn()
    };
    next = vi.fn();
  });

  describe('title validation', () => {
    it('should reject when title is missing', () => {
      req.body = { description: 'Test description' };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        errors: expect.arrayContaining(['Title is required'])
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject when title is empty string', () => {
      req.body = { title: '', description: 'Test description' };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Title is required'])
        })
      );
    });

    it('should reject when title is only whitespace', () => {
      req.body = { title: '   ', description: 'Test description' };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Title is required'])
        })
      );
    });

    it('should reject when title exceeds 255 characters', () => {
      req.body = { 
        title: 'a'.repeat(256), 
        description: 'Test description' 
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Title must be 255 characters or less'])
        })
      );
    });

    it('should accept title with exactly 255 characters', () => {
      req.body = { 
        title: 'a'.repeat(255), 
        description: 'Test description' 
      };
      
      validateIssue(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('description validation', () => {
    it('should reject when description is missing', () => {
      req.body = { title: 'Test title' };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Description is required'])
        })
      );
    });

    it('should reject when description is empty string', () => {
      req.body = { title: 'Test title', description: '' };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should reject when description exceeds 5000 characters', () => {
      req.body = { 
        title: 'Test title', 
        description: 'a'.repeat(5001) 
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Description must be 5000 characters or less'])
        })
      );
    });
  });

  describe('site validation', () => {
    it('should reject when site exceeds 100 characters', () => {
      req.body = { 
        title: 'Test title', 
        description: 'Test description',
        site: 'a'.repeat(101)
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining(['Site must be 100 characters or less'])
        })
      );
    });

    it('should accept when site is not provided', () => {
      req.body = { 
        title: 'Test title', 
        description: 'Test description'
      };
      
      validateIssue(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should accept valid site', () => {
      req.body = { 
        title: 'Test title', 
        description: 'Test description',
        site: 'Site-101'
      };
      
      validateIssue(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });
  });

  describe('severity validation', () => {
    it('should reject invalid severity value', () => {
      req.body = { 
        title: 'Test title', 
        description: 'Test description',
        severity: 'invalid'
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            'Severity must be one of: minor, major, critical'
          ])
        })
      );
    });

    it('should accept valid severity values', () => {
      const validSeverities = ['minor', 'major', 'critical'];
      
      validSeverities.forEach(severity => {
        const localReq = {
          body: { 
            title: 'Test title', 
            description: 'Test description',
            severity
          }
        };
        const localNext = vi.fn();
        
        validateIssue(localReq, res, localNext);
        
        expect(localNext).toHaveBeenCalled();
      });
    });
  });

  describe('status validation', () => {
    it('should reject invalid status value', () => {
      req.body = { 
        title: 'Test title', 
        description: 'Test description',
        status: 'invalid'
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.arrayContaining([
            'Status must be one of: open, in_progress, resolved'
          ])
        })
      );
    });

    it('should accept valid status values', () => {
      const validStatuses = ['open', 'in_progress', 'resolved'];
      
      validStatuses.forEach(status => {
        const localReq = {
          body: { 
            title: 'Test title', 
            description: 'Test description',
            status
          }
        };
        const localNext = vi.fn();
        
        validateIssue(localReq, res, localNext);
        
        expect(localNext).toHaveBeenCalled();
      });
    });
  });

  describe('multiple validation errors', () => {
    it('should return all validation errors at once', () => {
      req.body = { 
        title: '',
        description: '',
        site: 'a'.repeat(101),
        severity: 'invalid',
        status: 'wrong'
      };
      
      validateIssue(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Validation failed',
        errors: expect.arrayContaining([
          'Title is required',
          'Description is required',
          'Site must be 100 characters or less',
          'Severity must be one of: minor, major, critical',
          'Status must be one of: open, in_progress, resolved'
        ])
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('valid request', () => {
    it('should call next() for valid complete request', () => {
      req.body = { 
        title: 'Valid title',
        description: 'Valid description',
        site: 'Site-101',
        severity: 'major',
        status: 'open'
      };
      
      validateIssue(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should call next() for valid minimal request', () => {
      req.body = { 
        title: 'Valid title',
        description: 'Valid description'
      };
      
      validateIssue(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});