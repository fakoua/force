import { Application, Router, Context, send } from "https://deno.land/x/oak/mod.ts"
import { Session } from "https://deno.land/x/session/mod.ts";

import * as utils from "./src/utils.ts"
import * as adminUtils from "./src/core/admin_utils.ts"
import * as pagesUtils from "./src/core/page_utils.ts"

import { Handlebars } from "./src/handlebars/mod.ts"

const handle = new Handlebars();
const app = new Application()
const session = new Session({ framework: "oak" });
await session.init();

const router = new Router({
    strict: false
})

app.use(session.use()(session));

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
                    return;
                }
            }
        }
        const page = await adminUtils.processFile(ctx.request.url)
        ctx.response.body = page.content
    });


// admin authentication
app.use(async (ctx: Context, next: any) => {
    const pathname = ctx.request.url.pathname.toLocaleLowerCase()

    if (pathname.startsWith("/admin/login")) {
        await next()
        return;
    }
    if (pathname.startsWith("/admin")) {
        const auth = await ctx.state.session.get("auth")
        if (auth === undefined) {
            ctx.response.redirect("/admin/login")
            return;
        }
    }
    await next()
});

// static
app.use(async (context, next: any) => {
    if (context.request.url.pathname.startsWith("/themes")) {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/src/cms/`,
        });
        return;
    }
    if (context.request.url.pathname.startsWith("/admin/content")) {
        await send(context, context.request.url.pathname, {
            root: `${Deno.cwd()}/src/core/`,
        });
        return;
    }
    await next()
});

// Logger
app.use(async (ctx: Context, next: any) => {
    await next();
    console.log(`${ctx.request.method} ${ctx.request.url}`);
});

router
    .all("/admin/api/pages", async (ctx: Context) => {
        const pages = await pagesUtils.getPages()
        ctx.response.body = pages
    });

router
    .all("/admin/(.*)", async (ctx: Context) => {
        console.log(atob(ctx.request.url.searchParams.get("pageId") ?? ""))
        let html = await adminUtils.getTheme()
        const page = await adminUtils.processFile(ctx.request.url)

        if (page.head === undefined) {
            ctx.response.body = page.content
        } else {
            const model = {
                body: page.content,
                title: page.head.title,
                script: page.script
            }

            html = handle.render(html, model)
            ctx.response.body = html
        }
    });

router
    .all("/(.*)", async (ctx: Context) => {
        let html = await utils.getTheme()
        const page = await utils.processFile(ctx.request.url)
        let menu = await utils.processMenu()

        const menuModel = {
            menu: [
                {
                    title: "Home",
                    url: "/",
                    icon: "home"
                },
                {
                    title: "About",
                    url: "/about",
                    icon: "info"
                }
            ]
        }
        menu = handle.render(menu, menuModel)

        const model = {
            body: page.content,
            title: page.head.title,
            menu: menu
        }

        html = handle.render(html, model)
        ctx.response.body = html
    });

// Listen to server events
app.addEventListener("listen", ({ hostname, port, secure }: any) => {
    console.log(
        `Listening on: ${secure ? "https://" : "http://"}${hostname ??
        "localhost"}:${port}`,
    );
});

// Listen to server errors
app.addEventListener("error", (evt) => {
    // Will log the thrown error to the console.
    // console.log(evt);
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 9000 });
