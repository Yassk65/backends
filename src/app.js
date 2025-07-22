// app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();
const prisma = new PrismaClient();

// Middleware de sécurité
app.use(helmet());

// Configuration CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8100',
  credentials: true
}));

// ========================================
// RATE LIMITING DÉSACTIVÉ POUR LES TESTS
// ========================================
// Pour réactiver les restrictions, décommentez le code ci-dessous

/*
// Rate limiting général
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite chaque IP à 100 requêtes par windowMs
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard'
  }
});
app.use('/api/', limiter);

// Rate limiting spécifique pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limite chaque IP à 10 tentatives de connexion par windowMs
  message: {
    success: false,
    message: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
  }
});
*/

// Rate limiting désactivé - vous pouvez maintenant tester autant de connexions que vous voulez
const authLimiter = null; // Middleware désactivé

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
// app.use('/api/auth', authLimiter, authRoutes); // Avec rate limiting
app.use('/api/auth', authRoutes); // Sans rate limiting pour les tests
app.use('/api/users', userRoutes); // Routes de gestion des utilisateurs (Admin seulement)

// Route de base pour tester l'API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API fonctionne correctement',
    timestamp: new Date().toISOString()
  });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur:', err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Fichier trop volumineux'
    });
  }

  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`Environnement: ${process.env.NODE_ENV}`);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  console.log('\nFermeture du serveur...');
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;