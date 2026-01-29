// Script pour supprimer tous les utilisateurs clients (pas les admins)
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://faust:faust@cluster0.ioszllp.mongodb.net/orga_clients?appName=Cluster0';

async function deleteAllClients() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Définir le schéma User
    const UserSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String,
      phone: String,
      role: String,
      createdAt: Date,
    });

    const User = mongoose.models.User || mongoose.model('User', UserSchema);

    // Compter les utilisateurs avant suppression
    const totalUsers = await User.countDocuments();
    const clientUsers = await User.countDocuments({ role: 'client' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    console.log('\n📊 État actuel de la base de données:');
    console.log(`   Total utilisateurs: ${totalUsers}`);
    console.log(`   Clients: ${clientUsers}`);
    console.log(`   Admins: ${adminUsers}`);

    // Supprimer uniquement les clients
    console.log('\n🗑️  Suppression des utilisateurs clients...');
    const result = await User.deleteMany({ role: 'client' });

    console.log(`\n✅ ${result.deletedCount} utilisateur(s) client(s) supprimé(s)`);

    // Vérifier l'état final
    const remainingUsers = await User.countDocuments();
    const remainingAdmins = await User.countDocuments({ role: 'admin' });
    
    console.log('\n📊 État final de la base de données:');
    console.log(`   Total utilisateurs restants: ${remainingUsers}`);
    console.log(`   Admins restants: ${remainingAdmins}`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

deleteAllClients();
