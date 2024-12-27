import express from "express";

import {
  handleCreateFolder,
  handleDeleteFile,
  handleDeleteFolder,
  handleFetchFiles,
  handleUploadFile,
  handleMoveFile,
  handleSendFile,
} from "../../controllers/api/file.js";

import upload from "../../middlewares/multer.js";
import checkStorageLimit from "../../middlewares/storage.js";
const router = express.Router();

router
  .route("/")
  .post(upload.array("files", 25), checkStorageLimit, handleUploadFile)
  .get(handleFetchFiles)
  .put(handleMoveFile)
  .delete(handleDeleteFile);

router.route("/folder").post(handleCreateFolder).delete(handleDeleteFolder);

router.route("/send").post(handleSendFile);

export default router;
