// routes/users.js
// 📅 Créé le : 21 Juillet 2025
// 👨‍💻 Développeur : Kiro AI Assistant
// 📝 Description : Routes sécurisées pour la gestion CRUD des utilisateurs
// 🔐 Sécurité : Authentification JWT + Autorisation ADMIN obligatoires
// 📊 Endpoints : 7 routes (GET, POST, PUT, DELETE, PATCH + stats)

const express = require('express');
const { 
  getAllUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser, 
  reactivateUser, 
  getUserStats 
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
  createUserValidation, 
  updateUserValidation, 
  idValidation, 
  queryValidation 
} = require('../middleware/validation');

const router = express.Router();

// Middleware d'authentification et d'autorisation pour toutes les routes
// Seuls les admins peuvent accéder à ces routes
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN'));

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs avec pagination et filtres
 * @access  Admin only
 * @query   page, limit, role, isActive, search
 */
router.get('/', queryValidation, getAllUsers);

/**
 * @route   GET /api/users/stats
 * @desc    Obtenir les statistiques des utilisateurs
 * @access  Admin only
 */
router.get('/stats', getUserStats);

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID
 * @access  Admin only
 */
router.get('/:id', idValidation, getUserById);

/**
 * @route   POST /api/users
 * @desc    Créer un nouvel utilisateur
 * @access  Admin only
 */
router.post('/', createUserValidation, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Mettre à jour un utilisateur
 * @access  Admin only
 */
router.put('/:id', updateUserValidation, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Supprimer un utilisateur (soft delete)
 * @access  Admin only
 */
router.delete('/:id', idValidation, deleteUser);

/**
 * @route   PATCH /api/users/:id/reactivate
 * @desc    Réactiver un utilisateur
 * @access  Admin only
 */
router.patch('/:id/reactivate', idValidation, reactivateUser);

module.exports = router;