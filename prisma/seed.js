const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Supprimer les utilisateurs existants (optionnel)
  await prisma.user.deleteMany({});
  console.log('🗑️  Utilisateurs existants supprimés');

  // Créer des utilisateurs de test
  const users = [
    {
      email: 'admin@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'ADMIN',
      firstName: 'Admin',
      lastName: 'Système',
      phone: '+33 1 23 45 67 89',
      isActive: true
    },
    {
      email: 'patient@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PATIENT',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33 1 23 45 67 90',
      dateOfBirth: new Date('1985-06-15'),
      address: '123 Rue de la Santé, 75001 Paris',
      isActive: true
    },
    {
      email: 'hopital@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'HOPITAL',
      firstName: 'Dr. Marie',
      lastName: 'Martin',
      phone: '+33 1 23 45 67 91',
      hospitalName: 'Centre Hospitalier Universitaire',
      hospitalAddress: '456 Avenue des Soins, 75002 Paris',
      licenseNumber: 'HOP-2024-001',
      isActive: true
    },
    {
      email: 'labo@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'LABO',
      firstName: 'Dr. Pierre',
      lastName: 'Durand',
      phone: '+33 1 23 45 67 92',
      labName: 'Laboratoire d\'Analyses Médicales BioTech',
      labAddress: '789 Boulevard des Analyses, 75003 Paris',
      labLicense: 'LAB-2024-001',
      isActive: true
    },
    {
      email: 'patient2@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'PATIENT',
      firstName: 'Sophie',
      lastName: 'Bernard',
      phone: '+33 1 23 45 67 93',
      dateOfBirth: new Date('1990-03-22'),
      address: '321 Rue de la Paix, 75004 Paris',
      isActive: true
    },
    {
      email: 'hopital2@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'HOPITAL',
      firstName: 'Dr. Claire',
      lastName: 'Moreau',
      phone: '+33 1 23 45 67 94',
      hospitalName: 'Hôpital Saint-Antoine',
      hospitalAddress: '654 Place de la Médecine, 75005 Paris',
      licenseNumber: 'HOP-2024-002',
      isActive: true
    },
    {
      email: 'labo2@test.com',
      password: await bcrypt.hash('password123', 10),
      role: 'LABO',
      firstName: 'Dr. Michel',
      lastName: 'Leroy',
      phone: '+33 1 23 45 67 95',
      labName: 'Laboratoire Central d\'Analyses',
      labAddress: '987 Rue des Sciences, 75006 Paris',
      labLicense: 'LAB-2024-002',
      isActive: true
    }
  ];

  console.log('👥 Création des utilisateurs de test...');

  for (const userData of users) {
    const user = await prisma.user.create({
      data: userData
    });
    console.log(`✅ Utilisateur créé: ${user.email} (${user.role})`);
  }

  console.log('🎉 Seeding terminé avec succès!');
  console.log('\n📋 Comptes de test créés:');
  console.log('👤 Admin: admin@test.com / password123');
  console.log('🏥 Patient: patient@test.com / password123');
  console.log('🏥 Hôpital: hopital@test.com / password123');
  console.log('🧪 Laboratoire: labo@test.com / password123');
  console.log('\n💡 Utilisez ces identifiants pour tester l\'application');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });