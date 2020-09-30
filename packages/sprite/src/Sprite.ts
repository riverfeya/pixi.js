import { BLEND_MODES } from '@pixi/constants';
import { Texture } from '@pixi/core';
import { Container } from '@pixi/display';
import { ObservablePoint, Point, Rectangle } from '@pixi/math';
import { settings } from '@pixi/settings';
import { sign } from '@pixi/utils';

import type { IBaseTextureOptions, Renderer, TextureSource } from '@pixi/core';
import type { IDestroyOptions } from '@pixi/display';
import type { IPointData } from '@pixi/math';

const tempPoint = new Point();
const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);

export type SpriteSource = TextureSource|Texture;

export interface Sprite extends GlobalMixins.Sprite, Container {}

/**
 * Объект Sprite является основой для всех текстурированных объектов, отображаемых на экране
*
 * Спрайт можно создать прямо из изображения следующим образом:
 *
 * ```js
 * let sprite = PIXI.Sprite.from('assets/image.png');
 * ```
 *
 * Более эффективный способ создания спрайтов - использование {@link PIXI.Spritesheet},
 * поскольку замена базовых текстур при рендеринге на экран неэффективна.
 *
 * ```js
 * PIXI.Loader.shared.add("assets/spritesheet.json").load(setup);
 *
 * function setup() {
 *   let sheet = PIXI.Loader.shared.resources["assets/spritesheet.json"].spritesheet;
 *   let sprite = new PIXI.Sprite(sheet.textures["image.png"]);
 *   ...
 * }
 * ```
 *
 * @class
 * @extends PIXI.Container
 * @memberof PIXI
 */
export class Sprite extends Container
{
    public blendMode: BLEND_MODES;
    public indices: Uint16Array;
    public pluginName: string;

    _width: number;
    _height: number;
    _texture: Texture;
    _textureID: number;
    _cachedTint: number;
    protected _textureTrimmedID: number;
    protected uvs: Float32Array;
    protected _anchor: ObservablePoint;
    protected vertexData: Float32Array;

    private vertexTrimmedData: Float32Array;
    private _roundPixels: boolean;
    private _transformID: number;
    private _transformTrimmedID: number;
    private _tint: number;

    // Internal-only properties
    _tintRGB: number;

