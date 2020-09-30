import { Texture } from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { Ticker, UPDATE_PRIORITY } from '@pixi/ticker';
import type { IDestroyOptions } from '@pixi/display';

/**
 * AnimatedSprite это простой способ отображения анимации, представленной списком текстур.
 *
 * ```js
 * let alienImages = ["image_sequence_01.png","image_sequence_02.png","image_sequence_03.png","image_sequence_04.png"];
 * let textureArray = [];
 *
 * for (let i=0; i < 4; i++)
 * {
 *      let texture = PIXI.Texture.from(alienImages[i]);
 *      textureArray.push(texture);
 * };
 *
 * let animatedSprite = new PIXI.AnimatedSprite(textureArray);
 * ```
 *
 * Более эффективный и простой способ создать анимированный спрайт - использовать {@link PIXI.Spritesheet}
 * содержащие определения анимации:
 *
 * ```js
 * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
 *   animatedSprite = new PIXI.AnimatedSprite(sheet.animations["image_sequence"]);
 *   ...
 * }
 * ```
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI
 */
export class AnimatedSprite extends Sprite
{
    public animationSpeed: number;
    public loop: boolean;
    public updateAnchor: boolean;
    public onComplete?: () => void;
    public onFrameChange?: (currentFrame: number) => void;
    public onLoop?: () => void;

    private _playing: boolean;
    private _textures: Texture[];
    private _durations: number[];
    private _autoUpdate: boolean;
    private _isConnectedToTicker: boolean;
    private _currentTime: number;
    private _previousFrame: number;

    /**
     * @param {PIXI.Texture[]|PIXI.AnimatedSprite.FrameObject[]} textures - как массив {@link PIXI.Texture} или 
     * объекты frame, составляющие анимацию.
     * @param {boolean} [autoUpdate=true] - Стоит ли использовать PIXI.Ticker.shared  а
     */
    c оnstructor (textures: Texture[]|FrameObject[], autoUpdate = true)
    {
        super(textures[0] instanceof Texture ? textures[0] : textures[0].texture);

        /**
         * @type {PIXI.Texture[]}
         * @private
         */
        this._textures = null;

        /**
         * @type {number[]}
         * @private
         */
        this._durations = null;

        /**
         * `true` использует PIXI.Ticker.shared  а
         *
   о      * @ type {boolean}
         * @default true
         * @private
         */
        this._autoUpdate = autoUpdate;

        /**
         * `true` если экземпляр в настоящее время подключен к PIXI.Ticker.shared  а
         *
   о      * @ type {boolean}
         * @default false
         * @private
         */
        this._isConnectedToTicker = false;

        /**
         * Скорость, с которой AnimatedSprite будет воспроизводить. Выше - быстрее, ниже - медленнее.
         *
         * @member {number}
         * @default 1
         */
        this.animationSpeed = 1;

        /**
         * Повторяется ли анимированный спрайт после воспроизведения.
         *
         * @member {boolean}
         * @default true
         */
        this.loop = true;

        /**
         * Обновить якорь к [Texture's defaultAnchor]{@link PIXI.Texture#defaultAnchor} когда кадр меняется.
         *
         * Полезно с [sprite sheet animations]{@link PIXI.Spritesheet#animations} создан с помощью инструментов.
         * Изменение якоря для каждого кадра позволяет привязать опорную точку спрайта к определенному движущемуся 
         * объекту кадра (например левой ноге).
         *
         * Note: Включение этого параметра переопределит любой ранее установленный 'якорь' при каждом изменении кадра.
         *
         * @member {boolean}
         * @default false
         */
        this.updateAnchor = false;

        /**
         * Назначаемая пользователем функция для вызова после завершения воспроизведения AnimatedSprite.
         *
         * @example
         * animation.onComplete = function () {
         *   // finished!
         * };
         * @member {Function}
         */
        this.onComplete = null;

        /**
         * Назначаемая пользователем функция для вызова, когда AnimatedSprite изменяет визуализируемую текстуру.
         *
         * @example
         * animation.onFrameChange = function () {
         *   // updated!
         * };
         * @member {Function}
         */
        this.onFrameChange = null;

        /**
         * Назначенная пользователем функция для вызова при `loop` = true, и AnimatedSprite воспроизводится и
         * зацикливается, чтобы начать снова.
         *
         * @example
         * animation.onLoop = function () {
         *   // looped!
         * };
         * @member {Function}
         */
        this.onLoop = null;

        /**
         * Время, прошедшее с момента запуска анимации, используется внутри для отображения текущей текстуры.
         *
         * @member {number}
         * @private
         */
        this._currentTime = 0;

        this._playing = false;

        /**
         * Индекс текстуры, который отображался в последний раз
         *
         * @member {number}
         * @private
         */
        this._previousFrame = null;

        this.textures = textures;
    }

