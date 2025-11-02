# Security Policy

## 🔒 Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

## 🐛 Reporting a Vulnerability

We take the security of CurisJS seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please DO NOT:
- Open a public GitHub issue for security vulnerabilities
- Disclose the vulnerability publicly before it has been addressed

### Please DO:
1. **Email:** Send details to amer.mo2377@outlook.com
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)
3. **Response Time:** You can expect an initial response within 48 hours

### What to Expect:
1. **Acknowledgment:** We'll acknowledge receipt of your report
2. **Investigation:** We'll investigate and validate the issue
3. **Fix:** We'll develop and test a fix
4. **Release:** We'll release a security patch
5. **Credit:** We'll credit you in the security advisory (unless you prefer to remain anonymous)

## 🛡️ Security Best Practices

When using CurisJS in production:

### Input Validation
- Always validate and sanitize user input
- Use the built-in validation system
- Never trust client-side data

### Authentication & Authorization
- Implement proper authentication middleware
- Use secure session management
- Validate permissions for protected routes

### Error Handling
- Don't expose sensitive information in error messages
- Use custom error handlers
- Log errors securely

### Dependencies
- Keep dependencies up to date
- Regularly run `pnpm audit`
- Review security advisories

### Environment Variables
- Never commit `.env` files
- Use secure key management
- Rotate secrets regularly

### CORS Configuration
- Configure CORS properly for your use case
- Don't use `origin: '*'` in production
- Validate origin headers

### Rate Limiting
- Implement rate limiting for public APIs
- Protect against DDoS attacks
- Monitor unusual traffic patterns

## 🔍 Security Checklist for Production

- [ ] All dependencies are up to date
- [ ] Environment variables are properly secured
- [ ] Input validation is implemented
- [ ] Authentication/authorization is in place
- [ ] CORS is properly configured
- [ ] Error messages don't leak sensitive info
- [ ] HTTPS is enforced
- [ ] Rate limiting is configured
- [ ] Security headers are set
- [ ] Logging is properly configured

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [CurisJS Security Documentation](./docs/security.md)

## 🙏 Hall of Fame

We appreciate security researchers who help keep CurisJS secure:

<!-- Security researchers will be listed here -->

---

**Thank you for helping keep CurisJS and our users safe!** 🛡️
