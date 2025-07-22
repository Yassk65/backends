// controllers/userController.js
// 📅 Créé le : 21 Juillet 2025
// 👨‍💻 Développeur : Kiro AI Assistant
// 📝 Description : Contrôleur pour la gestion CRUD des utilisateurs (Admin uniquement)
// 🔐 Sécurité : Authentification JWT + Autorisation ADMIN requises

const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Obtenir tous les utilisateurs (avec pagination et filtres)
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      isActive, 
      search 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construction des filtres
    const where = {};
    
    if (role) {
      where.role = role;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { hospitalName: { contains: search, mode: 'insensitive' } },
        { labName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Récupération des utilisateurs
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          phone: true,
          hospitalName: true,
          labName: true,
          isActive: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    const totalPages = Math.ceil(total / take);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers: total,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir un utilisateur par ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
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
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};
const createUser = async (req, res) => {
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
      labLicense,
      isActive = true
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
      phone,
      isActive
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
        isActive: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès',
      data: { user }
    });

  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Mettre à jour un utilisateur
const updateUser = async (req, res) => {
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

    const { id } = req.params;
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
      labLicense,
      isActive
    } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Cet email est déjà utilisé'
        });
      }
    }

    // Préparation des données à mettre à jour
    const updateData = {};

    if (email) updateData.email = email;
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hachage du nouveau mot de passe si fourni
    if (password) {
      const saltRounds = 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    // Mise à jour du rôle et des champs associés
    if (role && role !== existingUser.role) {
      updateData.role = role;
      
      // Réinitialiser tous les champs spécifiques aux rôles
      updateData.dateOfBirth = null;
      updateData.address = null;
      updateData.hospitalName = null;
      updateData.hospitalAddress = null;
      updateData.licenseNumber = null;
      updateData.labName = null;
      updateData.labAddress = null;
      updateData.labLicense = null;
    }

    // Ajout des champs spécifiques selon le rôle (nouveau ou existant)
    const userRole = role || existingUser.role;
    
    if (userRole === 'PATIENT') {
      if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
      if (address !== undefined) updateData.address = address;
    } else if (userRole === 'HOPITAL') {
      if (hospitalName !== undefined) updateData.hospitalName = hospitalName;
      if (hospitalAddress !== undefined) updateData.hospitalAddress = hospitalAddress;
      if (licenseNumber !== undefined) updateData.licenseNumber = licenseNumber;
    } else if (userRole === 'LABO') {
      if (labName !== undefined) updateData.labName = labName;
      if (labAddress !== undefined) updateData.labAddress = labAddress;
      if (labLicense !== undefined) updateData.labLicense = labLicense;
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
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

    res.json({
      success: true,
      message: 'Utilisateur mis à jour avec succès',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Empêcher la suppression de son propre compte
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte'
      });
    }

    // Soft delete - désactiver l'utilisateur
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.json({
      success: true,
      message: 'Utilisateur supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Réactiver un utilisateur
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Réactiver l'utilisateur
    const reactivatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        isActive: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      message: 'Utilisateur réactivé avec succès',
      data: { user: reactivatedUser }
    });

  } catch (error) {
    console.error('Erreur lors de la réactivation de l\'utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

// Obtenir les statistiques des utilisateurs
const getUserStats = async (req, res) => {
  try {
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      })
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleStats
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  reactivateUser,
  getUserStats
};