export default class StorageService {
  constructor(storage, name) {
    this._storage = storage;
    this._name = name;
  }
  async uploadPicture(uniqueName, body) {
    const result = await this._storage
      .upload({
        Bucket: this._name,
        Key: uniqueName,
        Body: body,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
      })
      .promise();

    return result.Location;
  }
}
