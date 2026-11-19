/**
 * Error de regla de negocio. Su mensaje es seguro para mostrarlo al usuario.
 * Cualquier otro error se considera inesperado y se muestra con un mensaje genérico.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}
