const pool = require("../../config/db");
const { cloudinary } = require("../../config/upload");

const getPublicId = (url) => {
  // extract public_id from cloudinary URL
  // URL format: https://res.cloudinary.com/cloud/image/upload/v123/practice-space/rooms/filename.jpg
  const parts = url.split("/");
  const filename = parts[parts.length - 1].split(".")[0];
  return `practice-space/rooms/${filename}`;
};

const createRoom = async (
  ownerId,
  { name, description, address, lat, lng, phone, price_per_day, image_url },
) => {
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);

  if (isNaN(parsedLat) || isNaN(parsedLng))
    throw new Error("Invalid coordinates");

  const { rows } = await pool.query(
    `INSERT INTO rooms (owner_id, name, description, address, location, phone, price_per_day, image_url)
     VALUES ($1, $2, $3, $4, ST_SetSRID(ST_MakePoint($5, $6), 4326), $7, $8, $9)
     RETURNING id, name, description, address, phone, price_per_day, is_active, image_url, created_at`,
    [
      ownerId,
      name,
      description,
      address,
      parsedLng,
      parsedLat,
      phone,
      price_per_day,
      image_url || [],
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
  if (!rows[0]) throw new Error("Room not found");
  return rows[0];
};

const updateRoom = async (ownerId, roomId, updates) => {
  // check room belongs to this owner
  const { rows: existing } = await pool.query(
    "SELECT * FROM rooms WHERE id = $1 AND owner_id = $2",
    [roomId, ownerId],
  );
  if (!existing[0]) throw new Error("Room not found or unauthorized");

  const current = existing[0];
  // use incoming value if provided, otherwise keep existing value
  const name = updates.name ?? current.name;
  const description = updates.description ?? current.description;
  const address = updates.address ?? current.address;
  const phone = updates.phone ?? current.phone;
  const price_per_day = updates.price_per_day ?? current.price_per_day;
  // for location, only update if both lat and lng are provided
  const lat = updates.lat ?? null;
  const lng = updates.lng ?? null;

  // handle image array update
  let imageUrls = current.image_url || [];

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

    // only proceed if there are actually indices to remove
    if (removedIndices.length > 0) {
      const urlsToDelete = imageUrls.filter((_, i) =>
        removedIndices.includes(i),
      );

      await Promise.all(
        urlsToDelete.map((url) =>
          cloudinary.uploader
            .destroy(getPublicId(url))
            .catch((err) => console.log("cloudinary delete failed:", err)),
        ),
      );

      imageUrls = imageUrls.filter((_, i) => !removedIndices.includes(i));
    }
  }

  // append new images
  if (updates.newImageUrls && updates.newImageUrls.length > 0) {
    imageUrls = [...imageUrls, ...updates.newImageUrls];
  }

  // cap at 3
  imageUrls = imageUrls.slice(0, 3);

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
      name,
      description,
      address,
      phone,
      price_per_day,
      imageUrls,
      lat,
      lng,
      roomId,
      ownerId,
    ],
  );
  return rows[0];
};

const deleteRoom = async (ownerId, roomId) => {
  const { rows: existing } = await pool.query(
    "SELECT image_url FROM rooms WHERE id = $1 AND owner_id = $2",
    [roomId, ownerId],
  );
  if (!existing[0]) throw new Error("Room not found or unauthorized");

  // delete all room images from cloudinary
  await Promise.all(
    (existing[0].image_url || []).map((url) =>
      cloudinary.uploader
        .destroy(getPublicId(url))
        .catch((err) => console.log("Cloudinary delete failed:", err)),
    ),
  );

  const { rows } = await pool.query(
    "DELETE FROM rooms WHERE id = $1 AND owner_id = $2 RETURNING id",
    [roomId, ownerId],
  );
  if (!rows[0]) throw new Error("Room not found or unauthorized");
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
  if (!rows[0]) throw new Error("Room not found or unauthorized");
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
