const sha256 = require('sha256')

class SessionHandler {
  constructor () {
    this.sessions = Object()
    console.log('ntm')
  }

  // To generate a session ID
  generateSessionId (username) {
    let sessionId
    // To be sure we don't get an already in use session ID
    while (Object.keys(this.sessions).includes(sessionId) || !sessionId) {
      const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      sessionId = sha256(randomString)
    }
    this.sessions[sessionId] = username
    return sessionId
  }

  isAlreadyConnected (username) {
    console.log('connected?', username)
    for (const session of Object.keys(this.sessions)) {
      if (this.sessions[session] === username) {
        return true
      }
    }
    return false
  }

  getUsername (sessionId) {
    return this.sessions[sessionId]
  }

  destroySession (sessionId) {
    if (this.sessions[sessionId]) {
      delete this.sessions[sessionId]
    }
  }
}
module.exports = { SessionHandler }
