import { type Constructable } from "typedi"
import type { ClassConstructor, ClassProvider, DynamicModule, Provider, ValueProvider, ModuleImports, ModuleOptions } from "../types";
import { Container } from "../classes/container.class";

/**
 * Determine if the provider is a Static class one.
 * 
 */
function isValueProvider(provider: Provider): provider is ValueProvider<unknown> {
  return (provider as ValueProvider<unknown>)?.useValue !== undefined;
}

/**
 * Determine if the provider is a ClassProvider one.
 * 
 */
function isClassProvider(provider: Provider): provider is ClassProvider<unknown> {
  return (provider as ClassProvider<unknown>)?.useClass !== undefined;
}

function isDynamicModule(importedModule: ModuleImports): importedModule is DynamicModule {
  return (importedModule as DynamicModule)?.module !== undefined;
}

/**
 * Register module dependencies in the IOC.
 * 
 */
export function Module(moduleOptions: ModuleOptions): ClassDecorator {
  return function (target: Function) {
    const { providers = [], imports } = moduleOptions;

    let resolvedProviders: Provider[] = [...providers];

    /**
     * Append the dynamic module providers to the resolvedProviders array.
     * 
     */
    imports?.forEach((importedModule) => {
      if (isDynamicModule(importedModule)) {
        resolvedProviders = [...resolvedProviders, ...importedModule.providers];
      }
    });

    /**
     * Mark the current class with the Module decorator as injectable.
     * 
     */
    Container.set({
      id: target,
      type: target as Constructable<unknown>,
    });

    /**
     * Mark all resolved providers as injectable.
     * 
     */
    resolvedProviders?.forEach((provider) => {
      if (isValueProvider(provider)) {
        Container.set({
          id: provider.provide as string,
          value: provider.useValue,
        });
        
        return;
      }

      if (isClassProvider(provider)) {
        Container.set({
          id: provider.provide as ClassConstructor,
          type: provider.useClass,
        });

        return;
      }

      Container.set({
        id: provider,
        type: provider,
      });
    });
  };
}