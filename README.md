# Glacial

Glacial is a web-app that backs up files to QR codes to print for offline 'cold'-storage. Glacial can read these QR codes back into the source file using any onboard cameras once it comes time to restore.

Try it out at: https://glacial.vercel.app/

## Development

### Requirements:

- `Node.js` `v22.x`
- `pnpm`

```shell
# Install dependencies
pnpm install

# Run
pnpm run dev
```

Note that development is done on `https://localhost:5173` as camera permissions require `https`.

## TODOs:

- Implement a better QR code UI/UX
- Implement all the WIP features on the archive form