    /**
     * @param {PIXI.Texture} [texture] - Текстура для этого спрайта.
     */
    constructor(texture: Texture)
    {
        super();

        /**
         * anchor point определяет нормализованные координаты
         * в текстуре, которая соответствует положению этого
         * спрайт.
         *
         * По умолчанию это `(0,0)` (или `texture.defaultAnchor`
         * если вы изменили это), что означает положение
         * `(x,y)` этого `Sprite` будет в верхнем левом углу.
         *
         * Note: Апдейт `texture.defaultAnchor` после
         * построения `Sprite` _не_ обновляет его anchor.
         *
         * {@link https://docs.cocos2d-x.org/cocos2d-x/en/sprites/manipulation.html}
         *
         * @default `texture.defaultAnchor`
         * @member {PIXI.ObservablePoint}
         * @private
         */
        this._anchor = new ObservablePoint(
            this._onAnchorUpdate,
            this,
            (texture ? texture.defaultAnchor.x : 0),
            (texture ? texture.defaultAnchor.y : 0)
        );

        /**
         * Текстура, которую использует спрайт
         *
         * @private
         * @member {PIXI.Texture}
         */
        this._texture = null;

        /**
         * Ширина спрайта (это изначально устанавливается текстурой)
         *
         * @protected
         * @member {number}
         */
        this._width = 0;

        /**
         * высотаСпрайта (изначальноЗадаетсяТекстурой)
         *
         * @protected
         * @member {number}
         */
        this._height = 0;

        /**
         * Оттенок, примененный к спрайту. Это шестнадцатеричное значение. Значение 0xFFFFFF удалит любой эффект оттенка..
         *
         * @private
         * @member {number}
         * @default 0xFFFFFF
         */
        this._tint = null;

        /**
         * Оттенок, примененный к спрайту. Это значение RGB. Значение 0xFFFFFF удалит любой эффект оттенка..
         *
         * @private
         * @member {number}
         * @default 16777215
         */
        this._tintRGB = null;

        this.tint = 0xFFFFFF;

        /**
         * Режим наложения, применяемый к спрайту.Примените значение PIXI.BLEND_MODES.NORMAL для сброса режима наложения..
         *
         * @member {number}
         * @default PIXI.BLEND_MODES.NORMAL
         * @see PIXI.BLEND_MODES
         */
        this.blendMode = BLEND_MODES.NORMAL;

        /**
         * Кэшированное значение оттенка, чтобы мы могли узнать, когда оттенок изменился.
         * Значение используется для 2d CanvasRenderer.
         *
         * @protected
         * @member {number}
         * @default 0xFFFFFF
         */
        this._cachedTint = 0xFFFFFF;

        /**
         * это используется для хранения данных uvs спрайта, назначенных одновременно
         * как vertexData в calculateVertices ()
         *
         * @private
         * @member {Float32Array}
         */
        this.uvs = null;

        // вызов установщика текстуры
        this.texture = texture || Texture.EMPTY;

        /**
         * это используется для хранения данных вершин спрайта (в основном четырехугольника)
         *
         * @private
         * @member {Float32Array}
         */
        this.vertexData = new Float32Array(8);

        /**
         * Используется для вычисления границ объекта, ЕСЛИ это обрезанный спрайт.
         *
         * @private
         * @member {Float32Array}
         */
        this.vertexTrimmedData = null;

        this._transformID = -1;
        this._textureID = -1;

        this._transformTrimmedID = -1;
        this._textureTrimmedID = -1;

        // Batchable вещи..
        // TODO мог бы сделать это миксином?
        this.indices = indices;

        /**
         * Плагин, отвечающий за рендеринг этого элемента.
         * Позволяет настроить процесс рендеринга без переопределения методов '_render' и '_renderCanvas'.
         *
         * @member {string}
         * @default 'batch'
         */
        this.pluginName = 'batch';

        /**
         * используется для быстрой проверки, является ли спрайт .. спрайтом!
         * @member {boolean}
         */
        this.isSprite = true;

        /**
         * Внутреннее поле roundPixels
         *
         * @member {boolean}
         * @private
         */
        this._roundPixels = settings.ROUND_PIXELS;
    }

    /**
     * Когда текстура обновляется, это событие срабатывает, чтобы обновить масштаб и кадр.
     *
     * @protected
     */
    protected _onTextureUpdate(): void
    {
        this._textureID = -1;
        this._textureTrimmedID = -1;
        this._cachedTint = 0xFFFFFF;

        // поэтому, если _width равен 0, ширина не была установлена..
        if (this._width)
        {
            this.scale.x = sign(this.scale.x) * this._width / this._texture.orig.width;
        }

        if (this._height)
        {
            this.scale.y = sign(this.scale.y) * this._height / this._texture.orig.height;
        }
    }

    /**
     * Вызывается при обновлении позиции якоря.
     *
     * @private
     */
    private _onAnchorUpdate(): void
    {
        this._transformID = -1;
        this._transformTrimmedID = -1;
    }

