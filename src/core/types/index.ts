import { ServiceMetadata } from "typedi";

export type ClassDecorator = <TFunction extends Function>(target: TFunction) => TFunction | void;


export interface Factory {
  create(cls: ClassConstructor): AppContainer;
}

export interface AppContainer {
  get<T = unknown>(Cls: ClassConstructor<T> | InjectionToken<T>): T
}

export type ClassConstructor<T = unknown> = new (...args: any[]) => T;

export type InjectionToken<T = any> = string | symbol | ClassConstructor<T>| Abstract<T> | Function;

export interface Abstract<T> extends Function {
  prototype: T;
}

export type Provider<T = unknown> = ClassConstructor<T> | ClassProvider<T> | ValueProvider<T>;

export type ClassProvider<T> = {
  provide: InjectionToken<T>;
  useClass: ClassConstructor<T>;
}

export type ValueProvider<T> = {
  provide: InjectionToken<T>;
  useValue: T;
}

export type DynamicModule<T = unknown> = {
  module: ClassConstructor<T>;
  providers: Provider[];
}

export type ContainerSetArgs<T> = ContainerSetValueArgs<T> | ContainerSetTypeArgs<T>;

export type ContainerSetValueArgs<T> = {
  id: ServiceMetadata<T>['id'];
  value: ServiceMetadata<T>['value'];
};

export type ContainerSetTypeArgs<T> = {
  id: ServiceMetadata<T>['id'];
  type: ServiceMetadata<T>['type'];
};

export type ModuleOptions = {
  imports?: ModuleImports[],
  providers?: Provider[],
}

export type ModuleImports = (ClassConstructor | DynamicModule)