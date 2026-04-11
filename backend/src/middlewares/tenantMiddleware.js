export const requireSameInstituteOrSuperAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized.",
      });
    }

    if (req.user.role === "SUPER_ADMIN") {
      return next();
    }

    const requestedInstituteId =
      req.params.id || req.params.instituteId || req.body.instituteId;

    if (!requestedInstituteId) {
      return res.status(400).json({
        success: false,
        message: "Institute ID is required.",
      });
    }

    if (req.user.instituteId !== requestedInstituteId) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Cross-institute access is not allowed.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Tenant validation failed.",
      error: error.message,
    });
  }
};