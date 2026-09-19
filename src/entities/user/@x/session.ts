/**
 * Cross-import public API exposed by the `user` entity to the `session` entity.
 *
 * Slices on the same layer may not import each other directly (see CLAUDE.md).
 * An interactive flow session embeds the user it authenticates, so the user
 * slice explicitly publishes the part of its model the session slice may use.
 */
export { type UserResource, userResourceSchema } from '../model/UserResource'
