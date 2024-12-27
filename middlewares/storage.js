import Users from "../models/user.js";

const MAX_STORAGE_LIMIT = 1 * 1024 * 1024 * 1024;

const checkStorageLimit = async (req, res, next) => {
  const { id } = req.user;
  const { files: _files } = req;

  if (!_files || _files.length === 0) {
    return res.status(400).send("No files to upload.");
  }

  try {
    const userStorage = await Users.findOne({ _id: id });
    const usedStorage = userStorage ? userStorage.usedStorage : 0;

    const files = Array.isArray(_files) ? _files : [_files];
    const totalUploadSize = files.reduce(
      (total, file) => parseInt(total) + parseInt(file.size),
      0
    );

    if (usedStorage + totalUploadSize > MAX_STORAGE_LIMIT) {
      return res
        .status(400)
        .send("Storage limit exceeded. Cannot upload files.");
    }

    req.size = totalUploadSize;

    next();
  } catch (error) {
    console.error("Error checking storage limit:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export default checkStorageLimit;
