import { createSlice } from "@reduxjs/toolkit";
import { Material } from "./type";

interface MaterialState {
  materials: Material[];
  loading: boolean;
  error: string | null;
}

const examples: Material[] = [
  {
    id: 1,
    title: "Introduction to React Hooks",
    description: "Learn about React Hooks",
    createdAt: "2023-05-15T10:00:00Z",
    updatedAt: "2023-05-15T10:00:00Z",
    fileLinks: [],
    links: [],
  },
  {
    id: 2,
    title: "Advanced TypeScript Techniques",
    description: "Explore advanced TypeScript features and best practices",
    createdAt: "2023-04-02T14:45:00Z",
    updatedAt: "2023-04-05T09:15:00Z",
    fileLinks: ["https://example.com/advanced-typescript.pptx"],
    links: ["https://www.typescriptlang.org/docs/handbook/advanced-types.html"],
  },
  {
    id: 3,
    title: "Redux Toolkit Tutorial",
    description: "Learn how to use Redux Toolkit for state management",
    createdAt: "2023-05-10T11:20:00Z",
    updatedAt: "2023-05-10T11:20:00Z",
    fileLinks: ["https://example.com/redux-toolkit-tutorial.mp4"],
    links: ["https://redux-toolkit.js.org/introduction/getting-started"],
  },
  {
    id: 4,
    title: "CSS Grid Layout Mastery",
    description: "Master CSS Grid Layout for responsive web design",
    createdAt: "2023-06-18T16:00:00Z",
    updatedAt: "2023-06-20T13:30:00Z",
    fileLinks: ["https://example.com/css-grid-cheatsheet.pdf"],
    links: ["https://css-tricks.com/snippets/css/complete-guide-grid/"],
  },
];

const initialState: MaterialState = {
  materials: examples,
  loading: false,
  error: null,
};

const materialSlice = createSlice({
  name: "materials",
  initialState,
  reducers: {},
});

export default materialSlice.reducer;
