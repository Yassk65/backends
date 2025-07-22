// routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation pour l'inscription
const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

  body('role')
    .isIn(['PATIENT', 'HOPITAL', 'LABO', 'ADMIN'])
    .withMessage('Rôle invalide'),

  body('firstName')
    .notEmpty()
    .withMessage('Le prénom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .notEmpty()
    .withMessage('Le nom est requis')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('phone')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Numéro de téléphone invalide'),

  // Validation conditionnelle pour les patients
  body('dateOfBirth')
    .if(body('role').equals('PATIENT'))
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide'),

  body('address')
    .if(body('role').equals('PATIENT'))
    .optional()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),

  // Validation conditionnelle pour les hôpitaux
  body('hospitalName')
    .if(body('role').equals('HOPITAL'))
    .notEmpty()
    .withMessage('Le nom de l\'hôpital est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'hôpital doit contenir entre 2 et 100 caractères'),

  body('hospitalAddress')
    .if(body('role').equals('HOPITAL'))
    .notEmpty()
    .withMessage('L\'adresse de l\'hôpital est requise')
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),

  body('licenseNumber')
    .if(body('role').equals('HOPITAL'))
    .notEmpty()
    .withMessage('Le numéro de licence est requis'),

  // Validation conditionnelle pour les laboratoires
  body('labName')
    .if(body('role').equals('LABO'))
    .notEmpty()
    .withMessage('Le nom du laboratoire est requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du laboratoire doit contenir entre 2 et 100 caractères'),

  body('labAddress')
    .if(body('role').equals('LABO'))
    .notEmpty()
    .withMessage('L\'adresse du laboratoire est requise')
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),

  body('labLicense')
    .if(body('role').equals('LABO'))
    .notEmpty()
    .withMessage('Le numéro de licence du laboratoire est requis')
];

// Validation pour la connexion
const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Le mot de passe est requis')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/profile', authenticateToken, getProfile);

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnecter l'utilisateur
 * @access  Private
 */
router.post('/logout', authenticateToken, (req, res) => {
  try {
    // Dans une implémentation avec blacklist de tokens ou base de données de sessions,
    // on pourrait invalider le token ici

    res.json({
      success: true,
      message: 'Déconnexion réussie'
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la déconnexion'
    });
  }
});

module.exports = router;