import { db } from './src/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

async function checkConnection() {
  console.log('Verificando conexão com Firestore...');
  const collections = ['settings', 'tours', 'gallery', 'translations'];
  
  for (const col of collections) {
    const startTime = Date.now();
    try {
      const q = query(collection(db, col), limit(1));
      const snapshot = await getDocs(q);
      const duration = Date.now() - startTime;
      console.log(`📡 Coleção '${col}': ${snapshot.size > 0 ? '✅ Dados presentes' : '🟡 Vazia'} (${duration}ms)`);
    } catch (error) {
      console.error(`❌ Erro na coleção '${col}':`, error);
    }
  }
  process.exit(0);
}

checkConnection();