    /**
     * вычисляет вершины worldTransform *, сохраняет их в vertexData
     */
    public calculateVertices(): void
    {
        const texture = this._texture;

        if (this._transformID === this.transform._worldID && this._textureID === texture._updateID)
        {
            return;
        }

        // обновите текстуру UV здесь, потому что базовую текстуру можно изменить без вызова `_onTextureUpdate`
        if (this._textureID !== texture._updateID)
        {
            this.uvs = this._texture._uvs.uvsFloat32;
        }

        this._transformID = this.transform._worldID;
        this._textureID = texture._updateID;

        // установить данные вершины

        const wt = this.transform.worldTransform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;
        const vertexData = this.vertexData;
        const trim = texture.trim;
        const orig = texture.orig;
        const anchor = this._anchor;

        let w0 = 0;
        let w1 = 0;
        let h0 = 0;
        let h1 = 0;

        if (trim)
        {
            // если спрайт обрезан и не является тайлинг-спрайтом, нам нужно добавить дополнительные
            // пробел перед преобразованием координат спрайта.
            w1 = trim.x - (anchor._x * orig.width);
            w0 = w1 + trim.width;

            h1 = trim.y - (anchor._y * orig.height);
            h0 = h1 + trim.height;
        }
        else
        {
            w1 = -anchor._x * orig.width;
            w0 = w1 + orig.width;

            h1 = -anchor._y * orig.height;
            h0 = h1 + orig.height;
        }

        // xy
        vertexData[0] = (a * w1) + (c * h1) + tx;
        vertexData[1] = (d * h1) + (b * w1) + ty;

        // xy
        vertexData[2] = (a * w0) + (c * h1) + tx;
        vertexData[3] = (d * h1) + (b * w0) + ty;

        // xy
        vertexData[4] = (a * w0) + (c * h0) + tx;
        vertexData[5] = (d * h0) + (b * w0) + ty;

        // xy
        vertexData[6] = (a * w1) + (c * h0) + tx;
        vertexData[7] = (d * h0) + (b * w1) + ty;

        if (this._roundPixels)
        {
            const resolution = settings.RESOLUTION;

            for (let i = 0; i < vertexData.length; ++i)
            {
                vertexData[i] = Math.round((vertexData[i] * resolution | 0) / resolution);
            }
        }
    }

    /**
     * вычисляет вершины worldTransform * для не текстуры с обрезкой. сохранить его в vertexTrimmedData
     * Это используется для обеспечения соблюдения истинной ширины и высоты обрезанной текстуры.
     */
    public calculateTrimmedVertices(): void
    {
        if (!this.vertexTrimmedData)
        {
            this.vertexTrimmedData = new Float32Array(8);
        }
        else if (this._transformTrimmedID === this.transform._worldID && this._textureTrimmedID === this._texture._updateID)
        {
            return;
        }

        this._transformTrimmedID = this.transform._worldID;
        this._textureTrimmedID = this._texture._updateID;

        // давайте сделаем специальный код обрезки!
        const texture = this._texture;
        const vertexData = this.vertexTrimmedData;
        const orig = texture.orig;
        const anchor = this._anchor;

        // давайте вычислим новые необрезанные границы ..
        const wt = this.transform.worldTransform;
        const a = wt.a;
        const b = wt.b;
        const c = wt.c;
        const d = wt.d;
        const tx = wt.tx;
        const ty = wt.ty;

        const w1 = -anchor._x * orig.width;
        const w0 = w1 + orig.width;

        const h1 = -anchor._y * orig.height;
        const h0 = h1 + orig.height;

        // xy
        vertexData[0] = (a * w1) + (c * h1) + tx;
        vertexData[1] = (d * h1) + (b * w1) + ty;

        // xy
        vertexData[2] = (a * w0) + (c * h1) + tx;
        vertexData[3] = (d * h1) + (b * w0) + ty;

        // xy
        vertexData[4] = (a * w0) + (c * h0) + tx;
        vertexData[5] = (d * h0) + (b * w0) + ty;

        // xy
        vertexData[6] = (a * w1) + (c * h0) + tx;
        vertexData[7] = (d * h0) + (b * w1) + ty;
    }

