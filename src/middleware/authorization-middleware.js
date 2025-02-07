import { ResponseError } from "../error/response-error.js";

const verifyAuthorization = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    throw new ResponseError(
      401,
      "Akses ditolak, anda tidak memiliki cukup hak akses ke layanan ini"
    );
  } else {
    next();
  }
};

export default {
  verifyAuthorization,
};
