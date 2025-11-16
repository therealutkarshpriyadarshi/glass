export interface Activity {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  creator: string;
}

export interface Assignment extends Activity {
  dueDate: string;
  extensionsAllowed: string[];
  fileLinks: string[];
  links: string[];
}
