import { getRect, random, hasValueChanged } from "../../utils/utils";
import ResizeObserver from "@juggle/resize-observer";
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
  resizeObserver: ResizeObserver;
  mutationObserver: MutationObserver;
  mutationObserverConfig = { childList: true };
  valuesToWatch = ["top", "left", "width", "height"];

  componentDidRender() {
    this.children = Array.from(this.host.querySelectorAll("*"));
    this.childCount = this.children.length;

    // creates a representation of the dom.
    this.createVDOM(this.host, ...this.children);

    /** create ResizeObserver instance and
     * listen for resize events.
     */
    this.resizeObserver = new ResizeObserver(this.observeChanges);

    /** create MutationObserver instance and
     * listen for mutation events.
     */
    this.mutationObserver = new MutationObserver(this.observeChanges);

    this.setObservers();
  }

  disconnectedCallback() {
    this.vDom = {};
    this.disconnectObservers();
  }

  setObservers() {
    this.resizeObserver.observe(this.host);
    this.mutationObserver.observe(this.host, this.mutationObserverConfig);

    window.addEventListener("resize", this.windowResize);

    // listen for mutation and resize events on child elements.
    this.children.forEach(child => {
      this.resizeObserver.observe(child);
      this.mutationObserver.observe(child, this.mutationObserverConfig);
    });
  }

  disconnectObservers() {
    this.mutationObserver.disconnect();
    window.removeEventListener("resize", this.windowResize);
  }

  observeChanges = () => {
    this.computedDelay = 0;
    this._animate(this.host);

    this.children.forEach(child => this._animate(child));

    this.children = Array.from(this.host.querySelectorAll("*"));
    this.childCount = this.children.length;
  };

  windowResize = () => {
    this._animate(this.host);
    this.children.forEach((child, i) => {
      this._animate(child);
      if (i === this.childCount - 1) this.computedDelay = 0;
    });
  };

  createVDOM(...nodes: any) {
    nodes.forEach((node: HTMLElement) => {
      let length = Object.keys(this.vDom).length;
      let key: number = random(0, length);

      while (this.vDom[key]) key = random(0, length);

      const nodeRect = getRect(node);
      const rect = {};

      this.valuesToWatch.forEach(value => {
        rect[value] = nodeRect[value];
      });

      this.vDom[key] = rect;
      node.setAttribute("data-key", `${key}`);
    });
  }

  _animate(target: any) {
    const key = parseFloat(target.getAttribute("data-key"));
    const newRect = getRect(target);
    const oldRect = this.vDom[key];
    const computedStyle = getComputedStyle(target);

    // const transitionDuration = target.style.transitionDuration;
    // target.style.transition = "none";

    if (target.hasAttribute("data-is-animating")) return;

    if (
      computedStyle.position === "static" ||
      computedStyle.position === "relative"
    ) {
      const changedValues = [];

      // checks if specified values changed
      this.valuesToWatch.map(value => {
        if (hasValueChanged(oldRect, newRect, value)) {
          changedValues.push(value);
        }
      });

      const toAnimation = {
        position: "relative"
      };

      const fromAnimation = Object.assign({}, toAnimation);

      if (changedValues.length === 0) return;

      console.log(this.computedDelay, this.delay);

      /**
       * collects old and new values that changed for
       * animation.
       */
      changedValues.map(changedValue => {
        let newValue = newRect[changedValue];
        let oldValue = oldRect[changedValue];

        if (changedValue === "top" || changedValue === "left") {
          newValue = 0;
          oldValue = oldRect[changedValue] - newRect[changedValue];
        }

        toAnimation[changedValue] = `${newValue}px`;
        fromAnimation[changedValue] = `${oldValue}px`;
      });

      const animation = target.animate([fromAnimation, toAnimation], {
        fill: "backwards",
        easing: this.easing,
        duration: this.duration,
        delay: this.computedDelay
      });

      this.computedDelay += this.delay;
      target.setAttribute("data-is-animating", true);

      animation.onfinish = () => {
        this.vDom = {};
        animation.cancel();

        // if (transitionDuration.trim() === "") {
        //   target.style.removeProperty("transition");
        // } else {
        //   target.style.transition = transitionDuration;
        // }

        target.removeAttribute("data-is-animating");
        this.createVDOM(this.host, ...this.children);
      };
    }
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
