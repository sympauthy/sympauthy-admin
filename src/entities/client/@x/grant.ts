/**
 * Cross-import public API exposed by the `client` entity to the `grant` entity.
 *
 * Slices on the same layer may not import each other directly (see CLAUDE.md).
 * A grant embeds the client it was opened for, so the client slice explicitly
 * publishes the part of its model the grant slice may use.
 */
export {
  type ClientReferenceResource,
  clientReferenceName,
  clientReferenceResourceSchema
} from '../model/ClientReferenceResource'
