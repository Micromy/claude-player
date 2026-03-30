import type { BrowserWindow } from 'electron'
import { registerDatabaseHandlers } from './database.handlers'
import { registerFilesystemHandlers } from './filesystem.handlers'

export function registerAllHandlers(win: BrowserWindow): void {
  registerDatabaseHandlers()
  registerFilesystemHandlers(win)
}
