"use strict";
interface paramsType {
  domObject?: HTMLElement | null;
  type?: "2d" | "rotation" | "perspective";
  autoplay?: boolean;
  dots?: boolean;
  arrow?: boolean;
  infinite?: boolean;
  draggable?: boolean;
  autoplayDelay?: number;
  speed?: number;
  leftArrow?: string;
  rightArrow?: string;
  dotClass?: string;
}

const defaultParams: paramsType = {
  domObject: null,
  type: "2d",
  autoplay: false,
  dots: false,
  arrow: false,
  infinite: false,
  draggable: false,
  autoplayDelay: 5000,
  speed: 400,
};

interface Slider {
  init(): void;
  resize(): void;
  containElement(): void;
  removeImgDragging(): void;
  addDots(): void;
  addArrows(): void;
  addDraggable(): void;
  dragStart(event: MouseEvent): void;
  dragEnd(event: MouseEvent): void;
  dragging(event: MouseEvent): void;
  touchStart(event: TouchEvent): void;
  touchEnd(event: TouchEvent): void;
  touching(event: TouchEvent): void;
  convertSlide(index: number): void;
  appendEnd(): void;
  check(target: EventTarget | null): boolean;
  addAutoplay(): void;
  addEffect(): void;
}

class Slider implements Slider {
  dom: HTMLElement | null | undefined;
  contentDom: HTMLElement | null | undefined;
  dotsDom: Element | undefined;
  x: number | undefined;
  diffX: number | undefined;
  prevX: number | undefined;
  nowxPos: number | undefined;
  now: number;
  max: number | undefined;
  clientWidth: number | undefined;
  clientHeight: number | undefined;
  type: string | undefined;
  sliding: boolean | undefined;
  isAutoplay: boolean | undefined;
  isDots: boolean | undefined;
  isArrow: boolean | undefined;
  isInfinite: boolean | undefined;
  isDraggable: boolean | undefined;
  isDragging: boolean;
  autoplayDelay: number | undefined;
  speed: number | undefined;
  leftArrow: string | undefined;
  rightArrow: string | undefined;
  dotClass: string | undefined;
  timeoutObject: ReturnType<typeof setTimeout> | undefined;
  intervalObject: ReturnType<typeof setInterval> | undefined;

  constructor(props: paramsType) {
    this.dom = props.domObject;
    this.contentDom;
    this.dotsDom;
    this.x;
    this.diffX = 0;
    this.prevX = 0;
    this.nowxPos = 0;
    this.now = 0;
    this.max = this.dom?.childElementCount;
    this.clientWidth;
    this.clientHeight;
    this.type = props.type;
    this.sliding = false;
    this.isAutoplay = props.autoplay;
    this.isArrow = props.arrow;
    this.isDots = props.dots;
    this.isInfinite = props.infinite;
    this.isDraggable = props.draggable;
    this.isDragging = false;
    this.autoplayDelay = props.autoplayDelay;
    this.speed = props.speed;
    this.leftArrow = props.leftArrow;
    this.rightArrow = props.rightArrow;
    this.dotClass = props.dotClass;
    this.timeoutObject;
    this.intervalObject;

    this.init();
    window.onresize = this.resize;
  }

  init() {
    this.clientWidth = this.dom?.clientWidth;
    this.clientHeight = this.dom?.clientHeight;
    this.dom!.style.overflowX = "hidden";
    this.dom!.style.position = "relative";
    this.containElement();
    this.removeImgDragging();
    this.addDots();
    this.addArrows();
    this.addDraggable();
    const dots = this.dotsDom?.children as HTMLCollectionOf<HTMLElement>;
    dots[0].style.background = "white";
    if (this.isInfinite) {
      this.appendEnd();
    }
    if (this.isAutoplay) {
      this.addAutoplay();
    }
    this.addEffect();
  }

  resize() {
    this.clientWidth = this.dom?.clientWidth;
    this.clientHeight = this.dom?.clientHeight;
  }

