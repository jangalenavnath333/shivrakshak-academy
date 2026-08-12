# अकॅडमीचा लोगो / Academy logo

इथे लोगो ठेवा: `academy-logo.png`

नंतर `src/content/landing.ts` मध्ये:

```ts
export const ACADEMY_LOGO: string | null = '/images/logo/academy-logo.png'
```

## लोगो कसा असावा

- **चौरस (square)** — किमान 256 × 256 pixels.
- **PNG, पारदर्शक (transparent) background** — गडद रंगावर लोगो लावला जातो,
  त्यामुळे पांढरी चौकट दिसू नये.
- लोगो न दिल्यास सध्याचा shield mark (`src/components/Logo.tsx`) वापरला जातो.
