const pool = require("../../config/db");

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

  const { rows } = await pool.query(
    `UPDATE rooms
     SET name = $1,
         description = $2,
         address = $3,
         phone = $4,
         price_per_day = $5,
         location = CASE
           WHEN $6::float IS NOT NULL AND $7::float IS NOT NULL
           THEN ST_SetSRID(ST_MakePoint($7, $6), 4326)
           ELSE location
         END
     WHERE id = $8 AND owner_id = $9
     RETURNING id, name, description, address, phone, price_per_day, is_active`,
    [
      name,
      description,
      address,
      phone,
      price_per_day,
      lat,
      lng,
      roomId,
      ownerId,
    ],
  );
  return rows[0];
};

const deleteRoom = async (ownerId, roomId) => {
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

module.exports = {
  createRoom,
  getRoomById,
  updateRoom,
  deleteRoom,
  getOwnerRooms,
  searchRooms,
};
