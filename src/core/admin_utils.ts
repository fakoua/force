import { join } from "https://deno.land/std/path/mod.ts"
import { exists, readFileStr } from "https://deno.land/std/fs/mod.ts"
import { PageModel } from "./models/PageModel.ts"

export function parseUrl(ctx: any): string[] {
    const pathname = ctx.request.url.pathname as string
    const paths = pathname.split("/")
    paths.shift()
    return paths
}

export async function getTheme(): Promise<string> {
    const themePath = join(Deno.cwd(), "src/core/admin/layout.html")
    let result = await readFileStr(themePath)
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
    const root = join(Deno.cwd(), "src/core/admin/pages")
    let paths = url.pathname.split("/")
    paths = paths.filter(p => p !== "")
    paths.shift()

    if (paths.length === 0) {
        return join(root, '/index.html')
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
    return folderExist ? join(checkFolder, 'index.html') : `${checkFolder}.html`
}

export async function processFile(url: URL): Promise<PageModel> {
    const filePath = await urlToFilePath(url)
    console.log(filePath)
    let content = await readFileStr(filePath)
    const regex: RegExp = /\<\!\-\-\s\@force(.*?)\-\-\>/gis
    let json: any
    let mt = regex.exec(content)
    if (mt !== null) {
        json = JSON.parse(mt[1])
    }

    return {
        content: content,
        head: json
    }
}

export function validateAccount(username: string, password: string): boolean {
    return username === "admin" && password === "pass"
}