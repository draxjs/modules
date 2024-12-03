interface Link {
  name: string;
}

interface MenuItem {
  icon: string;
  text: string;
  link?: Link;
  gallery: boolean;
  children?: MenuItem[];
  permission?: string;
  auth?: boolean;
}

export type{
  Link,
  MenuItem
}
