const jwt = require('jsonwebtoken');
const models = require('../models/models');

const JWT_SECRET = '2343434asaflajsdfkljalsibkei'; // Hardcoded JWT secret

exports.signup = (req, res) => {
  const { firstName, lastName, email, password, role, bu, transport } = req.body;
  const token = jwt.sign({ email }, JWT_SECRET);

  models.insertUser(firstName, lastName, email, password, role, bu, transport, (err, result) => {
    if (err) {
      console.error("Error inserting user:", err.message);
      return res.status(500).json({ error: 'Error inserting data into the database' });
    }
    res.status(201).json({ message: 'Data inserted successfully', token });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  models.findUserByEmailAndPassword(email, password, (err, rows) => {
    if (err) {
      console.error('Error fetching user data:', err.message);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const newToken = jwt.sign({ email: user.email }, JWT_SECRET);
    res.status(200).json({ message: 'Login successful', token: newToken, role: user.role });
  });
};

exports.getBu = async (req, res) => {
  try {
    const Bu = await models.getBu();
    if (Bu.length === 0) {
      return res.status(404).json({ message: 'Bu not found' });
    }
    res.status(200).json(Bu);
    console.log(Bu);
  } catch (err) {
    console.error('Error fetching Bunames:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getAllocatedSetsAdmin = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocatedSetsAdmin();
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
    console.log(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getSeatingCapacityAdmin = async (req, res) => {
  try {
    const getCapacity = await models.getSeatingCapacityAdmin();
    if (getCapacity.length === 0) {
      return res.status(404).json({ message: 'getCapacity not found' });
    }
    res.status(200).json(getCapacity);
    console.log(getCapacity);
  } catch (err) {
    console.error('Error fetching getCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.postSeatingCapacityAdmin = async (req, res) => {
  const requestBody = req.body;
  try {
    const createCapacityMsg = await models.createSeatingCapacityAdmin(requestBody);
    res.status(200).json({ msg: 'created succesfully' });
    console.log(createCapacityMsg);
  } catch (err) {
    console.error('Error fetching createCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateSeatingCapacityAdmin = async (req, res) => {
  const id = req.params.id;
  const { capacity } = req.body
  try {
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const updateCapacityMsg = await models.updateSeatingCapacityAdmin(id, capacity);
    res.status(200).json({ msg: 'updated succesfully' });
    console.log(updateCapacityMsg);
  } catch (err) {
    console.error('Error fetching update Capacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.deleteSeatingCapacityAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    if (!id) {
      return res.status(400).json({ error: 'Missing id' });
    }
    const deleteCapacityMsg = await models.deleteSeatingCapacityAdmin(id);
    res.status(200).json({ msg: 'deleted succesfully' });
    console.log(deleteCapacityMsg);
  } catch (err) {
    console.error('Error fetching delete Capacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.createAllocatedSetsAdmin = async (req, res) => {
  console.log(req.body)
  const requestBody = req.body;
  try {
    const createCapacityMsg = await models.createAllocatedSetsAdmin(requestBody);
    res.status(200).json({ msg: 'created succesfully' });
    console.log(createCapacityMsg);
  } catch (err) {
    console.error('Error fetching createCapacity:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getSeatingCapacityAdminByFilter = async (req, res) => {
  try {
    const { country, city, state, floor } = req.query
    const values = [country, state, city, parseInt(floor)]
    const allocatedSeats = await models.getSeatingCapacityAdminByFilter(values);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
    console.log(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getHOEFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);

  try {
    const result = await models.getHOEFromTable(id);
    if (result.length === 0) {
      return res.status(404).json({ message: 'HOE not found' });
    }
    res.status(200).json(result);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching HOE:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getManagersByHOEIdFromTable = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const {campus, floor} = req.query;

  try {
    const result = await models.getManagersByHOEIdFromTable(id, campus, floor);
    if (result.length === 0) {
      return res.status(404).json({ message: 'Managers not found' });
    }
    res.status(200).json(result);
    //console.log(hoe);
  } catch (err) {
    console.error('Error fetching Managers:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateManagerData = async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { seats } = req.body;

  try {
    const result = await models.updateManagerData(id, seats);
    res.status(200).json({ message: 'Manager data updated successfully', result });
  } catch (err) {
    console.error('Error updating manager data:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getAllocationForAdminMatrix = async (req, res) => {
  try {
    const allocatedSeats = await models.getAllocationForAdminMatrix(req);
    if (allocatedSeats.length === 0) {
      return res.status(404).json({ message: 'allocatedSeats not found' });
    }
    res.status(200).json(allocatedSeats);
  } catch (err) {
    console.error('Error fetching allocatedSeats:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}