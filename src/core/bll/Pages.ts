import { join } from "https://deno.land/std/path/mod.ts"
import { readFileStr, walk } from "https://deno.land/std/fs/mod.ts"
import { PageModel } from "../models/page/PageModel.ts"
import * as utils from "../../utils.ts"
import { SectionModel } from "../models/page/SectionModel.ts"
import { PageHeadModel } from "../models/page/PageHeadModel.ts"

export async function getTheme(): Promise<string> {
    const themePath = join(utils.rootFolder(), "src/cms/themes/newton/layout.html")
    const result = await readFileStr(themePath)
    return result
}

export async function getPage(url: URL): Promise<PageModel> {
    const filePath = await urlToFilePath(url)
    let content = await readFileStr(filePath)
    const regexSections = /\<section name\=\"(.*?)\"\>(.*?)(\<\/section\>)/gis

    const pageHeader = getPageHeader(content)
    content = content.replace(/\<\!\-\-\s\@force(.*?)\-\-\>/gis, "")

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

    return new PageModel(content, pageHeader, sections)
}

export function getPageHeader(content: string): PageHeadModel {
    const regexForce: RegExp = /\<\!\-\-\s\@force(.*?)\-\-\>/gis
    let json: any
    const mt = regexForce.exec(content)

    if (mt !== null) {
        json = JSON.parse(mt[1])
        content = content.replace(regexForce, "")
        return json
    }
    return {
        layout: "layout",
        menuTitle: "",
        pageTitle: ""
    }
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
    const root = join(utils.rootFolder(), "src/cms/pages")

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
