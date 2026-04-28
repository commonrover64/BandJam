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

const create = async (req, res) => {
  try {
    // image_urls is now a JSON array of cloudinary URLs sent by client
    const image_url = req.body.image_urls
      ? JSON.parse(req.body.image_urls)
      : [];

    const room = await createRoom(req.user.id, { ...req.body, image_url });
    res.status(201).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const getOne = async (req, res) => {
  try {
    const room = await getRoomById(req.params.id);
    res.status(200).json({ success: true, room });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};

const update = async (req, res) => {
  try {
    const newImageUrls = req.body.image_urls
      ? JSON.parse(req.body.image_urls)
      : [];

    const room = await updateRoom(req.user.id, req.params.id, {
      ...req.body,
      newImageUrls,
    });
    res.status(200).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteRoom(req.user.id, req.params.id);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

const myRooms = async (req, res) => {
  try {
    const rooms = await getOwnerRooms(req.user.id);
    res.status(200).json({ success: true, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const search = async (req, res) => {
  try {
    // all params come from query string
    const { lat, lng, radius, minPrice, maxPrice, sortBy } = req.query;

    if (!lat || !lng) {
      return res
        .status(400)
        .json({ success: false, message: "lat and lng are required" });
    }

    const rooms = await searchRooms({
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      radius: radius ? parseFloat(radius) : 10,
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy,
    });

    res.status(200).json({ success: true, count: rooms.length, rooms });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const toggleActive = async (req, res) => {
  try {
    const room = await toggleRoomActive(req.user.id, req.params.id);
    res.status(200).json({ success: true, room });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
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
    res.status(500).json({ success: false, message: err.message });
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
