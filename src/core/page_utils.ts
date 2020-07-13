import { readFileStr, walk } from "https://deno.land/std/fs/mod.ts"
import { join } from "https://deno.land/std/path/mod.ts"
import { MenuModel } from "../../src/core/models/MenuModel.ts"

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
            menuItems.push({
                fullPath: fullPath,
                name: name, 
                nameView: nameView,
                relativePath: relativePath,
                isHome: nameView === "home",
                isSub: relativePath.indexOf("\\") > 0,
                pageId: encodeURIComponent(btoa(relativePath))
            })
        }
    }

    menuItems = menuItems.sort((a, b) => {
        if (a.relativePath < b.relativePath) {
            return -1;
          }
          if (a.relativePath > b.relativePath) {
            return 1
          }
          return 0;
    })
    return menuItems
}
