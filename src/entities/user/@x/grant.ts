/**
 * Cross-import public API exposed by the `user` entity to the `grant` entity.
 *
 * Slices on the same layer may not import each other directly (see CLAUDE.md).
 * A grant embeds the user it was opened for, so the user slice explicitly
 * publishes the part of its model the grant slice may use.
 */
export { type UserResource, userIdentifierLabel, userResourceSchema } from '../model/UserResource'
