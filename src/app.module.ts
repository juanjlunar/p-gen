import { Module } from "./core/decorators/module.decorator";
import { HasuraModule } from "./hasura/hasura.module";
import { HttpModule } from "./http/http.module";
import { UtilsModule } from "./utils/utils.module";

@Module({
  imports: [
      HasuraModule, 
      UtilsModule, 
      HttpModule.register({
      url: 'http://localhost:8080/v1/metadata',
    })
  ],
})
export class AppModule {}