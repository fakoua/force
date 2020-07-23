import { join } from "https://deno.land/std/path/mod.ts"
import { exists, readFileStr, writeFileStr } from "https://deno.land/std@0.61.0/fs/mod.ts"
import { PageModel } from "../../models/page/PageModel.ts"
import { SectionModel } from "../../models/page/SectionModel.ts"

export async function getTheme(): Promise<string> {
    const themePath = join(Deno.cwd(), "src/core/admin/layout.html")
    const result = await readFileStr(themePath)
    return result
}

export async function getPage(url: URL | string): Promise<PageModel> {
    let filePath: string

    if (typeof url === "string") {
        filePath = join(Deno.cwd(), "src/cms/pages")
        filePath = join(filePath, url)
        filePath = join(filePath, "index.html")
    } else {
        filePath = await urlToFilePath(url)
    }

    let content = await readFileStr(filePath)
    const regexForce: RegExp = /\<\!\-\-\s\@force(.*?)\-\-\>/gis
    const regexSections = /\<section name\=\"(.*?)\"\>(.*?)(\<\/section\>)/gis

    let json: any
    const mt = regexForce.exec(content)
    if (mt !== null) {
        json = JSON.parse(mt[1])
        content = content.replace(regexForce, "")
    }

    const matches = content.matchAll(regexSections)

    content = content.replace(regexSections, "")
    const sectionsMatch = Array.from(matches)
    const sections: SectionModel = {}

    sectionsMatch.forEach(sec => {
        // sec[0]: whole section
        // sec[1]: section name
        // sec[2]: section content
       sections[sec[1]] = sec[2]
    })
    // Trim new line
    content = content.replace(/^\s+|\s+$/g, "")
   
    return new PageModel(content, json, sections)
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
    await writeFileStr(filePath, fileContent)
    return true
}

export function validateAccount(username: string, password: string): boolean {
    return username === "admin" && password === "pass"
}


/**
 * Returns the path of the requested file.
 * If URL:
 *  - /: root/home/index.md
 *  - /home: root/home/index.md
 *  - /company/about: root/company/about.md OR root/company/about/index.md
 * @param url requested url.
 */
async function urlToFilePath(url: URL): Promise<string> {
    const root = join(Deno.cwd(), "src/core/admin/pages")
    let paths = url.pathname.split("/")
    paths = paths.filter(p => p !== "")
    paths.shift()

    if (paths.length === 0) {
        return join(root, "/index.html")
    }

    if (paths.length === 1) {
        // check for login, logout ...
        if (paths[0] === "login") {
            return join(Deno.cwd(), "src/core/admin/login.html")
        }
        return join(root, `${paths[0]}/index.html`)
    }

    const last = paths.pop()
    let res = ""
    paths.forEach(path => {
        res = `${res}/${path}`
    })
    const checkFolder = join(root, `${res}/${last}`)
    const folderExist = await exists(checkFolder)
    return folderExist ? join(checkFolder, "index.html") : `${checkFolder}.html`
}
