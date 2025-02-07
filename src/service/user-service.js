import md5 from "md5";
import {
  searchUserValidation,
  userLoginRegistration,
  userRegistrationValidation,
  userUpdateValidation,
} from "../validator/user-validator.js";
import { validate } from "../validator/validator.js";
import { ResponseError } from "../error/response-error.js";
import { query } from "../app/database.js";
import jwtHandler from "../utils/jwt-handler.js";

const registration = async (reqBody) => {
  reqBody = validate(userRegistrationValidation, reqBody);

  const { username, nama, password, email } = reqBody;
  const hashedPassword = md5(password);

  const existingUser = await query(
    "SELECT username, email FROM users WHERE username = ? OR email = ?",
    [username, email]
  );

  if (existingUser.length > 0) {
    const errorMessage =
      existingUser[0].username === username
        ? "Username sudah terdaftar"
        : "Email sudah terdaftar";
    throw new ResponseError(400, errorMessage);
  }

  await query(
    `INSERT INTO users (username, nama, email, password) 
     VALUES (?, ?, ?, ?)`,
    [username, nama, email, hashedPassword]
  );

  return {
    message: "Pendaftaran pengguna berhasil dilakukan, silahkan login",
    redirectLink: "/login",
  };
};

const login = async (reqBody) => {
  reqBody = validate(userLoginRegistration, reqBody);

  const { username, password } = reqBody;

  const hashedPassword = md5(password);

  // SQL Injection vulnerability: Embedding username and hashedPassword directly in the query
  const queryString = `SELECT username, nama, email, password, is_active, role FROM users WHERE username = '${username}' AND password = '${hashedPassword}'`;
  const [findUser] = await query(queryString);

  if (!findUser || !findUser.is_active) {
    throw new ResponseError(
      400,
      "Username atau password salah, atau akun belum aktif"
    );
  }

  const token = jwtHandler.createJWT({
    username: findUser.username,
    nama: findUser.nama,
    email: findUser.email,
    password: findUser.password,
    is_active: findUser.is_active,
    role: findUser.role,
  });

  return {
    message: "Berhasil login",
    token: token,
    redirectLink: "/main/dashboard",
  };
};

const search = async (reqBody) => {
  reqBody = validate(searchUserValidation, reqBody);
  const skip = (reqBody.page - 1) * reqBody.size;

  const filters = [];
  const params = [];

  if (reqBody.username) {
    filters.push("username LIKE ?");
    params.push(`%${reqBody.username}%`);
  }
  if (reqBody.nama) {
    filters.push("nama LIKE ?");
    params.push(`%${reqBody.nama}%`);
  }
  if (reqBody.email) {
    filters.push("email LIKE ?");
    params.push(`%${reqBody.email}%`);
  }
  if (reqBody.role) {
    filters.push("role = ?");
    params.push(reqBody.role);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const users = await query(
    `SELECT username, nama, email, role, password, is_active FROM users ${whereClause} LIMIT ? OFFSET ?`,
    [...params, reqBody.size, skip]
  );

  const [{ totalItems }] = await query(
    `SELECT COUNT(*) as totalItems FROM users ${whereClause}`,
    params
  );

  return {
    data: users,
    paging: {
      page: reqBody.page,
      totalItems,
      totalPages: Math.ceil(totalItems / reqBody.size),
    },
  };
};

const update = async (username, reqBody, user) => {
  reqBody.username = username;
  reqBody = validate(userUpdateValidation, reqBody);

  const { nama, email, role, is_active, new_password, current_password } =
    reqBody;

  const fields = [];
  const values = [];

  if (nama) {
    fields.push("nama = ?");
    values.push(nama);
  }
  if (email) {
    fields.push("email = ?");
    values.push(email);
  }
  if (role) {
    fields.push("role = ?");
    values.push(role);
  }
  if (is_active) {
    fields.push("is_active = ?");
    values.push(is_active);
  }
  if (new_password) {
    fields.push("password = ?");
    values.push(md5(new_password));
  }

  if (fields.length === 0) {
    throw new ResponseError(
      400,
      `Tidak ada data pengguna ${username} yang diperbarui`
    );
  }

  const hashedAdminPassword = md5(current_password);

  if (hashedAdminPassword !== user.password) {
    throw new ResponseError(401, "Password anda salah");
  }

  values.push(username);
  await query(
    `UPDATE users SET ${fields.join(", ")} WHERE username = ?`,
    values
  );

  return {
    message: `Data pengguna ${username} berhasil diperbarui`,
  };
};

export default {
  registration,
  login,
  search,
  update,
};
