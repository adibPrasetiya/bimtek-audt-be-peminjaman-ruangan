export const corsOptions = {
  // origin: "http://localhost:4200", // Ganti dengan URL frontend Anda
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Penting: Agar kredensial (cookies, header) bisa diterima
  exposedHeaders: "Authorization",
};
