/**
 * Checks whether a user is the owner of a resource or has admin privileges.
 */
export const isOwnerOrAdmin = (resourceAuthorId, user) => {
  if (!resourceAuthorId || !user) return false;
  const authorIdStr = resourceAuthorId._id ? resourceAuthorId._id.toString() : resourceAuthorId.toString();
  const userIdStr = user._id ? user._id.toString() : user.toString();
  return authorIdStr === userIdStr || user.role === 'admin';
};

/**
 * Checks whether a user is the owner of a resource, staff, or admin.
 */
export const isOwnerOrStaffOrAdmin = (resourceAuthorId, user) => {
  if (!resourceAuthorId || !user) return false;
  const authorIdStr = resourceAuthorId._id ? resourceAuthorId._id.toString() : resourceAuthorId.toString();
  const userIdStr = user._id ? user._id.toString() : user.toString();
  return authorIdStr === userIdStr || user.role === 'staff' || user.role === 'admin';
};
