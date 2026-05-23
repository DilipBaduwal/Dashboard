declare module "react-dom/client" {
  import type { ReactElement } from "react"

  export function createRoot(
    container: Element | DocumentFragment,
  ): {
    render: (element: ReactElement) => void
    unmount: () => void
  }
}