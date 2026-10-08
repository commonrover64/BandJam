const {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  searchRooms,
  toggleRoomActive,
} = require("./rooms.service");
const { cloudinary } = require("../../config/upload");
const { sendError } = require("../../utils/httpError");

const create = async (req, res) => {
  try {
    // image_urls: JSON array of Cloudinary URLs; validated in the service
    const room = await createRoom(req.user.id, {
      ...req.body,
      image_url: req.body.image_urls,
    });
    res.status(201).json({ success: true, room });
  } catch (err) {
    sendError(res, err);
  }
};

const getOne = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);
    res.status(200).json({ success: true, room });
  } catch (err) {
    sendError(res, err, 404);
  }
};

const update = async (req, res) => {
  try {
    const room = await updateRoom(req.user.id, req.params.id, {
      ...req.body,
      newImageUrls: req.body.image_urls,
    });
    res.status(200).json({ success: true, room });
  } catch (err) {
    sendError(res, err);
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteRoom(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    sendError(res, err);
  }
};

const myRooms = async (req, res) => {
  try {
    const rooms = await getOwnerRooms(req.user.id);
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const search = async (req, res) => {
  try {
    // all params come from query string
    const { lat, lng, radius, minPrice, maxPrice, sortBy } = req.query;

    const latN = parseFloat(lat);
    const lngN = parseFloat(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN) || Math.abs(latN) > 90 || Math.abs(lngN) > 180) {
      return res
        .status(400)
        .json({ success: false, message: "Valid lat and lng are required" });
    }

    // cap radius so one request can't dump the whole table
    const radiusN = Math.min(Math.max(parseFloat(radius) || 10, 0.1), 100);
    const num = (v) => (Number.isFinite(parseFloat(v)) ? parseFloat(v) : null);

    const rooms = await searchRooms({
      lat: latN,
      lng: lngN,
      radius: radiusN,
      minPrice: num(minPrice),
      maxPrice: num(maxPrice),
      sortBy,
    });

    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    sendError(res, err, 500);
  }
};

const toggleActive = async (req, res) => {
  try {
    const room = await toggleRoomActive(req.user.id, req.params.id);
    res.status(200).json({ success: true, room });
  } catch (err) {
    sendError(res, err);
  }
};

const getUploadSignature = (req, res) => {
  try {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = "practice-space/rooms";
    const transformation = "w_1200,h_675,c_fill,q_auto";

    // signature is generated server side — client never sees the API secret
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder, transformation },
      process.env.CLOUDINARY_API_SECRET,
    );

    res.status(200).json({
      success: true,
      signature,
      timestamp,
      folder,
      transformation,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    });
  } catch (err) {
    sendError(res, err, 500);
  }
};

module.exports = {
  create,
  getOne,
  update,
  remove,
  myRooms,
  search,
  toggleActive,
  getUploadSignature,
};