    /**
     * Останавливает AnimatedSprite.
     *
     */
    public stop(): void
    {
        if (!this._playing)
        {
            return;
        }

        this._playing = false;
        if (this._autoUpdate && this._isConnectedToTicker)
        {
            Ticker.shared.remove(this.update, this);
            this._isConnectedToTicker = false;
        }
    }

    /**
     * Воспроизводит AnimatedSprite.
     *
     */
    public play(): void
    {
        if (this._playing)
        {
            return;
        }

        this._playing = true;
        if (this._autoUpdate && !this._isConnectedToTicker)
        {
            Ticker.shared.add(this.update, this, UPDATE_PRIORITY.HIGH);
            this._isConnectedToTicker = true;
        }
    }

    /**
     * Останавливает AnimatedSprite и переходит к определенному кадру.
     *
     * @param {number} frameNumber - Индекс кадра, на котором нужно остановиться.
     */
    public gotoAndStop(frameNumber: number): void
    {
        this.stop();

        const previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame)
        {
            this.updateTexture();
        }
    }

    /**
     * Переходит к определенному кадру и начинает воспроизведение AnimatedSprite.
     *
     * @param {number} frameNumber - Frame index to start at.
     */
    public gotoAndPlay(frameNumber: number): void
    {
        const previousFrame = this.currentFrame;

        this._currentTime = frameNumber;

        if (previousFrame !== this.currentFrame)
        {
            this.updateTexture();
        }

        this.play();
    }

    /**
     * Обновляет преобразование объекта для рендеринга.
     *
     * @param {number} deltaTime - Время с последнего тика.
     */
    update(deltaTime: number): void
    {
        const elapsed = this.animationSpeed * deltaTime;
        const previousFrame = this.currentFrame;

        if (this._durations !== null)
        {
            let lag = this._currentTime % 1 * this._durations[this.currentFrame];

            lag += elapsed / 60 * 1000;

            while (lag < 0)
            {
                this._currentTime--;
                lag += this._durations[this.currentFrame];
            }

            const sign = Math.sign(this.animationSpeed * deltaTime);

            this._currentTime = Math.floor(this._currentTime);

            while (lag >= this._durations[this.currentFrame])
            {
                lag -= this._durations[this.currentFrame] * sign;
                this._currentTime += sign;
            }

            this._currentTime += lag / this._durations[this.currentFrame];
        }
        else
        {
            this._currentTime += elapsed;
        }

        if (this._currentTime < 0 && !this.loop)
        {
            this.gotoAndStop(0);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (this._currentTime >= this._textures.length && !this.loop)
        {
            this.gotoAndStop(this._textures.length - 1);

            if (this.onComplete)
            {
                this.onComplete();
            }
        }
        else if (previousFrame !== this.currentFrame)
        {
            if (this.loop && this.onLoop)
            {
                if (this.animationSpeed > 0 && this.currentFrame < previousFrame)
                {
                    this.onLoop();
                }
                else if (this.animationSpeed < 0 && this.currentFrame > previousFrame)
                {
                    this.onLoop();
                }
            }

            this.updateTexture();
        }
    }

    /**
     * Обновляет отображаемую текстуру в соответствии с индексом текущего кадра.
     *
     * @private
     */
    private updateTexture(): void
    {
        const currentFrame = this.currentFrame;

        if (this._previousFrame === currentFrame)
        {
            return;
        }

        this._previousFrame = currentFrame;

        this._texture = this._textures[currentFrame];
        this._textureID = -1;
        this._textureTrimmedID = -1;
        this._cachedTint = 0xFFFFFF;
        this.uvs = this._texture._uvs.uvsFloat32;

        if (this.updateAnchor)
        {
            this._anchor.copyFrom(this._texture.defaultAnchor);
        }

        if (this.onFrameChange)
        {
            this.onFrameChange(this.currentFrame);
        }
    }

    /**
     * Останавливает AnimatedSprite и уничтожает его.
     *
     * @param {object|boolean} [options] - Параметр Options. Логическое значение будет действовать так, как если бы все параметры
     * были установлены на это значение.
     * @param {boolean} [options.children=false] - Если установлено значение true, то метод destroy() всех потомков
     *      также будет вызван. 'options' будут переданы этим вызовам.
     * @param {boolean} [options.texture=false] - Если он также уничтожит текущую текстуру спрайта.
     * @param {boolean} [options.baseTexture=false] - Если он также уничтожит базовую текстуру спрайта.
     */
    public destroy(options: IDestroyOptions|boolean): void
    {
        this.stop();
        super.destroy(options);

        this.onComplete = null;
        this.onFrameChange = null;
        this.onLoop = null;
    }

    /**
     * Краткий способ создания AnimatedSprite из массива идентификаторов кадров.
     *
     * @static
     * @param {string[]} frames - Массив идентификаторов кадров, который AnimatedSprite будет использовать в качестве кадров текстуры..
     * @return {PIXI.AnimatedSprite} Новый анимированный спрайт с заданными кадрами.
     */
    public static fromFrames(frames: string[]): AnimatedSprite
    {
        const textures = [];

        for (let i = 0; i < frames.length; ++i)
        {
            textures.push(Texture.from(frames[i]));
        }

        return new AnimatedSprite(textures);
    }

    /**
     * Краткий способ создания AnimatedSprite из массива идентификаторов изображений.
     *
     * @static
     * @param {string[]} images - Массив URL-адресов изображений, который AnimatedSprite будет использовать в качестве кадров текстуры..
     * @return {PIXI.AnimatedSprite} Новый анимированный спрайт с указанными изображениями в виде кадров.
     */
    public static fromImages(images: string[]): AnimatedSprite
    {
        const textures = [];

        for (let i = 0; i < images.length; ++i)
        {
            textures.push(Texture.from(images[i]));
        }

        return new AnimatedSprite(textures);
    }

    /**
     * Общее количество кадров в AnimatedSprite. Это то же самое, что и количество текстур
     * присвоенных AnimatedSprite.
     *
     * @readonly
     * @member {number}
     * @default 0
     */
    get totalFrames(): number
    {
        return this._textures.length;
    }

    /**
     * Массив текстур, используемых для этого AnimatedSprite.
     *
     * @member {PIXI.Texture[]}
     */
    get textures(): Texture[]|FrameObject[]
    {
        return this._textures;
    }

    set textures(value: Texture[]|FrameObject[])
    {
        if (value[0] instanceof Texture)
        {
            this._textures = value as Texture[];
            this._durations = null;
        }
        else
        {
            this._textures = [];
            this._durations = [];

            for (let i = 0; i < value.length; i++)
            {
                this._textures.push((value[i] as FrameObject).texture);
                this._durations.push((value[i] as FrameObject).time);
            }
        }
        this._previousFrame = null;
        this.gotoAndStop(0);
        this.updateTexture();
    }

    /**
    * Индекс текущего кадра AnimatedSprites.
    *
    * @member {number}
    * @readonly
    */
    get currentFrame(): number
    {
        let currentFrame = Math.floor(this._currentTime) % this._textures.length;

        if (currentFrame < 0)
        {
            currentFrame += this._textures.length;
        }

        return currentFrame;
    }

    /**
     * Указывает, воспроизводится ли AnimatedSprite в данный момент.
     *
     * @member {boolean}
     * @readonly
     */
    get playing(): boolean
    {
        return this._playing;
    }

    /**
     * Стоит ли использовать PIXI.Ticker.shared для автоматического обновления времени анимации
     *
     * @member {boolean}
     */
    get autoUpdate(): boolean
    {
        return this._autoUpdate;
    }

    set autoUpdate(value: boolean)
    {
        if (value !== this._autoUpdate)
        {
            this._autoUpdate = value;

            if (!this._autoUpdate && this._isConnectedToTicker)
            {
                Ticker.shared.remove(this.update, this);
                this._isConnectedToTicker = false;
            }
            else if (this._autoUpdate && !this._isConnectedToTicker && this._playing)
            {
                Ticker.shared.add(this.update, this);
                this._isConnectedToTicker = true;
            }
        }
    }
}

export interface FrameObject {
    texture: Texture;
    time: number;
}

/**
 * @memberof PIXI.AnimatedSprite
 * @typedef {object} FrameObject
 * @type {object}
 * @property {PIXI.Texture} texture -  {@link PIXI.Texture} кадра
 * @property {number} time - длительность кадра в мс
 */
