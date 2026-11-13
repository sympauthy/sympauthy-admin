/**
 * Cross-import public API exposed by the `client` entity to the `session` entity.
 *
 * Slices on the same layer may not import each other directly (see CLAUDE.md).
 * An interactive flow session embeds the client it was started for, so the
 * client slice explicitly publishes the part of its model the session slice
 * may use.
 */
export {
  type ClientReferenceResource,
  clientReferenceResourceSchema
} from '../model/ClientReferenceResource'
