# @pixi/app

## Installation

```bash
npm install @pixi/app
```

## Usage

```js
import { Application } from '@pixi/app';

const app = new Application();
document.body.appendChild(app.view);
```

### Plugins

PixiJS предоставляет несколько плагинов для добавления функций в приложение. Их можно установить из следующих пакетов. Используйте Application.registerPlugin, чтобы использовать эти плагины. _Note:если вы используете пакеты pixi.js или pixi.js-legacy, в этом нет необходимости, так как по умолчанию плагины устанавливаются автоматически._

* **LoaderPlugin** from `@pixi/loaders`
* **TickerPlugin** from `@pixi/ticker`