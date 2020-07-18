export interface MenuModel {
    fullPath: string,
    relativePath: string,
    name: string,
    nameView: string,
    isHome: boolean,
    isSub: boolean,
    pageId: string,
    pageTitle?: string,
    menuTitle?: string,
    hidden?: boolean,
    icon?: string,
    url?: string,
    children?: MenuModel[]
}
