# Solider

## create function

### Parameters

- domObject: HTMLElement
  - domObject is slider container element. you need add img or any tags in domObject.
- type: "2d" | "rotation" | "perspective"
  - 2d is default type. normal 2d slider.
    rotation is 3d slider. this is box (this version is test version thus only four children)
    perspective is in development.
- autoplay: boolean
  - autoplay is "isAutoplay"
- dots: boolean
  - dots is "isDots"
- arrow: boolean
  - arrow is "isArrow"
- infinite: boolean
  - infinite is "isInfinite"
- draggable: boolean
  - draggable is "isDraggable". not only PC, but also mobile.
- autoplayDelay: number (ms)
- speed: number (ms)
  - speed is sliding duration.
- leftArrow: string
- rightArrow: string
  - Left or Right arrow is string of HTMLElement.
- dotClass: string
  - dotClaas is you want to add class in dot, you can use dotClass parameter.

### Default Parameters

- domObject: null
- type: 2d
- autoplay: false
- dots: false
- arrow: false
- infinite: false
- draggable: false
- autoplayDelay: 5000
- speed: 400
