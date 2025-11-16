import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Assignment } from "./type";

interface IAssignmentSlice {
  assignment: Assignment | null;
}

const initialState: IAssignmentSlice = {
  assignment: {
    id: "1",
    title: "Introduction to React Hooks",
    description:
      "# React Hooks Assignment\n\n## Objective\nLearn and implement basic React Hooks in a small project.\n\n### Tasks:\n1. Create a functional component using `useState`\n2. Implement `useEffect` for data fetching\n3. Create a custom hook\n\n**Bonus:** Use `useContext` for theme switching\n\n```jsx\nconst Example = () => {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}\n```\n\nGood luck!",
    createdAt: "2023-05-15T10:00:00Z",
    creator: "Prof. Jane Smith",
    dueDate: "2023-05-30T23:59:59Z",
    extensionsAllowed: ["pdf", "js", "jsx", "ts", "tsx"],
    fileLinks: ["https://reactjs.org/docs/hooks-intro.html"],
    links: ["https://github.com/example-repo/react-hooks-assignment"],
  },
};

const assignmentSlice = createSlice({
  name: "assignment",
  initialState,
  reducers: {
    setAssignment: (state, action: PayloadAction<Assignment>) => {
      state.assignment = action.payload;
    },
  },
});

export const { setAssignment } = assignmentSlice.actions;

export default assignmentSlice.reducer;
