import { AppModule } from "../../app.module";
import { App } from "../app";
import type { AppContainer, Factory } from "../types";

class AppFactoryStatic implements Factory {
  create(_AppModuleClass: typeof AppModule): AppContainer {
    // We don't actually need the AppModule class, we need the class to be imported so the Module decorator runs.
    // Do we need to pass the Class this way in order to the @Module decorator to run?
    return new App();
  }
}

export const AppFactory = new AppFactoryStatic();