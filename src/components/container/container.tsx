import SortedMap from "collections/sorted-map";
import { Component, Prop, h, Watch, Element } from "@stencil/core";

@Component({
  shadow: true,
  styles: `:host {
      display: block;
    }`,
  tag: "animated-container"
})
export class Container {
  @Prop() stagger: number = 0;
  @Prop() duration: number = 250;
  @Prop() easing: string = "ease-in-out";

  @Element() host: HTMLElement;

  vDom = {};
  childCount: number;
  children: Element[];
  computedDelay: number = 0;
  delay: number = this.stagger;
  mutationObserver: MutationObserver;
  mutationObserverConfig = { childList: true };

  componentDidLoad() {
    this.children = Array.from(this.host.querySelectorAll("*"));
    this.childCount = this.children.length;

    // creates a representation of the dom.
    this.createVDOM(this.host, ...this.children);

    /** create MutationObserver instance and
     * listen for mutation events.
     */
    this.mutationObserver = new MutationObserver(this.mutationObserverCallback);

    this.setObservers();
  }

  disconnectedCallback() {
    this.vDom.clear();
    this.disconnectObservers();
  }

  setObservers() {
    this.mutationObserver.observe(this.host, this.mutationObserverConfig);

    window.addEventListener("resize", this.windowResize);

    // listen for mutation and resize events on child elements.
    this.children.forEach(child => {
      this.mutationObserver.observe(child, this.mutationObserverConfig);
    });
  }

  disconnectObservers() {
    this.mutationObserver.disconnect();
    window.removeEventListener("resize", this.windowResize);
  }

  mutationObserverCallback = () => {
    this._animate(this.host);
    this.children.forEach((child, i) => {
      this._animate(child, this.computedDelay);
      this.computedDelay += this.delay;
      if (i === this.childCount - 1) this.computedDelay = 0;
    });

    this.children = Array.from(this.host.querySelectorAll("*"));
    this.childCount = this.children.length;
  };

  windowResize = () => {
    this._animate(this.host);
    this.children.forEach(child => this._animate(child));
  };

  createVDOM(...nodes: any) {
    nodes.forEach((node: HTMLElement) => {
      let length = Object.keys(this.vDom).length;
      let key: number = this.random(0, length);
      while (this.vDom[key]) {
        key = this.random(0, length);
      }

      const nodeRect = this.getRect(node);
      const rect = {
        top: nodeRect.top,
        left: nodeRect.left,
        width: nodeRect.width,
        height: nodeRect.height
      };

      this.vDom[key] = rect;
      node.setAttribute("data-key", `${key}`);
    });
  }

  _animate(target: any, delay: number = 0) {
    const key = parseFloat(target.getAttribute("data-key"));
    const newRect = this.getRect(target);
    const oldRect = this.vDom[key];
    const computedStyle = getComputedStyle(target);

    if (
      computedStyle.position === "static" ||
      computedStyle.position === "relative"
    ) {
      const animation = target.animate(
        [
          {
            position: "relative",
            width: `${oldRect.width}px`,
            height: `${oldRect.height}px`,
            top: `${oldRect.top - newRect.top}px`,
            left: `${oldRect.left - newRect.left}px`
          },
          {
            top: 0,
            left: 0,
            position: "relative",
            width: `${newRect.width}px`,
            height: `${newRect.height}px`
          }
        ],
        {
          delay,
          fill: "both",
          easing: this.easing,
          duration: this.duration
        }
      );

      animation.onfinish = () => {
        this.vDom = {};
        animation.cancel();
        this.createVDOM(this.host, ...this.children);
      };
    }
  }

  random(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  getRect(element: HTMLElement) {
    return element.getBoundingClientRect();
  }

  @Watch("stagger")
  updateDelay(newValue: number) {
    this.stagger = newValue;
    this.delay = this.stagger;
  }

  @Watch("duration")
  updateDuration(newValue: number) {
    this.duration = newValue;
  }

  @Watch("easing")
  updateEasing(newValue: string) {
    this.easing = newValue;
  }

  render() {
    return <slot />;
  }
}
