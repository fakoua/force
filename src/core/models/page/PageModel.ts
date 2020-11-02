import type { PageHeadModel } from "./PageHeadModel.ts"
import type { SectionModel } from "./SectionModel.ts"
import type { ModuleModel } from "./ModuleModel.ts"

export class PageModel {
    constructor(content?: string, head?: PageHeadModel, sections?: SectionModel, parent?: string) {
        this.content = content ?? ""
        this.sections = sections
        this.modules = {}
        this.parent = parent ?? ""
        this.hasChildren = false
        this.head = head ?? {
            layout: "layout",
            pageTitle: "Force",
            menuTitle: "Force",
            hidden: false, 
            icon: "",
            meta: []
        }
    }
    
    content: string
    parent: string
    head: PageHeadModel
    sections?: SectionModel
    modules: ModuleModel
    pageId?: string
    hasChildren: boolean

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