  containElement() {
    const childrens = this.dom?.children as HTMLCollectionOf<HTMLElement>;
    const tempDom = document.createElement("div");
    tempDom.style.display = "grid";
    tempDom.style.cursor = "pointer";
    tempDom.style.width = "100%";
    tempDom.style.height = "100%";
    tempDom.style.gridTemplateRows = "100%";
    if (!childrens || !this.max) return;
    for (let i = 0; i < this.max; i++) {
      childrens[0].style.width = "100%";
      childrens[0].style.height = "100%";
      tempDom.appendChild(childrens[0]);
    }
    if (this.isInfinite)
      tempDom.style.gridTemplateColumns = `repeat(${
        tempDom.childElementCount + 2
      }, 100%)`;
    else
      tempDom.style.gridTemplateColumns = `repeat(${tempDom.childElementCount}, 100%)`;
    this.dom?.appendChild(tempDom);
    this.contentDom = tempDom;
  }

  removeImgDragging() {
    const elements = this.dom!.getElementsByTagName("img");
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      element.setAttribute("draggable", "false");
    }
  }

  addDots() {
    const domWrapperElement: HTMLElement = document.createElement("div");
    const dotElement: HTMLElement = document.createElement("div");
    domWrapperElement.style.position = "absolute";
    domWrapperElement.style.bottom = "10px";
    domWrapperElement.style.left = "50%";
    domWrapperElement.style.transform = "translateX(-50%)";
    domWrapperElement.style.display = "flex";
    if (this.dotClass) dotElement.classList.add(this.dotClass);
    else {
      dotElement.style.width = "10px";
      dotElement.style.height = "10px";
      dotElement.style.background = "black";
      dotElement.style.marginRight = "6px";
      dotElement.style.borderRadius = "50%";
      dotElement.style.cursor = "pointer";
    }
    if (this.max === undefined) throw new Error("Can not found childElement");
    for (let index = 0; index < this.max; index++) {
      if (index === this.max - 1) dotElement.style.marginRight = "0";
      const tempDotElement: Node = dotElement.cloneNode();
      const nowPage = index;
      tempDotElement.addEventListener("click", () => {
        if (this.sliding) return;
        this.now = nowPage;
        this.convertSlide(this.now);
      });
      domWrapperElement.appendChild(tempDotElement);
    }
    this.dom?.appendChild(domWrapperElement);
    this.dotsDom = domWrapperElement;
  }

  addArrows() {
    let leftArrowElement: HTMLElement = document.createElement("div");
    let rightArrowElement: HTMLElement = document.createElement("div");
    leftArrowElement.setAttribute("class", "solider-left-arrow");
    rightArrowElement.setAttribute("class", "solider-right-arrow");
    if (this.leftArrow) {
      leftArrowElement.innerHTML = this.leftArrow;
      leftArrowElement = leftArrowElement
        .children[0] as HTMLCollectionOf<HTMLElement>[0];
      leftArrowElement.classList.add("solider-left-arrow");
    } else {
      leftArrowElement.style.background = "black";
      leftArrowElement.style.width = "20px";
      leftArrowElement.style.height = "20px";
      leftArrowElement.style.position = "absolute";
      leftArrowElement.style.top = "50%";
      leftArrowElement.style.left = "15px";
      leftArrowElement.style.fontSize = "20px";
      leftArrowElement.style.transform = "translateY(-50%)";
    }
    if (this.rightArrow) {
      rightArrowElement.innerHTML = this.rightArrow;
      rightArrowElement = rightArrowElement
        .children[0] as HTMLCollectionOf<HTMLElement>[0];
      rightArrowElement.classList.add("solider-right-arrow");
    } else {
      rightArrowElement.style.background = "black";
      rightArrowElement.style.width = "20px";
      rightArrowElement.style.height = "20px";
      rightArrowElement.style.position = "absolute";
      rightArrowElement.style.top = "50%";
      rightArrowElement.style.right = "15px";
      rightArrowElement.style.fontSize = "20px";
      rightArrowElement.style.transform = "translateY(-50%)";
    }
    rightArrowElement.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.sliding) return;
      if (this.max === undefined) throw new Error("Can not found childElement");
      if (this.now >= this.max - 1 && !this.isInfinite) return;
      this.now = this.now + 1;
      this.convertSlide(this.now);
    });
    leftArrowElement.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.sliding) return;
      if (this.now <= 0 && !this.isInfinite) return;
      this.now = this.now - 1;
      this.convertSlide(this.now);
    });
    this.dom?.appendChild(leftArrowElement);
    this.dom?.appendChild(rightArrowElement);
  }

  addDraggable() {
    this.dom?.addEventListener("mousedown", this.dragStart.bind(this));
    this.dom?.addEventListener("mousemove", this.dragging.bind(this));
    window.addEventListener("mouseup", this.dragEnd.bind(this));
    this.dom?.addEventListener("touchstart", this.touchStart.bind(this));
    this.dom?.addEventListener("touchmove", this.touching.bind(this));
    window.addEventListener("touchend", this.touchEnd.bind(this));
  }

  dragStart(event: MouseEvent) {
    if (this.intervalObject) {
      clearInterval(this.intervalObject);
      this.addAutoplay();
    }
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = true;
    this.x = event.x;
    this.prevX = event.x;
  }

  dragEnd(event: MouseEvent) {
    if (this.check(event.target)) return;
    if (this.sliding || !this.isDragging) return;
    this.isDragging = false;
    this.diffX = Number(
      this.contentDom?.style.transform.match(/-?\d+.?\d+(?=px)/)
    );
    let nowxPos = this.now * this.clientWidth!;
    if (this.isInfinite) {
      nowxPos = nowxPos + this.clientWidth!;
    }
    const diffX = this.diffX + nowxPos;
    const direction = diffX > 0 ? 1 : diffX < 0 ? -1 : 0;
    if (Math.abs(diffX) >= this.clientWidth! / 4) {
      if (direction === 1) {
        if (this.now > 0) {
          this.now = this.now - 1;
        } else if (this.isInfinite) {
          this.now = this.now - 1;
        }
      } else if (direction === -1) {
        if (this.now < this.max! - 1) {
          this.now = this.now + 1;
        } else if (this.isInfinite) {
          this.now = this.now + 1;
        }
      }
    }
    this.convertSlide(this.now);
  }

  dragging(event: MouseEvent) {
    if (this.check(event.target)) return;
    if (
      this.isDragging === false ||
      this.x === undefined ||
      this.diffX === undefined ||
      this.max === undefined ||
      this.sliding
    )
      return;
    if (this.prevX === undefined) this.prevX = 0;
    if (this.nowxPos === undefined) this.nowxPos = 0;
    const nowMouseX: number = event.x;
    let diffMouseX: number = this.prevX - nowMouseX;
    const nowTrans: number = this.nowxPos;
    let moveX: number = 0;
    const maxxPos = (this.max - 1) * this.dom!.clientWidth;
    if (!this.isInfinite) {
      if (nowTrans > 0 && diffMouseX < 0) diffMouseX = diffMouseX / 2;
      else if (-nowTrans >= maxxPos && diffMouseX > 0)
        diffMouseX = diffMouseX / 2;
    }
    moveX = nowTrans - diffMouseX;
    this.contentDom!.style.transform = `translate3d(${moveX}px, 0, 0)`;
    this.prevX = nowMouseX;
    this.nowxPos = moveX;
  }

  touchStart(event: TouchEvent) {
    if (this.intervalObject) {
      clearInterval(this.intervalObject);
      this.addAutoplay();
    }
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = true;
    this.x = event.touches[0].pageX;
    this.prevX = event.touches[0].pageX;
  }

  touchEnd(event: TouchEvent) {
    if (this.check(event.target)) return;
    if (this.sliding || !this.isDragging) return;
    this.isDragging = false;
    this.diffX = Number(
      this.contentDom?.style.transform.match(/-?\d+.?\d+(?=px)/)
    );
    let nowxPos = this.now * this.clientWidth!;
    if (this.isInfinite) {
      nowxPos = nowxPos + this.clientWidth!;
    }
    const diffX = this.diffX + nowxPos;
    const direction = diffX > 0 ? 1 : diffX < 0 ? -1 : 0;
    if (Math.abs(diffX) >= this.clientWidth! / 4) {
      if (direction === 1) {
        if (this.now > 0) {
          this.now = this.now - 1;
        } else if (this.isInfinite) {
          this.now = this.now - 1;
        }
      } else if (direction === -1) {
        if (this.now < this.max! - 1) {
          this.now = this.now + 1;
        } else if (this.isInfinite) {
          this.now = this.now + 1;
        }
      }
    }
    this.convertSlide(this.now);
  }

  touching(event: TouchEvent) {
    if (this.check(event.target)) return;
    if (
      this.isDragging === false ||
      this.x === undefined ||
      this.diffX === undefined ||
      this.max === undefined ||
      this.sliding
    )
      return;
    if (this.prevX === undefined) this.prevX = 0;
    if (this.nowxPos === undefined) this.nowxPos = 0;
    const nowMouseX: number = event.touches[0].pageX;
    let diffMouseX: number = this.prevX - nowMouseX;
    const nowTrans: number = this.nowxPos;
    let moveX: number = 0;
    const maxxPos = (this.max - 1) * this.dom!.clientWidth;
    if (!this.isInfinite) {
      if (nowTrans > 0 && diffMouseX < 0) diffMouseX = diffMouseX / 2;
      else if (-nowTrans >= maxxPos && diffMouseX > 0)
        diffMouseX = diffMouseX / 2;
    }
    moveX = nowTrans - diffMouseX;
    this.contentDom!.style.transform = `translate3d(${moveX}px, 0, 0)`;
    this.prevX = nowMouseX;
    this.nowxPos = moveX;
  }

  convertSlide(index: number) {
    if (!this.contentDom) throw new Error("Can not found solider-content");
    if (this.sliding) return;
    let moveX = -(index * this.clientWidth!);
    if (this.isInfinite) {
      moveX = moveX - this.clientWidth!;
    }
    const dots = this.dotsDom?.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < dots.length; i++) {
      dots[i].style.background = "black";
      dots[i].style.cursor = "pointer";
    }
    if (index < 0) {
      index = this.max! - 1;
    } else if (index >= this.max!) {
      index = 0;
    }
    dots[index].style.background = "white";
    dots[index].style.cursor = "default";
    this.sliding = true;
    this.contentDom.style.transition = `${this.speed}ms all cubic-bezier(0.370, 0.230, 0.095, 0.915)`;
    this.contentDom.style.transform = `translate3D(${moveX}px, 0, 0)`;
    document.getElementsByClassName("solider-dots-wrapper");
    this.nowxPos = moveX;
    setTimeout(() => {
      this.contentDom!.style.transition = "none";
      this.sliding = false;
      if (this.isInfinite) {
        if (this.now >= this.max!) {
          this.contentDom!.style.transform = `translate3D(${-this
            .clientWidth!}px, 0, 0)`;
          this.nowxPos = -this.clientWidth!;
          this.now = 0;
        } else if (this.now < 0) {
          this.contentDom!.style.transform = `translate3D(${
            -this.clientWidth! * this.max!
          }px, 0, 0)`;
          this.nowxPos = -this.clientWidth! * this.max!;
          this.now = this.max! - 1;
        }
      }
    }, this.speed);
  }

  appendEnd() {
    const firstChild:
      | Node
      | undefined = this.contentDom!.firstChild?.cloneNode();
    const lastChild: Node | undefined = this.contentDom!.lastChild?.cloneNode();
    this.contentDom?.insertBefore(lastChild!, this.contentDom!.firstChild);
    this.contentDom?.appendChild(firstChild!);
    this.contentDom!.style.transform = `translate3D(${-this
      .clientWidth!}px, 0, 0)`;
    this.nowxPos = -this.clientWidth!;
  }

  check(target: EventTarget | null) {
    let isIn = false;
    for (let i = 0; i < this.dotsDom!.children.length; i++) {
      if (this.dotsDom?.children[i] === target) {
        isIn = true;
      }
    }
    if (
      target === document.getElementsByClassName("solider-right-arrow")[0] ||
      target === document.getElementsByClassName("solider-left-arrow")[0] ||
      isIn
    ) {
      return true;
    } else {
      return false;
    }
  }

  addAutoplay() {
    this.intervalObject = setInterval(() => {
      this.now = this.now + 1;
      if (!this.isInfinite) {
        if (this.now > this.max! - 1) {
          this.now = 0;
        }
      }
      this.convertSlide(this.now);
    }, this.autoplayDelay);
  }

  addEffect() {
    switch (this.type) {
      case "rotation":
        break;
      case "perspective":
        break;
      default:
        throw new Error("Can not found type");
    }
  }
}

