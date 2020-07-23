export interface MenuModel {
    fullPath: string,
    relativePath: string,
    relativePathView: string,
    name: string,
    nameView: string,
    isHome: boolean,
    pageId: string,
    pageTitle: string,
    menuTitle: string,
    hidden: boolean,
    icon: string,
    url: string,
    children: MenuModel[]
}
