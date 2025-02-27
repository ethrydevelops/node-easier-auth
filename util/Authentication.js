const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto");

class Authentication {
    constructor(knex) {
        this.knex = knex;
    }

    /**
     * Registers a new user by hashing their password.
     *
     * @param {string} username The username of the new user.
     * @param {string} pwdUnhashed The plain text password to be hashed.
     * @returns {Promise<void>} A promise to be either resolved or throw an error on signup.
     *
     * @example
     * register("john_doe", "securePassword123")
     *   .then(() => console.log("User registered"))
     *   .catch(err => console.error(err));
     */
    async register(username, pwdUnhashed) {
        if(!this.knex) throw new Error("Knex hasn't been initiated in the AuthService class.");
        if(!username || !pwdUnhashed) throw new Error("Username and password must be provided");

        const uuid = uuidv4();
        const password = await bcrypt.hash(pwdUnhashed, 10);

        if(await this.userExists(username)) {
            throw new Error("User with this username already exists");
        }

        await this.knex("users").insert({
            uuid,
            username,
            password
        });
    }

    /**
     * Creates a login session for the account
     * 
     * @param {string} username Account username.
     * @param {string} password Password corresponding to username.
     * @returns {Promise<string | boolean>} A promise that resolves to a session token as a string if successful, or `false` if authentication fails.
     * 
     * @example
     * login("john_doe", "myPassword")
     *  .then((token) => console.log("Logged in! Your token is " + token))
     *  .catch((err) => console.error(err)); 
     */
    async login(username, password) {
        if(!this.knex) throw new Error("Knex hasn't been initiated in the AuthService class.");
        if(!username || !password) throw new Error("Username and password must be provided");

        const [user] = await this.knex("users")
            .select("uuid", "password")
            .where("username", username);

        // if no user is found, authentication fails
        if (!user) {
            return false;
        }

        const passwordMatches = await bcrypt.compare(password, user.password);
        if (!passwordMatches) {
            return false;
        }

        const uuid = user.uuid;

        // generate stuff
        const sid = crypto.randomBytes(8).toString("hex");
        const token = crypto.randomBytes(30).toString("hex");
        const tokenHash = await bcrypt.hash(token, 10); // store hashed token in DB

        // register session in the sessions table
        await this.knex("sessions").insert({
            session_id: sid,
            token: tokenHash,
            uuid
        });

        return `${sid}.${token}`;
    }

    /**
     * Verifies a login session
     * 
     * @param {string} tokenString Token string to verify (XXX.XXXXXXX)
     * @returns {Promise<boolean>} A promise that returns whether the session is valid
     * 
     * @example
     * verifyToken("XXX.XXXXX")
     *  .then((valid) => console.log(valid))
     *  .catch((err) => console.error(err))
     */
    async verifyToken(tokenString) {
        if(!this.knex) throw new Error("Knex hasn't been initiated in the AuthService class.");
        if(!tokenString) throw new Error("Token string must be provided");

        // split token string
        const [sid, tok] = tokenString.split(".");

        // verify session by matched sid
        const sidMatch = await this.knex("sessions")
            .where({session_id: sid})
            .first();
        
        if(!sidMatch) return false;

        const matchTokenHash = sidMatch.token;

        return Boolean(await bcrypt.compare(tok, matchTokenHash));
    }

    /**
     * Logout by session ID
     * 
     * @param {string} sid Session ID to be logged out
     * 
     * @example
     * logout("XXX")
     *  .then((success) => console.log(success))
     *  .catch((err) => console.error(err))
     */
    async logout(sid) {
        if(!this.knex) throw new Error("Knex hasn't been initiated in the AuthService class.");
        if(!sid) throw new Error("SID must be provided");

        const deletedRows = await this.knex("sessions").where({ session_id: sid }).del();
    }

    /**
     * Confirms if a user with a certain username exists
     * 
     * @param {string} username Username to check
     * @returns {Promise<boolean>} Whether the user exists or not
     * 
     * @example
     * (async () => {
     *  if(await userExists("john_doe")) {
     *      console.log("User exists!");
     *  } else {
     *      console.log("User does not exist.");
     *  }
     * })();
     */
    async userExists(username) {
        if(!this.knex) throw new Error("Knex hasn't been initiated in the AuthService class.");
        if(!username) throw new Error("Username must be provided");
        
        const exists = await this.knex("users")
            .where({ username })
            .first();

        return Boolean(exists);
    }
}

module.exports = Authentication;