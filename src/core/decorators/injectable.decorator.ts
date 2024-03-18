import { Service } from "typedi";

/**
 * Mark a class as injectable.
 * 
 */
export function Injectable() {
  return Service();
}