# 3dPacking — API de empaquetado 3D

Microservicio **Express.js** que expone un endpoint para calcular el empaquetado tridimensional de objetos dentro de una “baulera” (contenedor). La lógica de empaquetado corre en **Python** mediante la librería [py3dbp](https://github.com/jerry800416/py3dbp).

## Qué hace

- Recibe por HTTP un JSON con dimensiones del contenedor (`baulera`) y una lista de `items` (con cantidades).
- Valida el cuerpo de la petición con **express-validator**.
- Invoca el script `src/utils/ejecutable.py`, que usa **py3dbp** para colocar los ítems y devuelve qué cabe (`fittedItems`), qué no (`unfittedItems`) y el detalle del contenedor.

## Requisitos

| Componente | Notas |
|------------|--------|
| **Node.js** | Para ejecutar la API (versión LTS recomendada). |
| **Python 3** | En el `PATH`. Por defecto se usa `python` en Windows y `python3` en Linux/macOS; se puede forzar con `PYTHON_CMD`. |
| **py3dbp** | Instalar con pip según `requirements.txt`. |

## Instalación

```bash
# Dependencias Node
npm install

# Entorno Python (recomendado: venv)
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
```

## Configuración

| Variable | Descripción | Por defecto |
|----------|-------------|---------------|
| `PORT` | Puerto del servidor HTTP | `5501` |
| `CORS_ORIGIN` | Origen(es) permitido(s) para CORS. Varios valores separados por coma | `http://127.0.0.1:4173` |
| `PYTHON_CMD` | Comando del intérprete Python usado por el backend | `python` en Windows, `python3` en el resto |
| `NODE_ENV` | Si es `production`, los errores 500 no incluyen detalle interno del error | — |

### Salud del servicio

- `GET /health` — responde `{ "status": "ok" }` con código `200`.

## Ejecución

```bash
npm start
```

El servidor escucha en `http://localhost:<PORT>` (por defecto `5501`). Rutas: `GET /health`, `POST /api/pack`.

## API

### `POST /api/pack`

**Content-Type:** `application/json`

**Cuerpo esperado:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `baulera` | objeto | Contenedor |
| `baulera.name` | string | Nombre |
| `baulera.width`, `height`, `depth` | número | Dimensiones |
| `baulera.weightLimit` | entero | Peso máximo admitido |
| `items` | array | Lista de objetos a empaquetar |
| `items[].name` | string | Nombre del ítem |
| `items[].width`, `height`, `depth`, `weight` | número | Dimensiones y peso |
| `items[].quantity` | número | Cantidad de unidades de ese ítem |

**Respuestas habituales:**

- `200` — JSON con `baulera`, `fittedItems`, `unfittedItems` (salida del script Python).
- `422` — Errores de validación (`errors` de express-validator).
- `500` — Fallo al ejecutar el script Python (`application/json` con `error` y `message`).

**Respuesta 200 — forma de cada elemento en `fittedItems` / `unfittedItems`:**

| Campo | Descripción |
|-------|-------------|
| `name` | Nombre del ítem |
| `position` | `{ "x", "y", "z" }` — esquina en coordenadas del contenedor (números, no `Decimal`) |
| `rotationType` | Entero `0`–`5` (orientación elegida por py3dbp) |
| `rotationLabel` | Etiqueta legible, p. ej. `RT_WHD`, `RT_HWD`, … |
| `dimensions` | `{ "width", "height", "depth" }` efectivas según la rotación |
| `weight` | Peso |
| `volume` | Volumen del ítem en esa orientación |
| `detail` | Texto legacy (`item.string()` de py3dbp); puedes ignorarlo si usas los campos anteriores |

**Ejemplo mínimo:**

```json
{
  "baulera": {
    "name": "baulera simple 3x3x3",
    "width": 3,
    "height": 3,
    "depth": 3,
    "weightLimit": 10000
  },
  "items": [
    {
      "name": "mesa de luz",
      "width": 0.4,
      "height": 0.5,
      "depth": 0.4,
      "weight": 5,
      "quantity": 1
    }
  ]
}
```

## Pruebas

```bash
npm run test:ci
```

En desarrollo, `npm test` ejecuta Jest en modo watch. `test:ci` usa `--ci` y sin watch (adecuado para pipelines). La prueba de integración invoca el script Python real; hace falta Python y `py3dbp` instalados.

## Documentación del código (JSDoc)

El proyecto incluye configuración JSDoc (`conf.json`) y plantilla **docdash**. Para regenerar la documentación estática en `./docs/`:

```bash
npx jsdoc -c conf.json
```

## Estructura relevante

```
src/
  app.js                 # Servidor Express, CORS, montaje de rutas
  routes/router.js       # POST /pack
  controllers/           # Validación y controlador
  utils/
    pythonExecutor.js    # Invocación al intérprete Python
    ejecutable.py        # Empaquetado con py3dbp
```

## Licencia

MIT (ver `package.json`).

### Notas de implementación recientes

- Invocación a Python con **`spawn`** y lista de argumentos (sin shell) para reducir riesgo de inyección.
- Dependencias de documentación y tests (**jsdoc**, **docdash**, **jest**) solo en `devDependencies`.
- Errores 500 en **JSON**; mensaje detallado solo fuera de `production`.

Posibles siguientes pasos: ESLint, tests con mock del proceso Python en CI, o pasar el JSON por **stdin** al script para simplificar el protocolo de argumentos.
