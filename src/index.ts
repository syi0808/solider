"use strict";
interface paramsType {
  domObject?: HTMLElement | null;
  type?: "rotation" | "perspective";
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
  type: "rotation",
  autoplay: true,
  dots: false,
  arrow: false,
  infinite: false,
  draggable: false,
  autoplayDelay: 2000,
  speed: 100,
};

class Slider {
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
    this.dom?.setAttribute("class", "solider-contain-wrapper");
    this.containElement();
    this.removeImgDragging();
    this.addDots();
    this.addArrows();
    this.addDraggable();
    const dots = this.dotsDom?.children as HTMLCollectionOf<HTMLElement>;
    dots[0].style.background = "white";
  }

  resize() {
    this.clientWidth = this.dom?.clientWidth;
    this.clientHeight = this.dom?.clientHeight;
  }

  containElement() {
    const childrens = this.dom?.children;
    const tempDom = document.createElement("div");
    tempDom.setAttribute("class", "solider-content");
    if (!childrens || !this.max) return;
    for (let i = 0; i < this.max; i++) {
      tempDom.appendChild(childrens[0]);
    }
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
    const domWrapperElement: Element = document.createElement("div");
    const dotElement: Element = document.createElement("div");
    domWrapperElement.setAttribute("class", "solider-dots-wrapper");
    dotElement.setAttribute("class", "solider-dots");
    if (this.max === undefined) throw new Error("Can not found childElement");
    for (let index = 0; index < this.max; index++) {
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
    const leftArrowElement: Element = document.createElement("div");
    const rightArrowElement: Element = document.createElement("div");
    leftArrowElement.setAttribute("class", "solider-left-arrow");
    rightArrowElement.setAttribute("class", "solider-right-arrow");
    rightArrowElement.addEventListener("click", (event) => {
      console.log(this.sliding);
      if (this.sliding) return;
      if (this.max === undefined) throw new Error("Can not found childElement");
      if (this.now >= this.max - 1) return;
      this.now = this.now + 1;
      this.convertSlide(this.now);
    });
    leftArrowElement.addEventListener("click", (event) => {
      event.stopPropagation();
      if (this.sliding) return;
      if (this.now <= 0) return;
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
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = true;
    this.x = event.x;
    this.prevX = event.x;
  }

  dragEnd(event: MouseEvent) {
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = false;
    this.diffX = Number(
      this.contentDom?.style.transform.match(/-?\d+.?\d+(?=px)/)
    );
    const nowxPos = this.now * this.clientWidth!;
    const diffX = this.diffX + nowxPos;
    if (Math.abs(diffX) >= this.clientWidth! / 4) {
      if (diffX > 0) {
        if (!(this.now <= 0)) {
          this.now = this.now - 1;
        }
      } else if (diffX < 0) {
        if (!(this.now >= this.max! - 1)) {
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
    if (nowTrans > 0 && diffMouseX < 0) diffMouseX = diffMouseX / 2;
    else if (-nowTrans >= maxxPos && diffMouseX > 0)
      diffMouseX = diffMouseX / 2;
    moveX = nowTrans - diffMouseX;
    if (this.contentDom)
      this.contentDom.style.transform = `translate3D(${moveX}px, 0, 0)`;
    this.prevX = nowMouseX;
    this.nowxPos = moveX;
  }

  touchStart(event: TouchEvent) {
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = true;
    this.x = event.touches[0].pageX;
    this.prevX = event.touches[0].pageX;
  }

  touchEnd(event: TouchEvent) {
    if (this.check(event.target)) return;
    if (this.sliding) return;
    this.isDragging = false;
    this.diffX = Number(
      this.contentDom?.style.transform.match(/-?\d+.?\d+(?=px)/)
    );
    const nowxPos = this.now * this.clientWidth!;
    const diffX = this.diffX + nowxPos;
    if (Math.abs(diffX) >= this.clientWidth! / 4) {
      if (diffX > 0) {
        if (!(this.now <= 0)) {
          this.now = this.now - 1;
        }
      } else if (diffX < 0) {
        if (!(this.now >= this.max! - 1)) {
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
      throw new Error("Can not drag");
    if (this.prevX === undefined) this.prevX = 0;
    if (this.nowxPos === undefined) this.nowxPos = 0;
    const nowMouseX: number = event.touches[0].pageX;
    let diffMouseX: number = this.prevX - nowMouseX;
    const nowTrans: number = this.nowxPos;
    let moveX: number = 0;
    const maxxPos = (this.max - 1) * this.dom!.clientWidth;
    if (nowTrans > 0 && diffMouseX < 0) diffMouseX = diffMouseX / 2;
    else if (-nowTrans >= maxxPos && diffMouseX > 0)
      diffMouseX = diffMouseX / 2;
    moveX = nowTrans - diffMouseX;
    if (this.contentDom)
      this.contentDom.style.transform = `translate3D(${moveX}px, 0, 0)`;
    this.prevX = nowMouseX;
    this.nowxPos = moveX;
  }

  convertSlide(index: number) {
    if (!this.contentDom) throw new Error("Can not found solider-content");
    if (this.sliding) return;
    const moveX = -(index * this.clientWidth!);
    const dots = this.dotsDom?.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < dots.length; i++) {
      dots[i].style.background = "black";
      dots[i].style.cursor = "pointer";
    }
    dots[index].style.background = "white";
    dots[index].style.cursor = "default";
    this.sliding = true;
    this.contentDom.style.transition =
      "0.4s all cubic-bezier(0.370, 0.230, 0.095, 0.915)";
    this.contentDom.style.transform = `translate3D(${moveX}px, 0, 0)`;
    document.getElementsByClassName("solider-dots-wrapper");
    this.nowxPos = moveX;
    setTimeout(() => {
      this.contentDom!.style.transition = "none";
      this.sliding = false;
    }, 400);
  }

  check(target: EventTarget | null): boolean {
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

  addInfinite() {}

  addAutoplay() {}

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

export function create(params: paramsType): void {
  const settings: paramsType = {
    ...defaultParams,
    ...params,
  };
  if (!settings.domObject) throw new Error("Can not found document");
  switch (settings.type) {
    case "rotation":
    case "perspective":
      new Slider(settings);
      break;
    default:
      throw new Error("Can not found type");
  }
}
