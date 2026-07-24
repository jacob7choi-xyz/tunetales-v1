// Shared framer-motion mock for cinema island tests. Exit animations never
// finish under jsdom, so AnimatePresence passes children through; scroll
// primitives resolve to static values (useTransform returns its first
// output) so motion styles render as plain numbers/strings.
import * as React from "react";

const stripMotionProps = (props: Record<string, unknown>) => {
  const {
    initial: _initial,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    whileHover: _whileHover,
    whileTap: _whileTap,
    ...rest
  } = props;
  return rest;
};

const makeElement =
  (tag: string) =>
  ({ children, ...props }: Record<string, unknown> & { children?: React.ReactNode }) =>
    React.createElement(tag, stripMotionProps(props), children as React.ReactNode);

// Component identity MUST be stable across renders: returning a fresh
// function per property access changes the element type every render,
// which makes React remount the subtree (losing focus and DOM nodes)
const elementCache = new Map<string, ReturnType<typeof makeElement>>();

export const motion = new Proxy(
  {},
  {
    get: (_target, key) => {
      const tag = String(key);
      let component = elementCache.get(tag);
      if (!component) {
        component = makeElement(tag);
        elementCache.set(tag, component);
      }
      return component;
    },
  }
);

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => children;

export const useScroll = () => ({ scrollY: 0, scrollYProgress: 0 });

export const useTransform = (
  _value: unknown,
  _input: unknown[],
  output: unknown[]
) => output[0];

export const useReducedMotion = () => false;

export const useMotionValueEvent = () => undefined;
