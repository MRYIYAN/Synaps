//===========================================================================   //
//                             PIXEL CANVAS DE SYNAPS                           //
//===========================================================================   //
//  Este archivo define un componente web personalizado (Web Component) que     //
//  crea efectos visuales de píxeles animados. Se utiliza para dar un aspecto   //
//  distintivo a ciertos elementos de la interfaz como botones y subtítulos.    //
//  Los píxeles aparecen/desaparecen con animaciones suaves cuando el usuario   //
//  interactúa con los elementos que contienen este componente.                 //
//===========================================================================   //

//===========================================================================   //
//                             CLASE PIXEL                                      //
//===========================================================================   //
//  Define cada píxel individual y su comportamiento en la animación.           //
//  Contiene métodos para dibujar, aparecer, desaparecer y crear efectos        //
//  visuales como el brillo (shimmer).                                          //
//===========================================================================   //
class Pixel {
  constructor(canvas, context, x, y, color, speed, delay) {
    this.width = canvas.width;
    this.height = canvas.height;
    this.ctx = context;
    this.x = x;
    this.y = y;
    this.color = color;
    this.speed = this.getRandomValue(0.1, 0.9) * speed;
    this.size = 0;
    this.sizeStep = Math.random() * 0.4;
    this.minSize = 0.5;
    this.maxSizeInteger = 2;
    this.maxSize = this.getRandomValue(this.minSize, this.maxSizeInteger);
    this.delay = delay;
    this.counter = 0;
    this.counterStep = Math.random() * 4 + (this.width + this.height) * 0.01;
    this.isIdle = false;
    this.isReverse = false;
    this.isShimmer = false;
  }

  // Genera un valor aleatorio dentro de un rango específico
  getRandomValue(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Dibuja el píxel en el canvas
  draw() {
    const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;

    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(
      this.x + centerOffset,
      this.y + centerOffset,
      this.size,
      this.size
    );
  }

  // Maneja la animación de aparición del píxel
  appear() {
    this.isIdle = false;

    if (this.counter <= this.delay) {
      this.counter += this.counterStep;
      return;
    }

    if (this.size >= this.maxSize) {
      this.isShimmer = true;
    }

    if (this.isShimmer) {
      this.shimmer();
    } else {
      this.size += this.sizeStep;
    }

    this.draw();
  }

  // Maneja la animación de desaparición del píxel
  disappear() {
    this.isShimmer = false;
    this.counter = 0;

    if (this.size <= 0) {
      this.isIdle = true;
      return;
    } else {
      this.size -= 0.1;
    }

    this.draw();
  }

  // Crea un efecto de brillo oscilando el tamaño del píxel
  shimmer() {
    if (this.size >= this.maxSize) {
      this.isReverse = true;
    } else if (this.size <= this.minSize) {
      this.isReverse = false;
    }

    if (this.isReverse) {
      this.size -= this.speed;
    } else {
      this.size += this.speed;
    }
  }
}

//===========================================================================   //
//                          COMPONENTE WEB PIXELCANVAS                          //
//===========================================================================   //
//  Componente web personalizado que crea un lienzo de píxeles animados.        //
//  Maneja la creación, animación y gestión del ciclo de vida del componente,   //
//  así como los eventos de interacción del usuario.                            //
//===========================================================================   //
class PixelCanvas extends HTMLElement {
  // Registra el componente en el navegador con el nombre de etiqueta especificado
  static register(tag = "pixel-canvas") {
    if ("customElements" in window) {
      customElements.define(tag, this);
    }
  }

  // Estilos CSS para el componente
  static css = `
    :host {
      display: grid;
      inline-size: 100%;
      block-size: 100%;
      overflow: hidden;
    }
  `;

  // Obtiene los colores de los píxeles desde el atributo data-colors
  get colors() {
    return this.dataset.colors?.split(",") || ["#f8fafc", "#f1f5f9", "#cbd5e1"];
  }

  // Obtiene el espacio entre píxeles desde el atributo data-gap
  get gap() {
    const value = this.dataset.gap || 5;
    const min = 4;
    const max = 50;

    if (value <= min) {
      return min;
    } else if (value >= max) {
      return max;
    } else {
      return parseInt(value);
    }
  }

