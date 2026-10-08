const pool = require("../../config/db");
const { cloudinary } = require("../../config/upload");
const { HttpError } = require("../../utils/httpError");

const MAX_PHOTOS = 3;
const UPLOAD_FOLDER = "practice-space/rooms";

const getPublicId = (url) => {
  // https://res.cloudinary.com/<cloud>/image/upload/<transforms>/v123/practice-space/rooms/<id>.jpg
  const idx = url.indexOf(`/${UPLOAD_FOLDER}/`);
  if (idx === -1) return null;
  return url.slice(idx + 1).replace(/\.[a-z0-9]+$/i, "");
};

const destroyImages = (urls) =>
  Promise.all(
    urls
      .map(getPublicId)
      .filter(Boolean)
      .map((id) =>
        cloudinary.uploader
          .destroy(id)
          .catch((err) => console.warn("Cloudinary delete failed:", err?.message)),
      ),
  );

// Only accept images that were uploaded to *our* Cloudinary folder.
// Previously any URL (or any JSON) was stored and later rendered in the app.
const sanitizeImageUrls = (value) => {
  let list = value;
  if (typeof value === "string") {
    try {
      list = JSON.parse(value);
    } catch {
      throw new HttpError(400, "image_urls must be a JSON array");
    }
  }
  if (list == null) return [];
  if (!Array.isArray(list)) throw new HttpError(400, "image_urls must be an array");
  const prefix = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`;
  return list.filter(
    (u) => typeof u === "string" && u.startsWith(prefix) && u.includes(`/${UPLOAD_FOLDER}/`),
  );
};

const parseCoord = (v, min, max) => {
  const n = typeof v === "number" ? v : parseFloat(v);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
};

const validateRoomFields = ({ name, address, phone, price_per_day }, partial = false) => {
  const check = (cond, msg) => {
    if (!cond) throw new HttpError(400, msg);
  };
  if (!partial || name !== undefined) check(String(name ?? "").trim(), "Room name is required");
  if (!partial || address !== undefined) check(String(address ?? "").trim(), "Address is required");
  if (!partial || phone !== undefined) check(String(phone ?? "").trim(), "Phone is required");
  if (!partial || price_per_day !== undefined) {
    const p = Number(price_per_day);
    check(Number.isFinite(p) && p > 0 && p < 1e8, "Valid price is required");
  }
};

const emptyToNull = (v) => (typeof v === "string" && v.trim() === "" ? null : v);

const createRoom = async (
  ownerId,
  { name, description, address, lat, lng, phone, price_per_day, image_url },
) => {
  validateRoomFields({ name, address, phone, price_per_day });
  const parsedLat = parseCoord(lat, -90, 90);
  const parsedLng = parseCoord(lng, -180, 180);
  if (parsedLat === null || parsedLng === null) throw new HttpError(400, "Invalid coordinates");

  const { rows } = await pool.query(
    `INSERT INTO rooms (owner_id, name, description, address, location, phone, price_per_day, image_url)
     VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9)
     RETURNING id, name, description, address, phone, price_per_day, is_active, image_url, created_at`,
    [
      ownerId,
      String(name).trim(),
      emptyToNull(description),
      String(address).trim(),
      parsedLng,
      parsedLat,
      String(phone).trim(),
      price_per_day,
      sanitizeImageUrls(image_url).slice(0, MAX_PHOTOS),
    ],
  );
  return rows[0];
};

const getRoomById = async (id) => {
  const { rows } = await pool.query(
    `SELECT r.id, r.owner_id, r.name, r.description, r.address,
            r.phone, r.price_per_day, r.is_active, r.image_url, r.created_at,
            ST_Y(r.location::geometry) AS lat,
            ST_X(r.location::geometry) AS lng,
            u.name AS owner_name
     FROM rooms r
     JOIN users u ON r.owner_id = u.id
     WHERE r.id = $1`,
    [id],
  );
  if (!rows[0]) throw new HttpError(404, "Room not found");
  return rows[0];
};

const updateRoom = async (ownerId, roomId, updates) => {
  // check room belongs to this owner
  const { rows: existing } = await pool.query(
    "SELECT * FROM rooms WHERE id = $1 AND owner_id = $2",
    [roomId, ownerId],
  );
  if (!existing[0]) throw new HttpError(404, "Room not found or unauthorized");
  validateRoomFields(updates, true);

  const current = existing[0];
  // use incoming value if provided, otherwise keep existing value
  const name = updates.name ?? current.name;
  const description =
    updates.description !== undefined ? emptyToNull(updates.description) : current.description;
  const address = updates.address ?? current.address;
  const phone = updates.phone ?? current.phone;
  const price_per_day = updates.price_per_day ?? current.price_per_day;
  // for location, only update if both lat and lng are provided
  let lat = null;
  let lng = null;
  if (updates.lat != null || updates.lng != null) {
    lat = parseCoord(updates.lat, -90, 90);
    lng = parseCoord(updates.lng, -180, 180);
    if (lat === null || lng === null) throw new HttpError(400, "Invalid coordinates");
  }

  // handle image array update
  let imageUrls = current.image_url || [];
  let urlsToDelete = [];

  if (updates.removed_image_indices) {
    // parse the JSON string sent from mobile
    let removedIndices;
    try {
      removedIndices = JSON.parse(updates.removed_image_indices).map(Number);
    } catch {
      removedIndices = Array.isArray(updates.removed_image_indices)
        ? updates.removed_image_indices.map(Number)
        : [Number(updates.removed_image_indices)];
    }

    removedIndices = removedIndices.filter(Number.isInteger);
    if (removedIndices.length > 0) {
      urlsToDelete = imageUrls.filter((_, i) => removedIndices.includes(i));
      imageUrls = imageUrls.filter((_, i) => !removedIndices.includes(i));
    }
  }

  // append new images (validated), cap at MAX_PHOTOS
  const incoming = sanitizeImageUrls(updates.newImageUrls);
  imageUrls = [...imageUrls, ...incoming];
  const overflow = imageUrls.slice(MAX_PHOTOS);
  imageUrls = imageUrls.slice(0, MAX_PHOTOS);

  const { rows } = await pool.query(
    `UPDATE rooms
     SET name = $1, description = $2, address = $3,
         phone = $4, price_per_day = $5,
         image_url = $6,
         location = CASE
           WHEN $7::float IS NOT NULL AND $8::float IS NOT NULL
           THEN ST_SetSRID(ST_MakePoint($8, $7), 4326)
           ELSE location
         END
     WHERE id = $9 AND owner_id = $10
     RETURNING id, name, description, address, phone, price_per_day, is_active, image_url`,
    [
      String(name).trim(),
      description,
      String(address).trim(),
      String(phone).trim(),
      price_per_day,
      imageUrls,
      lat,
      lng,
      roomId,
      ownerId,
    ],
  );

  // delete from Cloudinary only after the DB update succeeded — previously
  // images were destroyed first, so a failed update left broken image links
  await destroyImages([...urlsToDelete, ...overflow]);
  return rows[0];
};

const deleteRoom = async (ownerId, roomId) => {
  const { rows: existing } = await pool.query(
    "SELECT image_url FROM rooms WHERE id = $1 AND owner_id = $2",
    [roomId, ownerId],
  );
  if (!existing[0]) throw new HttpError(404, "Room not found or unauthorized");

  const { rows } = await pool.query(
    "DELETE FROM rooms WHERE id = $1 AND owner_id = $2 RETURNING id",
    [roomId, ownerId],
  );
  if (!rows[0]) throw new HttpError(404, "Room not found or unauthorized");

  // images go after the row is gone, so a failed delete never leaves a room
  // pointing at deleted images
  await destroyImages(existing[0].image_url || []);
  return { message: "Room deleted successfully" };
};

const getOwnerRooms = async (ownerId) => {
  const { rows } = await pool.query(
    `SELECT id, name, description, address, phone, price_per_day, is_active, image_url, created_at,
            ST_Y(location::geometry) AS lat,
            ST_X(location::geometry) AS lng
     FROM rooms WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId],
  );
  return rows;
};

