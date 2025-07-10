<p align="center">
  <img width="128" height="128" alt="logo" src="https://github.com/user-attachments/assets/19a7c4cd-2296-4d04-8f3e-0a20b75da8c4" alt="Basic Auth Logo" />
</p>

# Basic Auth

A Next.js application that provides a secure, extensible and ready-to-use auth solution, implemented from scratch. It includes features like role-based access control, two-factor authentication, OAuth integration, and more - with a strong emphasis on security and best practices.

## Features

### Authentication & Session Management

- **Credential-based Login**: Standard email and password authentication
- **OAuth 2.0**: Integration with major providers (Google, GitHub, Discord)
- **Sign Up**: User registration with mandatory email verification
- **Secure Session Management**: Secure, cookie-based session handling. Automatically checks session status on tab visibility or before expiration to ensure a seamless user experience
- **Log Out Everywhere**: Invalidate all active sessions for a user

### Authorization

- **Protected Routes**: Middleware to protect pages and API routes based on authentication status
- **Role-Based Access Control (RBAC)**: Differentiate user roles (e.g., `user` vs. `admin`) and restrict access to specific resources, like the [admin page](src/app/admin/page.tsx)

### Security

- **Low Entropy Data Hashing**: Uses **Argon2**, a modern secure hashing algorithm, to protect user passwords and recovery codes
- **Token Hashing**: All sensitive tokens (email verification etc) are hashed in the database using **HMAC-SHA256** to prevent takeover even if the database is compromised
- **Data Encryption**: Sensitive data is encrypted at rest using **AES-256-GCM** via the Node.js `crypto` module, as seen in [`crypto.ts`](src/auth/crypto.ts)
- **Pepper**: A secret key (pepper) is added to data before hashing, providing an additional layer of security against dictionary and rainbow table attacks, even in the event of a database breach
- **Email verification**: Ensures users own their email address by sending a unique, short-lived verification link, preventing account creation with invalid or unauthorized emails
- **Database Security**:
  - **Prepared Statements**: Frequent database queries are executed using Drizzle ORM's `prepare` method, to boost performance
  - **Transactions**: Critical multi-step database operations are wrapped in transactions to ensure data integrity and atomicity
- **Two-Factor Authentication (2FA)**:
  - Time-based One-Time Password (TOTP) setup via QR code, powered by `otpauth`
  - Support for backup recovery codes
  - Available for users with password
- **Type-Safe Environment Variables**: Utilizes `T3 Env` to ensure type-safety and validate environment variables at build time
- and more preventive measures in case of attacks such as XSS, CSRF, SQL injection, enumeration, timing

### User Experience

- **Responsive Design**: Built with **Tailwind CSS** for a fully responsive experience across all devices
- **Toast Notifications**: Uses **Sonner** to provide non-intrusive, real-time feedback for user actions
- **Modern Email Templates**: Emails are built with **React Email**, ensuring they are responsive and compatible with a wide range of email clients

## Technologies Used

- **Framework**: [Next.js](https://nextjs.org/) (App Router) & [React.js](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Geist](https://vercel.com/font) font
- **Database & ORM**:
  - [Drizzle ORM](https://orm.drizzle.team/): Modern TypeScript ORM
  - [@neondatabase/serverless](https://github.com/neondatabase/serverless): Serverless driver for PostgreSQL
- **Authentication & Cryptography**:
  - [Argon2](https://www.npmjs.com/package/argon2): Hashing
  - [otpauth](https://www.npmjs.com/package/otpauth): 2FA (TOTP) logic
  - [qrcode](https://www.npmjs.com/package/qrcode): Generate QR codes for 2FA setup
- **Email**:
  - [Resend](https://resend.com/): Email sending service
  - [React Email](https://react.email/): Build email templates with React components
- **Validation & Tooling**:
  - [Zod](https://zod.dev/): Schema declaration and validation
  - [T3 Env](https://env.t3.gg/): Type-safe environment variables
  - [Sonner](https://sonner.emilkowal.ski/): Toast notifications
