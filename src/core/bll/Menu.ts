import { walk } from "https://deno.land/std/fs/mod.ts"
import { join } from "https://deno.land/std/path/mod.ts"
import type { MenuModel } from "../models/MenuModel.ts"
import * as Pages from "./Pages.ts"
import * as utils from "../../utils.ts"

export async function getMenuItems(path?: string): Promise<MenuModel[]> {
    const rootFolder = join(utils.rootFolder(), "src/cms/pages/")
    const root = path === undefined ? rootFolder : path
    const folders = walk(root, {
        includeDirs: true,
        includeFiles: false,
        maxDepth: 1
    })

    let menuItems: MenuModel[] = []

    for await (const folder of folders) {
        const fullPath = folder.path
        const relativePath = folder.path.replace(rootFolder, "")
        const name = folder.name
        const nameView = name.replace(/\d\d\./gm, "")
        let url = "/" + relativePath.replace(/\d\d\./gm, "")
        url = url === "/home" ? "/" : url
        const relativePathView = relativePath.replace(/\d\d\./gm, "").replace(/\\/g, " \\ ").replace(/\//g, " / ")
        if (root !== fullPath) {
            const content = await Deno.readTextFile(join(fullPath, "index.html"))
            const pageHeader = Pages.getPageHeader(content)
            const children = await getMenuItems(fullPath)
            menuItems.push({
                fullPath: fullPath,
                name: name,
                nameView: nameView,
                relativePath: relativePath,
                relativePathView: relativePathView,
                isHome: nameView === "home",
                pageId: encodeURIComponent(btoa(relativePath)),
                hidden: pageHeader.hidden ?? false,
                menuTitle: pageHeader.menuTitle,
                pageTitle: pageHeader.pageTitle,
                icon: pageHeader.icon,
                url: url,
                children: children
            })
        }
    }

    menuItems = menuItems.sort((a, b) => {
        if (a.relativePath < b.relativePath) {
            return -1
        }
        if (a.relativePath > b.relativePath) {
            return 1
        }
        return 0
    })

    return menuItems
}

export async function getMenuRoots(): Promise<string[]> {
    const rootFolder = join(utils.rootFolder(), "src/cms/pages/")
    const folders = walk(rootFolder, {
        includeDirs: true,
        includeFiles: false,
        maxDepth: 1
    })

    const roots: string[] = []

    for await (const folder of folders) {
        roots.push(folder.name == "pages" ? "- ROOT -" : folder.name)
    }

    return roots
}
