# easier-auth
Authentication shouldn't be difficult. Add secure authentication to your site in under 10 lines.

Passwords are automatically hashed with bcrypt. Easier-auth also includes an Express middleware to validate routes easily.

## Installation

### Prerequisites:

* You will need to have a [Knex](https://knexjs.org/guide/) and a database (preferably MySQL/MariaDB).

* In your database, you will also need a `users` table and a `sessions` table. You can add these with the below SQL: *(A CLI setup may be implemented/provided later.)*
```sql 
CREATE TABLE users (
    uuid CHAR(36) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE sessions (
    session_id VARCHAR(100) PRIMARY KEY,
    token VARCHAR(80) NOT NULL UNIQUE,
    uuid CHAR(36) NOT NULL,
    FOREIGN KEY (uuid) REFERENCES Users(uuid) ON DELETE CASCADE
);
```

### Installation Steps & Examples

1. Install easier-auth with your preferred package manager.
```bash
npm i easier-auth
```

2. **It has now been installed!** You can now import easier-auth with some example code:

```js
const AuthService = require("easier-auth");

const auth = new AuthService(knex); // knex should be your knex instance

async function registerAccount(user, pass) {
    // your validation ...
    return await auth.register(user, pass);
}

async function loginToAccount(user, pass) {
    const token = await auth.login(user, pass); 

    // send to client (...)
    // you can also logout with auth.logout(token.split(".")[0])
}
```

3. You may also want to use easier-auth for authentication on your API in Express. You can do this with:
    * Authenticate all routes:
    ```js
    // Authenticate with Authorization: Bearer header:
    app.use(auth.express_middleware.bind(auth))
    ```

    * Or apply it per-route:
    ```js
    app.get('/protected', auth.express_middleware.bind(auth), (req, res) => {
        console.log(req.eauth.user); // <-- access authenticated user info: id, username, provided token

        // authenticated! (...)
    });
    ```

4. Token hashing is included by default. **If you find that logging in or verifying tokens is too slow,** you may want to disable hashing. You can do this with the code below.

    This should shave off ~200ms of time during token verification, although it might be less secure:

    ```js
    const auth = new AuthService(knex, false); // `false` disables token hashing
    ```
    All sessions logged in will break if hashing is toggled.