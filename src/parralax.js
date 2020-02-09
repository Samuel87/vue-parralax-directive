const observe = (item) => {
    const opts = { rootMargin: '50% 0px' };
    const io = new IntersectionObserver((entries) => {
        let [{ isIntersecting }] = entries;
        item.isVisible = isIntersecting;
    }, opts);

    io.observe(item.el);
    item.el._observe = io;
};

class ParralaxElements {
    constructor() {
        this.items = [];
        this.listeners();
    }

    add(el, binding) {
        el.style.willChange = 'transform';

        const item = {
            el,
            multiplier: binding.value || 1,
            modifiers: binding.modifiers,
            isVisible: false,
            init: false,
        };

        observe(item);
        this.items.push(item);
    }

    move() {
        this.items.forEach((item) => {
            if (!item.isVisible && item.init) return;
            if (!item.init) item.init = true;

            const parallax = this.calcParralax(item);
            window.requestAnimationFrame(() => {
                item.el.style.transform = `translate3d(0, ${parallax}px, 0)`;
            });
        });
    }

    calcParralax({ el, multiplier, modifiers }) {
        const box = el.getBoundingClientRect();
        const pageTop = window.pageYOffset;
        const wHeight = window.innerHeight;
        const wBottom = pageTop + wHeight;
        const boxOffsetTop = box.top + pageTop;

        let scrolled = (wBottom - boxOffsetTop) / (box.height + wHeight);
        scrolled = modifiers.center ? scrolled - 0.5 : scrolled;

        return box.height * scrolled * multiplier;
    }

    remove(el) {
        el._observe.observer.unobserve(el);
        delete el._observer;
        this.items = this.items.filter((item) => item.el !== el);
    }

    listeners() {
        ['scroll', 'resize'].forEach((evtName) => {
            window.addEventListener(evtName, () => this.move(), {
                passive: true,
            });
        });
    }
}

const parralax = new ParralaxElements();

const directive = {
    inserted(el, binding) {
        parralax.add(el, binding);
        parralax.move();
    },
    unbind(el) {
        parralax.remove(el);
    },
};

export default directive;
