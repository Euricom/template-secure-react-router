# Security Headers Documentation

This document outlines the security headers implemented in our application to enhance security and protect against various web vulnerabilities.

## Implemented Security Headers

### 1. Strict-Transport-Security (HSTS)

```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

- Forces browsers to use HTTPS for all future requests
- `max-age=31536000`: Enforces HTTPS for 1 year
- `includeSubDomains`: Applies to all subdomains

### 2. X-Frame-Options

```http
X-Frame-Options: DENY
```

- Prevents the page from being displayed in frames or iframes
- Protects against clickjacking attacks

### 3. X-Content-Type-Options

```http
X-Content-Type-Options: nosniff
```

- Prevents browsers from MIME-sniffing a response away from the declared content-type
- Reduces exposure to drive-by download attacks

### 4. Referrer-Policy

```http
Referrer-Policy: same-origin
```

- Controls how much referrer information is included with requests
- `same-origin`: Only sends referrer information for same-origin requests

### 5. Cross-Origin Embedder Policy (COEP)

```http
Cross-Origin-Embedder-Policy: require-corp
```

- Requires all resources to be either same-origin or explicitly marked as loadable from another origin
- Helps prevent cross-origin attacks

### 6. Cross-Origin Opener Policy (COOP)

```http
Cross-Origin-Opener-Policy: same-origin
```

- Ensures that a top-level document is isolated from other origins
- Prevents cross-origin window interactions

### 7. Permissions Policy

```http
Permissions-Policy: accelerometer=(), autoplay=(), camera=(), cross-origin-isolated=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), keyboard-map=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), sync-xhr=(), usb=(), web-share=(), xr-spatial-tracking=(), clipboard-read=(), clipboard-write=(), gamepad=(), hid=(), idle-detection=(), interest-cohort=(), serial=(), unload=()
```

- Controls which browser features and APIs can be used
- All listed features are disabled by default for enhanced security

### 8. Content Security Policy (CSP)

```http
Content-Security-Policy: default-src 'none'; script-src 'self' 'nonce-${nonce}'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; block-all-mixed-content; upgrade-insecure-requests;
```

- Restricts which resources can be loaded
- Uses nonce-based script execution
- Key directives:
  - `default-src 'none'`: Blocks all resources by default
  - `script-src 'self' 'nonce-${nonce}'`: Only allows scripts from same origin with valid nonce
  - `style-src 'self' 'unsafe-inline'`: Allows styles from same origin and inline styles
  - `connect-src 'self'`: Restricts connections to same origin
  - `object-src 'none'`: Blocks plugins
  - `base-uri 'self'`: Restricts base tag to same origin
  - `form-action 'self'`: Restricts form submissions to same origin
  - `frame-ancestors 'none'`: Prevents embedding in frames
  - `block-all-mixed-content`: Blocks mixed content
  - `upgrade-insecure-requests`: Upgrades HTTP requests to HTTPS

## Implementation Details

These headers are implemented in the `entry.server.tsx` file using the `setHeaders` function. The headers are set for every request, ensuring consistent security across the application.

The CSP nonce is dynamically generated for each request using:

```typescript
const nonce = crypto.randomBytes(16).toString("hex");
```

This ensures that each page load has a unique nonce value, making it impossible for attackers to predict and inject malicious scripts.

## Best Practices

1. Always keep the security headers up to date
2. Regularly review and update the CSP policy as the application evolves
3. Monitor for any CSP violations in production
4. Test the headers using security scanning tools
5. Consider implementing reporting endpoints for CSP violations

## Testing

You can verify these headers using:

- Browser Developer Tools (Network tab)
- Security scanning tools like [SecurityHeaders.com](https://securityheaders.com)
- [Mozilla Observatory](https://observatory.mozilla.org)
