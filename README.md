# Puissance Foot Rules

Moteur de règles sans interface ni accès réseau partagé entre le navigateur et
le serveur multijoueur de Puissance Foot.

## Principes

- fonctions pures et déterministes ;
- aucune confiance accordée au navigateur ;
- le serveur reste l'autorité pour les parties en ligne ;
- aucun secret ni dépendance de production.

## Utilisation Node.js

```js
const {
  createInitialBoard,
  validateMove,
  applyMove,
  getWinner
} = require('@pierreraspi/puissance-foot-rules');
```

## Utilisation navigateur

Charger `dist/puissance-foot-rules.browser.js`. L'API est disponible dans
`window.PuissanceFootRules`.

## Tests

```bash
npm test
```