  // Obtiene la velocidad de animación desde el atributo data-speed
  get speed() {
    const value = this.dataset.speed || 35;
    const min = 0;
    const max = 100;
    const throttle = 0.001;

    if (value <= min || this.reducedMotion) {
      return min;
    } else if (value >= max) {
      return max * throttle;
    } else {
      return parseInt(value) * throttle;
    }
  }

  // Verifica si se debe ignorar el enfoque (focus) para la animación
  get noFocus() {
    return this.hasAttribute("data-no-focus");
  }

  // Se ejecuta cuando el componente se añade al DOM
  connectedCallback() {
    const canvas = document.createElement("canvas");
    const sheet = new CSSStyleSheet();

    this._parent = this.parentNode;
    this.shadowroot = this.attachShadow({ mode: "open" });

    sheet.replaceSync(PixelCanvas.css);

    this.shadowroot.adoptedStyleSheets = [sheet];
    this.shadowroot.append(canvas);
    this.canvas = this.shadowroot.querySelector("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.timeInterval = 1000 / 60;
    this.timePrevious = performance.now();
    this.reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    this.init();
    this.resizeObserver = new ResizeObserver(() => this.init());
    this.resizeObserver.observe(this);

    this._parent.addEventListener("mouseenter", this);
    this._parent.addEventListener("mouseleave", this);

    if (!this.noFocus) {
      this._parent.addEventListener("focusin", this);
      this._parent.addEventListener("focusout", this);
    }
  }

  // Se ejecuta cuando el componente se elimina del DOM
  disconnectedCallback() {
    this.resizeObserver.disconnect();
    this._parent.removeEventListener("mouseenter", this);
    this._parent.removeEventListener("mouseleave", this);

    if (!this.noFocus) {
      this._parent.removeEventListener("focusin", this);
      this._parent.removeEventListener("focusout", this);
    }

    delete this._parent;
  }

  // Maneja todos los eventos del componente
  handleEvent(event) {
    this[`on${event.type}`](event);
  }

  // Maneja el evento de entrada del ratón
  onmouseenter() {
    this.handleAnimation("appear");
  }

  // Maneja el evento de salida del ratón
  onmouseleave() {
    this.handleAnimation("disappear");
  }

  // Maneja el evento de enfoque
  onfocusin(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    this.handleAnimation("appear");
  }

  // Maneja el evento de pérdida de enfoque
  onfocusout(e) {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    this.handleAnimation("disappear");
  }

  // Inicia la animación especificada
  handleAnimation(name) {
    cancelAnimationFrame(this.animation);
    this.animation = this.animate(name);
  }

  // Inicializa el canvas y crea los píxeles
  init() {
    const rect = this.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    this.pixels = [];
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.createPixels();
  }

  // Calcula la distancia desde un punto al centro del canvas
  getDistanceToCanvasCenter(x, y) {
    const dx = x - this.canvas.width / 2;
    const dy = y - this.canvas.height / 2;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance;
  }

  // Crea los objetos de píxeles distribuidos en el canvas
  createPixels() {
    for (let x = 0; x < this.canvas.width; x += this.gap) {
      for (let y = 0; y < this.canvas.height; y += this.gap) {
        const color = this.colors[
          Math.floor(Math.random() * this.colors.length)
        ];
        const delay = this.reducedMotion
          ? 0
          : this.getDistanceToCanvasCenter(x, y);

        this.pixels.push(
          new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay)
        );
      }
    }
  }

  // Ejecuta el bucle de animación para todos los píxeles
  animate(fnName) {
    this.animation = requestAnimationFrame(() => this.animate(fnName));

    const timeNow = performance.now();
    const timePassed = timeNow - this.timePrevious;

    if (timePassed < this.timeInterval) return;

    this.timePrevious = timeNow - (timePassed % this.timeInterval);

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.pixels.length; i++) {
      this.pixels[i][fnName]();
    }

    if (this.pixels.every((pixel) => pixel.isIdle)) {
      cancelAnimationFrame(this.animation);
    }
  }
}

// Registrar el componente web personalizado
PixelCanvas.register();

export default PixelCanvas;