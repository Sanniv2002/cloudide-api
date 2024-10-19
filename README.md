# api-scriptbox

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

To build:

```bash
bun build ./index.ts --outdir ./build
```

To start using pm2 

```bash
pm2 start --interpreter ~/.bun/bin/bun index.ts
```

This project was created using `bun init` in bun v1.1.8. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
