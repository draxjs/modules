interface IEmailLayout{

    bodyStyle?:string
    maxWidth?: string

    headerCentered?: boolean
    headerBgColor?: string
    headerColor?: string

    headerImage?: string
    headerImageStyle?: string

    headerTitle?: string
    headerTitleStyle?: string

    headerLogo?: string
    headerLogoStyle?: string

    footerBgColor?: string
    footerCopyright?: string
    footerContent?: string
    footerUnsubscribe?: string
}

export type {IEmailLayout}
