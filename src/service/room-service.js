import { query } from "../app/database.js";
import { ResponseError } from "../error/response-error.js";
import {
  peminjamanIdValidation,
  roomPengajuanSchema,
  roomPermissionsSchema,
  roomSearchSchema,
} from "../validator/room-validator.js";
import { usernameValidation } from "../validator/user-validator.js";
import { validate } from "../validator/validator.js";
import { v4 as uuidv4 } from "uuid";

const pengajuan = async (reqUser, reqBody) => {
  reqBody = validate(roomPengajuanSchema, reqBody);

  const { nama_ruang, tanggal, waktu_mulai, waktu_selesai } = reqBody;
  // Cek apakah ada overlap
  const existing = await query(
    "SELECT * FROM peminjaman_ruang WHERE nama_ruang = ? AND tanggal = ? AND ((waktu_mulai < ? AND waktu_selesai > ?) OR (waktu_mulai BETWEEN ? AND ?) OR (waktu_selesai BETWEEN ? AND ?) OR (? BETWEEN waktu_mulai AND waktu_selesai))",
    [
      nama_ruang,
      tanggal,
      waktu_selesai,
      waktu_mulai, // Cek apakah jadwal baru menutupi jadwal lama
      waktu_mulai,
      waktu_selesai, // Cek apakah waktu mulai baru ada di dalam rentang lama
      waktu_mulai,
      waktu_selesai, // Cek apakah waktu selesai baru ada di dalam rentang lama
      waktu_mulai, // Cek apakah jadwal lama menutupi jadwal baru
    ]
  );

  if (existing.length > 0) {
    throw new ResponseError(400, "Ruangan sudah dipinjam dalam waktu tersebut");
  }

  const id = uuidv4();

  await query(
    "INSERT INTO peminjaman_ruang (id, user_id, nama_ruang, tanggal, waktu_mulai, waktu_selesai, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      reqUser.username,
      nama_ruang,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      "TERKIRIM",
    ]
  );

  return {
    message: "Peminjaman ruangan berhasil diajukan",
    data: {
      id: id,
      nama_ruang,
      tanggal,
      waktu_mulai,
      waktu_selesai,
      status: "TERKIRIM",
    },
  };
};

const search = async (reqParams) => {
  reqParams = validate(roomSearchSchema, reqParams);
  const skip = (reqParams.page - 1) * reqParams.size;

  const filters = [];
  const params = [];

  if (reqParams.nama_ruang) {
    filters.push("nama_ruang LIKE ?");
    params.push(`%${reqParams.nama_ruang}%`);
  }
  if (reqParams.tanggal) {
    filters.push("tanggal = ?");
    params.push(reqParams.tanggal);
  }
  if (reqParams.status) {
    filters.push("status = ?");
    params.push(reqParams.status);
  }
  if (reqParams.peminjam) {
    filters.push("users.nama LIKE ?");
    params.push(`%${reqParams.peminjam}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const peminjaman = await query(
    `SELECT peminjaman_ruang.*, users.nama as peminjam FROM peminjaman_ruang 
    JOIN users ON peminjaman_ruang.user_id = users.username 
    ${whereClause} LIMIT ? OFFSET ?`,
    [...params, reqParams.size, skip]
  );

  const [{ totalItems }] = await query(
    `SELECT COUNT(*) as totalItems 
     FROM peminjaman_ruang
     JOIN users ON peminjaman_ruang.user_id = users.username
     ${whereClause}`,
    params
  );

  return {
    data: peminjaman,
    paging: {
      page: reqParams.page,
      totalItems,
      totalPages: Math.ceil(totalItems / reqParams.size),
    },
  };
};

// buat kerawanan idor, buat tidak ada pengecekan kepemilikan pengajuan
const remove = async (peminjamId) => {
  peminjamId = validate(peminjamanIdValidation, peminjamId);

  const [existingPeminjaman] = await query(
    `SELECT * FROM peminjaman_ruang WHERE id = ?`,
    [peminjamId]
  );

  if (!existingPeminjaman) {
    throw new ResponseError(
      404,
      `Data peminjaman dengan ID ${peminjamId} tidak ditemukan`
    );
  }

  if (existingPeminjaman.status !== "TERKIRIM") {
    throw new ResponseError(
      401,
      "Gagal menghapus data peminjaman. Status peminjaman tidak sesuai"
    );
  }

  await query(`DELETE FROM peminjaman_ruang WHERE id = ?`, [peminjamId]);

  return {
    message: "Data peminjaman berhasil dihapus",
  };
};

const givePermission = async (peminjamanId, reqBody) => {
  reqBody.id = peminjamanId;
  reqBody = validate(roomPermissionsSchema, reqBody);

  const [existingPeminjaman] = await query(
    `SELECT * FROM peminjaman_ruang WHERE id = ?`,
    [peminjamanId]
  );

  if (!existingPeminjaman) {
    throw new ResponseError(
      404,
      `Data peminjaman dengan ID ${peminjamanId} tidak ditemukan`
    );
  }

  if (existingPeminjaman.status !== "TERKIRIM") {
    throw new ResponseError(
      401,
      "Gagal mengubah status data peminjaman. Status peminjaman tidak sesuai"
    );
  }

  await query(
    "UPDATE peminjaman_ruang SET status = ?, alasan_penolakan = ? WHERE id = ?",
    [reqBody.status, reqBody.alasan_penolakan || null, peminjamanId]
  );

  return {
    message: `Status data peminjaman dengan ID ${existingPeminjaman.id} berhasil diperbarui`,
  };
};

export default {
  pengajuan,
  search,
  remove,
  givePermission,
};
