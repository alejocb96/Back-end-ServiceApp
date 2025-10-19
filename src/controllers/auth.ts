import { Response } from 'express';
import User from '../models/User';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail';
import { AuthenticatedRequest, ApiResponse } from '../types';

// Get token from model, create cookie and send response
const sendTokenResponse = (user: any, statusCode: number, res: Response): void => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE as any) * 24 * 60 * 60 * 1000),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    (options as any).secure = true;
  }

  const response: ApiResponse = {
    success: true,
    token,
    data: user
  };

  res.status(statusCode).cookie('token', token, options).json(response);
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: any, res: Response): Promise<void> => {
  try {
    const { nombre, email, password, telefono, role } = req.body;

    // Create user
    const user = await User.create({
      nombre,
      email,
      password,
      telefono,
      role
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: any, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Por favor proporcione email y contraseña'
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
      return;
    }

    // Check if user is active
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Cuenta desactivada. Contacte al administrador'
      });
      return;
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id);

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const fieldsToUpdate = {
      nombre: req.body.nombre,
      email: req.body.email,
      telefono: req.body.telefono
    };

    const user = await User.findByIdAndUpdate(req.user._id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    const response: ApiResponse = {
      success: true,
      data: user
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (!(await user!.matchPassword(req.body.currentPassword))) {
      res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      });
      return;
    }

    user!.password = req.body.newPassword;
    await user!.save();

    sendTokenResponse(user!, 200, res);
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'No existe usuario con ese email'
      });
      return;
    }

    // Get reset token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expire
    user.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    await user.save({ validateBeforeSave: false });

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const message = `
      Has recibido este email porque tú (o alguien más) ha solicitado el restablecimiento de contraseña. 
      Por favor haz clic en el siguiente enlace para restablecer tu contraseña: \n\n ${resetUrl}
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Token de restablecimiento de contraseña',
        message
      });

      res.status(200).json({
        success: true,
        data: 'Email enviado'
      });
    } catch (err) {
      console.log(err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        success: false,
        error: 'Email no pudo ser enviado'
      });
    }
  } catch (error) {
    console.error('Error in forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req: any, res: Response): Promise<void> => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400).json({
        success: false,
        error: 'Token inválido'
      });
      return;
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Error in reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

