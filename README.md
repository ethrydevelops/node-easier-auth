# easier-auth

```
CREATE TABLE users (
    uuid CHAR(36) PRIMARY KEY,  -- UUID (RFC 9562 format)
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL  -- Store hashed passwords
);

CREATE TABLE sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    token VARCHAR(80) NOT NULL UNIQUE,
    uuid CHAR(36) NOT NULL,
    FOREIGN KEY (uuid) REFERENCES Users(uuid) ON DELETE CASCADE
);
```

```
    const AuthService = require("easier-auth");

    const auth = new AuthService(knex);

    async function registerAccount(user, pass) {
        return await register(user, pass);
    }
```