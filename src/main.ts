import { AppModule } from './app.module';
import { CommandFactory } from 'nest-commander';
import * as figlet from 'figlet';

async function bootstrap() {
  console.log(figlet.textSync('P-GEN CLI'));

  await CommandFactory.run(AppModule, {
    serviceErrorHandler: (err) => {
      console.log(`error: ${err.message}`);
    },
  });
}
bootstrap();
