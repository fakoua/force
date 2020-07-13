import { assertEquals } from "./test_deps.ts"
import * as utils from "./utils.ts"
import { join } from "https://deno.land/std/path/mod.ts"

Deno.test({
    name: "test_utils_urlToFilePath_01",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/home/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_02",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/home/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_03",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/home/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/home"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_04",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/home/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/home/index"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_05",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/afolder/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/afolder/index"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_06",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/afolder/index.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/afolder"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_07",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/afolder/afile.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/afolder/afile"))
        assertEquals(result, expected)
    },
})

Deno.test({
    name: "test_utils_urlToFilePath_09",
    async fn(): Promise<void> {
        const expected = join(Deno.cwd(), "src/cms/pages/a/b/c/d/e/f/g.md")
        const result = await utils.urlToFilePath(new URL("https://www.me.com/a/b/c/d/e/f/g"))
        assertEquals(result, expected)
    },
})
