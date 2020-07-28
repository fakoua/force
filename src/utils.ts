import { join } from "https://deno.land/std/path/mod.ts"
import { walk } from "https://deno.land/std/fs/mod.ts"
import { PageModel } from "./core/models/page/PageModel.ts"

export function rootFolder(): string {
    return Deno.cwd()
}

export function unifiedPath(path: string): string {
    return path.replace(/\\/g, "/")
}

export function parseUrl(ctx: any): string[] {
    const pathname = ctx.request.url.pathname as string
    const paths = pathname.split("/")
    paths.shift()
    return paths
}

export async function getTheme(): Promise<string> {
    const themePath = join(Deno.cwd(), "src/cms/themes/newton/layout.html")
    const result = await Deno.readTextFile(themePath)
    return result
}

/**
 * Returns the path of the requested file.
 * If URL:
 *  - /: root/home/index.md
 *  - /home: root/home/index.md
 *  - /company/about: root/company/about.md OR root/company/about/index.md
 * @param url requested url.
 */
export async function urlToFilePath(url: URL): Promise<string> {
    const root = join(Deno.cwd(), "src/cms/pages")

    const folders = walk(root, {
        includeDirs: true, 
        includeFiles: false, 
    })

    let paths = url.pathname.split("/")
    paths = paths.filter(p => p !== "")

    if (paths.length === 0) {
        paths.push("home")
    }

    let res = ""
    paths.forEach(path => {
        res = `${res}/@PAT@${path}`
    })
    res = join(root, res)
    res = res.replace(/\\/g, "@")
    res = res.replace(/\//g, "@")
    res = res.replace(/@PAT@/g, "\\d\\d\\.")

    let resultPath = ""
    for await (const folder of folders) {
        let safePath = folder.path.replace(/\\/g, "@")
        safePath = safePath.replace(/\//g, "@")

        const isMatch = (new RegExp(res)).test(safePath)
        if (isMatch) {
            resultPath = folder.path
            break
        }
    }
    return join(resultPath, "index.html")
}

export async function processFile(url: URL): Promise<PageModel> {
    const filePath = await urlToFilePath(url)
    const content = await Deno.readTextFile(filePath)
    const regex: RegExp = /\<\!\-\-\s\@force(.*?)\-\-\>/gis
    let json: any
    const mt = regex.exec(content)
    if (mt !== null) {
        json = JSON.parse(mt[1])
    }

    return new PageModel(content, json, {})
}

export async function processMenu(): Promise<string> {
    const root = join(Deno.cwd(), "src/cms/themes")
    const menuPath = join(root, "/newton/modules/menu.html")
    const content = await Deno.readTextFile(menuPath)
    return content
}

export async function processMobileMenu(): Promise<string> {
    const root = join(Deno.cwd(), "src/cms/themes")
    const menuPath = join(root, "/newton/modules/mobile_menu.html")
    const content = await Deno.readTextFile(menuPath)
    return content
}

