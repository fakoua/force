import { MetatagModel } from "./MetatagModel.ts";

export interface PageHeadModel {
    pageTitle: string,
    menuTitle: string,
    layout: string,
    meta?: Array<MetatagModel>
    hidden?: boolean
}