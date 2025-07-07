interface ILink {
  name: string;
}

interface IMenuItem {
  icon: string;
  text: string;
  link?: ILink;
  gallery: boolean;
  children?: IMenuItem[];
  permission?: string;
  auth?: boolean;
}

export type{
  ILink,
  IMenuItem
}
