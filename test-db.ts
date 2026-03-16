import { adminService } from './src/lib/adminService';

async function testAddTestimonial() {
  console.log('Testando envio de depoimento...');
  try {
    await adminService.addTestimonial({
      name: 'Teste de Sistema',
      text: 'Este é um comentário de teste via script automátizado.',
      rating: 5
    });
    console.log('✅ Depoimento enviado com sucesso!');
    
    const testimonials = await adminService.getTestimonials();
    const testItem = testimonials.find(t => t.name === 'Teste de Sistema');
    if (testItem) {
      console.log('✅ Depoimento encontrado no banco!');
    } else {
      console.log('❌ Depoimento NÃO encontrado no banco após envio.');
    }
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testAddTestimonial();
