PixiJS — HTML5 Творческий движок
=============

![pixi.js logo](https://pixijs.download/pixijs-banner-v5.png)
[<img src="https://img.shields.io/badge/slack/pixijs-gray.svg?logo=slack">](https://join.slack.com/t/pixijs/shared_invite/zt-dcem1map-uVuVGC7pZ0trF8SrcA2p9g)
[![Inline docs](http://inch-ci.org/github/pixijs/pixi.js.svg?branch=dev)](http://inch-ci.org/github/pixijs/pixi.js)
[![Node.js CI](https://github.com/pixijs/pixi.js/workflows/Node.js%20CI/badge.svg)](https://github.com/pixi.js/pixi.js/actions?query=workflow%3A%22Node.js+CI%22)

Цель этого проекта - предоставить быструю легкую 2D-библиотеку, которая работает
на всех устройствах. Рендерер PixiJS позволяет каждому насладиться мощью
аппаратного ускорения без предварительного знания WebGL. Кроме того, это быстро. Действительно быстро.

Если вы хотите быть в курсе последних новостей PixiJS, подпишитесь на нас в Twitter.
([@doormat23](https://twitter.com/doormat23), [@rolnaaba](https://twitter.com/rolnaaba), [@bigtimebuddy](https://twitter.com/bigtimebuddy), [@ivanpopelyshev](https://twitter.com/ivanpopelyshev))
и мы будем держать вас в курсе! Вы также можете проверить [our site](http://www.pixijs.com)
так как любые прорывы там тоже будут публиковаться!

**Теперь мы являемся частью [Open Collective](https://opencollective.com/pixijs) и с вашей поддержкой вы можете помочь нам сделать PixiJS даже лучше. Чтобы сделать пожертвование, просто нажмите кнопку ниже, и мы будем любить вас вечно!**

<div align="center">
  <a href="https://opencollective.com/pixijs/donate" target="_blank">
    <img src="https://opencollective.com/pixijs/donate/button@2x.png?color=blue" width=250 />
  </a>
</div>

### Для чего использовать PixiJS и когда его использовать

PixiJS - это библиотека рендеринга, которая позволит вам создавать насыщенную интерактивную графику, кроссплатформенные приложения и игры без необходимости погружаться в WebGL API или заниматься совместимостью браузера и устройства.

PixiJS полностью поддерживает [WebGL](https://en.wikipedia.org/wiki/WebGL) и плавно возвращается к HTML5 [canvas](https://en.wikipedia.org/wiki/Canvas_element) если нужно. As a framework, PixiJS фантастический инструмент для создания интерактивного контента. Используйте его для создания насыщенных графикой интерактивных веб-сайтов, приложений и игр HTML5. Кросс-платформенная совместимость и постепенная деградация сразу после установки означают, что у вас меньше работы и больше удовольствия от ее выполнения! Если вы хотите относительно быстро создать безупречный и усовершенствованный опыт, не углубляясь в плотный, низкоуровневый код, и при этом избегая головной боли, связанной с несогласованностью браузера, тогда добавьте в свой следующий проект немного волшебства PixiJS!

**Ускорьте свое развитие и не стесняйтесь использовать свое воображение!**

### Learn ###
- Website: Узнайте больше о PixiJS на [Официальный сайт](http://www.pixijs.com/).
- Начиная: Посмотрите @kittykatattack's исчерпывающий [туториал](https://github.com/kittykatattack/learningPixi).
- Examples: Зависнуть играясь с кодом и фичами PixiJS можно [здесь](http://pixijs.github.io/examples/)!
- Docs: Познакомьтесь с PixiJS API, на сайте [документации](https://pixijs.github.io/docs/).
- Wiki: Другие различные руководства и ресурсы: [на Wiki](https://github.com/pixijs/pixi.js/wiki).

### Сообщество ###
- Forums: Check out the [forum](http://www.html5gamedevs.com/forum/15-pixijs/) and [Stackoverflow](http://stackoverflow.com/search?q=pixi.js), both friendly places to ask your PixiJS questions.
- Inspiration: Check out the [gallery](http://www.pixijs.com/gallery) to see some of the amazing things people have created!
- Chat: Вы можете присоединиться к нам на [Gitter](https://gitter.im/pixijs/pixi.js) Чтобы поговорить о PixiJS. У нас также есть канал Slack. Если вы хотите присоединиться к нему, пришлите мне электронное письмо (mat@goodboydigital.com) и я приглашу вас.


### Настройка ###

Начать работу с PixiJS просто! Загрузите [готовую сборку](https://github.com/pixijs/pixi.js/wiki/FAQs#where-can-i-get-a-build)!

Или, установите PixiJS с помощью [npm](https://docs.npmjs.com/getting-started/what-is-npm) или просто используя сеть доставки контента (CDN) URL для вставки PixiJS прямо на свою страницу HTML.

_Note: С версии v4.5.0, поддержка пакетного менеджера [Bower](https://bower.io) была прекращена. Пожалуйста, посмотрите [release notes](https://github.com/pixijs/pixi.js/releases/tag/v4.5.0) чтобы узнать больше._

#### NPM Install

```sh
npm install pixi.js
```
Нет экспорта по умолчанию. Правильный способ импорта PixiJS::

```js
import * as PIXI from 'pixi.js'
```

#### CDN Install (via cdnjs)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.1.3/pixi.min.js"></script>
```

_Note: `5.1.3` можно заменить любым [released](https://github.com/pixijs/pixi.js/releases) версией._

### Demos ###

- [Filters Demo](http://pixijs.io/pixi-filters/tools/demo/)
- [Run Pixie Run](http://work.goodboydigital.com/runpixierun/)
- [Flash vs HTML](http://flashvhtml.com)
- [Bunny Demo](http://www.goodboydigital.com/pixijs/bunnymark)
- [Storm Brewing](http://www.goodboydigital.com/pixijs/storm)
- [Render Texture Demo](http://www.goodboydigital.com/pixijs/examples/11)
- [Primitives Demo](http://www.goodboydigital.com/pixijs/examples/13)
- [Masking Demo](http://www.goodboydigital.com/pixijs/examples/14)
- [Interaction Demo](http://www.goodboydigital.com/pixijs/examples/6)
- [photonstorm's Balls Demo](http://gametest.mobi/pixi/balls)
- [photonstorm's Morph Demo](http://gametest.mobi/pixi/morph)

Спасибо [@photonstorm](https://twitter.com/photonstorm) за предоставленные
эти последние 2 примера и позволяющие нам поделиться исходным кодом :)

### Contribute ###

Want to be part of the PixiJS project? Great! All are welcome! We will get there quicker
together :) Whether you find a bug, have a great feature request or you fancy owning a task
from the road map above feel free to get in touch.

Make sure to read the [Contributing Guide](.github/CONTRIBUTING.md)
before submitting changes.

### Current features ###

- WebGL renderer (с автоматическим интеллектуальным дозированием, обеспечивающим ДЕЙСТВИТЕЛЬНО высокую производительность)
- Canvas renderer (Самый быстрый в городе!)
- Full scene graph
- Супер простой в использовании API (аналогично списку отображения flash API)
- Поддержка текстурных атласов
- Загрузчик ресурсов / загрузчик листов спрайтов
- Автоматическое определение того, какой рендерер следует использовать
- Полноценное взаимодействие с мышью и мультитач
- Text
- BitmapFont text
- Multiline Text
- Render Texture
- Primitive Drawing
- Masking
- Filters
- [User Plugins](https://github.com/pixijs/pixi.js/wiki/v5-Resources)

### Базовый пример использования ###

```js
import * as PIXI from 'pixi.js';

// Если возможно, приложение создаст средство визуализации с использованием WebGL.,
// с откатом к рендерингу холста. Он также установит тикер
// и корневой stage PIXI.Container
const app = new PIXI.Application();

// Приложение создаст для вас элемент холста, который вы
// затем можно вставить в DOM
document.body.appendChild(app.view);

// загружаем нужную нам текстуру
app.loader.add('bunny', 'bunny.png').load((loader, resources) => {
    // Это создает текстуру из изображения 'bunny.png'
    const bunny = new PIXI.Sprite(resources.bunny.texture);

    // Настройте положение кролика
    bunny.x = app.renderer.width / 2;
    bunny.y = app.renderer.height / 2;

    // Повернуть вокруг центра
    bunny.anchor.x = 0.5;
    bunny.anchor.y = 0.5;

    // Добавьте кролика на сцену, которую мы строим
    app.stage.addChild(bunny);

    // Слушайте обновления кадров
    app.ticker.add(() => {
         // каждый кадр мы немного крутим кролика
        bunny.rotation += 0.01;
    });
});
```

### Как делать сборку ###

Обратите внимание, что для большинства пользователей создавать этот проект не требуется. Если все, что вам нужно, это использовать PixiJS, тогда
просто загрузите один из наших [готовых выпусков] (https://github.com/pixijs/pixi.js/releases). В самом деле
Единственный раз, когда вам может понадобиться собрать PixiJS, - это если вы его разрабатываете.

Если у вас еще нет Node.js и NPM, установите их. Затем в папке, в которую вы клонировали
репозиторий, установите зависимости сборки с помощью npm:

```sh
npm install
```

Затем, чтобы собрать исходный код, запустите:

```sh
npm run build
```

### Как создать документацию ###

Документы можно создать с помощью npm:

```sh
npm run docs
```

В документации используется JSDocs в сочетании с этим шаблоном [pixi-jsdoc-template](https://github.com/pixijs/pixi-jsdoc-template). Файл конфигурации можно найти по адресу [jsdoc.conf.json](jsdoc.conf.json)

### Лицензия ###

Этот контент выпущен под (http://opensource.org/licenses/MIT) MIT License.

[![Analytics](https://ga-beacon.appspot.com/UA-39213431-2/pixi.js/index)](https://github.com/igrigorik/ga-beacon)
