import userService from "../service/user-service.js";

const registration = async (req, res, next) => {
  try {
    const result = await userService.registration(req.body);
    res.status(201).json({
      message: result.message,
      redirectLink: result.redirectLink,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.set("Authorization", `Bearer ${result.token}`).status(200).json({
      message: result.message,
      redirectLink: result.redirectLink,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.set("Authorization", "").status(200).json({
      message: "Berhasil logout",
      redirectLink: "/login",
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const result = await userService.search(req.query);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await userService.update(
      req.params.userId,
      req.body,
      req.user
    );
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  registration,
  login,
  logout,
  search,
  update,
};
