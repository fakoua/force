import { Application, Router, Context, send } from "https://deno.land/x/oak/mod.ts"
import { Session } from "https://deno.land/x/session/mod.ts"

import * as utils1 from "./src/utils.ts"
import * as adminUtils from "./src/core/admin_utils.ts"
import * as pagesUtils from "./src/core/page_utils.ts"
import * as Pages from "./src/core/bll/Pages.ts"
import * as AdminPages from "./src/core/bll/admin/Pages.ts"
import * as PageApi from "./src/core/bll/admin/PageApi.ts"
import * as Menu from "./src/core/bll/Menu.ts"

import { Handlebars } from "./src/handlebars/mod.ts"

const handle = new Handlebars()
const app = new Application()
const session = new Session({ framework: "oak" })
await session.init()

const router = new Router({
    strict: false
})

app.use(session.use()(session))

router
    .all("/admin/login", async (ctx: Context) => {
        if (ctx.request.method === "POST") {
            const b = await ctx.request.body()
            const vl = b.value as URLSearchParams
            const username = vl.get("username")
            const password = vl.get("password")
            if (username !== null && password !== null) {
                if (adminUtils.validateAccount(username, password)) {
                    await ctx.state.session.set("auth", "yes")
                    ctx.response.redirect("/admin/")
                    return
                }
            }
        }
        const page = await adminUtils.getPage(ctx.request.url)
        ctx.response.body = page.content
    })


// admin authentication
// app.use(async (ctx: Context, next: any) => {
//     const pathname = ctx.request.url.pathname.toLocaleLowerCase()

//     if (pathname.startsWith("/admin/login")) {
//         await next()
//         return;
//     }
//     if (pathname.startsWith("/admin")) {
//         const auth = await ctx.state.session.get("auth")
//         if (auth === undefined) {
//             ctx.response.redirect("/admin/login")
//             return;
//         }
//     }
//     await next()
// });

// static
app.use(async (context, next: any) => {
    if (context.request.url.pathname.startsWith("/themes")) {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/src/cms/`,
        })
        return
    }
    if (context.request.url.pathname.startsWith("/admin/content")) {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/src/core/`,
        })
        return
    }
    await next()
})

// Logger
app.use(async (ctx: Context, next: any) => {
    await next()
    console.log(`${ctx.request.method} ${ctx.request.url}`)
})

router
    .all("/admin/api/pages", async (ctx: Context) => {
        const pages = await Menu.getPages()
        ctx.response.body = pages
    })

router
    .get("/admin/api/pages/get", async (ctx: Context) => {
        const pageId = atob(ctx.request.url.searchParams.get("pageId") ?? "")
        const page = await PageApi.getPage(pageId)
        ctx.response.body = page
    })

router
    .post("/admin/api/pages/post", async (ctx: Context) => {
        const body = await ctx.request.body()
        await adminUtils.savePage(body.value.data)
        ctx.response.body = true
    })

router
    .all("/admin/(.*)", async (ctx: Context) => {
        const pageId = ctx.request.url.searchParams.get("pageId") ?? ""
        const page = await AdminPages.getPage(ctx.request.url)
        let html = await AdminPages.getTheme()
        page.pageId = pageId
        if (page.head === undefined) {
            ctx.response.body = page.content
        } else {
            const model = {
                page: page
            }
            html = handle.render(html, model)
            html = handle.render(html, model) // for the body page.
            ctx.response.body = html
        }
    })

router
    .all("/(.*)", async (ctx: Context) => {
        const page = await Pages.getPage(ctx.request.url)
        let html = await Pages.getTheme()
        let menu = await utils1.processMenu()

        const menuItems = await Menu.getMenuItems()
        const menuModel = {
            menu: menuItems
        }

        menu = handle.render(menu, menuModel)
        const model = {
            page: page,
            menu: menu
        }

        html = handle.render(html, model)
        html = handle.render(html, model) // for the body page.
        ctx.response.body = html
    })

// Listen to server events
app.addEventListener("listen", ({ hostname, port, secure }: any) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${hostname ??
        "localhost"}:${port}`,
    )
})

// Listen to server errors
app.addEventListener("error", (evt) => {
    // Will log the thrown error to the console.
    console.log(evt.error)
})

app.use(router.routes())
app.use(router.allowedMethods())

await app.listen({ port: 9000 })
