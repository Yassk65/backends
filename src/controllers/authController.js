// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Générer un token JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Inscription
const register = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { 
      email, 
      password, 
      role, 
      firstName, 
      lastName, 
      phone,
      dateOfBirth,
      address,
      hospitalName,
      hospitalAddress,
      licenseNumber,
      labName,
      labAddress,
      labLicense
    } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Cet email est déjà utilisé'
      });
    }

    // Hachage du mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Préparation des données selon le rôle
    const userData = {
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      phone
    };

    // Ajout des champs spécifiques selon le rôle
    if (role === 'PATIENT') {
      userData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      userData.address = address;
    } else if (role === 'HOPITAL') {
      userData.hospitalName = hospitalName;
      userData.hospitalAddress = hospitalAddress;
      userData.licenseNumber = licenseNumber;
    } else if (role === 'LABO') {
      userData.labName = labName;
      userData.labAddress = labAddress;
      userData.labLicense = labLicense;
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        hospitalName: true,
        labName: true,
        createdAt: true
      }
    });

    // Générer le token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      message: 'Inscription réussie',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Connexion
const login = async (req, res) => {
  try {
    // Validation des erreurs
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Données invalides',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Compte désactivé'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token
    const token = generateToken(user.id, user.role);

    // Retourner les données sans le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir le profil utilisateur
const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        hospitalName: true,
        hospitalAddress: true,
        licenseNumber: true,
        labName: true,
        labAddress: true,
        labLicense: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};