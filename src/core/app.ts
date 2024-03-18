import { Container } from "./classes/container.class";
import type { AppContainer, ClassConstructor } from "./types";

export class App implements AppContainer {
  get<T = unknown>(Cls: ClassConstructor<T>): T {
    return Container.get<T>(Cls);
  }
}