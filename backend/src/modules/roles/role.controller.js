const Role = require('./role.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Get all roles
const getRoles = async (req, res, next) => {
  try {
    const roles = await Role.find();
    return res.status(200).json(
      new ApiResponse(200, { roles }, 'Roles fetched successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Create a new role
const createRole = async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body;
    
    if (!name) {
      throw new ApiError(400, 'Role name is required');
    }

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      throw new ApiError(400, 'Role with this name already exists');
    }

    const role = await Role.create({
      name,
      description,
      permissions: permissions || []
    });

    return res.status(201).json(
      new ApiResponse(201, { role }, 'Role created successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Update a role
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;

    await role.save();

    return res.status(200).json(
      new ApiResponse(200, { role }, 'Role updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

// Delete a role
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);
    if (!role) {
      throw new ApiError(404, 'Role not found');
    }

    // Protect core roles from deletion
    if (['Super Admin', 'College Admin', 'Student', 'Faculty', 'Parent'].includes(role.name)) {
       throw new ApiError(403, 'Core roles cannot be deleted');
    }

    await Role.findByIdAndDelete(id);

    return res.status(200).json(
      new ApiResponse(200, null, 'Role deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRoles,
  createRole,
  updateRole,
  deleteRole
};
