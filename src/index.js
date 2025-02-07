import { app } from "./app/server.js";
import { APP_PORT } from "./config/constant.js";

app.listen(APP_PORT || 3000, () => {
  console.info(`SERVER RUNNING ON PORT ${APP_PORT || 3000}`);
});
