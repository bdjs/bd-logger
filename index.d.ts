declare module 'bd-logger'

declare type Options = {
  root?: string,
  app?: string
}

declare function logger (options): void

export default logger
