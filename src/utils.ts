import { join } from "https://deno.land/std/path/mod.ts"
import { exists, readFileStr, walk } from "https://deno.land/std/fs/mod.ts"
import { PageModel } from "./core/models/PageModel.ts"

export function parseUrl(ctx: any): string[] {
    const pathname = ctx.request.url.pathname as string
    const paths = pathname.split("/")
    paths.shift()
    return paths
}

export async function getTheme(): Promise<string> {
    const themePath = join(Deno.cwd(), "src/cms/themes/newton/index.html")
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
    const root = join(Deno.cwd(), "src/cms/pages")

    let folders = walk(root, {
        includeDirs: true, 
        includeFiles: false, 
    })

    let paths = url.pathname.split("/")
    paths = paths.filter(p => p !== "")

    if (paths.length === 0) {
        paths.push("home")
    }

    //const last = paths.pop()
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
        //"C:@github@force@src@cms@pages@02.about@01.contact-us"
        let safePath = folder.path.replace(/\\/g, "@")
        safePath = safePath.replace(/\//g, "@")

        let isMatch = (new RegExp(res)).test(safePath)
        if (isMatch) {
            resultPath = folder.path
            break
        }
    }

    //let isMatch = /^C:@github@force@src@cms@pages@\d\d\.about@\d\d\.contact-us$/.test("C:@github@force@src@cms@pages@02.about@01.contact-us")
    
    //const checkFolder = join(root, `${res}/${last}`)
    //const folderExist = await exists(checkFolder)
    //return folderExist ? join(checkFolder, 'index.html') : `${checkFolder}.html`
    return join(resultPath, "index.html")
}

export async function processFile(url: URL): Promise<PageModel> {
    const filePath = await urlToFilePath(url)
    console.log(filePath)
    let content = await readFileStr(filePath)
    // content = Marked.parse(content)

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

export async function processMenu(): Promise<string> {
    const root = join(Deno.cwd(), "src/cms/themes")
    const menuPath = join(root, "/newton/modules/menu.html")
    let content = await readFileStr(menuPath)
    return content
}