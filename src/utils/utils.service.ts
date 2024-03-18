import { Injectable } from "../core/decorators/injectable.decorator";

@Injectable()
export class UtilsService {
  replaceHasuraSessionVars(conditions: Record<string, unknown>, replacements: Record<string, string>) {
    let stringified = JSON.stringify(conditions);

    const replacementKeys = Object.keys(replacements);

    replacementKeys.forEach((replacementKey) => {
      const regex = new RegExp(replacementKey, 'ig')

      stringified = stringified.replaceAll(regex, () => {
        return replacements[replacementKey];
      });
    });

    return JSON.parse(stringified) as Record<string, unknown>;
  }
}