'use strict';
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
    speed: 100
}

export function create(params: paramsType): void {
    const settings: paramsType = {
        ...defaultParams,
        ...params
    }
    if (!settings.domObject) throw new Error('Can not found document');
    switch(settings.type) {
        case "rotation":
        case "perspective":
            new Slider(settings)
            break;
        default:
            throw new Error('Can not found type')
    }
}

class Slider {
    dom: HTMLElement | null | undefined;
    now: number;
    max: number | undefined;
    containWidth: number | undefined;
    containHeight: number | undefined;
    type: string | undefined;
    isAutoplay: boolean | undefined;
    isDots: boolean | undefined;
    isArrow: boolean | undefined;
    isInfinite: boolean | undefined;
    isDraggable: boolean | undefined;
    autoplayDelay: number | undefined;
    speed: number | undefined;
    leftArrow: string | undefined;
    rightArrow: string | undefined;
    dotClass: string | undefined;

    constructor(props: paramsType) {
        this.dom = props.domObject;
        this.now = 0;
        this.max = this.dom?.childElementCount;
        this.containWidth;
        this.containHeight;
        this.type = props.type;
        this.isAutoplay = props.autoplay;
        this.isArrow = props.arrow;
        this.isDots = props.dots;
        this.isInfinite = props.infinite;
        this.isDraggable = props.draggable;
        this.autoplayDelay = props.autoplayDelay;
        this.speed = props.speed;
        this.leftArrow = props.leftArrow;
        this.rightArrow = props.rightArrow;
        this.dotClass = props.dotClass;

        this.init();

        window.onresize = this.init;
    }

    init() {
        this.containWidth = this.dom?.offsetWidth;
        this.containHeight = this.dom?.offsetHeight;
    }
}