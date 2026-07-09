/**
 * DTOs - Data Transfer Objects for Auth Module
 */

class AuthResponseDTO {
  constructor(success, message, data = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data) this.data = data;
    if (errors) this.errors = errors;
    this.timestamp = new Date();
  }
}

class UserDTO {
  constructor(data) {
    this.id = data._id;
    this.fullName = data.fullName;
    this.companyName = data.companyName;
    this.phone = data.phone;
    this.email = data.email;
    this.role = data.role;
  }
}

class SessionDTO {
  constructor(data) {
    this.id = data._id;
    this.userId = data.userId;
    this.deviceInfo = data.deviceInfo;
    this.ipAddress = data.ipAddress;
    this.isActive = data.isActive;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

class RegisterDTO {
  constructor(data) {
    this.user = new UserDTO(data.user);
    this.token = data.token;
  }
}

class LoginDTO {
  constructor(data) {
    this.token = data.token;
    this.user = new UserDTO(data.user);
  }
}

module.exports = {
  AuthResponseDTO,
  UserDTO,
  SessionDTO,
  RegisterDTO,
  LoginDTO,
};