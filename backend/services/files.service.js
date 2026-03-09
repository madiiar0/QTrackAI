import { nanoid } from "nanoid";
import FileModel from "../models/files.model.js";

export const saveFileMetadata = async ({
  ownerId,
  storedPath,
  originalName,
  mimeType,
  sizeBytes,
}) => {
  const publicId = `f_${nanoid(24)}`;

  const doc = await FileModel.create({
    publicId,
    ownerId: String(ownerId),
    storedPath,
    originalName,
    mimeType,
    sizeBytes,
  });

  return doc;
};

