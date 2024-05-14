interface Link {
  name: string;
}

interface MenuItem {
  icon?: string;
  text: string;
  link?: Link;
  gallery: boolean;
  children?: MenuItem[];
}

export type{
  Link,
  MenuItem
}