    /**
    *
    * Визуализирует объект с помощью средства визуализации WebGL
    *
    * @protected
    * @param {PIXI.Renderer} renderer - Используемый рендерер webgl.
    */
    protected _render(renderer: Renderer): void
    {
        this.calculateVertices();

        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);
    }

    /**
     * Обновляет границы спрайта.
     *
     * @protected
     */
    protected _calculateBounds(): void
    {
        const trim = this._texture.trim;
        const orig = this._texture.orig;

        // Сначала давайте проверим, есть ли обрезка у текущей текстуры.
        if (!trim || (trim.width === orig.width && trim.height === orig.height))
        {
            // без обрезки! воспользуемся обычными расчетами ..
            this.calculateVertices();
            this._bounds.addQuad(this.vertexData);
        }
        else
        {
            // позволяет вычислить специальные усеченные границы ...
            this.calculateTrimmedVertices();
            this._bounds.addQuad(this.vertexTrimmedData);
        }
    }

    /**
     * Получает локальные границы объекта спрайта.
     *
     * @param {PIXI.Rectangle} [rect] - Дополнительный выходной прямоугольник.
     * @return {PIXI.Rectangle} Границы.
     */
    public getLocalBounds(rect?: Rectangle): Rectangle
    {
        // мы можем сделать быстрые локальные границы, если у спрайта нет дочерних элементов!
        if (this.children.length === 0)
        {
            this._bounds.minX = this._texture.orig.width * -this._anchor._x;
            this._bounds.minY = this._texture.orig.height * -this._anchor._y;
            this._bounds.maxX = this._texture.orig.width * (1 - this._anchor._x);
            this._bounds.maxY = this._texture.orig.height * (1 - this._anchor._y);

            if (!rect)
            {
                if (!this._localBoundsRect)
                {
                    this._localBoundsRect = new Rectangle();
                }

                rect = this._localBoundsRect;
            }

            return this._bounds.getRectangle(rect);
        }

        return super.getLocalBounds.call(this, rect);
    }

    /**
     * Проверяет, находится ли точка внутри этого спрайта
     *
     * @param {PIXI.IPointData} point - точка для проверки
     * @return {boolean} результат теста
     */
    public containsPoint(point: IPointData): boolean
    {
        this.worldTransform.applyInverse(point, tempPoint);

        const width = this._texture.orig.width;
        const height = this._texture.orig.height;
        const x1 = -width * this.anchor.x;
        let y1 = 0;

        if (tempPoint.x >= x1 && tempPoint.x < x1 + width)
        {
            y1 = -height * this.anchor.y;

            if (tempPoint.y >= y1 && tempPoint.y < y1 + height)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * Уничтожает этот спрайт и, возможно, его текстуру и дочерние элементы
     *
     * @param {object|boolean} [options] - Параметр опций. Логическое значение будет действовать так, как если бы все параметры
     *  были установлены на это значение
     * @param {boolean} [options.children=false] - если установлено значение true, у всех потомков также будет вызван 
     *      метод destroy (). 'options' будут переданы этим вызовам.
     * @param {boolean} [options.texture=false] - Должна ли также уничтожаться текущая текстура спрайта
     * @param {boolean} [options.baseTexture=false] - Должна ли также уничтожаться base texture спрайта
     */
    public destroy(options: IDestroyOptions|boolean): void
    {
        super.destroy(options);

        this._texture.off('update', this._onTextureUpdate, this);

        this._anchor = null;

        const destroyTexture = typeof options === 'boolean' ? options : options && options.texture;

        if (destroyTexture)
        {
            const destroyBaseTexture = typeof options === 'boolean' ? options : options && options.baseTexture;

            this._texture.destroy(!!destroyBaseTexture);
        }

        this._texture = null;
    }

    // некоторые вспомогательные функции..

    /**
     * Вспомогательная функция, которая создает новый спрайт на основе предоставленного вами источника..
     * Источник может быть - frame id, image url, video url, canvas element, video element, base texture
     *
     * @static
     * @param {string|PIXI.Texture|HTMLCanvasElement|HTMLVideoElement} source - Источник для создания текстуры из
     * @param {object} [options] - см. конструктор {@link PIXI.BaseTexture} на предмет возможных опций.
     * @return {PIXI.Sprite} Вновь созданный спрайт
     */
    static from(source: SpriteSource, options: IBaseTextureOptions): Sprite
    {
        const texture = (source instanceof Texture)
            ? source
            : Texture.from(source, options);

        return new Sprite(texture);
    }

    /**
     * Если true, PixiJS будет использовать Math.floor () значения x / y при рендеринге, останавливая интерполяцию пикселей..
     * К преимуществам можно отнести более четкое изображение (например, текста) и более быструю визуализацию на холсте.
     * Главный недостаток - движение предметов может казаться менее плавным.
     * Чтобы установить глобальное значение по умолчанию, измените {@link PIXI.settings.ROUND_PIXELS}
     *
     * @member {boolean}
     * @default false
     */
    set roundPixels(value: boolean)
    {
        if (this._roundPixels !== value)
        {
            this._transformID = -1;
        }
        this._roundPixels = value;
    }

    get roundPixels(): boolean
    {
        return this._roundPixels;
    }

    /**
     * Установка ширины спрайта фактически изменит масштаб для достижения установленного значения.
     *
     * @member {number}
     */
    get width(): number
    {
        return Math.abs(this.scale.x) * this._texture.orig.width;
    }

    set width(value: number)
    {
        const s = sign(this.scale.x) || 1;

        this.scale.x = s * value / this._texture.orig.width;
        this._width = value;
    }

    /**
     * Установка высоты спрайта фактически изменит масштаб для достижения установленного значения.
     *
     * @member {number}
     */
    get height(): number
    {
        return Math.abs(this.scale.y) * this._texture.orig.height;
    }

    set height(value: number)
    {
        const s = sign(this.scale.y) || 1;

        this.scale.y = s * value / this._texture.orig.height;
        this._height = value;
    }

    /**
     * Якорь устанавливает исходную точку спрайта. Значение по умолчанию берется из {@link PIXI.Texture|Texture}
     * и передается конструктору.
     *
     * По умолчанию `(0,0)`, это означает, что опорная точка спрайта находится в верхнем левом углу.
     *
     * Установка якоря на `(0.5,0.5)` означает, что источник спрайта центрирован.
     *
     * Установка якоря на `(1,1)` будет означать, что исходная точка спрайта будет в правом нижнем углу.
     *
     * Если вы передадите только один параметр, он установит для x и y одно и то же значение, как показано в примере ниже..
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.anchor.set(0.5); // This will set the origin to center. (0.5) is same as (0.5, 0.5).
     *
     * @member {PIXI.ObservablePoint}
     */
    get anchor(): ObservablePoint
    {
        return this._anchor;
    }

    set anchor(value: ObservablePoint)
    {
        this._anchor.copyFrom(value);
    }

    /**
     * Оттенок, примененный к спрайту. Это шестнадцатеричное значение.
     * Значение 0xFFFFFF удалит любой эффект оттенка..
     *
     * @member {number}
     * @default 0xFFFFFF
     */
    get tint(): number
    {
        return this._tint;
    }

    set tint(value: number)
    {
        this._tint = value;
        this._tintRGB = (value >> 16) + (value & 0xff00) + ((value & 0xff) << 16);
    }

    /**
     * Текстура, которую использует спрайт
     *
     * @member {PIXI.Texture}
     */
    get texture(): Texture
    {
        return this._texture;
    }

    set texture(value: Texture)
    {
        if (this._texture === value)
        {
            return;
        }

        if (this._texture)
        {
            this._texture.off('update', this._onTextureUpdate, this);
        }

        this._texture = value || Texture.EMPTY;
        this._cachedTint = 0xFFFFFF;

        this._textureID = -1;
        this._textureTrimmedID = -1;

        if (value)
        {
            // дождитесь загрузки текстуры
            if (value.baseTexture.valid)
            {
                this._onTextureUpdate();
            }
            else
            {
                value.once('update', this._onTextureUpdate, this);
            }
        }
    }
}
