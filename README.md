# easier-auth
Authentication shouldn't be difficult. Add secure authentication to your site in under 10 lines.

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

### Installation Steps

1. Install easier-auth with your preferred package manager.
```bash
npm i easier-auth
```

2. You can now import easier-auth with some example code:

```js
const AuthService = require("easier-auth");

const auth = new AuthService(knex);

async function registerAccount(user, pass) {
    // your validation ...
    return await register(user, pass);
}
```

3. You may also want to use easier-auth for authentication on your API in Express. You can do this with:
```js
// Authenticate with Authorization: Bearer header:
app.use(auth.express_middleware.bind(auth))

// or you could enforce it per-route:
app.get('/protected', auth.express_middleware.bind(auth), (req, res) => {
    console.log(req.eauth.user); // <-- user info: id, username, provided token
    // authenticated! (...)
});
```