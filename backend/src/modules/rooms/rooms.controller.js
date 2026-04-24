const {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  searchRooms,
  toggleRoomActive,
} = require("./rooms.service");

const create = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;

    // multer with array handles multiple files
    const files = req.files || [];
    const image_urls = files.map((file) => baseUrl + file.filename);
    // console.log("payload ", req.body);
    // console.log("image_urls ", image_urls);

    const room = await createRoom(req.user.id, {
      ...req.body,
      image_url: image_urls,
    });
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
    const baseUrl = `${req.protocol}://${req.get("host")}/uploads/`;
    const files = req.files || [];
    const newImageUrls = files.map((f) => baseUrl + f.filename);

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

module.exports = {
  create,
  getOne,
  update,
  remove,
  myRooms,
  search,
  toggleActive,
};
