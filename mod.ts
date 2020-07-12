import { Application, Router, Context, send } from "https://deno.land/x/oak/mod.ts"
import { Session } from "https://deno.land/x/session/mod.ts";

import * as utils from "./src/utils.ts"
import * as adminUtils from "./src/core/admin_utils.ts"
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
        console.log('login page')
        if (ctx.request.method === "POST") {
            let b = await ctx.request.body()
            let vl = b.value as URLSearchParams
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
        let page = await adminUtils.processFile(ctx.request.url)
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
        let auth = await ctx.state.session.get("auth")
        if (auth === undefined) {
            console.log('redirected')
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
    .all("/admin/(.*)", async (ctx: Context) => {
        let html = await adminUtils.getTheme()
        let page = await adminUtils.processFile(ctx.request.url)

        if (page.head === undefined) {
            ctx.response.body = page.content
        }
        else {
            let model = {
                body: page.content,
                title: page.head.title
            }

            html = handle.render(html, model)
            if (ctx.request.url.search === "?id=1") {
                await ctx.state.session.set("auth", "tata")
            }
            ctx.response.body = html
        }
    });

router
    .all("/(.*)", async (ctx: Context) => {
        let html = await utils.getTheme()
        let page = await utils.processFile(ctx.request.url)
        let menu = await utils.processMenu()

        let menuModel = {
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

        let model = {
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
    //console.log(evt);
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 9000 });
