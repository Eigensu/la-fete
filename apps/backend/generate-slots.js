"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./src/app.module");
const delivery_service_1 = require("./src/modules/delivery/delivery.service");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const deliveryService = app.get(delivery_service_1.DeliveryService);
    const startDate = new Date();
    const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    console.log('Generating slots...');
    const slots = await deliveryService.generateSlots(startDate, endDate);
    console.log('Generated slots:', slots.length);
    await app.close();
}
bootstrap();
//# sourceMappingURL=generate-slots.js.map