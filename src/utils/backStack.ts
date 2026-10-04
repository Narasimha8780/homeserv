// Android hardware Back button support. Anything that should react to Back (an open
// modal, a category page, a non-home tab) registers a handler; the most recently
// registered one gets first go. A handler returns true if it consumed the press.
type BackHandler = () => boolean;
const stack: BackHandler[] = [];

export function pushBackHandler(handler: BackHandler): () => void {
  stack.push(handler);
  return () => {
    const i = stack.lastIndexOf(handler);
    if (i >= 0) stack.splice(i, 1);
  };
}

export function runBackHandlers(): boolean {
  for (let i = stack.length - 1; i >= 0; i--) {
    if (stack[i]()) return true;
  }
  return false;
}
