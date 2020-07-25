import { join } from "https://deno.land/std/path/mod.ts"
import { PageModel } from "../../models/page/PageModel.ts"
import { SectionModel } from "../../models/page/SectionModel.ts"

export async function getTheme(): Promise<string> {
    const themePath = join(Deno.cwd(), "src/core/admin/layout.html")
    const result = await Deno.readTextFile(themePath)
    return result
}

export async function getPage(pageId: string): Promise<PageModel> {
    if (pageId === "") {
        // Create new page
        return new PageModel("", {
            layout: "layout",
            menuTitle: "",
            pageTitle: "",
            hidden: false, 
            icon: "",
            meta: []
        })
    }

    let filePath: string
    filePath = join(Deno.cwd(), "src/cms/pages")
    filePath = join(filePath, pageId)
    filePath = join(filePath, "index.html")

    let content = await Deno.readTextFile(filePath)
    const regexForce: RegExp = /\<\!\-\-\s\@force(.*?)\-\-\>/gis

    let json: any
    const mt = regexForce.exec(content)
    if (mt !== null) {
        json = JSON.parse(mt[1])
        content = content.replace(regexForce, "")
    }

    content = content.replace(/^\s+|\s+$/g, "")
    return new PageModel(content, json, {})
}

export async function savePage(model: PageModel): Promise<boolean> {
    const path: string = atob(model.pageId ?? "")
    let filePath = join(Deno.cwd(), "src/cms/pages")
    filePath = join(filePath, path)
    filePath = join(filePath, "index.html")
    const force = JSON.stringify(model.head)
    const fileContent = `
<!-- @force
${force}
-->
${model.content}
    `
    await Deno.writeTextFile(filePath, fileContent)
    return true
}

export function validateAccount(username: string, password: string): boolean {
    return username === "admin" && password === "pass"
}