const searchRooms = async ({
  lat,
  lng,
  radius,
  minPrice,
  maxPrice,
  sortBy = "distance",
  limit = 200,
}) => {
  const radiusInMeters = radius * 1000;

  const params = [lat, lng, radiusInMeters];
  let paramIndex = 4;

  let priceFilter = "";

  if (minPrice) {
    priceFilter += ` AND price_per_day >= $${paramIndex}`;
    params.push(minPrice);
    paramIndex++;
  }

  if (maxPrice) {
    priceFilter += ` AND price_per_day <= $${paramIndex}`;
    params.push(maxPrice);
    paramIndex++;
  }

  const sortClause =
    sortBy === "price_asc"
      ? "ORDER BY price_per_day ASC"
      : sortBy === "price_desc"
        ? "ORDER BY price_per_day DESC"
        : "ORDER BY distance_km ASC";

  const query = `
    SELECT
      id, name, description, address, phone,
      price_per_day, is_active, image_url,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng,
      ROUND(
        (ST_Distance(
          location::geography,
          ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
        ) / 1000)::numeric, 2
      ) AS distance_km
    FROM rooms
    WHERE is_active = TRUE
    AND ST_DWithin(
      location::geography,
      ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
      $3
    )
    ${priceFilter}
    ${sortClause}
    LIMIT ${Number(limit) | 0}
  `;

  const { rows } = await pool.query(query, params);
  return rows;
};

const toggleRoomActive = async (ownerId, roomId) => {
  const { rows } = await pool.query(
    `UPDATE rooms SET is_active = NOT is_active
     WHERE id = $1 AND owner_id = $2
     RETURNING id, is_active`,
    [roomId, ownerId],
  );
  if (!rows[0]) throw new HttpError(404, "Room not found or unauthorized");
  return rows[0];
};

module.exports = {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  searchRooms,
  toggleRoomActive,
  getPublicId,
};
