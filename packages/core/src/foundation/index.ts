/**
 * Foundation - Laravel-like Application Foundation
 *
 * Exports core foundation classes for building Laravel-style applications
 */

export { Container, type Constructor, type Factory, type Binding, container } from './Container';
export { ServiceProvider } from './ServiceProvider';
export { Application, type ApplicationConfig } from './Application';
export { Config, createConfig } from './Config';
export { Facade, createFacade } from './Facade';
export { Env, loadEnv, env, type EnvOptions } from './Env';
export {
  Validator,
  Rules,
  validate,
  type ValidationRule,
  type ValidationError,
  type ValidationResult,
} from './Validator';
