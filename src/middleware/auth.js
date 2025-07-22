// middleware/auth.js
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Middleware d'authentification
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Vérifier que l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Utilisateur non trouvé ou désactivé' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token invalide' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expiré' 
      });
    }
    
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur interne du serveur' 
    });
  }
};

// Middleware pour vérifier les rôles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentification requise' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Accès non autorisé pour ce rôle' 
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};