class RotationSlider extends Slider {
  constructor(props: paramsType) {
    super(props);
    this.dom!.style.perspective = "800px";
    this.contentDom!.style.transformStyle = "preserve-3d";
    this.contentDom!.style.position = "relative";
    this.contentDom!.style.transform = `translateZ(${
      -this.clientWidth! / 2
    }px)`;
    const childs = this.contentDom!.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < childs.length; i++) {
      childs[i].style.position = "absolute";
      childs[i].style.transform = `rotateY(${i * 90}deg) translateZ(${
        this.clientWidth! / 2
      }px)`;
    }
  }

  dragging(event: MouseEvent) {
    if (this.check(event.target)) return;
    if (
      this.isDragging === false ||
      this.x === undefined ||
      this.diffX === undefined ||
      this.max === undefined ||
      this.sliding
    )
      return;
    if (this.prevX === undefined) this.prevX = 0;
    if (this.nowxPos === undefined) this.nowxPos = 0;
    const nowMouseX: number = event.x;
    let diffMouseX: number = this.prevX - nowMouseX;
    const nowTrans: number = this.nowxPos;
    let moveX: number = 0;
    const maxxPos = (this.max - 1) * this.dom!.clientWidth;
    if (!this.isInfinite) {
      if (nowTrans > 0 && diffMouseX < 0) diffMouseX = diffMouseX / 2;
      else if (-nowTrans >= maxxPos && diffMouseX > 0)
        diffMouseX = diffMouseX / 2;
    }
    moveX = nowTrans - diffMouseX;
    const childs = this.contentDom!.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < childs.length; i++) {
      childs[i].style.position = "absolute";
      childs[i].style.transform = `rotateY(${-(
        (Math.abs(moveX - this.clientWidth!) / this.clientWidth!) * 90 -
        90 * (i + 1)
      )}deg) translateZ(${this.clientWidth! / 2}px)`;
    }
    this.prevX = nowMouseX;
    this.nowxPos = moveX;
  }

  dragEnd(event: MouseEvent) {
    if (this.check(event.target)) return;
    if (this.sliding || !this.isDragging) return;
    this.isDragging = false;
    const children = this.contentDom!.children as HTMLCollectionOf<HTMLElement>;
    this.diffX = Number(children[0].style.transform.match(/-?\d+.?\d+(?=deg)/));
    let nowxPos = this.now * 90;
    const diffX = this.diffX + nowxPos;
    const direction = diffX > 0 ? 1 : diffX < 0 ? -1 : 0;
    if (Math.abs(diffX) >= 22.5) {
      if (direction === 1) {
        if (this.now > 0) {
          this.now = this.now - 1;
        } else if (this.isInfinite) {
          this.now = this.now - 1;
        }
      } else if (direction === -1) {
        if (this.now < this.max! - 1) {
          this.now = this.now + 1;
        } else if (this.isInfinite) {
          this.now = this.now + 1;
        }
      }
    }
    this.convertSlide(this.now);
  }

  convertSlide(index: number) {
    if (!this.contentDom) throw new Error("Can not found solider-content");
    if (this.sliding) return;
    let moveX = -(index * this.clientWidth!);
    const dots = this.dotsDom?.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < dots.length; i++) {
      dots[i].style.background = "black";
      dots[i].style.cursor = "pointer";
    }
    dots[index].style.background = "white";
    dots[index].style.cursor = "default";
    const childs = this.contentDom!.children as HTMLCollectionOf<HTMLElement>;
    this.sliding = true;
    for (let i = 0; i < childs.length; i++) {
      childs[
        i
      ].style.transition = `${this.speed}ms all cubic-bezier(0.370, 0.230, 0.095, 0.915)`;
      childs[i].style.transform = `rotateY(${
        i * 90 + this.now * -90
      }deg) translateZ(${this.clientWidth! / 2}px)`;
    }
    this.nowxPos = moveX;
    setTimeout(() => {
      this.sliding = false;
      const childs = this.contentDom!.children as HTMLCollectionOf<HTMLElement>;
      for (let i = 0; i < childs.length; i++) {
        childs[i].style.transition = "none";
      }
    }, 400);
  }
}

class DefaultSlider extends Slider {}
class PerspectiveSlider extends Slider {}

export function create(params: paramsType): void {
  const settings: paramsType = {
    ...defaultParams,
    ...params,
  };
  if (!settings.domObject) throw new Error("Can not found document");
  switch (settings.type) {
    case "2d":
      new DefaultSlider(settings);
      break;
    case "rotation":
      new RotationSlider(settings);
      break;
    case "perspective":
      new PerspectiveSlider(settings);
      break;
    default:
      throw new Error("Can not found type");
  }
}
