import { walk, readFileStr } from "https://deno.land/std@0.61.0/fs/mod.ts"
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
        const nameView = name.replace(/\d\d\./gm, "")
        const url = "/" + relativePath.replace(/\d\d\./gm, "").replace(/\\/gm, "/")
        const relativePathView = relativePath.replace(/\d\d\./gm, "").replace(/\\/, " \\ ")
        if (root !== fullPath) {
            const content = await readFileStr(join(fullPath, "index.html"))
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
