# ReminderAPI

An API to store your reminders easily!

## API Documentation

[Reminders](#reminders)

[Subscription](#subscription)

[User](#user)

### Reminders

#### [GET] /api/reminders

Available queries: `page` and `limit`

Required header:
- [`Authorization`](#login)

Returns:
- 200 along with reminder information
- 401 if unauthorized

#### [POST] /api/reminders/add

Required header:
- [`Authorization`](#login)

Required body (JSON):
- `title` as string

Optional body (JSON):
- `description` as string
- `color` as hex code starting with #, for example: `#FFFFFF`
- `priority` the options are `low`, `medium`, and `high`
- `tags` as an array
- `sharedWith` as user's ID
- `time` as string

### Subscription



### User

#### [POST] /user/signup

Headers required:
- Body (JSON):
    - `username` a-z, A-Z, 0-9, 3-20 characters as string
    - `email` as string
    - `password` as string

Returns:
- 200 if user creation was successful along with `{ message: "User created successfully" }`
- 409 if user already exists

#### [POST] /user/login

Headers required:
- Body (JSON):
    - `user` either username or email as string
    - `password` as string

Returns:
- 200 if login was successful along with `{ userid, session }`
- 400 if required header(s) is/are missing
- 401 if username/email or password is invalid

#### [POST] /user/delete

WARNING: This will delete your account and your reminders

Headers required:
- [`Authorization`](#login)
- Body (JSON):
    - `password`

Returns:
- 200 if user has been successfully deleted
- 400 if required header(s) is/are missing
- 401 if password is incorrect or unauthorized