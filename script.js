const insert = document.querySelector("#insert");
const remove = document.querySelector("#remove");
const shuffle = document.querySelector("#shuffle");
const animatedContainer = document.querySelector(".grid");

const controls = document.querySelector(".controls");
const easingsControl = controls.querySelector(".easings");
const staggerControl = controls.querySelector(".stagger");
const durationControl = controls.querySelector(".duration");

const buttonsExample = document.querySelector(".buttons-example");
const buttons = buttonsExample.querySelectorAll("button");

[staggerControl, durationControl, easingsControl].map(control => {
  control.addEventListener("change", e => {
    animatedContainer.setAttribute(control.name, control.value);
  });
});

window.addEventListener("DOMContentLoaded", () => {
  document.body.classList.remove('loading');
});

buttons.forEach(button => {
  button.addEventListener("click", () => {
    const text = button.textContent;
    if (text === "click me") {
      button.textContent = text + " again";
    } else {
      button.textContent = "click me";
    }
  });
});

insert.addEventListener("click", e => {
  const children = animatedContainer.children;
  const item = document.createElement("div");
  const random_item = children[random(0, children.length - 1)];
  item.textContent = "item";
  item.className = "item";
  item.animate(
    [
      {
        opacity: 0,
        background: "blue",
        transform: "translate3d(100px, 0, 0)"
      },
      {
        opacity: 1,
        background: "white",
        transform: "translate3d(0, 0, 0)"
      }
    ],
    { duration: 250 }
  );

  animatedContainer.insertBefore(item, random_item);
});

remove.addEventListener("click", e => {
  const children = animatedContainer.children;
  const random_item = children[random(0, children.length - 1)];
  const end = () => {
    animatedContainer.removeChild(random_item);
    random_item.removeEventListener("transitionend", end);
  };

  random_item.classList.add("remove");
  random_item.addEventListener("transitionend", end);
});

shuffle.addEventListener("click", () => {
  _shuffle(animatedContainer.children);
});

function _shuffle(elements) {
  let len = elements.length;

  for (let i = 0; i < len; i++) {
    const a = elements[random(0, len - 1)];
    const b = elements[random(0, len - 1)];
    a.parentNode.insertBefore(b, a);
  }
}

function random(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
