import { Signal } from "./signals";
let instancesOf = (target, ...constructors) => constructors.some((constructor) => target instanceof constructor);
export let fragment = (...members) => {
    let fragment = document.createDocumentFragment();
    if (members)
        fragment.append(...members.map(toAppendable));
    return fragment;
};
let toAppendable = (value) => {
    if (value == null) {
        return "";
    }
    if (instancesOf(value, Element, DocumentFragment, CharacterData)) {
        return value;
    }
    if (instancesOf(value, Signal)) {
        let wrapper = enchance("div");
        wrapper.style.display = "contents";
        wrapper.onConnect(() => value.follow((value) => wrapper.replaceChildren(toAppendable(value)), true));
        return wrapper;
    }
    if (instancesOf(value, Builder)) {
        return value.element;
    }
    if (Array.isArray(value)) {
        return fragment(...value.map(toAppendable));
    }
    return String(value);
};
let enchance = (tagname, newTagName = `enchance-${tagname}`, custom = customElements, constructor = custom.get(newTagName)) => {
    if (!constructor) {
        custom.define(newTagName, (constructor = class extends document.createElement(tagname).constructor {
            #connectedCallbacks = new Set();
            #disconnectedCallbacks = new Set();
            connectedCallback() {
                for (let callback of this.#connectedCallbacks) {
                    let disconnectedCallback = callback();
                    if (disconnectedCallback)
                        this.#disconnectedCallbacks.add(disconnectedCallback);
                }
            }
            disconnectedCallback() {
                for (let callback of this.#disconnectedCallbacks) {
                    callback();
                }
            }
            onConnect(connectedCallback) {
                this.#connectedCallbacks.add(connectedCallback);
            }
        }), { extends: tagname });
    }
    return new constructor();
};
export let tags = new Proxy({}, {
    get: (_, tag) => (attributes = {}) => Builder.Proxy(enchance(tag)).attributes(attributes),
});
export class Builder {
    element;
    constructor(element) {
        this.element = element;
    }
    /*
        Since we access buildier from, BuilderProxy
        Make sure to only use and override names that already exist in HTMLElement(s)
        We don't wanna conflict with something that might come in the future.
    */
    children(...members) {
        let element = this.element;
        element.append(...members.map(toAppendable));
        return this;
    }
    attributes(attributes) {
        let element = this.element;
        for (let name in attributes) {
            let value = attributes[name];
            let setOrRemoveAttribute = (value) => {
                if (value == null) {
                    element.removeAttribute(name);
                }
                else {
                    element.setAttribute(name, String(value));
                }
            };
            if (instancesOf(value, Signal)) {
                // @ts-ignore
                element.onConnect(() => value.follow(setOrRemoveAttribute, true));
            }
            else {
                setOrRemoveAttribute(value);
            }
        }
        return this;
    }
    static Proxy = (element) => new Proxy(new Builder(element), {
        get: (target, name, proxy) => target[name] ??
            (name in element &&
                ((value) => {
                    if (instancesOf(value, Signal)) {
                        ;
                        element.onConnect(() => value.follow((value) => {
                            ;
                            element[name] = value;
                        }));
                    }
                    else {
                        ;
                        element[name] = value;
                    }
                    return proxy;
                })),
    });
}
