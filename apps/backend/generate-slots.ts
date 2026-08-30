import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DeliveryService } from './src/modules/delivery/delivery.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const deliveryService = app.get(DeliveryService);
  
  const startDate = new Date();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  
  console.log('Generating slots...');
  const slots = await deliveryService.generateSlots(startDate, endDate);
  console.log('Generated slots:', slots.length);
  
  await app.close();
}
bootstrap();
