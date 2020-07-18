import { PageHeadModel } from "./PageHeadModel.ts"
import { SectionModel } from "./SectionModel.ts"

export class PageModel {
    constructor(content?: string, head?: PageHeadModel, sections?: SectionModel) {
        this.content = content ?? ""
        this.head = head ?? {
            layout: "layout",
            pageTitle: "Force",
            menuTitle: "Force"
        }
        this.sections = sections
    }
    content: string
    head: PageHeadModel
    sections?: SectionModel
    pageId?: string

    public get metatags(): string {
        if (this.head.meta !== undefined) {
            let result = ""
            this.head.meta.forEach(meta => {
                switch (meta.key) {
                    case "charset":
                        result = `${result}<meta charset="${meta.value}" />\r\n`
                        break
                    case "http-equiv":
                        // TODO: should be changed
                        result = `${result}<meta name="${meta.key}" content="${meta.value}" />\r\n`
                        break
                    default:
                        result = `${result}<meta name="${meta.key}" content="${meta.value}" />\r\n`
                        break
                }
            })
            return result
        }
        return ""
    }
}
