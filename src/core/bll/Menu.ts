import { walk, readFileStr } from "https://deno.land/std/fs/mod.ts"
import { join } from "https://deno.land/std/path/mod.ts"
import { MenuModel } from "../models/MenuModel.ts"
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
        const nameView = name.substring(3)
        const url = "/" + relativePath.replace(/\d\d\./gm, "").replace(/\\/gm, "/")
        // console.log("Path: ",  path ?? "EMPTY", "   Root: " , root, "   Relative: ", relativePath, "   FullPath: ", fullPath)
        if (root !== fullPath) {

            const content = await readFileStr(join(fullPath, "index.html"))
            const pageHeader = Pages.getPageHeader(content)
            const children = await getMenuItems(fullPath)
            menuItems.push({
                fullPath: fullPath,
                name: name,
                nameView: nameView,
                relativePath: relativePath,
                isHome: nameView === "home",
                isSub: relativePath.indexOf("\\") > 0,
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

export async function getPages(): Promise<MenuModel[]> {
    const root = join(Deno.cwd(), "src/cms/pages/")
    const folders = walk(root, {
        includeDirs: true,
        includeFiles: false,
    })

    let menuItems: MenuModel[] = []

    for await (const folder of folders) {
        const fullPath = folder.path
        const relativePath = folder.path.replace(root, "")
        const name = folder.name
        const nameView = name.substring(3)

        if (relativePath !== "") {

            const content = await readFileStr(join(fullPath, "index.html"))
            const pageHeader = Pages.getPageHeader(content)

            menuItems.push({
                fullPath: fullPath,
                name: name,
                nameView: nameView,
                relativePath: relativePath,
                isHome: nameView === "home",
                isSub: relativePath.indexOf("\\") > 0,
                pageId: encodeURIComponent(btoa(relativePath)),
                hidden: pageHeader.hidden ?? false,
                menuTitle: pageHeader.menuTitle,
                pageTitle: pageHeader.pageTitle,
                icon: "info",
                url: "#"
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
