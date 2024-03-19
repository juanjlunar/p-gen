import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';

async function bootstrap() {
  await CommandFactory.run(AppModule, {
    serviceErrorHandler: (err) => {
      console.log(`error: ${err.message}`);
    },
  });
}
bootstrap();
