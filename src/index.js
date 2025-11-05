import { initMongoConnection } from "./db/initMongoDB.js";
import { setupServer } from "./server.js";
import { createDirIfNotExists } from './utils/createDirIfNotExists.js';
import { TEMP_UPLOAD_DIR, UPLOAD_DIR } from './contacts/sortIndex.js';


const bootstrap = async () => {
  await initMongoConnection()
    await createDirIfNotExists(TEMP_UPLOAD_DIR);
  await createDirIfNotExists(UPLOAD_DIR);
  await setupServer().catch((error) => console.error(error));
};

bootstrap();
