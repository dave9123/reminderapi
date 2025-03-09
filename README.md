# ReminderAPI

An API to store your reminders easily!

## API Documentation

- [Reminders](#reminders)
- [Subscription](#subscription)
- [User](#user)

### Reminders

Note:
- * means that it's required
- Set Authorization header to `Bearer (your token)`

#### [GET] /api/reminders

Get a list of reminder(s)

Header(s):
- `Authorization`*
- Queries:
    - `page`
    - `limit`

Returns:
- 200 along with reminder information paginated
- 401 if unauthorized

#### [POST] /api/reminders/add

Adds a reminder

Header(s):
- `Authorization`*
- Body (JSON):
    - `title`*
    - `description`
    - `color` as hex code starting with #, for example: `#FFFFFF`
    - `priority` the options are `low`, `medium`, and `high`
    - `tags` as an array
    - `sharedWith` as user's ID
    - `time` as string

#### [POST] /api/reminders/modify/:id

You won't be able to modify it if you do not own it.

Header(s):
- `Authorization`*
- Body (JSON):
    - `title` as string
    - `description` as string
    - `color` as hex code starting with #, for example: `#FFFFFF`
    - `priority` the options are `low`, `medium`, and `high`
    - `tags` as an array
    - `sharedWith` as user's ID
    - `time` as string

Returns:
- 200 if modifying was successful
- 400 if there's a problem with your desired modifications
- 401 if unauthorized

#### [DELETE] /api/reminders/delete/:id

Deletes a reminder. This will remove you from `sharedWith` if you don't own it.

Header(s):
- `Authorization`*

Returns:
- 200 if deletion or removing you from `sharedWith` array was successful
- 401 if you're unauthorized

### Subscription

#### [GET] /api/subscription

Get the list of subscription(s)

Header(s):
- `Authorization`*
- Queries:
    - page
    - limit

Returns:
- 200 along with subscription list paginated
- 401 if unauthorized

#### [POST] /api/subscription/edit

Change `getSharedWith` trigger (to receive reminder(s) shared with you)

Header(s):
- `Authorization`*
- Body (JSON):
    - `type`* available options: discord-webhook, slack-webhook
    - `target`* the URL to the webhook
    - `getSharedWith`* get triggers for reminder(s) shared with you


#### [POST] /api/subscription/add

Adds a subscription for reminders that has the time information attached to it

Header(s):
- `Authorization`*
- Body (JSON):
    - `type`* available options: discord-webhook, slack-webhook
    - `target`* the URL to the webhook
    - `getSharedWith`* get triggers for reminder(s) shared with you

Returns:
- 200 if subscribing was successful
- 401 if unauthorized

#### [DELETE] /api/subscription/remove

Remove a subscription

Header(s):
- `Authorization`*
- Body (JSON):
    - `type`*
    - `target`*

Returns:
- 200 if unsubscribing was successful
- 401 if unauthorized

### User

#### [POST] /api/user/signup

Creating an account

Header(s):
- Body (JSON):
    - `username`* a-z, A-Z, 0-9, 3-20 characters as string
    - `email`* as string
    - `password`* as string

Returns:
- 200 if user creation was successful along
- 409 if user already exists

#### [POST] /api/user/login

Header(s):
- Body (JSON):
    - `user`* either username or email
    - `password`*

Returns:
- 200 if login was successful along with `{ userid, session }`, put the session as Bearer Token Authentication
- 400 if required header(s) is/are missing
- 401 if username/email or password is invalid

#### [POST] /api/user/logout

Header(s):
- `Authorization`*

Returns:
- 200 if logout was successful along with `{ message: "User logged out successfully" }`
- 401 if unauthorized

#### [DELETE] /api/user/delete

Delete your account and your reminders

Header(s):
- `Authorization`*
- Body (JSON):
    - `password`*

Returns:
- 200 if user has been successfully deleted
- 400 if required header(s) is/are missing
- 401 if password is incorrect or unauthorized

#### [GET] /api/user/sessions

Get a list of your account's sessions.

Header(s):
- `Authorization`*

Returns:
- 200 along with session list paginated
- 401 if unauthorized

#### [DELETE] /api/user/session/delete

Invalidate a session token.

Header(s):
- `Authorization`*
- Body (JSON):
    - `password`*