# 🛡️ PassHub

A modern, secure, and user-friendly password manager built with **Next.js 15**, **TypeScript**, and cutting-edge cryptographic practices. This project emphasizes client-side encryption, ensuring maximum security through a zero-knowledge architecture.

---

## 🌟 Features

- **Client-Side Encryption**: All sensitive data is encrypted and decrypted on the client, ensuring your data is never exposed to the server in plaintext.
- **Advanced Cryptography**:
  - Key derivation using **PBKDF2** and **HKDF**.
  - Data encryption with **AES-GCM**, ensuring both confidentiality and integrity.
- **User Authentication**:
  - Secure login and registration powered by JWTs.
  - Middleware to protect authenticated routes.
- **Responsive Design**: Built with **TailwindCSS** for a beautiful and responsive user interface.
- **Type Safety**: Developed with **TypeScript** for reliable and predictable code.
- **Data Validation**: Input validation using **Zod** to ensure robust security against malformed or malicious input.
- **Scalable Structure**: Organized folder structure for easy scalability and maintenance.

---

## 🚀 Tech Stack

| **Technology**       | **Purpose**                                  |
|-----------------------|----------------------------------------------|
| **Next.js 15**        | Frontend framework with App Router support. |
| **TypeScript**        | Ensures type safety and reduces runtime errors. |
| **TailwindCSS**       | Utility-first CSS framework for responsive UI. |
| **Zod**               | Runtime validation and schema declaration.  |
| **Web Crypto API**    | Native browser API for secure cryptography. |

---

## 📂 Project Structure

```typescript
app/
├── (auth)/             # Authentication routes
│   ├── login/page.tsx  # Login page
│   └── register/page.tsx  # Registration page
├── dashboard/page.tsx  # User dashboard (vault management)
├── layout.tsx          # Global layout
├── globals.css         # TailwindCSS setup
└── page.tsx            # Landing page
components/
├── ui/                 # Shared UI components
├── Header.tsx          # App header
├── VaultFetcher.tsx    # Fetches and displays encrypted vault
└── VaultUploader.tsx   # Handles vault updates
lib/
├── api.ts              # API interaction functions
├── crypto.ts           # Cryptographic functions
└── utils.ts            # Utility functions
types/
├── auth.ts             # Type definitions for auth-related data
├── vaultItem.ts        # Type definitions for vault items
middleware.ts           # Protects authenticated routes
```

🔐 Security Architecture
Zero-Knowledge Encryption:

All encryption and decryption processes occur on the client side.
The server only stores encrypted data and cannot access sensitive information.
Key Derivation:

PBKDF2 is used to derive the master key from the user’s email and password.
HKDF is applied to generate a stretched key suitable for AES-GCM encryption.
Data Encryption:

AES-GCM provides confidentiality and ensures data integrity through authentication tags.
Each encryption operation uses a random initialization vector (IV) to prevent key reuse attacks.
Input Validation:

Zod ensures that all user input conforms to predefined schemas, preventing injection attacks and malformed data.
🛠️ Installation and Setup
Clone the repository:
git clone https://github.com/your-username/nextjs-password-manager.git
cd nextjs-password-manager
Install dependencies:
npm install
Set up environment variables: Create a .env.local file and configure the following:
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url
JWT_SECRET=your-secret-key
Run the development server:
npm run dev

Build for production:
npm run build
npm start
📖 Usage
Registering an Account
Navigate to /register.
Provide your email and create a secure password.
Your password is used to derive a cryptographic key for vault encryption.
Managing Your Vault
Log in to access your dashboard.
Add, update, or delete vault entries.
All changes are encrypted on the client before being sent to the server.
Logout
Logout securely by invalidating your session.
🧑‍💻 Development Notes
API Endpoints:
/api/auth/login - User authentication.
/api/auth/register - User registration.
/api/vault - Fetch and update encrypted vault data.
Middleware: Ensures only authenticated users can access the dashboard and vault-related routes.
🛡️ Best Practices
Always handle sensitive operations, such as encryption, on the client side.
Use HTTPS to secure communication between the client and server.
Regularly update dependencies to patch potential vulnerabilities.
📈 Future Enhancements
Browser Extension: Integrate with browsers for autofilling credentials.
Secure Password Generator: Add a password generator with customizable options.
Mobile App: Extend functionality to iOS and Android platforms.
Multi-Factor Authentication (MFA): Enhance account security with MFA.
🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository.
Create a feature branch:
git checkout -b feature-name
Commit your changes:
git commit -m "Add feature-name"
Push to your branch:
git push origin feature-name
Open a pull request.
📄 License
This project is licensed under the MIT License. See the LICENSE file for details.

📬 Contact
For questions, feedback, or support, feel free to contact:

Email: fullstacksimon@gmail.com  
GitHub: FullStackSimonIO
Start managing your passwords securely with this modern and robust password manager!

