import Joi from "joi";

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const roomPengajuanSchema = Joi.object({
  nama_ruang: Joi.string()
    .valid("Loka Meeting", "Pakuon Meeting", "Lodya Meeting")
    .required(),
  tanggal: Joi.string().pattern(dateRegex).required().messages({
    "string.pattern.base": "Format tanggal harus YYYY-MM-DD.",
  }),
  waktu_mulai: Joi.string().pattern(timeRegex).required().messages({
    "string.pattern.base": "Format waktu_mulai harus HH:MM:SS",
  }),
  waktu_selesai: Joi.string().pattern(timeRegex).required().messages({
    "string.pattern.base": "Format waktu_selesai harus HH:MM:SS",
  }),
});

const peminjamanIdValidation = Joi.string().required();

const roomSearchSchema = Joi.object({
  nama_ruang: Joi.string().optional(),
  tanggal: Joi.string().pattern(dateRegex).optional().messages({
    "string.pattern.base": "Format tanggal harus YYYY-MM-DD.",
  }),
  waktu_mulai: Joi.string().pattern(timeRegex).optional().messages({
    "string.pattern.base": "Format waktu_mulai harus HH:MM:SS",
  }),
  waktu_selesai: Joi.string().pattern(timeRegex).optional().messages({
    "string.pattern.base": "Format waktu_selesai harus HH:MM:SS",
  }),
  status: Joi.string().valid("TERKIRIM", "DISETUJUI", "DITOLAK").optional(),
  peminjam: Joi.string().optional().max(100).messages({
    "string.max": "Panjang peminjam maksimal 100 karakter",
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman minimal 1",
  }),
  size: Joi.number().integer().min(1).default(10).messages({
    "number.base": "Ukuran halaman harus berupa angka",
    "number.min": "Ukuran halaman minimal 1",
  }),
});

const roomPermissionsSchema = Joi.object({
  id: peminjamanIdValidation,
  status: Joi.string().valid("TERKIRIM", "DISETUJUI", "DITOLAK").required(),
  alasan_penolakan: Joi.when("status", {
    is: "DITOLAK",
    then: Joi.string().required().messages({
      "any.required":
        "Alasan penolakan harus diisi jika status adalah DITOLAK.",
    }),
    otherwise: Joi.string().optional(),
  }),
});

export {
  roomPengajuanSchema,
  roomSearchSchema,
  peminjamanIdValidation,
  roomPermissionsSchema,
};
