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
    constructor(props: paramsType) {
        this.init();
    }

    init() {

    }
}