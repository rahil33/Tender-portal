const authService = require('./service');
const { AuthResponseDTO } = require('./dto');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req.body, req);

      return res.status(201).json(
        new AuthResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      if (error.message.includes('already registered')) {
        return res.status(409).json(
          new AuthResponseDTO(false, error.message, null, [error.message])
        );
      }
      return res.status(400).json(
        new AuthResponseDTO(false, 'Failed to register user', null, [error.message])
      );
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password, req);

      return res.status(200).json(
        new AuthResponseDTO(result.success, result.message, result.data)
      );
    } catch (error) {
      if (error.message.includes('Invalid') || error.message.includes('deactivated')) {
        const status = error.message.includes('deactivated') ? 403 : 401;
        return res.status(status).json(
          new AuthResponseDTO(false, error.message, null, [error.message])
        );
      }
      return res.status(500).json(
        new AuthResponseDTO(false, 'Failed to login', null, [error.message])
      );
    }
  }

  async logout(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const result = await authService.logout(token);

      return res.status(200).json(
        new AuthResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(500).json(
        new AuthResponseDTO(false, 'Failed to logout', null, [error.message])
      );
    }
  }

  async getSessions(req, res) {
    try {
      const userId = req.user.id;
      const result = await authService.getSessions(userId);

      return res.status(200).json(
        new AuthResponseDTO(result.success, 'Sessions retrieved', result.data)
      );
    } catch (error) {
      return res.status(500).json(
        new AuthResponseDTO(false, 'Failed to get sessions', null, [error.message])
      );
    }
  }

  async revokeSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const result = await authService.revokeSession(sessionId, userId);

      return res.status(200).json(
        new AuthResponseDTO(result.success, result.message)
      );
    } catch (error) {
      return res.status(400).json(
        new AuthResponseDTO(false, 'Failed to revoke session', null, [error.message])
      );
    }
  }
}

module.exports = new AuthController();