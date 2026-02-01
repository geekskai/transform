# Transform

A polyglot web converter — JSON, TypeScript, GraphQL, HTML, SVG, YAML, and more. All tools run in the browser; no data is sent to servers.

- **Live site:** [https://folioify.com/](https://folioify.com/)
- **Repository:** [https://github.com/geekskai/transform](https://github.com/geekskai/transform)

---

## About this fork

This project is a **fork** of [ritz078/transform](https://github.com/ritz078/transform). The original is maintained by [Ritesh Kumar](https://github.com/ritz078) and is deployed at [transform.tools](https://transform.tools/).

- **Upstream:** [github.com/ritz078/transform](https://github.com/ritz078/transform) → [transform.tools](https://transform.tools/)
- **This fork:** [github.com/geekskai/transform](https://github.com/geekskai/transform) → [folioify.com](https://folioify.com/)

We use this fork to host our own instance and to add features (e.g. SEO metadata, llms.txt, branding) for [GeeksKai](https://github.com/geekskai) / [Folioify](https://folioify.com/). We do not speak for the upstream project or its author.

---

## Credits

- **Original project:** [ritz078/transform](https://github.com/ritz078/transform) by [Ritesh Kumar](https://github.com/ritz078).
- **Logo:** Designed by [mikicon](https://thenounproject.com/mikicon/).
- **Contributors:** See the [upstream contributors list](https://github.com/ritz078/transform#contributors) for everyone who contributed to the original repo.

---

## Disclaimer

This project is a fork and derivative of [ritz078/transform](https://github.com/ritz078/transform) and is distributed under the [MIT License](LICENSE). The original author is not affiliated with and does not endorse this fork. All trademarks and names belong to their respective owners.

---

## License

MIT © Ritesh Kumar (original author). See [LICENSE](LICENSE).

---

## Development

- Run `yarn && yarn dev` for development.
- Routes live under `pages/`; add a new transformer there and register it in `utils/routes.tsx`.

## Self-hosting

- `yarn && yarn build && yarn start`
