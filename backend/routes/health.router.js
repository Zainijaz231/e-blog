import express from 'express';
import { checkAvailableServices, sendVerificationEmail } from '../services/EmailService.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Email services health check
router.get('/email', async (req, res) => {
  try {
    const services = await checkAvailableServices();
    
    res.status(200).json({
      status: 'ok',
      services: services,
      timestamp: new Date().toISOString(),
      recommendation: services.resend.configured 
        ? "Resend API configured - production ready" 
        : "Using test service - configure Resend for production"
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Test email sending endpoint (for Render testing)
router.post('/test-email', async (req, res) => {
  try {
    const { email, name } = req.body;
    
    // Validate input
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required',
        timestamp: new Date().toISOString()
      });
    }

    // Create test token
    const testToken = jwt.sign(
      { userId: 'render-test-' + Date.now() }, 
      process.env.JWT_SECRET || 'test-secret', 
      { expiresIn: '1h' }
    );

    console.log(`🧪 Test email request from Render for: ${email}`);

    // Send test email
    const result = await sendVerificationEmail(
      email, 
      testToken, 
      name || 'Render Test User'
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test email sent successfully!',
        messageId: result.messageId,
        service: result.service,
        strategy: result.strategy,
        timestamp: new Date().toISOString(),
        note: 'Check your email inbox for the verification email'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        technicalError: result.technicalError,
        code: result.code,
        service: result.service,
        timestamp: new Date().toISOString()
      });
    }

  } catch (error) {
    console.error('Test email endpoint error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while testing email',
      technicalError: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Overall health check
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;