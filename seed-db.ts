import { adminService } from './src/lib/adminService';

async function runSeed() {
  console.log('Iniciando sincronização da base de dados (Seed)...');
  try {
    await adminService.seedDatabase();
    console.log('✅ Sincronização concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante a sincronização:', error);
    process.exit(1);
  }
}

runSeed();
