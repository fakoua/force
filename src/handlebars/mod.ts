import HandlebarsJS from "https://jspm.dev/handlebars@4.7.6";

interface HandlebarsConfig {
    baseDir: string;
    extname: string;
    layoutsDir: string;
    partialsDir: string;
    defaultLayout: string;
    helpers: any;
    compilerOptions: any;
}

const DEFAULT_HANDLEBARS_CONFIG: HandlebarsConfig = {
    baseDir: "views",
    extname: ".hbs",
    layoutsDir: "layouts/",
    partialsDir: "partials/",
    defaultLayout: "main",
    helpers: undefined,
    compilerOptions: {
        noEscape: true
    },
};

export class Handlebars {
    constructor(private config: HandlebarsConfig = DEFAULT_HANDLEBARS_CONFIG) {
        this.config = { ...DEFAULT_HANDLEBARS_CONFIG, ...config };
    }

    public render(source: string, context?: Object): string {
        // TODO: use cashe
        //  @ts-ignore
        const template = HandlebarsJS.compile(source, this.config.compilerOptions);
        return template(context);
    }
}
