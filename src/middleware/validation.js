// middleware/validation.js
// 📅 Créé le : 21 Juillet 2025
// 👨‍💻 Développeur : Kiro AI Assistant
// 📝 Description : Validations avancées pour l'API de gestion des utilisateurs
// ✅ Fonctionnalités : Validation conditionnelle par rôle, pagination, filtres
// 🛡️ Sécurité : Validation stricte de tous les paramètres d'entrée

const { body, param, query } = require('express-validator');

// Validation pour la création d'utilisateur
const createUserValidation = [
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

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),

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

// Validation pour la mise à jour d'utilisateur
const updateUserValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID utilisateur invalide'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),

  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit contenir au moins 8 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'),

  body('role')
    .optional()
    .isIn(['PATIENT', 'HOPITAL', 'LABO', 'ADMIN'])
    .withMessage('Rôle invalide'),

  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le prénom doit contenir entre 2 et 50 caractères'),

  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),

  body('phone')
    .optional()
    .matches(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)
    .withMessage('Numéro de téléphone invalide'),

  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen'),

  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Format de date invalide'),

  body('address')
    .optional()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),

  body('hospitalName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom de l\'hôpital doit contenir entre 2 et 100 caractères'),

  body('hospitalAddress')
    .optional()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères'),

  body('labName')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Le nom du laboratoire doit contenir entre 2 et 100 caractères'),

  body('labAddress')
    .optional()
    .isLength({ max: 200 })
    .withMessage('L\'adresse ne peut pas dépasser 200 caractères')
];

// Validation pour les paramètres d'ID
const idValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID utilisateur invalide')
];

// Validation pour les paramètres de requête (pagination, filtres)
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Le numéro de page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('role')
    .optional()
    .isIn(['PATIENT', 'HOPITAL', 'LABO', 'ADMIN'])
    .withMessage('Rôle invalide'),

  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive doit être true ou false'),

  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('La recherche doit contenir entre 1 et 100 caractères')
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  idValidation,
  queryValidation
};