import roomService from "../service/room-service.js";

const pengajuan = async (req, res, next) => {
  try {
    const result = await roomService.pengajuan(req.user, req.body);
    res.status(201).json({
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const result = await roomService.search(req.query);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await roomService.remove(req.params.peminjamanId);
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const givePermission = async (req, res, next) => {
  try {
    const result = await roomService.givePermission(
      req.params.peminjamanId,
      req.body
    );
    res.status(200).json({
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const getMyPengajuans = async (req, res, next) => {
  try {
    const query = {
      peminjam: req.user.username,
      ...req.query,
    };

    console.log(query);
    const result = await roomService.search(query);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  pengajuan,
  search,
  remove,
  givePermission,
  getMyPengajuans,
};
