import fs, { write } from "fs";
import { app, shell, BrowserWindow, ipcMain } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { Migrator } from "./lib/db/migrator";
import { dbPath, migrationsDir } from "./lib/utils/misc";
import ddb from "./lib/db/ddb";
import { initalizeQdrantClient } from "./lib/db/qdrant";
import { initializeDatabase } from "./lib/db/sqlite";
app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  // ======================= IPC =======================

  ipcMain.handle("getDDB", ddb.get);
  ipcMain.handle("writeDDB", (_, data) => {
    ddb.write(data);
  });

  // Open or close DevTools using F12 in development
  // Ignore Cmd/Ctrl + R in production.
  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on("activate", function () {
    // For macOS, re-create a window in the app when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  app.on("ready", () => {
    // Initialize trad db running locally
    initializeDatabase();
    // Initialize Qdrant client running locally
    initalizeQdrantClient();
    // New install
    if (!fs.existsSync(dbPath)) {
      // const migrator = new Migrator({ migrationDir: migrationsDir, dbPath });
      // migrator.migrate();
    }
  });

  // Quit when all windows are closed
  app.on("window-all-closed", () => {
    // Except on macOS
    // It's common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  // Implement Electron auto-updater
  // autoUpdater.on();
  // https://www.electron.build/auto-update.html
});

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    minWidth: 960,
    minHeight: 540,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load vite dev server in development or static files in production
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}
