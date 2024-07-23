const pool = require('./db');

const insertUser = (firstName, lastName, email, password, role, bu, transport, callback) => {
  const sql = "INSERT INTO users (first_name, last_name, email, password, bu, transport, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *";
  const values = [firstName, lastName, email, password, bu, transport, role];
  pool.query(sql, values, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows[0]);
  });
};

const findUserByEmailAndPassword = (email, password, callback) => {
  const sql = 'SELECT * FROM users WHERE email = $1 AND password = $2';
  const values = [email, password];
  pool.query(sql, values, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    return callback(null, result.rows);
  });
};

const getBu=async()=>{
    const query = 'SELECT * FROM business_unit';
    const values = [];
  
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
  }

const getAllocatedSetsAdmin=async()=>{
    const query = 'SELECT * FROM seat_allocation';
    const values = [];
  
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const getSeatingCapacityAdmin=async()=>{
    const query = 'SELECT * FROM seating_capacity';
    const values = [];
  
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const createSeatingCapacityAdmin=async(body)=>{
  const {country,state,city,floor,capacity,campus}=body
  const values= [country,state,city,campus,parseInt(floor),parseInt(capacity)]
  const query = 'INSERT INTO seating_capacity (country,state,city,campus,floor,capacity) VALUES ($1, $2, $3,$4,$5,$6);';
  //  return values
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const updateSeatingCapacityAdmin=async(id,capacity)=>{ 
  const query = `
  UPDATE seating_capacity
  SET capacity = $1
  WHERE id = $2;
`;
  const values = [parseInt(capacity), id]; 
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const deleteSeatingCapacityAdmin=async(id)=>{ 
  const query = `
  DELETE FROM seating_capacity
  WHERE id = $1
`;
const values = [id];

try {
  const res = await pool.query(query, values);
  return res;
} catch (error) {
  console.error('Error executing query:', error);
  throw error;
}
}

const createAllocatedSetsAdmin=async(body)=>{
  const {country,state,city,campus,floor,bu,seats}=body
  const values= [country,state,city,campus,parseInt(floor),bu,seats,seats.length>0?seats.length:0] 
  const query = 'INSERT INTO seat_allocation (country,state,city,campus,floor,bu_id,seats,total) VALUES ($1, $2, $3,$4,$5,$6,$7::int[],$8);';
    try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const getSeatingCapacityAdminByFilter=async(values)=>{ 
  const query = `SELECT SUM(capacity) FROM seating_capacity where country=$1 and state=$2 and city=$3 and floor=$4`;
     try {
      const { rows } = await pool.query(query, values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}

const getHOEFromTable = async (id) => {
  const sql = `SELECT t1.id, t1.name, t1.manager, t1.role, t2.country, t2.state, t2.city, t2.campus, t2.floor, t2.total, t2.seats
            FROM business_unit AS t1
            INNER JOIN seat_allocation AS t2
            ON t1.id = t2.bu_id
            WHERE t1.id = $1`;
  const values = [id];

  try {
    const { rows } = await pool.query(sql, values);
    //console.log(rows);
    return rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
};

const getManagersByHOEIdFromTable = async (id, campus, floor) => {
  const sql = 'SELECT * FROM manager_allocation WHERE hoe_id = $1 AND campus = $2 AND floor = $3 ORDER BY seats_array[1]';
  const values = [id, campus, floor];

  try {
    const { rows } = await pool.query(sql, values);
    //console.log(rows);
    return rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
};

const updateManagerData = async (id, seats) => {
  const sql = 'UPDATE manager_allocation SET seats_array = $1 WHERE id = $2';
  const values = [seats, id];

  try {
    const result = await pool.query(sql, values);
    return result;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
};
const getQuery=(type,whereClause)=>{
 let query=""
  if(type=="country"){
   query = ` SELECT country,SUM(total) as allocated FROM seat_allocation ${whereClause}  GROUP BY country`
  }else if(type=="state"){
   query = ` SELECT country,state,SUM(total) as allocated FROM seat_allocation ${whereClause}  GROUP BY country, state`
  }else if(type=="city"){
     query = ` SELECT country,state,city,SUM(total) as allocated FROM seat_allocation ${whereClause}  GROUP BY country, state,city`;
  }else if(type=="floor"){
     query = ` SELECT country,state,city,floor,SUM(total) as allocated FROM seat_allocation ${whereClause}  GROUP BY country, state,city,floor`;
  }
  return query;
}
const getQueryCapacity=(type,whereClause)=>{
  let query=""
  if(type=="country"){
    query = ` SELECT country,SUM(capacity) as total FROM seating_capacity ${whereClause}  GROUP BY country`;
  }else if(type=="state"){
    query = ` SELECT country,state,SUM(capacity) as total FROM seating_capacity ${whereClause}  GROUP BY country, state`;

  }else if(type=="city"){
    query = ` SELECT country,state,city,SUM(capacity) as total FROM seating_capacity ${whereClause}  GROUP BY country, state,city`;

  }else if(type=="floor"){
    query = ` SELECT country,state,city,floor,SUM(capacity) as total FROM seating_capacity ${whereClause}  GROUP BY country, state,city,floor`;

  }
  return query;
}
const getAllocatedCount=async(values,whereClause,type)=>{
  const query=getQuery(type,whereClause)
     try {
      const { rows } = await pool.query(query,values);
      console.log(rows)
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}
const getCapacity=async(values,whereClause,type)=>{
  const query=getQueryCapacity(type,whereClause);
  if(whereClause==""){
    values=[]
  }
     try {
      const { rows } = await pool.query(query,values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}
const mergeArrays=(array1, array2, key)=> {
  let merged = {};
  // Merge array1 into merged object
  array1.forEach(item => {
      merged[item[key]] = { ...merged[item[key]], ...item };
  });
  // Merge array2 into merged object
  array2.forEach(item => {
    let obj={...item,unallocated:merged[item[key]].total-item.allocated} 
      merged[item[key]] = { ...merged[item[key]], ...obj };
  });
  // Convert merged object back to array
  let mergedArray = Object.values(merged);

  return mergedArray;
}
const getAllocationForAdminMatrix=async(req)=>{ 
const { country, state, city, floor,type } = req.query;
let values = [];
let whereConditions = [];
let index = 1;
if (country) {
  values.push(country);
  whereConditions.push(`country = $${index}`);
  index++;
}
if (state) {
  values.push(state);
  whereConditions.push(`state = $${index}`);
  index++;
}
if (city) {
  values.push(city);
  whereConditions.push(`city = $${index}`);
  index++;
}
if (floor) {
  values.push(parseInt(floor, 10));
  whereConditions.push(`floor = $${index}`);
  index++;
} 
const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
const allocatedCount = await getAllocatedCount(values,whereClause,type);
const totalCapacity = await getCapacity(values,whereClause,type);
let mergedArray = mergeArrays(totalCapacity, allocatedCount, type);
return mergedArray;
}
const getHOETotalAllocatedQuery=async()=>{
    const sql = `select bu_id,SUM(total) as total from seat_allocation WHERE bu_id = $1 group by bu_id`;
    return sql;
}
const getHOETotalAllocatedCount=async(buId)=>{
  let values = [buId];
  const query=await getHOETotalAllocatedQuery()
     try {
      const { rows } = await pool.query(query,values);
      return rows;
    } catch (err) {
      console.error('Error executing query', err);
      throw err;
    }
}
const getHOEManagerAllocatedQuery=async(whereClause)=>{
  const sql = `select hoe_id as bu_id,business_unit, SUM(array_length(seats_array, 1)) AS allocated  from manager_allocation ${whereClause} group by hoe_id,business_unit`;
  return sql;
}
const getHOEManagerAllocatedCount=async(whereClause,values)=>{
const query=await getHOEManagerAllocatedQuery(whereClause); 
   try {
    const { rows } = await pool.query(query,values);
    return rows;
  } catch (err) {
    console.error('Error executing query', err);
    throw err;
  }
}

const getAllocationForHOEMatrix=async(req)=>{ 
  const { manager_id,bu_id } = req.query;
  let values = [bu_id];
  let index = 1;
  let whereConditions = [`hoe_id = $${index}`];
  // if (manager_id) {
  //   index++;
  //   values.push(manager_id);
  //   whereConditions.push(`id = $${index}`);
  // } 
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  const allocatedCount = await getHOETotalAllocatedCount(bu_id);
  const managersCount = await getHOEManagerAllocatedCount(whereClause,values);
  let mergedArray = mergeArrays(allocatedCount,managersCount, "bu_id");
  return mergedArray;
  }

module.exports = {
  insertUser,
  findUserByEmailAndPassword,
  getBu,
  getAllocatedSetsAdmin,
  getSeatingCapacityAdminByFilter,
  createAllocatedSetsAdmin,
  deleteSeatingCapacityAdmin,
  updateSeatingCapacityAdmin,
  createSeatingCapacityAdmin,
  getSeatingCapacityAdmin,
  getHOEFromTable, 
  getManagersByHOEIdFromTable, 
  updateManagerData,
  getAllocationForAdminMatrix,
  getAllocationForHOEMatrix
};

