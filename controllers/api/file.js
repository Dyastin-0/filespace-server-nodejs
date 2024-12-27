import { sendHtmlEmail } from "../../helpers/email.js";
import Users from "../../models/user.js";
import { Storage } from "@google-cloud/storage";
import { emailTemplate } from "../../templates/email.js";

const storage = new Storage({
  projectId: process.env.GCLOUD_PROJECT_ID,
});

const bucket = storage.bucket("filespace-bucket");

const handleUploadFile = async (req, res) => {
  const { id } = req.user;
  const { files: _files, size } = req;
  const { path } = req.body;

  try {
    const files = Array.isArray(_files) ? _files : [_files];

    const fileUploads = files.map(async (file) => {
      const fileName =
        path === ""
          ? `${id}/${file.originalname}`
          : `${id}/${path}/${file.originalname}`;

      const newFile = bucket.file(fileName);

      await newFile.save(file.buffer, {
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      await newFile.setMetadata({
        metadata: {
          owner: id,
        },
      });

      return { fileName, size };
    });

    const fileUploadResults = await Promise.all(fileUploads);
    await Users.updateOne({ _id: id }, { $inc: { usedStorage: size } });

    return res.status(200).send(fileUploadResults);
  } catch (error) {
    console.error("Error uploading file:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const handleFetchFiles = async (req, res) => {
  const { id } = req.user;

  try {
    const [files] = await bucket.getFiles({
      prefix: `${id}/`,
    });

    const filesMetaData = await Promise.all(
      files.map(async (file) => {
        const [url] = await file.getSignedUrl({
          action: "read",
          expires: Date.now() + 15 * 60 * 1000,
        });

        return {
          name: file.metadata.name.replace(`${id}/`, ""),
          link: url,
          owner: file.metadata.metadata.owner,
          size: file.metadata.size,
          updated: file.metadata.updated,
          contentType: file.metadata.contentType,
          createdAt: file.metadata.timeCreated,
          type: file.metadata.contentType.split("/").pop(),
        };
      })
    );

    return res.status(200).send(filesMetaData);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
};

const handleCreateFolder = async (req, res) => {
  const { id } = req.user;
  const { folderName, path } = req.body;

  if (!folderName) {
    return res.status(400).send("No folder name provided.");
  }

  try {
    const folderPath =
      path === "" ? `${id}/${folderName}/` : `${id}/${path}/${folderName}/`;

    const newFolder = bucket.file(folderPath);

    await newFolder.save("", {
      metadata: {
        contentType: "application/x-www-form-urlencoded;charset=UTF-8",
        metadata: {
          owner: id,
        },
      },
    });

    return res.status(200).send(`Folder created successfully: ${folderName}`);
  } catch (error) {
    console.error("Error creating folder:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const handleDeleteFile = async (req, res) => {
  const { id } = req.user;
  const { path } = req.body;

  if (!path) {
    return res.status(400).send("No file name provided.");
  }

  try {
    const file = bucket.file(`${id}/${path}`);

    const [metadata] = await file.getMetadata();
    const fileSize = parseInt(metadata.size, 10);

    await file.delete();
    await Users.updateOne({ _id: id }, { $inc: { usedStorage: -fileSize } });

    return res.status(200).send(`File deleted successfully: ${path}`);
  } catch (error) {
    if (error.code === 404) {
      return res.status(404).send("File not found.");
    }

    console.error("Error deleting file:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const handleDeleteFolder = async (req, res) => {
  const { id } = req.user;
  const { path } = req.body;

  if (!path) {
    return res.status(400).send("No folder name provided.");
  }

  try {
    const [files] = await bucket.getFiles({
      prefix: `${id}/${path}/`,
    });

    const totalSize = files.reduce(
      (sum, file) => sum + parseInt(file.metadata.size, 10),
      0
    );

    await Promise.all(files.map(async (file) => await file.delete()));

    await Users.updateOne({ _id: id }, { $inc: { usedStorage: -totalSize } });

    return res.status(200).send(`Folder deleted successfully: ${path}`);
  } catch (error) {
    console.error("Error deleting folder:", error);
    return res.status(500).send("Internal Server Error");
  }
};

const handleMoveFile = async (req, res) => {
  const { id } = req.user;
  const { file, filePath, path: targetPath, type } = req.body;

  if (!file || !filePath) {
    return res.status(400).send("No folder or path provided.");
  }

  try {
    const sourceFolderPath =
      filePath === "" ? `${id}/${file}/` : `${id}/${filePath}`;

    const newPath =
      type === "file"
        ? `${id}/${targetPath}`
        : targetPath === ""
        ? `${id}/${targetPath}`
        : `${id}/${targetPath}/`;

    const [files] = await bucket.getFiles({ prefix: sourceFolderPath });

    if (files.length > 25) {
      return res.status(400).send("Cannot move more than 25 files at once.");
    }

    const promises = files.map(async (gcsFile) => {
      const newFilePath =
        type === "directory"
          ? `${newPath}${file}/`
          : targetPath === ""
          ? `${newPath}${file}`
          : `${newPath}/${file}`;

      return gcsFile.move(newFilePath);
    });

    await Promise.all(promises);

    return res.status(200).send(`Folder and its contents moved successfully.`);
  } catch (error) {
    console.error("Error moving folder:", error);
    return res.status(500).send("Error moving the folder.");
  }
};

const handleSendFile = async (req, res) => {
  const { id, email: sender } = req.user;
  const { email, file, expiration } = req.body;

  if (!email || !file) {
    return res.status(400).send("No email or file provided.");
  }

  try {
    const [gcsFile] = await bucket.getFiles({
      prefix: `${id}/${file}`,
    });

    const [url] = await gcsFile[0].getSignedUrl({
      action: "",
      expires: Date.now() + expiration.value,
    });

    sendHtmlEmail(
      email,
      "Filespace File",
      emailTemplate(
        `Hi, ${email}!`,
        `${sender} has sent you a file. You can download it from the link below.
        The link expires in ${expiration.text}.`,
        url,
        "Link to the file"
      )
    );

    return res.status(200).send("File sent successfully.");
  } catch (error) {
    console.error("Error sending file:", error);
    return res.status(500).send("Internal Server Error");
  }
};

export {
  handleUploadFile,
  handleFetchFiles,
  handleCreateFolder,
  handleDeleteFile,
  handleDeleteFolder,
  handleMoveFile,
  handleSendFile,
};
