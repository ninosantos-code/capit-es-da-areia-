import { db } from './src/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';

async function testWrite() {
  console.log('Testando escrita no Firestore...');
  try {
    await setDoc(doc(db, 'test_connection', 'test'), { lastCheck: new Date() });
    console.log('✅ Escrita realizada com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro de escrita:', error);
    process.exit(1);
  }
}

testWrite();
